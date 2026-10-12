import { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, CacheType, Interaction, ChannelSelectMenuBuilder, ColorResolvable, DiscordAPIError } from "discord.js";
import DiscordClient from "../client/client";
import { InteractionElements } from "./interactionElements";
import chalk from 'chalk';
import { setTimeout as wait } from 'node:timers/promises';
import { parseDuration } from "../utils/functions";
const interactionElements = new InteractionElements;
// const { ActionRowBuilder, EmbedBuilder } = require('discord.js');

export class modals {
modals(interaction: Interaction<CacheType>, client: DiscordClient) {
(async () => {
try{

    
const isUrl = (url: string) => { 
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
};
const isImageUrl = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        return !!(contentType && contentType.startsWith('image/'));
    } catch {
        return false;
    }
};

//  =======================  [ ModalSubmit ]  =======================  \\


if(interaction.isModalSubmit()){
  
    // Send Command \\
    if(interaction.customId.startsWith('send')){
        if (interaction.customId === 'send_message') {
            if(interaction.fields.getTextInputValue('send_message')){
            const message = interaction.fields.getTextInputValue('send_message');
            const components = [
                new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('send_message_channel')
                        .setPlaceholder(interaction.locale === 'th' ? 'โปรดเลือกช่องที่ต้องการส่งข้อความนี้' : 'Please select the channel to send this message')
                        .setChannelTypes(0, 2, 5, 10, 11, 12, 13, 14, 15, 16)
                ),
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('send_message_edit')
                        .setLabel(interaction.locale === 'th' ? 'แก้ไข' : 'Edit')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('✏️'),
                    new ButtonBuilder()
                        .setCustomId('send_message_cancel')
                        .setLabel(interaction.locale === 'th' ? 'ยกเลิก' : 'Cancel')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji({ name: 'wrong_mark', id: '1227494480446226493' }),
                ),
            ];
            await interaction.reply({
                content: message,
                components: components,
            });
            }
        } else if (interaction.customId === 'send_embed_author') {
            const author = {
                title: interaction.fields.getTextInputValue('send_embed_author_text') || null,
                url: interaction.fields.getTextInputValue('send_embed_author_url') || null,
                icon: interaction.fields.getTextInputValue('send_embed_author_icon') || null
            };
            const embed = interaction.message?.embeds[1]
                ? EmbedBuilder.from(interaction.message.embeds[1])
                : new EmbedBuilder();
            if (author.title) {
                const authorData: { name: string, url?: string, iconURL?: string } = {
                    name: author.title,
                };
        
                if (author.url && isUrl(author.url)) {
                    authorData.url = author.url;
                }
        
                if (author.icon && isUrl(author.icon) && await isImageUrl(author.icon)) {
                    authorData.iconURL = author.icon;
                }
        
                embed.setAuthor(authorData);
            } else {
                embed.setAuthor(null);
            };
            try {
                const warningMessage = interaction.locale === 'th'
                    ? `:warning: ไม่สามารถโหลดรูปภาพได้ ลิงก์รูปภาพอาจมีปัญหา (${author.icon})`
                    : `Failed to load image. Image link may be invalid (${author.icon})`;
            
                await interaction.deferUpdate();
            
                if (author.title && author.icon && !(await isImageUrl(author.icon))) {
                    await interaction.editReply({
                        content: warningMessage,
                        embeds: [interactionElements.send_embed_guide(interaction), embed],
                    });
                } else if (author.title) {
                    await interaction.editReply({
                        content: '',
                        embeds: [interactionElements.send_embed_guide(interaction), embed],
                    });
                } else {
                    embed.setAuthor(null);
            
                    const hasNoComponents = !embed.data.author &&
                                            !embed.data.title &&
                                            !embed.data.description &&
                                            !(embed.data.fields?.some(field => field.name && field.value)) &&
                                            !embed.data.image &&
                                            !embed.data.thumbnail &&
                                            !embed.data.footer &&
                                            !embed.data.timestamp;
            
                    await interaction.editReply({
                        content: '',
                        embeds: hasNoComponents
                            ? [interactionElements.send_embed_guide(interaction)]
                            : [interactionElements.send_embed_guide(interaction), embed],
                    });
                }
            
                await interaction.editReply({
                    components: interactionElements.send_embed_button(interaction.message, interaction),
                });
            } catch (error) {
                try {
                    await interaction.reply({ content: `${error}` });
                } catch {
                    console.error(" - ❗ เกิดข้อผิดพลาด ไม่สามารถส่งข้อความผิดพลาดไปที่ดิสคอร์ดได้:", error);
                }
            };       
        } else if (interaction.customId === 'send_embed_title') {
            const title = interaction.fields.getTextInputValue('send_embed_title') || null;
            const url = interaction.fields.getTextInputValue('send_embed_url') || null;
        
            const embed = interaction.message?.embeds[1]
                ? EmbedBuilder.from(interaction.message.embeds[1])
                : new EmbedBuilder();
        
            if (title) {
                embed.setTitle(title);
            } else {
                embed.setTitle(null);
            }
        
            if (url && isUrl(url)) {
                embed.setURL(url);
            } else {
                embed.setURL(null);
            }
        
            try {
                const hasNoComponents = !embed.data.author &&
                                        !embed.data.title &&
                                        !embed.data.description &&
                                        !(embed.data.fields?.some(field => field.name && field.value)) &&
                                        !embed.data.image &&
                                        !embed.data.thumbnail &&
                                        !embed.data.footer &&
                                        !embed.data.timestamp;
        
                await interaction.deferUpdate();
                
                await interaction.editReply({
                    content: '',
                    embeds: hasNoComponents
                        ? [interactionElements.send_embed_guide(interaction)]
                        : [interactionElements.send_embed_guide(interaction), embed],
                });
        
                await interaction.editReply({
                    components: interactionElements.send_embed_button(interaction.message, interaction),
                });
            } catch (error) {
                try {
                    await interaction.reply({ content: `${error}` });
                } catch {
                    console.error(" - ❗ เกิดข้อผิดพลาด ไม่สามารถส่งข้อความผิดพลาดไปที่ดิสคอร์ดได้:", error);
                }
            }
        } else if (interaction.customId === 'send_embed_description') {
            const description = interaction.fields.getTextInputValue('send_embed_description') || null;
            const embed = interaction.message?.embeds[1]
                ? EmbedBuilder.from(interaction.message.embeds[1])
                : new EmbedBuilder();
        
            if (description) {
                embed.setDescription(description);
            } else {
                embed.setDescription(null);
            }
        
            try {
                const hasNoComponents = !embed.data.author &&
                                        !embed.data.title &&
                                        !embed.data.description &&
                                        !(embed.data.fields?.some(field => field.name && field.value)) &&
                                        !embed.data.image &&
                                        !embed.data.thumbnail &&
                                        !embed.data.footer &&
                                        !embed.data.timestamp;
        
                await interaction.deferUpdate();
                await interaction.editReply({
                    content: '',
                    embeds: hasNoComponents
                        ? [interactionElements.send_embed_guide(interaction)]
                        : [interactionElements.send_embed_guide(interaction), embed],
                });
        
                await interaction.editReply({
                    components: interactionElements.send_embed_button(interaction.message, interaction),
                });
            } catch (error) {
                try {
                    await interaction.reply({ content: `${error}` });
                } catch {
                    console.error(" - ❗ เกิดข้อผิดพลาด ไม่สามารถส่งข้อความผิดพลาดไปที่ดิสคอร์ดได้:", error);
                }
            }
        } else if (interaction.customId === 'send_embed_field1') {
            const field1Name = interaction.fields.getTextInputValue('send_embed_field_name') || null;
            const field1Value = interaction.fields.getTextInputValue('send_embed_field_value') || null;
            const field1Inline = interaction.fields.getTextInputValue('send_embed_field_inline') === 'true' ||
                                 interaction.fields.getTextInputValue('send_embed_field_inline') === 'จริง';
        
            const embed = interaction.message?.embeds[1]
                ? EmbedBuilder.from(interaction.message.embeds[1])
                : new EmbedBuilder();
        
            const field2 = embed.data.fields?.[1] || null;
            
            embed.setFields([]);
            if(field1Name && field1Value){
                embed.addFields({ name: field1Name, value: field1Value, inline: field1Inline });
            };
            if(field2){embed.addFields({ name: field2.name, value: field2.value, inline: field1Inline });};
        
            try {
                const hasNoComponents = !embed.data.author &&
                                        !embed.data.title &&
                                        !embed.data.description &&
                                        !(embed.data.fields?.some(field => field.name && field.value)) &&
                                        !embed.data.image &&
                                        !embed.data.thumbnail &&
                                        !embed.data.footer &&
                                        !embed.data.timestamp;
        
                await interaction.deferUpdate();
                await interaction.editReply({
                    content: '',
                    embeds: hasNoComponents
                        ? [interactionElements.send_embed_guide(interaction)]
                        : [interactionElements.send_embed_guide(interaction), embed],
                });
        
                await interaction.editReply({
                    components: interactionElements.send_embed_button(interaction.message, interaction),
                });
            } catch (error) {
                try {
                    await interaction.reply({ content: `${error}` });
                } catch {
                    console.error(" - ❗ เกิดข้อผิดพลาด ไม่สามารถส่งข้อความผิดพลาดไปที่ดิสคอร์ดได้:", error);
                }
            };
        } else if (interaction.customId === 'send_embed_field2') {
            const field2Name = interaction.fields.getTextInputValue('send_embed_field_name') || null;
            const field2Value = interaction.fields.getTextInputValue('send_embed_field_value') || null;
            const field2Inline = interaction.fields.getTextInputValue('send_embed_field_inline') === 'true' ||
                                 interaction.fields.getTextInputValue('send_embed_field_inline') === 'จริง';
        
            const embed = interaction.message?.embeds[1]
                ? EmbedBuilder.from(interaction.message.embeds[1])
                : new EmbedBuilder();
        
            const field1 = embed.data.fields?.[0] || null;
        
            embed.setFields([]);
            if(field1){embed.addFields({ name: field1.name, value: field1.value, inline: field2Inline });};
            if (field2Name && field2Value) {
                embed.addFields({ name: field2Name, value: field2Value, inline: field2Inline });
            };
        
            try {
                const hasNoComponents = !embed.data.author &&
                                        !embed.data.title &&
                                        !embed.data.description &&
                                        !(embed.data.fields?.some(field => field.name && field.value)) &&
                                        !embed.data.image &&
                                        !embed.data.thumbnail &&
                                        !embed.data.footer &&
                                        !embed.data.timestamp;
        
                await interaction.deferUpdate();
                await interaction.editReply({
                    content: '',
                    embeds: hasNoComponents
                        ? [interactionElements.send_embed_guide(interaction)]
                        : [interactionElements.send_embed_guide(interaction), embed],
                });
        
                await interaction.editReply({
                    components: interactionElements.send_embed_button(interaction.message, interaction),
                });
            } catch (error) {
                try {
                    await interaction.reply({ content: `${error}` });
                } catch {
                    console.error(" - ❗ เกิดข้อผิดพลาด ไม่สามารถส่งข้อความผิดพลาดไปที่ดิสคอร์ดได้:", error);
                }
            };
        } else if (interaction.customId === 'send_embed_thumbnail') {
            const thumbnailUrl = interaction.fields.getTextInputValue('send_embed_thumbnail') || null;
        
            const embed = interaction.message?.embeds[1]
                ? EmbedBuilder.from(interaction.message.embeds[1])
                : new EmbedBuilder();
        
            if (thumbnailUrl && isUrl(thumbnailUrl) && await isImageUrl(thumbnailUrl)) {
                embed.setThumbnail(thumbnailUrl);
            } else {
                embed.setThumbnail(null);
            };
        
            try {
                const warningMessage = interaction.locale === 'th'
                    ? `:warning: ไม่สามารถโหลดรูปภาพได้ ลิงก์รูปภาพอาจมีปัญหา (${thumbnailUrl})`
                    : `Failed to load image. Image link may be invalid (${thumbnailUrl})`;
            
                const hasNoComponents = !embed.data.author &&
                                        !embed.data.title &&
                                        !embed.data.description &&
                                        !(embed.data.fields?.some(field => field.name && field.value)) &&
                                        !embed.data.image &&
                                        !embed.data.thumbnail &&
                                        !embed.data.footer &&
                                        !embed.data.timestamp;
        
                await interaction.deferUpdate();
    
                if (thumbnailUrl && !(await isImageUrl(thumbnailUrl))) {
                    await interaction.editReply({
                        content: warningMessage,
                        embeds: [interactionElements.send_embed_guide(interaction), embed],
                    });
                } else {
                    await interaction.editReply({
                        content: '',
                        embeds: hasNoComponents
                            ? [interactionElements.send_embed_guide(interaction)]
                            : [interactionElements.send_embed_guide(interaction), embed],
                    });
                }
        
                await interaction.editReply({
                    components: interactionElements.send_embed_button(interaction.message, interaction),
                });
            } catch (error) {
                try {
                    await interaction.reply({ content: `${error}` });
                } catch {
                    console.error(" - ❗ เกิดข้อผิดพลาด ไม่สามารถส่งข้อความผิดพลาดไปที่ดิสคอร์ดได้:", error);
                }
            };
        } else if (interaction.customId === 'send_embed_image') {
            const image = interaction.fields.getTextInputValue('send_embed_image') || null;
        
            const embed = interaction.message?.embeds[1]
                ? EmbedBuilder.from(interaction.message.embeds[1])
                : new EmbedBuilder();
        
            if (image && isUrl(image) && await isImageUrl(image)) {
                embed.setImage(image);
            } else {
                embed.setImage(null);
            };
        
            try {
                const warningMessage = interaction.locale === 'th'
                    ? `:warning: ไม่สามารถโหลดรูปภาพได้ ลิงก์รูปภาพอาจมีปัญหา (${image})`
                    : `Failed to load image. Image link may be invalid (${image})`;
            
                const hasNoComponents = !embed.data.author &&
                                        !embed.data.title &&
                                        !embed.data.description &&
                                        !(embed.data.fields?.some(field => field.name && field.value)) &&
                                        !embed.data.image &&
                                        !embed.data.thumbnail &&
                                        !embed.data.footer &&
                                        !embed.data.timestamp;
        
                await interaction.deferUpdate();
    
                if (image && !(await isImageUrl(image))) {
                    await interaction.editReply({
                        content: warningMessage,
                        embeds: [interactionElements.send_embed_guide(interaction), embed],
                    });
                } else {
                    await interaction.editReply({
                        content: '',
                        embeds: hasNoComponents
                            ? [interactionElements.send_embed_guide(interaction)]
                            : [interactionElements.send_embed_guide(interaction), embed],
                    });
                }
        
                await interaction.editReply({
                    components: interactionElements.send_embed_button(interaction.message, interaction),
                });
            } catch (error) {
                try {
                    await interaction.reply({ content: `${error}` });
                } catch {
                    console.error(" - ❗ เกิดข้อผิดพลาด ไม่สามารถส่งข้อความผิดพลาดไปที่ดิสคอร์ดได้:", error);
                }
            };
        } else if (interaction.customId === 'send_embed_footer') {
            const footerText = interaction.fields.getTextInputValue('send_embed_footer_text') || null;
            const footerIconUrl = interaction.fields.getTextInputValue('send_embed_footer_icon') || null;
            const timestampValue = interaction.fields.getTextInputValue('send_embed_timestamp') || null;
        
            const embed = interaction.message?.embeds[1]
                ? EmbedBuilder.from(interaction.message.embeds[1])
                : new EmbedBuilder();
        
            embed.setFooter(null);
        
            if (footerText) {
                const footerData: { text: string, iconURL?: string } = {
                    text: footerText,
                };;
        
                if (footerIconUrl && isUrl(footerIconUrl) && await isImageUrl(footerIconUrl)) {
                    footerData.iconURL = footerIconUrl;
                }
        
                embed.setFooter(footerData);
            }
    
            if (timestampValue) {
                const timestampPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
                if (timestampPattern.test(timestampValue)) {
                    const [datePart, timePart] = timestampValue.split(' ');
                    const dateParts = datePart.split('-');
                    const timeParts = timePart.split(':');
                    
                    const timestamp = new Date(
                        parseInt(dateParts[0], 10),
                        parseInt(dateParts[1], 10) - 1,
                        parseInt(dateParts[2], 10),
                        parseInt(timeParts[0], 10),
                        parseInt(timeParts[1], 10),
                    );
            
                    embed.setTimestamp(timestamp);
                }
            } else {
                embed.setTimestamp(null);
            };
        
            try {
                const timestampErrorMessage = interaction.locale === 'th'
                    ? `:warning: รูปแบบของ เวลา ไม่ถูกต้อง: (${timestampValue})`
                    : `:warning: The timestamp format is invalid (${footerIconUrl})`;
                const warningMessage = interaction.locale === 'th'
                    ? `:warning: ไม่สามารถโหลดรูปภาพได้ ลิงก์รูปภาพอาจมีปัญหา (${footerIconUrl})`
                    : `:warning: Failed to load image. Image link may be invalid (${footerIconUrl})`;
            
                const hasNoComponents = !embed.data.author &&
                                        !embed.data.title &&
                                        !embed.data.description &&
                                        !(embed.data.fields?.some(field => field.name && field.value)) &&
                                        !embed.data.image &&
                                        !embed.data.thumbnail &&
                                        !embed.data.footer &&
                                        !embed.data.timestamp;
        
                await interaction.deferUpdate();
    
                if (footerIconUrl && !(await isImageUrl(footerIconUrl))) {
                    await interaction.editReply({
                        content: warningMessage,
                        embeds: [interactionElements.send_embed_guide(interaction), embed],
                    });
                } else {
                    await interaction.editReply({
                        content: '',
                        embeds: hasNoComponents
                            ? [interactionElements.send_embed_guide(interaction)]
                            : [interactionElements.send_embed_guide(interaction), embed],
                    });
                }
        
                await interaction.editReply({
                    components: interactionElements.send_embed_button(interaction.message, interaction),
                });
            } catch (error) {
                try {
                    await interaction.reply({ content: `${error}` });
                } catch {
                    console.error(" - ❗ เกิดข้อผิดพลาด ไม่สามารถส่งข้อความผิดพลาดไปที่ดิสคอร์ดได้:", error);
                }
            }
        } else if (interaction.customId === 'send_embed_color') {
            if(interaction.message?.embeds[1]){
                const colorValue = interaction.fields.getTextInputValue('send_embed_color') || null;
        
                const isValidColor = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);
    
                const embed = EmbedBuilder.from(interaction.message.embeds[1]);
    
                if(colorValue && isValidColor(colorValue)){
                    try{
                        embed.setColor(colorValue as ColorResolvable);
                    }catch{
                        console.error(" - ❗ เกิดข้อผิดพลาดในการตั้งค่าสี:", colorValue);
                    };
                }else{
                    embed.setColor(null);
                };
            
                try{
                    const hasNoComponents = !embed.data.author &&
                                            !embed.data.title &&
                                            !embed.data.description &&
                                            !(embed.data.fields?.some(field => field.name && field.value)) &&
                                            !embed.data.image &&
                                            !embed.data.thumbnail &&
                                            !embed.data.footer &&
                                            !embed.data.timestamp &&
                                            !embed.data.color;
            
                    await interaction.deferUpdate();
                    await interaction.editReply({
                        content: '',
                        embeds: hasNoComponents
                            ? [interactionElements.send_embed_guide(interaction)]
                            : [interactionElements.send_embed_guide(interaction), embed],
                    });
            
                    await interaction.editReply({
                        components: interactionElements.send_embed_button(interaction.message, interaction),
                    });
                }catch(error){
                    try{
                        await interaction.reply({ content: `${error}` });
                    }catch{
                        console.error(" - ❗ เกิดข้อผิดพลาด ไม่สามารถส่งข้อความผิดพลาดไปที่ดิสคอร์ดได้:", error);
                    };
                };
            }else{return};
        }
    }

    // Ban Command \\
    if(interaction.customId.startsWith('ban')){
        try{
        if(interaction.customId === 'ban_reason'){
            const userId = interaction.message?.embeds[0].fields[0].value.replace(/\D/g, '');
            if(!userId)return await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
            const user = (await client.users.fetch(userId, { force: true }));
            const reason = interaction.components[0].components[0].value || null;
            await interaction.deferUpdate();
            return await interaction.editReply({ embeds: [interactionElements.ban_confirm_embed(user, reason, interaction)], components: interactionElements.ban_button(interaction) });
        };
        }catch(error){ throw error };
    }

    // Ban Command \\
    if(interaction.customId.startsWith('kick')){
        try{
        if(interaction.customId === 'kick_reason'){
            const userId = interaction.message?.embeds[0].fields[0].value.replace(/\D/g, '');
            if(!userId)return await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
            const user = (await client.users.fetch(userId, { force: true }));
            const reason = interaction.components[0].components[0].value || null;
            await interaction.deferUpdate();
            return await interaction.editReply({ embeds: [interactionElements.kick_confirm_embed(user, reason, interaction)], components: interactionElements.kick_button(interaction) });
        };
        }catch(error){ throw error };
    }

    // Timeout Command \\
    if(interaction.customId.startsWith('timeout')){
        if(!interaction.guild || !interaction.message)return;try{
        if(interaction.customId === 'timeout_reason'){
            const duration = parseDuration(interaction.message.embeds[0].fields[1].value, interaction.guildLocale || 'en-US');
            const reason = interaction.components[0].components[0].value || null;
            const userId = interaction.message.embeds[0].fields[0].value.replace(/\D/g, '');
            let member = interaction.guild?.members.cache.get(userId);
            if(!member){
              try{
                member = await interaction.guild.members.fetch(userId);
                if(!member){
                    const message = await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, embeds: [], components: [] });
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
            await interaction.deferUpdate();
            return await interaction.editReply({ embeds: [interactionElements.timeout_confirm_embed(member, duration, reason, interaction)], components: interactionElements.timeout_button(interaction) });
        }}catch(error){ throw error }
    }
    
}



}catch(error){
    if(error instanceof DiscordAPIError){
        if(String(error.code).startsWith('10')){
            return;
        };
    }else{ console.warn(chalk.red('[Camming MS]'), chalk.yellow(error)); };
}
})();
}
}