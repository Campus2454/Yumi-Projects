import { ActivityType, DiscordAPIError } from "discord.js";
import { FindOneOptions, getRepository } from "typeorm";
import DiscordClient from "../client/client";
import { GuildConfiguration } from "../typeorm/entities/GuildConfiguration";
import { setTimeout as wait } from 'node:timers/promises';
import chalk from 'chalk';
import { AppDataSource } from "../data-source";

export class botEvents {
private readonly guildConfigRepository = AppDataSource.getRepository(GuildConfiguration)
events(client: DiscordClient) {
try{

client.on('guildCreate', async (guild) => {
    try{
      const options: FindOneOptions<GuildConfiguration> = { where: { guildId: guild.id } };
      const config = await this.guildConfigRepository.findOne(options);
      if(config){
        // console.log((chalk.green(' joined')),`${guild.name}`,(chalk.yellow(`| server count ${client.guilds.cache.size} | A configuration was found!`)));
        client.configs.set(guild.id, config);
      }else{
        // console.log((chalk.green(' joined')),`${guild.name}`,(chalk.yellow(`| server count ${client.guilds.cache.size} | A configuration was NOT found. Creating One.`)));
        const newConfig = this.guildConfigRepository.create({
          guildId: guild.id,
        });
        const savedConfig = await this.guildConfigRepository.save(newConfig);
        client.configs.set(guild.id, savedConfig);
      };
    }catch(error: any){
      if(error.message){return console.error(error.message)};
      return console.error(error);
    }
});client.on('guildDelete', async (guild) => {
    try{
      // console.log((chalk.red(' leave')),` ${guild.name}`);
      const config = await this.guildConfigRepository.findOne({ where: { guildId: guild.id } });
      if(config){
        await this.guildConfigRepository.delete(guild.id)
        client.configs.delete(guild.id);
      };
    }catch(error: any){
      if(error.message){return console.error(error.message)};
      return console.error(error);
    }
});


}catch(error){
  if(error instanceof DiscordAPIError){
      if(String(error.code).startsWith('10')){
          return process.stdout.write('');
      };
  };
  console.warn(chalk.red('[Camming BE]'), chalk.yellow(error));
}
}}