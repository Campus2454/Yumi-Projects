import { DiscordAPIError, Guild, Message, MessagePayload, User } from 'discord.js';
import BaseEvent from '../utils/structures/BaseEvent';
import DiscordClient from '../client/client';
// import { getRepository } from 'typeorm';
import { GuildConfiguration } from '../typeorm/entities/GuildConfiguration';
import { Membership } from '../typeorm/entities/membership';
import { InteractionElements } from '../slashCommands/interactionElements';
import { interactionCache } from '../utils/cacheUtils';
import { setTimeout as wait } from 'node:timers/promises';
import chalk from 'chalk';
import { AppDataSource } from '../data-source';
const interactionElements = new InteractionElements;

export class events {
private readonly guildConfigRepository = AppDataSource.getRepository(GuildConfiguration)
private readonly membershipRepository = AppDataSource.getRepository(Membership)
events(client: DiscordClient) {
try{

client.on('messageCreate', async (message) => {
  const config = await this.guildConfigRepository.findOne({ where: { guildId: message.guildId as string } });
  const matchesCommand = (commandMessage: string) => { return message.content.toLowerCase() == config?.prefix+commandMessage };

  if(matchesCommand('prefix')){
    message.reply('Prefix คือ : **`'+config?.prefix+'`**');
  }if(matchesCommand('ping')){
    message.reply('🏓 **Pong**!  <a:loading2:1231898437474193498>').then((Message) => {
    let ping = Math.round(client.ws.ping);
    wait(ping * 2);
    if (ping >= 999){Message.edit('🏓 **Pong**!  <a:loading:1211212089947979807>'+' `'+ping+'ms`');}
    else if (ping >= 501){Message.edit('🏓 **Pong**!  <:ping3:1231145932436017213>'+' `'+ping+'ms`');}
    else if (ping >= 401 && ping <= 500){Message.edit('🏓 **Pong**!  <:ping2:1231145930317762600>'+' `'+ping+'ms`');}
    else if (ping >= 251 && ping <= 400){Message.edit('🏓 **Pong**!  <:ping1:1231145926710530130>'+' `'+ping+'ms`');}
    else if (ping >= 0 && ping <= 250){Message.edit('🏓 **Pong**!  <:ping:1231145924898586685>'+' `'+ping+'ms`');}
    else if (ping == -1){Message.edit('🏓 **Pong**!  Error to checking latency. Please try again.');}
    else {Message.edit('🏓 **Pong**!  Error to checking latency. `'+ping+'ms`')}
    })
  }
});client.on('guildMemberAdd', async (member) => {
  try{
    const config = await this.guildConfigRepository.findOne({ where: { guildId: member.guild.id } });

    if(config){
      const welcome = config.welcomeSetting?.welcome;
      if(welcome?.isEnabled){
        function replacePlaceholders(text?: string) {
          return text ? text
            .replace(/{userTag}/g, `<@${member.id}>`)
            .replace(/{userName}/g, member.user.username)
            .replace(/{userAvatar}/g, member.displayAvatarURL() || '')
            .replace(/{memberCount}/g, member.guild.memberCount.toString())
            .replace(/{serverName}/g, member.guild.name)
            .replace(/{serverIcon}/g, member.guild.iconURL() || '') : ''
        };
        if(welcome.channel && welcome.isEnabled && welcome.channel.id){
          const channel = await member.guild.channels.fetch(welcome.channel.id);
          const message = welcome.channel.message;
          if(channel && channel.isSendable() && message){
            const replacedContent = message.content ? replacePlaceholders(message.content) : undefined;
            const replacedEmbeds: typeof message.embeds = message.embeds ? message.embeds.map((embed) => {
              const newEmbed: typeof embed = { ...embed };

              if (newEmbed.title) newEmbed.title = replacePlaceholders(newEmbed.title);
              if (newEmbed.description) newEmbed.description = replacePlaceholders(newEmbed.description);
              if (newEmbed.footer?.text) newEmbed.footer.text = replacePlaceholders(newEmbed.footer.text);
              if (newEmbed.author?.name) newEmbed.author.name = replacePlaceholders(newEmbed.author.name);
              if (newEmbed.fields) {
                newEmbed.fields = newEmbed.fields.map((field): typeof field => ({
                  name: replacePlaceholders(field.name),
                  value: replacePlaceholders(field.value),
                  inline: field.inline,
                }));
              }

              return newEmbed;
            }) : undefined;
            await channel.send(MessagePayload.create(channel, { content: replacedContent, embeds: replacedEmbeds }));
          }
        }if(welcome.user && welcome.user.isEnabled){
          const message = welcome.user.message;
          const dm = await member.createDM();
          if(dm && dm.isSendable() && message){
            const replacedContent = message.content ? replacePlaceholders(message.content) : undefined;
            const replacedEmbeds: typeof message.embeds = message.embeds ? message.embeds.map((embed) => {
              const newEmbed: typeof embed = { ...embed };

              if (newEmbed.title) newEmbed.title = replacePlaceholders(newEmbed.title);
              if (newEmbed.description) newEmbed.description = replacePlaceholders(newEmbed.description);
              if (newEmbed.footer?.text) newEmbed.footer.text = replacePlaceholders(newEmbed.footer.text);
              if (newEmbed.author?.name) newEmbed.author.name = replacePlaceholders(newEmbed.author.name);
              if (newEmbed.fields) {
                newEmbed.fields = newEmbed.fields.map((field): typeof field => ({
                  name: replacePlaceholders(field.name),
                  value: replacePlaceholders(field.value),
                  inline: field.inline,
                }));
              }

              return newEmbed;
            }) : undefined;
            await dm.send(MessagePayload.create(dm, { content: replacedContent, embeds: replacedEmbeds }));
          }
        }
      };
      return;
    };
  }catch(error: any){
    throw error
  }
});client.on('guildMemberRemove', async (member) => {
  try{
    const config = await this.guildConfigRepository.findOne({ where: { guildId: member.guild.id } });
    await interactionElements.user_update_message(member.guild);

    if(config){
      const goodbye = config.welcomeSetting?.goodbye;
      if(goodbye?.isEnabled){
        function replacePlaceholders(text?: string) {
          return text ? text
            .replace(/{userTag}/g, `<@${member.id}>`)
            .replace(/{userName}/g, member.user.username)
            .replace(/{userAvatar}/g, member.displayAvatarURL() || '')
            .replace(/{memberCount}/g, member.guild.memberCount.toString())
            .replace(/{serverName}/g, member.guild.name)
            .replace(/{serverIcon}/g, member.guild.iconURL() || '') : ''
        };
        if(goodbye.channel && goodbye.isEnabled && goodbye.channel.id){
          const channel = await member.guild.channels.fetch(goodbye.channel.id);
          const message = goodbye.channel.message;
          if(channel && channel.isSendable() && message){
            const replacedContent = message.content ? replacePlaceholders(message.content) : undefined;
            const replacedEmbeds: typeof message.embeds = message.embeds ? message.embeds.map((embed) => {
              const newEmbed: typeof embed = { ...embed };

              if (newEmbed.title) newEmbed.title = replacePlaceholders(newEmbed.title);
              if (newEmbed.description) newEmbed.description = replacePlaceholders(newEmbed.description);
              if (newEmbed.footer?.text) newEmbed.footer.text = replacePlaceholders(newEmbed.footer.text);
              if (newEmbed.author?.name) newEmbed.author.name = replacePlaceholders(newEmbed.author.name);
              if (newEmbed.fields) {
                newEmbed.fields = newEmbed.fields.map((field): typeof field => ({
                  name: replacePlaceholders(field.name),
                  value: replacePlaceholders(field.value),
                  inline: field.inline,
                }));
              }

              return newEmbed;
            }) : undefined;
            await channel.send(MessagePayload.create(channel, { content: replacedContent, embeds: replacedEmbeds }));
          }
        }if(goodbye.user && goodbye.user.isEnabled){
          const message = goodbye.user.message;
          const dm = await member.createDM();
          if(dm && dm.isSendable() && message){
            const replacedContent = message.content ? replacePlaceholders(message.content) : undefined;
            const replacedEmbeds: typeof message.embeds = message.embeds ? message.embeds.map((embed) => {
              const newEmbed: typeof embed = { ...embed };

              if (newEmbed.title) newEmbed.title = replacePlaceholders(newEmbed.title);
              if (newEmbed.description) newEmbed.description = replacePlaceholders(newEmbed.description);
              if (newEmbed.footer?.text) newEmbed.footer.text = replacePlaceholders(newEmbed.footer.text);
              if (newEmbed.author?.name) newEmbed.author.name = replacePlaceholders(newEmbed.author.name);
              if (newEmbed.fields) {
                newEmbed.fields = newEmbed.fields.map((field): typeof field => ({
                  name: replacePlaceholders(field.name),
                  value: replacePlaceholders(field.value),
                  inline: field.inline,
                }));
              }

              return newEmbed;
            }) : undefined;
            await dm.send(MessagePayload.create(dm, { content: replacedContent, embeds: replacedEmbeds }));
          }
        }
      };
      return;
    };
  }catch(error: any){
    throw error
  }
});client.on('guildMemberUpdate', async (oldMember, newMember) => {
  if(oldMember.communicationDisabledUntil != newMember.communicationDisabledUntil){
    await interactionElements.user_update_message(newMember.guild);
  };
});client.on('guildBanAdd', async (ban) => {
  await interactionElements.user_update_message(ban.guild);
});client.on('guildBanRemove', async (ban) => {
  await interactionElements.user_update_message(ban.guild);
});


}catch(error){
  if(error instanceof DiscordAPIError){
      if(String(error.code).startsWith('10')){
          return process.stdout.write('');
      };
  };
  console.warn(chalk.red('[Camming EV]'), chalk.yellow(error));
}
}}