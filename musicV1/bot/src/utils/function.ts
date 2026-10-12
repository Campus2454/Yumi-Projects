import chalk from "chalk";
import { ContainerBuilder } from "discord.js";
import { Client, TextDisplayBuilder } from "discord.js";
import fs from "fs";
import { Kazagumo, KazagumoTrack } from "kazagumo";
import path from "path";
import { setTimeout as wait } from 'timers/promises';
import { sendPStatus } from "./messages.js";
import { MessageFlags } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import { isDev, isM } from "./env.js";
import { Player } from "shoukaku";
import { User } from "discord.js";

const SAVE_FILE = path.join(process.cwd(), `players_${isDev ? 'dev' : isM ? 'music' : 'main'}.json`);

export function savePlayers(kazagumo: Kazagumo) {
  const data = [];

  for (const player of kazagumo.players.values()) {
    data.push({
      guildId: player.guildId,
      voiceId: player.voiceId,
      textId: player.textId,
      messageId: player.messageId,
      volume: player.volume,
      position: player.position,
      paused: player.paused,
      current: player.queue.current?.uri ?? null,
      queue: player.queue.map(t => t.uri),
      loop: player.loop,
      247: player[247] || false
    });
  }

  fs.writeFileSync(SAVE_FILE, JSON.stringify(data, null, 2));
}

function loadPlayers() {
  if (!fs.existsSync(SAVE_FILE)) return [];
  return JSON.parse(fs.readFileSync(SAVE_FILE, "utf8"));
}

export async function restorePlayers(client: Client, kazagumo: Kazagumo) {
  const head = chalk.bold('[RePlayer]');
  console.log(head, `Trying to restore players...`);
  const saved = loadPlayers();

  for (const data of saved) {
    try {
      const player = await kazagumo.createPlayer({
        guildId: data.guildId,
        voiceId: data.voiceId,
        textId: data.textId
      });

      const guild = client.guilds.cache.get(data.guildId);
      const channel = await guild?.channels.fetch(data.textId);
      const oldM = channel?.isSendable() && await channel.messages.fetch(data.messageId) || undefined;
      const m = { components: [
          (new ContainerBuilder()
            .addTextDisplayComponents(t=>t.setContent('trying to restore this player...'))
            .setAccentColor(0x00ff00)
          ),
      ]};
      try{
        if(oldM && oldM.editable){
          const newM = await oldM.edit(m);

          player.messageId = newM.id;
          // console.log([player.messageId, newM.id, data.messageId]);
          await wait(500);
        }else if(channel?.isSendable()){
          // console.log(m);
          const newM = await channel.send({ ...m, flags: [ MessageFlags.IsComponentsV2 ] });

          player.messageId = newM.id;
          // console.log(newM);
          await wait(500);
        };
      }catch{(e: any)=>console.error(head, `Error to send new message:`, e)};

      player.setVolume(data.volume ?? 100);

      // ใส่เพลงที่กำลังเล่นก่อน
      if (data.current) {
        const res = await kazagumo.search(data.current);
        if (res.tracks.length) {
          player.queue.add(res.tracks[0]);
        }
      }

      // แล้วค่อยใส่ queue
      for (const url of data.queue) {
        const res = await kazagumo.search(url);
        if (res.tracks.length) {
          player.queue.add(res.tracks[0]);
        }
      }

      if (player.queue.size || player.queue.current) {
        await player.play();
      }

      if (data.position) player.seek(data.position);
      if (data.paused) player.pause(true);
      player.loop = data.loop;
      player[247] = data[247];

      await sendPStatus(client, kazagumo, player, { from: 'playerRestore' });
      savePlayers(kazagumo);
      console.log(head, `Restore player for ${chalk.yellowBright(player.guildId)}`);

    } catch (e) {
      console.error("Restore player error:", e);
    }
  }

  console.log(head, `Restore players complete`);
}

export function autoDisconnect(kazagumo: Kazagumo) {
  const head = chalk.bold('[AutoDC]');
  setInterval(() => {
    const now = Date.now();

    for (const player of kazagumo.players.values()) {
      const last = player.latestUpdate ?? 0;
      const diff = now - last;

      if(diff > 7*24*60*60*1000 && !player[247]){
        console.log(head,`Destroy player ${player.guildId}`);
        player.destroy();
        continue;
      };

      if(diff > 10*60*1000 && player.voiceId){
        if(player.queue.current || player.queue.size || player[247])continue;
        console.log(head,`Disconnect ${player.guildId}`);
        if(player.playing || !player.paused)player.pause(true);
        player.destroy();
      };
    }
  }, 1*60*1_000);
}

function drawCover(ctx:any,img:any,w:number,h:number){
  const scale = Math.max(w/img.width,h/img.height)
  const x = (w-img.width*scale)/2
  const y = (h-img.height*scale)/2
  ctx.drawImage(img,x,y,img.width*scale,img.height*scale)
}

function drawWrapText(ctx:any,text:string,x:number,y:number,maxWidth:number,lineHeight:number){
  const words = text.split(" ")
  let line = ""

  for(const word of words){
    const test = line + word + " "
    const width = ctx.measureText(test).width

    if(width > maxWidth && line){
      ctx.fillText(line,x,y)
      line = word + " "
      y += lineHeight
    }else{
      line = test
    }
  }

  ctx.fillText(line,x,y)
}

const emojiCache = new Map<string, any>()

async function getEmoji(url:string){
  if(!emojiCache.has(url)){
    emojiCache.set(url, await loadImage(url))
  }
  return emojiCache.get(url)
}

export async function drawStatus(
  ctx:any,
  data:{
    position:string
    duration:string
    volume:number
    loop:string
    loopText:string
    nextSong?:string
  },
  x:number,
  y:number,
  maxWidth:number
){

  const loopIcons: Record<string,string> = {
    none: "https://cdn.discordapp.com/emojis/1399323885710872746.png",
    queue: "https://cdn.discordapp.com/emojis/1399323901619601498.png",
    track: "https://cdn.discordapp.com/emojis/1399323918061535384.png"
  }

  const parts = [
    {
      icon:"https://cdn.discordapp.com/emojis/1398230368921976922.png",
      text:`${data.position}/${data.duration}`
    },
    {
      icon:"https://cdn.discordapp.com/emojis/1399327081355284480.png",
      text:`${data.volume}%`
    },
    {
      icon:loopIcons[data.loop] || loopIcons.none,
      text:data.loopText
    }
  ]

  if(data.nextSong){
    parts.push({
      icon:"https://cdn.discordapp.com/emojis/1399323787203448894.png",
      text:data.nextSong
    })
  }

  let cx = x
  let cy = y

  for(const part of parts){

    const icon = await getEmoji(part.icon)

    const textWidth = ctx.measureText(part.text).width
    const blockWidth = 20 + 6 + textWidth + 20

    if(cx + blockWidth > x + maxWidth){
      cx = x
      cy += 24
    }

    ctx.drawImage(icon,cx,cy-16,18,18)
    cx += 24

    ctx.fillText(part.text,cx,cy)
    cx += textWidth + 20
  }
}

export async function createMusicCard(data:{
  track:any
  progress:number
  position:string
  duration:string
  volume:number
  loop:string
  loopText:string
  nextSong?:string
}){

  const canvas = createCanvas(800,250)
  const ctx = canvas.getContext("2d")

  const img = await loadImage(data.track?.thumbnail || "./src/utils/default.png")

  // background cover + blur
  ;(ctx as any).filter = "blur(30px)"
  drawCover(ctx,img,800,250)
  ;(ctx as any).filter = "none"

  // gradient
  const gradient = ctx.createLinearGradient(0,0,800,0)
  gradient.addColorStop(0,"rgba(0,0,0,0.85)")
  gradient.addColorStop(1,"rgba(0,0,0,0.3)")
  ctx.fillStyle = gradient
  ctx.fillRect(0,0,800,250)

  // thumbnail
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(20,20,210,210,20)
  ctx.clip()
  ctx.drawImage(img,20,20,210,210)
  ctx.restore()

  // title
  ctx.fillStyle = "#fff"
  ctx.font = "bold 28px Sans"
  drawWrapText(ctx,data.track?.title || "unknown",250,55,520,32)

  // author
  ctx.fillStyle = "#ccc"
  ctx.font = "20px Sans"
  drawWrapText(ctx,data.track?.author || "unknown",250,105,520,24)

  // progress bar bg
  ctx.fillStyle = "#444"
  ctx.beginPath()
  ctx.roundRect(250,135,500,10,5)
  ctx.fill()

  // progress
  // ctx.fillStyle = "#1db954"
  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.roundRect(250,135,500 * data.progress,10,5)
  ctx.fill()

  // requester
  ctx.fillStyle = "#fff"
  ctx.font = "18px Sans"
  ctx.fillText(`Requested by: ${(data.track?.requester as User)?.globalName || (data.track?.requester as User)?.username || "unknown"}`,250,175)

  // status
  ctx.font = "18px Sans"
  ctx.fillStyle = "#ddd"

  await drawStatus(
    ctx,
    {
      position:data.position,
      duration:data.duration,
      volume:data.volume,
      loop:data.loop,
      loopText:data.loopText,
      nextSong:data.nextSong
    },
    250,
    205,
    520
  )

  return canvas.toBuffer("image/png")
}
