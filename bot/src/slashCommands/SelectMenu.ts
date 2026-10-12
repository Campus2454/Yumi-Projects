import { ButtonBuilder, ButtonStyle, CacheType, DiscordAPIError, Interaction, MessageFlags, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle } from "discord.js";
import DiscordClient from "../client/client";
import { InteractionElements } from "./interactionElements";
import { AuditLogSettings, logEvents } from "../types";
// import { getRepository } from "typeorm";
import { GuildConfiguration } from "../typeorm/entities/GuildConfiguration";
import chalk from "chalk";
import { setTimeout as wait } from 'node:timers/promises';
import { AppDataSource } from "../data-source";
const interactionElements = new InteractionElements;
const { ActionRowBuilder, EmbedBuilder } = require('discord.js');

export class selectMenu {
private readonly guildConfigRepository = AppDataSource.getRepository(GuildConfiguration)
selectMenu(interaction: Interaction<CacheType>, client: DiscordClient) {

(async () => {
try{
let config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guildId as string } });


//  =======================  [ StringSelectMenu ]  =======================  \\


if(interaction.isStringSelectMenu()){

    // Send Command \\
    if(interaction.customId === 'send_option'){
        const loadingEmoji = '<a:loading2:1231898437474193498>';
        const warningMessage_th = `-# :warning: หากหน้าต่างกรอกข้อมูลไม่ปรากฎ โปรดลองใช้คำสั่งอีกครั้ง หรือแจ้งนักพัฒนา ได้ที่[Discord](https://discord.com/channels/1018508978445099098/1134123486382657606)`;
        const warningMessage_us = `-# :warning: If the input window does not appear, please try the command again or contact the developer on [Discord](https://discord.com/channels/1018508978445099098/1134123486382657606)`;
        if(interaction.values.includes('message')){
            if(interaction.locale == 'th'){
            await interaction.showModal(interactionElements.send_message_modal(interaction));
            // await interaction.followUp({ content: `กำลังรอการป้อนข้อมูล ${loadingEmoji}\n\n${warningMessage_th}`, ephemeral: true });
            await interaction.followUp({ content: `${warningMessage_th}`, ephemeral: true });
            }else{
            await interaction.showModal(interactionElements.send_message_modal(interaction));
            // await interaction.followUp({ content: `Waiting for input data ${loadingEmoji}\n\n${warningMessage_us}`, ephemeral: true });
            await interaction.followUp({ content: `${warningMessage_us}`, ephemeral: true });
            };
        }else if(interaction.values.includes('embed')){
            await interaction.reply({
                embeds: [interactionElements.send_embed_guide(interaction)],
                components: interactionElements.send_embed_button(interaction.message, interaction),
            });
        };
    };

    // Timeout Command \\
    if(interaction.customId === 'timeout_duration'){
        if(!interaction.guild)return;try{
        if(!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) || !interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)){
            return await interaction.reply({ content: interactionElements.noAdminButtonPermission[interaction.locale || 'en-US'], ephemeral: true });
        };
        const duration = Math.min(interaction.values.map(Number).reduce((a, b) => a + b, 0), 28 * 24 * 60 * 60 * 1000);
        const reason = interaction.message.embeds[0].fields[2].value;
        const userId = interaction.message.embeds[0].fields[0].value.replace(/\D/g, '');
        if(!userId){
          const message = await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
          await wait(10_000);
          await message.delete();
          return;
        };
        let member = interaction.guild?.members.cache.get(userId);
        if(!member){
          try{
            member = await interaction.guild.members.fetch(userId);
            if(!member){
                const message = await interaction.update({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, embeds: [], components: [] });
                await wait(10_000);
                return await message.delete();
            };
          }catch{
            try{
              const message = await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
              await wait(10_000);
              return await message.delete();
            }catch{ return }
          };
        };
        return await interaction.update({ embeds: [interactionElements.timeout_confirm_embed(member, duration, reason, interaction)], components: interactionElements.timeout_button(interaction) })
        }catch(error){ throw error }
    };
}


//  =======================  [ ChannelSelectMenu ]  =======================  \\


if(interaction.isChannelSelectMenu()){

    // Send Command \\
    if(interaction.customId.startsWith('send')){
        if(interaction.customId === 'send_message_channel') {
            try {
                const message = interaction.message.content;
                const channelId = interaction.values.toString();
                const channel = await interaction.guild?.channels.fetch(channelId);
                if (channel && channel.isTextBased() && channel.permissionsFor(interaction.client.user)?.has(PermissionFlagsBits.SendMessages)) {
                await channel.send(message);
                if(interaction.locale == 'th'){
                    await interaction.message.fetch()
                    .then(async()=>{
                        await interaction.deferUpdate();
                        await interaction.editReply({
                        content: `<:check_mark:1227490709871919104> ส่งข้อความไปที่ <#${channel.id}> สำเร็จ`,
                        components: []
                        });
                    }).catch(async()=>{ 
                        await interaction.reply({
                        content: `<:check_mark:1227490709871919104> ส่งข้อความไปที่ <#${channel.id}> สำเร็จ`,
                        components: []
                        });
                    });
                }else{
                    await interaction.message.fetch()
                    .then(async()=>{
                        await interaction.deferUpdate();
                        await interaction.editReply({
                        content: `<:check_mark:1227490709871919104> Successfully sent message to <#${channel.id}>.`,
                        components: []
                        });
                    }).catch(async()=>{ 
                        await interaction.reply({
                        content: `<:check_mark:1227490709871919104> Successfully sent message to <#${channel.id}>.`,
                        components: []
                        });
                    });
                }
                await wait(10_000);
                await interaction.message.fetch()
                    .then(async()=>{ await interaction.deleteReply(); }).catch(()=>{ return });
                } else {
                await interaction.reply({
                    content: interaction.locale === 'th' ? `<:wrong_mark:1227494480446226493> ไม่สามารถส่งข้อความไปที่<#${channel?.id}>ได้ โปรดตรวจสอบสิทธิในการส่งข้อความของบอท` : `<:wrong_mark:1227494480446226493> Unable to send message to <#${channel?.id}>. Please check the bot's message permissions.`,
                    ephemeral: true
                });
                await wait(10_000);
                await interaction.message.fetch()
                    .then(async()=>{ await interaction.deleteReply(); }).catch(()=>{ return });
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        }else if(interaction.customId === 'send_embed_channel') {
            try {
                const embed = interaction.message.embeds[0];
                const channelId = interaction.values.toString();
                const channel = await interaction.guild?.channels.fetch(channelId);
                if (channel && channel.isTextBased() && channel.permissionsFor(interaction.client.user)?.has(PermissionFlagsBits.SendMessages)) {
                    await channel.send({ embeds: [embed] });
                    await interaction.message.fetch()
                    .then(async()=>{
                        await interaction.deferUpdate();
                        await interaction.editReply({
                            content: interaction.locale == 'th'
                                    ? `<:check_mark:1227490709871919104> ส่งฝังไปที่ <#${channel.id}> สำเร็จ`
                                    : `<:check_mark:1227490709871919104> Successfully sent embed to <#${channel.id}>.`,
                            embeds: [],
                            components: []
                        });
                    }).catch(async()=>{ 
                        await interaction.reply({
                            content: interaction.locale == 'th'
                                    ? `<:check_mark:1227490709871919104> ส่งฝังไปที่ <#${channel.id}> สำเร็จ`
                                    : `<:check_mark:1227490709871919104> Successfully sent embed to <#${channel.id}>.`,
                            embeds: [],
                            components: []
                        });
                    });
                    await wait(10_000);
                    await interaction.message.fetch()
                        .then(async()=>{ await interaction.deleteReply(); }).catch(()=>{ return });
                } else {
                    await interaction.reply({
                        content: interaction.locale === 'th'
                                ? `<:wrong_mark:1227494480446226493> ไม่สามารถส่งฝังไปที่<#${channel?.id}>ได้ โปรดตรวจสอบสิทธิในการส่งข้อความของบอท`
                                : `<:wrong_mark:1227494480446226493> Unable to send embed to <#${channel?.id}>. Please check the bot's message permissions.`,
                        ephemeral: true
                    });
                    await wait(10_000);
                    await interaction.message.fetch()
                        .then(async()=>{ await interaction.deleteReply(); }).catch(()=>{ return });
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        };
    };

    // AuditLog Command \\
    if(interaction.customId.startsWith('audit_log')){
        if(!interaction.memberPermissions?.has(PermissionFlagsBits.ViewAuditLog)){
            await interaction.reply({
              content: interaction.locale == 'th'
                ? 'คุณไม่มีสิทธิ์ `administrator` เพื่อที่จะให้ปุ่มนี้'
                : 'You do not have `administrator` permission to use this button.',
              ephemeral: true
            })
        }else if(interaction.customId === 'audit_log_set_all'){
            if (config == undefined){
                const newConfig = this.guildConfigRepository.create({
                guildId: interaction.guild?.id,
                });
                const savedConfig = await this.guildConfigRepository.save(newConfig);
                client.configs.set(interaction.guild?.id!, savedConfig);
                config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guildId as string } });
            };
            const channelId = interaction.values.toString();
            const auditLogSettings: AuditLogSettings = JSON.parse('{}');
            logEvents.forEach(event => {
                auditLogSettings[event as keyof AuditLogSettings] = channelId;
            });
            const embed = interactionElements.audit_log_embed(interaction);
        
            logEvents.forEach(event => {
                embed.addFields({
                    name: event.charAt(0).toUpperCase() + event.slice(1).replace(/_/g, ' '),
                    value: auditLogSettings[event as keyof AuditLogSettings]
                    ? `<#${auditLogSettings[event as keyof AuditLogSettings]}>`
                    : (interaction.locale == 'th' ? 'ไม่ได้ตั้งค่า' : 'not set'),
                    inline: true
                });
            });
        
            try{
                await interaction.deferUpdate();
                await interaction.editReply({ embeds: [embed], components: interactionElements.audit_log_button(interaction) });
            }catch(error){
                console.error(error);
                const errorMessage = interaction.locale == 'th'
                    ? '-# โปรดติดต่อนักพัฒนา [Discord](https://discord.com/channels/1018508978445099098/1134123486382657606)'
                    : '-# Please contact the developer [Discord](https://discord.com/channels/1018508978445099098/1134123486382657606)';
                try{
                    const err = error as Error;
                    await interaction.reply({
                        content: `${err.message}\n${errorMessage}`,
                        ephemeral: true
                    });
                }catch(replyError){
                    console.error('Failed to send error message:', replyError);
                };
            };
        }
    };

    // Welcome Command \\
    if(interaction.customId.startsWith('welcome')){
        if(!interaction.guild)return;
        try{
            if(!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
                return interaction.reply({ content: interactionElements.permis_admin_edit[interaction.locale || 'en-US'], flags: MessageFlags.Ephemeral });
            }if(!config){
                const newConfig = this.guildConfigRepository.create({ guildId: interaction.guild.id });
                await this.guildConfigRepository.save(newConfig);
                config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guild.id } }) as GuildConfiguration;
            };
            if(interaction.customId === 'welcome_channel_channel'){
                const channelId = interaction.values[0];
                const savedConfig = await this.guildConfigRepository.save({
                    ...config,
                    welcomeSetting: {
                        ...config.welcomeSetting,
                        welcome: {
                            ...config.welcomeSetting?.welcome,
                            isEnabled: config.welcomeSetting?.welcome?.isEnabled ?? false,
                            channel: {
                                ...config.welcomeSetting?.welcome?.channel,
                                isEnabled: config.welcomeSetting?.welcome?.channel?.isEnabled ?? false,
                                id: channelId
                            }
                        }
                    }
                });
                config = savedConfig;
                return interaction.update({ components: interactionElements.welcome_component(interaction, config) });
            };
            return interaction.update({ components: interactionElements.welcome_component(interaction, config) });
        }catch(error){
            throw error;
        }
    };

    // Goodbye Command \\
    if(interaction.customId.startsWith('goodbye')){
        if(!interaction.guild)return;
        try{
            if(!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
                return interaction.reply({ content: interactionElements.permis_admin_edit[interaction.locale || 'en-US'], flags: MessageFlags.Ephemeral });
            }if(!config){
                const newConfig = this.guildConfigRepository.create({ guildId: interaction.guild.id });
                await this.guildConfigRepository.save(newConfig);
                config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guild.id } }) as GuildConfiguration;
            };
            if(interaction.customId === 'goodbye_channel_channel'){
                const channelId = interaction.values[0];
                const savedConfig = await this.guildConfigRepository.save({
                    ...config,
                    welcomeSetting: {
                        ...config.welcomeSetting,
                        goodbye: {
                            ...config.welcomeSetting?.goodbye,
                            isEnabled: config.welcomeSetting?.goodbye?.isEnabled ?? false,
                            channel: {
                                ...config.welcomeSetting?.goodbye?.channel,
                                isEnabled: config.welcomeSetting?.goodbye?.channel?.isEnabled ?? false,
                                id: channelId
                            }
                        }
                    }
                });
                config = savedConfig;
                return interaction.update({ components: interactionElements.goodbye_component(interaction, config) });
            };
            return interaction.update({ components: interactionElements.goodbye_component(interaction, config) });
        }catch(error){
            throw error;
        }
    };
}
  


}catch(error){
    if(error instanceof DiscordAPIError){
        if(String(error.code).startsWith('10')){
            return;
        };
    }else{ console.warn(chalk.red('[Camming SM]'), chalk.yellow(error)); };
}
})();
}
}