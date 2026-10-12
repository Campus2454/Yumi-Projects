import chalk from "chalk";
import { Client } from "discord.js";
import { Kazagumo } from "kazagumo";

type UserVoiceState = { guildId: string; channelId: string; updatedAt: number; };
const userVoiceMap = new Map<string, UserVoiceState>();

async function syncVoiceStates(client: Client) {
  for(const g of client.guilds.cache.values()){
    g.members.cache.forEach(m=>{
      if(m.voice.channelId){
        userVoiceMap.set(m.id, {
          guildId: g.id,
          channelId: m.voice.channelId,
          updatedAt: Date.now()
        });
      };
    });
  };
  console.log(`${chalk.bold.yellowBright('[VoiceSync]')} ${userVoiceMap.size} guilds loaded`);
};

function voiceStateUpdateEvent(client: Client) {
  client.removeAllListeners('voiceStateUpdate');
  client.on('voiceStateUpdate', (oldS, newS)=>{
    const userId = newS.id;
    const guildId = newS.guild.id;
    const channelId = newS.channelId;

    if(channelId){
      userVoiceMap.set(userId, { guildId, channelId, updatedAt: Date.now() });
    }else{
      userVoiceMap.delete(userId);
    };
  });
};

export class PlayerServer {
  private client: Client;
  private kazagumo: Kazagumo;

  constructor(kazagumo: Kazagumo, client: Client){
    this.client = client;
    this.kazagumo = kazagumo;
  }

  async init() {
    try{
      await syncVoiceStates(this.client);
      voiceStateUpdateEvent(this.client);
    }catch(error){
      console.error(error);
    }
  }
};

export function getUserChannelId(userId: string) {
  return userVoiceMap.get(userId) ?? { 
    guildId: null,
    channelId: null,
    updatedAt: null
  };
};