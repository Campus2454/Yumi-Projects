import { Client } from "discord.js";
import { Connectors, NodeOption } from "shoukaku";
import Env from "./utils/env.js";
import chalk from "chalk";
import { Kazagumo, Plugins } from "kazagumo";
import { sendPStatus } from "./utils/messages.js";
import { savePlayers } from "./utils/function.js";


export default class KazagumoManager {
  constructor(client: Client) {
    const headS = chalk.green.bold('[Shoukaku]');
    const headSE = chalk.redBright.bold('[Shoukaku ERROR]');
    const headSD = chalk.yellow.bold('[Shoukaku DEBUG]');
    const headK = chalk.green.bold('[Kazagumo]');
    const headKE = chalk.redBright.bold('[Kazagumo ERROR]');
    const headKD = chalk.yellow.bold('[Kazagumo DEBUG]');
    const Nodes: NodeOption[] = [
      // {
      //   name: 'TH',
      //   url: Env('LAVALINK_HOST_TH') || '',
      //   auth: Env('LAVALINK_PASS_TH') || 'youshallnotpass',
      //   secure: Env('LAVALINK_SECURE_TH')?.toLowerCase() == 'true',
      // },
      // {
      //   name: 'CA',
      //   url: Env('LAVALINK_HOST_CA') || '',
      //   auth: Env('LAVALINK_PASS_CA') || 'youshallnotpass',
      //   secure: Env('LAVALINK_SECURE_CA')?.toLowerCase() == 'true',
      // },
      // {
      //   name: 'SG',
      //   url: Env('LAVALINK_HOST_SG') || '',
      //   auth: Env('LAVALINK_PASS_SG') || 'youshallnotpass',
      //   secure: Env('LAVALINK_SECURE_SG')?.toLowerCase() == 'true',
      // },
      {
        name: 'TEST',
        url: Env('LAVALINK_HOST') || '',
        auth: Env('LAVALINK_PASS') || 'youshallnotpass',
        secure: Env('LAVALINK_SECURE')?.toLowerCase() == 'true',
      },
    ];
    const kazagumo = new Kazagumo({
      defaultSearchEngine: "youtube_music",
      send: (guildId, payload)=>{
          const guild = client.guilds.cache.get(guildId);
          if(guild)guild.shard.send(payload);
      },
      plugins: [new Plugins.PlayerMoved(client)]
    }, new Connectors.DiscordJS(client), Nodes, { moveOnDisconnect: true });
    kazagumo.nodes = Nodes;

    kazagumo.shoukaku.on('ready', (name) => console.log(headS, `Node ${chalk.bold(name)} is ready!`));
    kazagumo.shoukaku.on('error', (name, error) => console.error(headSE, `Node ${chalk.bold(name)} error:`, error.message));
    kazagumo.shoukaku.on('disconnect', (name, count) => console.error(headSE, `Node ${chalk.bold(name)} disconnected: ${count}`));
    kazagumo.shoukaku.on('reconnecting', (name, reconnectsLeft, reconnectInterval) => console.debug(headSD, `Node ${chalk.bold(name)} reconnecting in ${reconnectInterval}s`, chalk.yellow(`(${reconnectsLeft})`)));

    kazagumo.on('playerCreate', async(p)=>{
      console.log(headK, `Player was created: ${chalk.bold(p.guildId)}`);
      p.setVolume(20);
      p.pause(false);
      p.showInfo = false;
      p.latestUpdate = Date.now();
      savePlayers(kazagumo);
 });kazagumo.on('playerStart', async(p, t)=>{
      console.log(headK, `Player was started: ${chalk.bold(p.guildId)}`);
      await sendPStatus(client, kazagumo, p, { from: 'playerStart event' });
      savePlayers(kazagumo);
 });kazagumo.on('playerEnd', async(p)=>{
      console.log(headK, `Player was ended: ${chalk.bold(p.guildId)}`);
      await sendPStatus(client, kazagumo, p, { from: 'playerEnd event' });
      if(p[247] !== true && p.queue.isEmpty && !p.queue.current && p.loop == 'none'){await p.destroy()};
      savePlayers(kazagumo);
 });kazagumo.on('playerUpdate', async(p, data)=>{
      console.log(headK, `Player was updated: ${chalk.bold(p.guildId)}`);
      const player = kazagumo.players.get(p.guildId);
      if(!player)return;

      console.debug({playing: player.playing, paused: player.paused});

      player.latestUpdate = Date.now();
      if(!player.queue.current && player.queue.size == 0 && player[247] == false){
        try{player.disconnect();}
        catch{(e: any)=>{console.log('')}};
      };

      await sendPStatus(client, kazagumo, player, { from: 'playerUpdate event' });
      savePlayers(kazagumo);
 });kazagumo.on('playerMoved', async(p, state, channels)=>{
      console.log(headK, `Player was moved: ${chalk.bold(p.guildId)}`);
      if(state === 'LEFT' && channels.oldChannelId){
        console.log(headK, `Bot was kicked from channel ${channels.oldChannelId}`);
        p.shoukaku.clean();
      };
      savePlayers(kazagumo);
 });kazagumo.on('playerDestroy', async(p)=>{
      console.log(headK, `Player was destroy: ${chalk.bold(p.guildId)}`);
      savePlayers(kazagumo);

      const c = p.textId && p.messageId && await client.channels.fetch(p.textId);
      const oldM = c && p.messageId && c.isSendable() && await c.messages.fetch(p.messageId);
      if(oldM && oldM.deletable)await oldM.delete();
 });

    kazagumo.on('debug', async(m)=>{
      console.debug(headKD, m);
    });

    (async()=>{while(true){
      await new Promise(res => setTimeout(res, 10_000));
      try{
        for(const node of Nodes){
          // console.debug(headSD, `Node ${chalk.bold(node.name)} status is ${Array.from(kazagumo.shoukaku.nodes.values()).find(n=>n.name == node.name)?.state}`);
          if(!kazagumo.shoukaku.nodes.has(node.name)){
            kazagumo.shoukaku.addNode(node);
            console.debug(headSD, `Trying to reconnect to Node ${chalk.bold(node.name)}`);
          }
        }
      }catch(err){
        console.error(headSE, 'Loop error:', err);
      };
      await new Promise(res => setTimeout(res, 10_000));
    }})();

    return kazagumo;
  }
};
