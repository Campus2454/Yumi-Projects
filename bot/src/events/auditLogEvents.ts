import { AuditLogEvent, CacheType, Channel, ChannelFlagsBitField, ChannelType, ClientUser, Collection, DiscordAPIError, EmbedBuilder, Guild, GuildChannel, GuildMember, Interaction, InteractionType, Message, PermissionsBitField, Role, TextChannel, ThreadChannel, User } from "discord.js";
import DiscordClient from "../client/client";
// import { getRepository } from "typeorm";
import { GuildConfiguration } from "../typeorm/entities/GuildConfiguration";
import { AuditLogSettings } from "../types";
import { setTimeout as wait } from 'node:timers/promises';
import chalk from 'chalk';
import { AppDataSource } from "../data-source";

export class auditLogEvents {
private readonly guildConfigRepository = AppDataSource.getRepository(GuildConfiguration)
events(client: DiscordClient) {
try{

client.on('guildMemberAdd', async (member) => {
    const guildId = member.guild.id;
    let config = await this.guildConfigRepository.findOne({ where: { guildId } });
    if (!config) return;
    const auditLogSettings: AuditLogSettings = JSON.parse(config?.auditLogSettings || '{}');
    if (auditLogSettings.member_joined) {
        const channel = member.guild.channels.cache.get(auditLogSettings.member_joined);
        if(channel && channel.isSendable()){
            const embed = new EmbedBuilder()
                .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() || undefined })
                .setDescription(`👋  **<@${member.id}> ${member.guild.preferredLocale == 'th' ? 'เข้าร่วมเซิร์ฟเวอร์' : 'join the server'}**`)
                .setThumbnail(member.displayAvatarURL({ extension: 'png' }) || null)
                .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL({ extension: 'png' }) || undefined })
                .setTimestamp()
                .setColor('#066C33')
            ;
            await channel.send({ embeds: [embed] });
        };
    }
});client.on('guildMemberRemove', async (member) => {
    if(member.id == '1291978782571495465'){ return };
    if(!member.guild.members.me?.permissions.has('ViewAuditLog')){ return };

    try{
        const fetchedKickLog = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberKick,
        });
        const kickLog = fetchedKickLog.entries.first();
        if(kickLog){
            const kickTimeDiff = Date.now() - kickLog.createdAt.getTime();
            if (kickLog.target?.id === member.user.id && kickTimeDiff < 10 * 1000) { return };
        };
        const fetchedBanLog = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanAdd,
        });
        const banLog = fetchedBanLog.entries.first();
        if(banLog){
            const banTimeDiff = Date.now() - banLog.createdAt.getTime();
            if(banLog.target?.id === member.user.id && banTimeDiff < 10 * 1000){ return };
        };
    }catch{ return };

    const guildId = member.guild.id;
        let config = await this.guildConfigRepository.findOne({ where: { guildId } });
        if (!config) return;
        const auditLogSettings: AuditLogSettings = JSON.parse(config?.auditLogSettings || '{}');
        if (auditLogSettings.member_leaved) {
            const channel = member.guild.channels.cache.get(auditLogSettings.member_leaved);
            if(channel && channel.isSendable()){
                const embed = new EmbedBuilder()
                    .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() || undefined })
                    .setDescription(`👋  **<@${member.id}> ${member.guild.preferredLocale == 'th' ? 'ออกจากเซิร์ฟเวอร์' : 'leave the server'}**`)
                    .setThumbnail(member.displayAvatarURL({ extension: 'png' }) || null)
                    .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL({ extension: 'png' }) || undefined })
                    .setTimestamp()
                    .setColor('#ff3131')
                ;
                await channel.send({ embeds: [embed] });
            };
    }
// });client.on('guildBanAdd', async (ban) => {
//     const guildId = ban.guild.id;
//         let config = await this.guildConfigRepository.findOne({ where: { guildId } });
//         if(config){
//             const auditLogSettings: AuditLogSettings = JSON.parse(config?.auditLogSettings || '{}');
//             if (auditLogSettings.member_banned) {
//             const channel = ban.guild.channels.cache.get(auditLogSettings.member_banned);
//             if(channel && channel.isSendable()){
//                 const fetchedLogs = await ban.guild.fetchAuditLogs({
//                     limit: 1,
//                     type: AuditLogEvent.MemberBanAdd,
//                 });
//                 const banLog = fetchedLogs.entries.first();
//                 const banBy = () => {
//                     if(banLog?.target?.id == ban.user.id){
//                         return `<@${banLog?.executor?.id}>`;
//                     }else{
//                         return null;
//                     };
//                 };
    
//                 const embed = new EmbedBuilder()
//                     .setAuthor({ name: ban.user.displayName, iconURL: ban.user.displayAvatarURL() || undefined })
//                     .setDescription(`**✈️ <@${ban.user.id}> ${ban.guild.preferredLocale == 'th'
//                         ? 'ถูกแบนออกจากเซิร์ฟเวอร์'
//                         : 'was banned from the server'}**`)
//                     .setThumbnail(ban.user.displayAvatarURL({ extension: 'png' }) || null)
//                     .addFields(
//                         { name: ban.guild.preferredLocale == 'th' ? 'ชื่อผู้ใช้' : 'username', value: `<@${ban.user.id}>`, inline: true },
//                         { name: ban.guild.preferredLocale == 'th' ? 'แบนโดย' : 'Banned by', value: `${banBy()}`, inline: true },
//                         {
//                         name: ban.guild.preferredLocale == 'th' ? 'เหตุผล' : 'reason',
//                         value: ban.reason ?? ban.guild.preferredLocale == 'th' ? 'ไม่ได้ระบุเหตุผล' : 'no reason', inline: true
//                         }
//                     )
//                     .setFooter({ text: ban.guild.name, iconURL: ban.guild.iconURL({ extension: 'png' }) || undefined })
//                     .setTimestamp()
//                     .setColor('#ff3131')
//                 ;
//                 await channel.send({ embeds: [embed] });
//             };
//         }
//     };
// });client.on('guildBanRemove', async (ban) => {
//     const guildId = ban.guild.id;
//         let config = await this.guildConfigRepository.findOne({ where: { guildId } });
//         if(config){
//             const auditLogSettings: AuditLogSettings = JSON.parse(config?.auditLogSettings || '{}');
//             if (auditLogSettings.member_unbanned) {
//             const channel = ban.guild.channels.cache.get(auditLogSettings.member_unbanned);
//             if(channel && channel.isSendable()){
//                 const fetchedLogs = await ban.guild.fetchAuditLogs({
//                     limit: 1,
//                     type: AuditLogEvent.MemberBanRemove,
//                 });
//                 const banLog = fetchedLogs.entries.first();
//                 const banBy = () => {
//                     if(banLog?.target?.id == ban.user.id){
//                         return `<@${banLog?.executor?.id}>`;
//                     }else{
//                         return null;
//                     };
//                 };
    
//                 const embed = new EmbedBuilder()
//                     .setAuthor({ name: ban.user.displayName, iconURL: ban.user.displayAvatarURL() || undefined })
//                     .setDescription(`**🛬 <@${ban.user.id}> ${ban.guild.preferredLocale == 'th'
//                         ? 'ถูกปลดแบนแล้ว'
//                         : 'has been unbanned'}**`)
//                     .setThumbnail(ban.user.displayAvatarURL({ extension: 'png' }) || null)
//                     .addFields(
//                         { name: ban.guild.preferredLocale == 'th' ? 'ชื่อผู้ใช้' : 'username', value: `<@${ban.user.id}>`, inline: true },
//                         { name: ban.guild.preferredLocale == 'th' ? 'ปลดแบนโดย' : 'unbanned by', value: `${banBy()}`, inline: true },
//                         {
//                         name: ban.guild.preferredLocale == 'th' ? 'เหตุผล' : 'reason',
//                         value: ban.reason ?? ban.guild.preferredLocale == 'th' ? 'ไม่ได้ระบุเหตุผล' : 'no reason', inline: true
//                         }
//                     )
//                     .setFooter({ text: ban.guild.name, iconURL: ban.guild.iconURL({ extension: 'png' }) || undefined })
//                     .setTimestamp()
//                     .setColor('#302c34')
//                 ;
//                 await channel.send({ embeds: [embed] });
//             };
//         }
//     };
});client.on('guildAuditLogEntryCreate', async (auditLogEntry, guild) => {
    const guildId = guild.id;
    let config = await this.guildConfigRepository.findOne({ where: { guildId } });
    if(!config){ return };
    const auditLogSettings: AuditLogSettings = JSON.parse(config?.auditLogSettings || '{}');

    // console.log(auditLogEntry.action);
    // console.log(auditLogEntry.changes);
    // console.log(auditLogEntry.extra);
    // console.log(auditLogEntry);

    if(auditLogEntry.action == AuditLogEvent.MemberBanAdd){
        if (auditLogSettings.member_banned) {
            const channel = guild.channels.cache.get(auditLogSettings.member_banned);
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const target = auditLogEntry.target as User;
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() || undefined })
                    .setDescription(`**✈️  <@${target.id}> ${guild.preferredLocale == 'th'
                        ? 'ถูกแบนออกจากเซิร์ฟเวอร์'
                        : 'was banned from the server'}**`)
                    .setThumbnail(target.displayAvatarURL({ extension: 'png' }) || null)
                    .addFields(
                        { name: guild.preferredLocale == 'th' ? 'ชื่อผู้ใช้' : 'username', value: `<@${target.id}>`, inline: true },
                        { name: guild.preferredLocale == 'th' ? 'แบนโดย' : 'banned by', value: `<@${auditLogEntry.executorId}>`, inline: true },
                        {
                        name: guild.preferredLocale == 'th' ? 'เหตุผล' : 'reason',
                        value: auditLogEntry.reason ?? guild.preferredLocale == 'th' ? 'ไม่ได้ระบุเหตุผล' : 'no reason', inline: true
                        }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL({ extension: 'png' }) || undefined })
                    .setTimestamp()
                    .setColor('#ff3131')
                );
                await channel.send({ embeds: [embed] });
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.MemberBanRemove){
        if (auditLogSettings.member_unbanned) {
            const channel = guild.channels.cache.get(auditLogSettings.member_unbanned);
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const target = auditLogEntry.target as User;
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() || undefined })
                    .setDescription(`**🛬  <@${target.id}> ${guild.preferredLocale == 'th'
                        ? 'ถูกปลดแบนแล้ว'
                        : 'has been unbanned'}**`)
                    .setThumbnail(target.displayAvatarURL({ extension: 'png' }) || null)
                    .addFields(
                        { name: guild.preferredLocale == 'th' ? 'ชื่อผู้ใช้' : 'username', value: `<@${target.id}>`, inline: true },
                        { name: guild.preferredLocale == 'th' ? 'ปลดแบนโดย' : 'unbanned by', value: `<@${auditLogEntry.executorId}>`, inline: true },
                        {
                        name: guild.preferredLocale == 'th' ? 'เหตุผล' : 'reason',
                        value: auditLogEntry.reason ?? guild.preferredLocale == 'th' ? 'ไม่ได้ระบุเหตุผล' : 'no reason', inline: true
                        }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL({ extension: 'png' }) || undefined })
                    .setTimestamp()
                    .setColor('#302c34')
                );
                await channel.send({ embeds: [embed] });
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.MemberKick){
        if (auditLogSettings.member_kicked) {
            const channel = guild.channels.cache.get(auditLogSettings.member_kicked);
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const target = auditLogEntry.target as User;
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() || undefined })
                    .setDescription(`**✈️  <@${target.id}> ${guild.preferredLocale == 'th'
                        ? 'ถูกเตะออกจากเซิร์ฟเวอร์'
                        : 'was kicked from the server'}**`)
                    .setThumbnail(target.displayAvatarURL({ extension: 'png' }) || null)
                    .addFields(
                        { name: guild.preferredLocale == 'th' ? 'ชื่อผู้ใช้' : 'username', value: `<@${target.id}>`, inline: true },
                        { name: guild.preferredLocale == 'th' ? 'เตะโดย' : 'kicked by', value: `<@${auditLogEntry.executorId}>`, inline: true },
                        {
                            name: guild.preferredLocale == 'th' ? 'เหตุผล' : 'reason',
                            value: auditLogEntry.reason ?? guild.preferredLocale == 'th' ? 'ไม่ได้ระบุเหตุผล' : 'no reason', inline: true
                        }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL({ extension: 'png' }) || undefined })
                    .setTimestamp()
                    .setColor('#db7528')
                );
                await channel.send({ embeds: [embed] });
            }
        };
    }else if(auditLogEntry.action == AuditLogEvent.MemberRoleUpdate){
        if(auditLogSettings.member_role_updated){
            const channel = guild.channels.cache.get(auditLogSettings.member_role_updated);
            if(channel && channel.isTextBased()){
                const executor = auditLogEntry.executor as User;
                const target = auditLogEntry.target as User;
                const changes = auditLogEntry.changes;
                const beforeRoles = (changes.find(change => change.key === '$remove')?.new as { id: string }[] || []).map(role => role.id);
                const afterRoles = (changes.find(change => change.key === '$add')?.new as { id: string }[] || []).map(role => role.id);
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() || undefined })
                    .setDescription(`**:writing_hand:  <@${target.id}> ${guild.preferredLocale === 'th' ? 'ได้รับการเปลี่ยนแปลงบทบาท' : 'has changed roles'}**`)
                    .setThumbnail(target.displayAvatarURL({ extension: 'png' }) || null)
                    .setFooter({ text: guild.name, iconURL: guild.iconURL({ extension: 'png' }) || undefined })
                    .setTimestamp()
                    .setColor('#7289da')
                );
                let roles = '';
                const addedRoles = afterRoles.filter(roleId => !beforeRoles.includes(roleId));
                if(addedRoles.length > 0){
                    roles += `${addedRoles.map(id => `\n✅ <@&${id}>`).join('')}`;
                };
                const removedRoles = beforeRoles.filter(roleId => !afterRoles.includes(roleId));
                if(removedRoles.length > 0){
                    roles += `${removedRoles.map(id => `\n⛔ <@&${id}>`).join('')}`;
                };
                const member = guild.members.cache.get(target.id);
                const memberRoles = member 
                    ? member.roles.cache.filter(role => role.id !== guild.id && !addedRoles.includes(role.id))
                    : new Collection<string, Role>();
                if(memberRoles.size > 0){
                    roles += `${memberRoles.map(role => `\n<:slash_mark:1227495506440224768> <@&${role.id}>`).join('')}`;
                };
                if(roles) embed.addFields({ name: guild.preferredLocale === 'th' ? 'บทบาท' : 'roles', value: roles, inline: true });
                embed.addFields(
                    { name: guild.preferredLocale === 'th' ? 'ชื่อผู้ใช้' : 'username', value: `<@${target.id}>`, inline: true },
                    { name: guild.preferredLocale === 'th' ? 'แก้ไขโดย' : 'edited by', value: `<@${auditLogEntry.executorId}>`, inline: true }
                );
                await channel.send({ embeds: [embed] });
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.RoleCreate){
        if(auditLogSettings.role_created){
            const channel = guild.channels.cache.get(auditLogSettings.role_created)
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const role = auditLogEntry.target as Role;
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: guild.iconURL() || undefined })
                    .setDescription(`**${guild.preferredLocale == 'th'
                        ? 'ได้สร้างบทบาท `'+role.name+'` แล้ว'
                        : '`'+role.name+'` role has been created.'
                    }**`)
                    .addFields(
                        { name: guild.preferredLocale === 'th' ? 'บทบาท' : 'role', value: '<@&'+role.id+'>', inline: true },
                        { name: guild.preferredLocale === 'th' ? 'สร้างโดย' : 'created by', value: `<@${auditLogEntry.executorId}>`, inline: true }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                    .setTimestamp()
                    .setColor('#d9d8d8')
                );
                await channel.send({ embeds: [embed] });
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.RoleUpdate){
        if(auditLogSettings.role_updated){
            const channel = guild.channels.cache.get(auditLogSettings.role_updated)
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const role = auditLogEntry.target as Role;
                const name = auditLogEntry.changes.find(change => change.key === 'name');
                const color = auditLogEntry.changes.find(change => change.key === 'color');
                const permissions = auditLogEntry.changes.find(change => change.key === 'permissions');
                const hoist = auditLogEntry.changes.find(change => change.key === 'hoist');
                const mentionable = auditLogEntry.changes.find(change => change.key === 'mentionable');
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: guild.iconURL() || undefined })
                    .setDescription(`**${guild.preferredLocale == 'th'
                        ? 'อัปเดตบทบาท `'+role.name+'` แล้ว'
                        : '`'+role.name+'` role has been updated.'
                    }**`)
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                    .setTimestamp()
                    .setColor(role.color || '#066c33')
                );
                if(permissions?.new != permissions?.old){
                    const permissionsOld = new PermissionsBitField(BigInt(permissions?.old as string | number)).toArray();
                    const permissionsNew = new PermissionsBitField(BigInt(permissions?.new as string | number)).toArray();
                    let permission = '';
                    const addedPermissions = permissionsNew.filter(p => !permissionsOld.includes(p));
                    if(addedPermissions.length > 0){
                        permission += `${addedPermissions.map(name => `\n✅ ${name}`).join('')}`;
                    };
                    const removedPermissions = permissionsOld.filter(p => !permissionsNew.includes(p));
                    if(removedPermissions.length > 0){
                        permission += `${removedPermissions.map(name => `\n⛔ ${name}`).join('')}`;
                    };
                    if(permission){ embed.addFields({ name: guild.preferredLocale == 'th' ? 'การอนุญาต' : 'permissions', value: permission, inline: true }); };
                }if(name?.new != name?.old){
                    embed.addFields({
                        name: guild.preferredLocale == 'th' ? 'ชื่อ' : 'name',
                        value: guild.preferredLocale == 'th'
                            ? `- **เก่า :**\n  - ${name?.old}\n - **ใหม่ :**\n  - ${name?.new}`
                            : `- **old :**\n  - ${name?.old}\n - **new :**\n  - ${name?.new}`,
                        inline: true
                    });
                }if(color?.new != color?.old){
                    const newColorHex = `#${(color?.new as string | number).toString(16).padStart(6, '0')}`;
                    const oldColorHex = `#${(color?.old as string | number).toString(16).padStart(6, '0')}`;
                    embed.addFields({
                        name: guild.preferredLocale == 'th' ? 'สี' : 'color',
                        value: guild.preferredLocale == 'th'
                            ? `- **เก่า :**\n  - ${oldColorHex}\n - **ใหม่ :**\n  - ${newColorHex}`
                            : `- **old :**\n  - ${oldColorHex}\n - **new :**\n  - ${newColorHex}`,
                        inline: true
                    });
                }if(hoist?.new != hoist?.old){
                    embed.addFields({
                        name: guild.preferredLocale == 'th' ? 'ยก' : 'hoist',
                        value: guild.preferredLocale == 'th'
                            ? `${hoist?.new}`
                            : `${hoist?.new}`,
                        inline: true
                    });
                }if(mentionable?.new != mentionable?.old){
                    embed.addFields({
                        name: guild.preferredLocale == 'th' ? 'สามารถกล่าวถึงได้' : 'mentionable',
                        value: guild.preferredLocale == 'th'
                            ? `${mentionable?.new}`
                            : `${mentionable?.new}`,
                        inline: true
                    });
                };
                embed.addFields(
                    { name: guild.preferredLocale === 'th' ? 'อัปเดตโดย' : 'updated by', value: `<@${auditLogEntry.executorId}>`, inline: true }
                );
                await channel.send({ embeds: [embed] });
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.RoleDelete){
        if(auditLogSettings.role_deleted){
            const channel = guild.channels.cache.get(auditLogSettings.role_deleted)
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const role = auditLogEntry.target as Role;
                const roleName = auditLogEntry.changes.find(change => change.key === 'name')?.old as string || 'Unknown Role';
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: guild.iconURL() || undefined })
                    .setDescription(`**${guild.preferredLocale == 'th'
                        ? 'ได้ลบบทบาท `'+roleName+'` แล้ว'
                        : '`'+roleName+'` role has been deleted.'
                    }**`)
                    .addFields(
                        { name: guild.preferredLocale === 'th' ? 'บทบาท' : 'role', value: '`@'+roleName+'`', inline: true },
                        { name: guild.preferredLocale === 'th' ? 'ลบโดย' : 'deleted by', value: `<@${auditLogEntry.executorId}>`, inline: true }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                    .setTimestamp()
                    .setColor('#171220')
                );
                await channel.send({ embeds: [embed] });
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.ChannelCreate){
        if(auditLogSettings.channel_created){
            const channel = guild.channels.cache.get(auditLogSettings.channel_created);
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const target = auditLogEntry.target as GuildChannel;
                function getChannelTypeName(type: number, locale: 'th' | 'en' = 'en', emoji: boolean = false): string {
                    const channelTypeMap: Record<'th' | 'en', Record<number, string>> = {
                        th: {
                            [ChannelType.GuildText]: 'ช่องข้อความ',
                            [ChannelType.GuildVoice]: 'ช่องเสียง',
                            [ChannelType.GuildCategory]: 'หมวดหมู่',
                            [ChannelType.GuildAnnouncement]: 'ช่องประกาศ',
                            [ChannelType.GuildStageVoice]: 'ช่องเวที',
                            [ChannelType.GuildDirectory]: 'ไดเรกทอรี',
                            [ChannelType.GuildForum]: 'ฟอรั่ม',
                        },
                        en: {
                            [ChannelType.GuildText]: 'Text Channel',
                            [ChannelType.GuildVoice]: 'Voice Channel',
                            [ChannelType.GuildCategory]: 'Category',
                            [ChannelType.GuildAnnouncement]: 'Announcement Channel',
                            [ChannelType.GuildStageVoice]: 'Stage Channel',
                            [ChannelType.GuildDirectory]: 'Directory Channel',
                            [ChannelType.GuildForum]: 'Forum',
                        },
                    };
                    const channelEmojiMap: Record<number, string> = {
                        [ChannelType.GuildText]: '<:TextChannel:1299608265121861673>',
                        [ChannelType.GuildVoice]: '<:VoiceChannel:1299608261858955264>',
                        [ChannelType.GuildCategory]: '<:TextChannel:1299608265121861673>',
                        [ChannelType.GuildAnnouncement]: '<:AnnouncementChannel:1299651564235128852>',
                        [ChannelType.GuildStageVoice]: '<:StageChannel:1299608255542329396>',
                        [ChannelType.GuildDirectory]: '<:TextChannel:1299608265121861673>',
                        [ChannelType.GuildForum]: '<:ForumChannel:1299608251385516103>',
                    };
                
                    if(!emoji)return channelTypeMap[locale][type] || (locale === 'th' ? 'ประเภทช่องที่ไม่รู้จัก' : 'Unknown Channel Type');
                    else return channelEmojiMap[type] || '';
                };
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: guild.iconURL() || undefined })
                    .setDescription(`${getChannelTypeName(target.type, undefined, true)}  **${guild.preferredLocale == 'th'
                        ? 'ช่อง `'+target.name+'` ได้ถูกสร้างขึ้นแล้ว'
                        : '`'+target.name+'` channel has been created.'
                    }**`)
                    .addFields(
                        { name: guild.preferredLocale === 'th' ? 'ช่อง' : 'channel', value: `<#${target.id}>`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'ประเภท' : 'type', value: `${getChannelTypeName(target.type, guild.preferredLocale === 'th' ? 'th' : 'en')}`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'สร้างโดย' : 'created by', value: `<@${auditLogEntry.executorId}>`, inline: true }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                    .setTimestamp()
                    .setColor('#302c34')
                );
                await channel.send({ embeds: [embed] });
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.ChannelUpdate || auditLogEntry.action == AuditLogEvent.ChannelOverwriteCreate || auditLogEntry.action == AuditLogEvent.ChannelOverwriteUpdate || auditLogEntry.action == AuditLogEvent.ChannelOverwriteDelete){
        if(auditLogSettings.channel_updated){
            const channel = guild.channels.cache.get(auditLogSettings.channel_updated);
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const target = auditLogEntry.target as GuildChannel;
                const name = auditLogEntry.changes.find(change => change.key === 'name');
                const topic = auditLogEntry.changes.find(change => change.key === 'topic');
                const nsfw = auditLogEntry.changes.find(change => change.key === 'nsfw');
                const rateLimit = auditLogEntry.changes.find(change => change.key === 'rate_limit_per_user');
                const archiveDuration = auditLogEntry.changes.find(change => change.key === 'default_auto_archive_duration');
                const type = auditLogEntry.changes.find(change => change.key === 'type');
                const id = auditLogEntry.changes.find(change => change.key === 'id');
                const allow = auditLogEntry.changes.find(change => change.key === 'allow');
                const deny = auditLogEntry.changes.find(change => change.key === 'deny');
                function getChannelTypeName(type: number, locale: 'th' | 'en' = 'en', emoji: boolean = false): string {
                    const channelTypeMap: Record<'th' | 'en', Record<number, string>> = {
                        th: {
                            [ChannelType.GuildText]: 'ช่องข้อความ',
                            [ChannelType.GuildVoice]: 'ช่องเสียง',
                            [ChannelType.GuildCategory]: 'หมวดหมู่',
                            [ChannelType.GuildAnnouncement]: 'ช่องประกาศ',
                            [ChannelType.GuildStageVoice]: 'ช่องเวที',
                            [ChannelType.GuildDirectory]: 'ไดเรกทอรี',
                            [ChannelType.GuildForum]: 'ฟอรั่ม',
                        },
                        en: {
                            [ChannelType.GuildText]: 'Text Channel',
                            [ChannelType.GuildVoice]: 'Voice Channel',
                            [ChannelType.GuildCategory]: 'Category',
                            [ChannelType.GuildAnnouncement]: 'Announcement Channel',
                            [ChannelType.GuildStageVoice]: 'Stage Channel',
                            [ChannelType.GuildDirectory]: 'Directory Channel',
                            [ChannelType.GuildForum]: 'Forum',
                        },
                    };
                    const channelEmojiMap: Record<number, string> = {
                        [ChannelType.GuildText]: '<:TextChannel:1299608265121861673>',
                        [ChannelType.GuildVoice]: '<:VoiceChannel:1299608261858955264>',
                        [ChannelType.GuildCategory]: '<:TextChannel:1299608265121861673>',
                        [ChannelType.GuildAnnouncement]: '<:AnnouncementChannel:1299651564235128852>',
                        [ChannelType.GuildStageVoice]: '<:StageChannel:1299608255542329396>',
                        [ChannelType.GuildDirectory]: '<:TextChannel:1299608265121861673>',
                        [ChannelType.GuildForum]: '<:ForumChannel:1299608251385516103>',
                    };
                
                    if(!emoji)return channelTypeMap[locale][type] || (locale === 'th' ? 'ประเภทช่องที่ไม่รู้จัก' : 'Unknown Channel Type');
                    else return channelEmojiMap[type] || '';
                };
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: guild.iconURL() || undefined })
                    .setDescription(`${getChannelTypeName(target.type, undefined, true)}  **${guild.preferredLocale == 'th'
                        ? 'ช่อง `'+target.name+'` ได้ถูกอัปเดตแล้ว'
                        : '`'+target.name+'` channel has been updated.'
                    }**`)
                    .addFields(
                        { name: guild.preferredLocale === 'th' ? 'ช่อง' : 'channel', value: `<#${auditLogEntry.targetId}>`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'ประเภท' : 'type', value: `${getChannelTypeName(target.type, guild.preferredLocale === 'th' ? 'th' : 'en')}`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'อัปเดตโดย' : 'updated by', value: `<@${auditLogEntry.executorId}>`, inline: true }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                    .setTimestamp()
                    .setColor('#864b8e')
                );
                if(auditLogEntry.action == AuditLogEvent.ChannelUpdate){
                    if(name && name.new != name.old){
                        embed.addFields({
                            name: guild.preferredLocale == 'th' ? 'ชื่อ' : 'name',
                            value: guild.preferredLocale == 'th'
                                ? `- **เก่า :**\n  - ${name.old}\n - **ใหม่ :**\n  - ${name.new}`
                                : `- **old :**\n  - ${name.old}\n - **new :**\n  - ${name.new}`,
                            inline: true
                        });
                    }if(topic && topic.new != topic.old){
                        embed.addFields({
                            name: guild.preferredLocale === 'th' ? 'หัวข้อ เก่า' : 'old topic',
                            value: '```'+`${topic.old || guild.preferredLocale === 'th' ? 'ไม่ได้ตั้งค่า' : 'not set'}`+'```',
                            inline: true
                        });
                        embed.addFields({
                            name: guild.preferredLocale === 'th' ? 'หัวข้อ ใหม่' : 'new topic',
                            value: '```'+`${topic.new || guild.preferredLocale === 'th' ? 'ไม่ได้ตั้งค่า' : 'not set'}`+'```',
                            inline: true
                        });
                    }if(rateLimit && rateLimit.new != rateLimit.old){
                        function rate(r: number) {
                            if(r === 0){
                                return `${guild.preferredLocale === 'th' ? 'ปิด' : 'off'}`;
                            }else if(r > 0 && r < 60){
                                return `${guild.preferredLocale === 'th' ? `${r}วินาที` : `${r}seconds`}`;
                            }else if(r >= 60 && r < 3600){
                                if(r == 60){
                                    return `${guild.preferredLocale === 'th' ? `${r/60}นาที` : `${r/60}minute`}`;
                                }else if(r > 60){
                                    return `${guild.preferredLocale === 'th' ? `${r/60}นาที` : `${r/60}minutes`}`;
                                };
                            }else if(r >= 3600){
                                if(r == 3600){
                                    return `${guild.preferredLocale === 'th' ? `${(r/60)/60}ชั่วโมง` : `${(r/60)/60}hour`}`;
                                }else if(r > 3600){
                                    return `${guild.preferredLocale === 'th' ? `${(r/60)/60}ชั่วโมง` : `${(r/60)/60}hours`}`;
                                };
                            };
                        };
                        embed.addFields({
                            name: guild.preferredLocale == 'th' ? 'โหมดช้า' : 'slow mode',
                            value: guild.preferredLocale == 'th'
                                ? `- **เก่า :**\n  - ${rate(rateLimit.old as number)}\n - **ใหม่ :**\n  - ${rate(rateLimit.new as number)}`
                                : `- **old :**\n  - ${rate(rateLimit.old as number)}\n - **new :**\n  - ${rate(rateLimit.new as number)}`,
                            inline: true
                        });
                    }if(nsfw && nsfw.new != nsfw.old){
                        embed.addFields({
                            name: guild.preferredLocale === 'th' ? 'จำกัดอายุ' : 'age limit',
                            value: nsfw.new ? `${guild.preferredLocale === 'th' ? 'เปิด' : 'enable'}` : `${guild.preferredLocale === 'th' ? 'ปิด' : 'disabled'}`,
                            inline: true
                        });
                    }if(type && type.new != type.old){
                        const newType = getChannelTypeName(type.new as number, guild.preferredLocale === 'th' ? 'th' : 'en');
                        const oldType = getChannelTypeName(type.old as number, guild.preferredLocale === 'th' ? 'th' : 'en');
                        embed.addFields({
                            name: guild.preferredLocale === 'th' ? 'ประเภท' : 'type',
                            value: guild.preferredLocale == 'th'
                            ? `- **เก่า :**\n  - ${oldType}\n - **ใหม่ :**\n  - ${newType}`
                            : `- **old :**\n  - ${oldType}\n - **new :**\n  - ${newType}`,
                            inline: true
                        });
                    }if(archiveDuration && archiveDuration.new != archiveDuration.old){
                        function time(t: number) {
                            if(t >= 60 && t <= 1440){
                                if(t == 60){
                                    return `${guild.preferredLocale === 'th' ? `${t/60}ชั่วโมง` : `${t/60}hour`}`;
                                }else if(t > 60){
                                    return `${guild.preferredLocale === 'th' ? `${t/60}ชั่วโมง` : `${t/60}hours`}`;
                                };
                            }else if(t > 1440 && t < 10080){
                                return `${guild.preferredLocale === 'th' ? `${(t/60)/24}วัน` : `${(t/60)/24}days`}`;
                            }if(t >= 10080){
                                if(t == 10080){
                                    return `${guild.preferredLocale === 'th' ? `${((t/60)/24)/7}สัปดาห์` : `${((t/60)/24)/7}week`}`;
                                }else if(t > 10080){
                                    return `${guild.preferredLocale === 'th' ? `${((t/60)/24)/7}สัปดาห์` : `${((t/60)/24)/7}weeks`}`;
                                };
                            };
                        };
                        embed.addFields({
                            name: guild.preferredLocale == 'th' ? 'ซ่อนหลังจากไม่ได้ใช้งาน' : 'hide after inactivity',
                            value: guild.preferredLocale == 'th'
                                ? `- **เก่า :**\n  - ${time(archiveDuration.old as number)}\n - **ใหม่ :**\n  - ${time(archiveDuration.new as number)}`
                                : `- **old :**\n  - ${time(archiveDuration.old as number)}\n - **new :**\n  - ${time(archiveDuration.new as number)}`,
                            inline: true
                        });
                    };
                }else{
                    if(auditLogEntry.action == AuditLogEvent.ChannelOverwriteCreate){
                        embed.addFields({
                            name: guild.preferredLocale === 'th' ? 'การอนุญาต' : 'permissions',
                            value: `${type?.new === 1 ? `✅ <@${id?.new}>` : `✅ <@&${id?.new}>`}`,
                            inline: true
                        });
                    }if(auditLogEntry.action == AuditLogEvent.ChannelOverwriteUpdate){
                        let per = '';
                        const newAllow = new PermissionsBitField(BigInt(allow?.new as string | number || 0)).toArray();
                        const oldAllow = new PermissionsBitField(BigInt(allow?.old as string | number || 0)).toArray();
                        const newDeny = new PermissionsBitField(BigInt(deny?.new as string | number || 0)).toArray();
                        const oldDeny = new PermissionsBitField(BigInt(deny?.old as string | number || 0)).toArray();
                        const addAllow = newAllow.filter(id => !oldAllow.includes(id));
                        if(addAllow.length > 0){
                            per += addAllow.map(p => `\n<:check_mark:1227490709871919104> ${p}`).join('');
                        };
                        const addDeny = newDeny.filter(id => !oldDeny.includes(id));
                        if(addDeny.length > 0){
                            per += addDeny.map(p => `\n<:wrong_mark:1227494480446226493> ${p}`).join('');
                        };
                        const reset = [...oldAllow, ...oldDeny].filter(id => !addAllow.includes(id) && !addDeny.includes(id));
                        if(reset.length > 0){
                            per += reset.map(p => `\n<:slash_mark:1227495506440224768> ${p}`).join('');
                        };
                        embed.addFields({
                            name: guild.preferredLocale === 'th' ? 'การอนุญาต' : 'permissions',
                            value: `${(auditLogEntry.extra as { id: string, type: string }).type === '1' ? `↘️ <@${(auditLogEntry.extra as User).id}>${per}` : `↘️ <@&${(auditLogEntry.extra as Role).id}>${per}`}`,
                            inline: true
                        });
                    }if(auditLogEntry.action == AuditLogEvent.ChannelOverwriteDelete){
                        embed.addFields({
                            name: guild.preferredLocale === 'th' ? 'การอนุญาต' : 'permissions',
                            value: `${type?.old === 1 ? `⛔ <@${id?.old}>` : `⛔ <@&${id?.old}>`}`,
                            inline: true
                        });
                    };
                };
                await channel.send({ embeds: [embed] });
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.ChannelDelete){
        if(auditLogSettings.channel_deleted){
            const channel = guild.channels.cache.get(auditLogSettings.channel_deleted);
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const target = auditLogEntry.target as GuildChannel;
                function getChannelTypeName(type: number, locale: 'th' | 'en' = 'en', emoji: boolean = false): string {
                    const channelTypeMap: Record<'th' | 'en', Record<number, string>> = {
                        th: {
                            [ChannelType.GuildText]: 'ช่องข้อความ',
                            [ChannelType.GuildVoice]: 'ช่องเสียง',
                            [ChannelType.GuildCategory]: 'หมวดหมู่',
                            [ChannelType.GuildAnnouncement]: 'ช่องประกาศ',
                            [ChannelType.GuildStageVoice]: 'ช่องเวที',
                            [ChannelType.GuildDirectory]: 'ไดเรกทอรี',
                            [ChannelType.GuildForum]: 'ฟอรั่ม',
                        },
                        en: {
                            [ChannelType.GuildText]: 'Text Channel',
                            [ChannelType.GuildVoice]: 'Voice Channel',
                            [ChannelType.GuildCategory]: 'Category',
                            [ChannelType.GuildAnnouncement]: 'Announcement Channel',
                            [ChannelType.GuildStageVoice]: 'Stage Channel',
                            [ChannelType.GuildDirectory]: 'Directory Channel',
                            [ChannelType.GuildForum]: 'Forum',
                        },
                    };
                    const channelEmojiMap: Record<number, string> = {
                        [ChannelType.GuildText]: '<:TextChannel:1299608265121861673>',
                        [ChannelType.GuildVoice]: '<:VoiceChannel:1299608261858955264>',
                        [ChannelType.GuildCategory]: '<:TextChannel:1299608265121861673>',
                        [ChannelType.GuildAnnouncement]: '<:AnnouncementChannel:1299651564235128852>',
                        [ChannelType.GuildStageVoice]: '<:StageChannel:1299608255542329396>',
                        [ChannelType.GuildDirectory]: '<:TextChannel:1299608265121861673>',
                        [ChannelType.GuildForum]: '<:ForumChannel:1299608251385516103>',
                    };
                
                    if(!emoji)return channelTypeMap[locale][type] || (locale === 'th' ? 'ประเภทช่องที่ไม่รู้จัก' : 'Unknown Channel Type');
                    else return channelEmojiMap[type] || '';
                };
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: guild.iconURL() || undefined })
                    .setDescription(`${getChannelTypeName(target.type, undefined, true)}  **${guild.preferredLocale == 'th'
                        ? 'ช่อง `'+target.name+'` ได้ถูกลบแล้ว'
                        : '`'+target.name+'` channel has been deleted.'
                    }**`)
                    .addFields(
                        { name: guild.preferredLocale === 'th' ? 'ช่อง' : 'channel', value: `#${target.name}`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'ประเภท' : 'type', value: `${getChannelTypeName(target.type, guild.preferredLocale === 'th' ? 'th' : 'en')}`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'ลบโดย' : 'deleted by', value: `<@${auditLogEntry.executorId}>`, inline: true }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                    .setTimestamp()
                    .setColor('#302c34')
                );
                await channel.send({ embeds: [embed] });
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.GuildUpdate){
        if(auditLogSettings.guild_updated){
            const channel = guild.channels.cache.get(auditLogSettings.guild_updated);
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const target = auditLogEntry.target as Guild;
                const icon = auditLogEntry.changes.find(change => change.key === 'icon_hash');
                const name = auditLogEntry.changes.find(change => change.key === 'name');
                // const afk_channel_id = auditLogEntry.changes.find(change => change.key === 'afk_channel_id');
                // const afk_timeout = auditLogEntry.changes.find(change => change.key === 'afk_timeout');
                // const system_channel_id = auditLogEntry.changes.find(change => change.key === 'system_channel_id');
                // const system_channel_flags = auditLogEntry.changes.find(change => change.key === 'system_channel_flags');
                // const default_message_notifications = auditLogEntry.changes.find(change => change.key === 'default_message_notifications');
                // const premium_progress_bar_enabled = auditLogEntry.changes.find(change => change.key === 'premium_progress_bar_enabled');
                // const banner = auditLogEntry.changes.find(change => change.key === 'banner_hash');
                // const image = auditLogEntry.changes.find(change => change.key === 'image_hash');
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: guild.iconURL() || undefined })
                    .setDescription(`:writing_hand:  **${guild.preferredLocale == 'th'
                        ? 'เซิร์ฟเวอร์ `'+target.name+'` ได้ถูกอัปเดตแล้ว'
                        : '`'+target.name+'` server has been updated.'
                    }**`)
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                    .setTimestamp()
                    .setColor('#428852')
                );
                if(icon && icon.new != icon.old){
                    embed.addFields(
                        {
                            name: guild.preferredLocale === 'th' ? 'ไอคอน' : 'icon',
                            value: guild.preferredLocale == 'th'
                                ? `- **เก่า :**\n  - [${icon.old}](https://cdn.discordapp.com/icons/${guild.id}/${icon.old})\n - **ใหม่ :**\n  - [${icon.new}](https://cdn.discordapp.com/icons/${guild.id}/${icon.new})`
                                : `- **old :**\n  - [${icon.old}](https://cdn.discordapp.com/icons/${guild.id}/${icon.old})\n - **new :**\n  - [${icon.new}](https://cdn.discordapp.com/icons/${guild.id}/${icon.new})`,
                            inline: true
                        }
                    );
                }if(name && name.new != name.old){
                    embed.addFields(
                        {
                            name: guild.preferredLocale === 'th' ? 'ชื่อ' : 'name',
                            value: guild.preferredLocale == 'th'
                                ? `- **เก่า :**\n  - ${name.old}\n - **ใหม่ :**\n  - ${name.new}`
                                : `- **old :**\n  - ${name.old}\n - **new :**\n  - ${name.new}`,
                            inline: true
                        }
                    );
                };
                embed.addFields(
                    { name: guild.preferredLocale === 'th' ? 'อัปเดตโดย' : 'updated by', value: `<@${auditLogEntry.executorId}>`, inline: true }
                );
                if(icon || name){
                    await channel.send({ embeds: [embed] });
                };
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.ThreadCreate){
        if(auditLogSettings.thread_created){
            const channel = guild.channels.cache.get(auditLogSettings.thread_created);
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const target = auditLogEntry.target as ThreadChannel;
                function getThreadType(type: number, locale: 'th' | 'en' = 'en', emoji: boolean = false): string {
                    const channelTypeMap: Record<'th' | 'en', Record<number, string>> = {
                        th: {
                            [ChannelType.AnnouncementThread]: 'เธรดประกาศ',
                            [ChannelType.PublicThread]: 'เธรดสาธารณะ',
                            [ChannelType.PrivateThread]: 'เธรดส่วนตัว',
                        },
                        en: {
                            [ChannelType.AnnouncementThread]: 'Announcement Thread',
                            [ChannelType.PublicThread]: 'Public Thread',
                            [ChannelType.PrivateThread]: 'Private Thread',
                        },
                    };
                    const channelEmojiMap: Record<number, string> = {
                        [ChannelType.AnnouncementThread]: '<:Thread:1299608267609346139>',
                        [ChannelType.PublicThread]: '<:Thread:1299608267609346139>',
                        [ChannelType.PrivateThread]: '<:ThreadPrivate:1299608248298635304>',
                    };
                
                    if(!emoji) return channelTypeMap[locale][type] || (locale === 'th' ? 'ประเภทช่องที่ไม่รู้จัก' : 'Unknown Channel Type');
                    else return channelEmojiMap[type] || '';
                };
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: guild.iconURL() || undefined })
                    .setDescription(`${getThreadType(target.type, undefined, true)}  **${guild.preferredLocale == 'th'
                        ? 'เธรด `'+target.name+'` ได้ถูกสร้างแล้ว'
                        : '`'+target.name+'` thread has been created.'
                    }**`)
                    .addFields(
                        { name: guild.preferredLocale === 'th' ? 'เธรด' : 'thread', value: `<#${target.id}>`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'ประเภท' : 'type', value: `${getThreadType(target.type, guild.preferredLocale === 'th' ? 'th' : 'en')}`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'ใน' : 'in', value: `<#${target.parentId}>`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'สร้างโดย' : 'created by', value: `<@${auditLogEntry.executorId}>`, inline: true }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                    .setTimestamp()
                    .setColor('#864b8e')
                );
                await channel.send({ embeds: [embed] });
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.ThreadUpdate){
        if(auditLogSettings.thread_updated){
            const channel = guild.channels.cache.get(auditLogSettings.thread_updated);
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const target = auditLogEntry.target as ThreadChannel;
                const name = auditLogEntry.changes.find(change => change.key === 'name');
                const archived = auditLogEntry.changes.find(change => change.key === 'archived');
                const locked = auditLogEntry.changes.find(change => change.key === 'locked');
                const archiveDuration = auditLogEntry.changes.find(change => change.key === 'auto_archive_duration');
                const rateLimit = auditLogEntry.changes.find(change => change.key === 'rate_limit_per_user');
                const invitable = auditLogEntry.changes.find((change: any) => change.key === 'invitable');
                function getThreadType(type: number, locale: 'th' | 'en' = 'en', emoji: boolean = false): string {
                    const channelTypeMap: Record<'th' | 'en', Record<number, string>> = {
                        th: {
                            [ChannelType.AnnouncementThread]: 'เธรดประกาศ',
                            [ChannelType.PublicThread]: 'เธรดสาธารณะ',
                            [ChannelType.PrivateThread]: 'เธรดส่วนตัว',
                        },
                        en: {
                            [ChannelType.AnnouncementThread]: 'Announcement Thread',
                            [ChannelType.PublicThread]: 'Public Thread',
                            [ChannelType.PrivateThread]: 'Private Thread',
                        },
                    };
                    const channelEmojiMap: Record<number, string> = {
                        [ChannelType.AnnouncementThread]: '<:Thread:1299608267609346139>',
                        [ChannelType.PublicThread]: '<:Thread:1299608267609346139>',
                        [ChannelType.PrivateThread]: '<:ThreadPrivate:1299608248298635304>',
                    };
                
                    if(!emoji) return channelTypeMap[locale][type] || (locale === 'th' ? 'ประเภทช่องที่ไม่รู้จัก' : 'Unknown Channel Type');
                    else return channelEmojiMap[type] || '';
                };
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: guild.iconURL() || undefined })
                    .addFields(
                        { name: guild.preferredLocale === 'th' ? 'เธรด' : 'thread', value: `<#${target.id}>`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'ประเภท' : 'type', value: `${getThreadType(target.type, guild.preferredLocale === 'th' ? 'th' : 'en')}`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'ใน' : 'in', value: `<#${target.parentId}>`, inline: true }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                    .setTimestamp()
                    .setColor('#864b8e')
                );
                if(name && name.new != name.old){
                    embed.addFields({
                        name: guild.preferredLocale === 'th' ? 'ชื่อ' : 'name',
                        value: guild.preferredLocale == 'th'
                            ? `- **เก่า :**\n  - ${name?.old}\n - **ใหม่ :**\n  - ${name?.new}`
                            : `- **old :**\n  - ${name?.old}\n - **new :**\n  - ${name?.new}`,
                        inline: true
                    });
                }if(archiveDuration && archiveDuration.new != archiveDuration.old){
                    function time(t: number) {
                        if(t >= 60 && t <= 1440){
                            if(t == 60){
                                return `${guild.preferredLocale === 'th' ? `${t/60}ชั่วโมง` : `${t/60}hour`}`;
                            }else if(t > 60){
                                return `${guild.preferredLocale === 'th' ? `${t/60}ชั่วโมง` : `${t/60}hours`}`;
                            };
                        }else if(t > 1440 && t < 10080){
                            return `${guild.preferredLocale === 'th' ? `${(t/60)/24}วัน` : `${(t/60)/24}days`}`;
                        }if(t >= 10080){
                            if(t == 10080){
                                return `${guild.preferredLocale === 'th' ? `${((t/60)/24)/7}สัปดาห์` : `${((t/60)/24)/7}week`}`;
                            }else if(t > 10080){
                                return `${guild.preferredLocale === 'th' ? `${((t/60)/24)/7}สัปดาห์` : `${((t/60)/24)/7}weeks`}`;
                            };
                        };
                    };
                    embed.addFields({
                        name: guild.preferredLocale == 'th' ? 'ซ่อนหลังจากไม่ได้ใช้งาน' : 'hide after inactivity',
                        value: guild.preferredLocale == 'th'
                            ? `- **เก่า :**\n  - ${time(archiveDuration.old as number)}\n - **ใหม่ :**\n  - ${time(archiveDuration.new as number)}`
                            : `- **old :**\n  - ${time(archiveDuration.old as number)}\n - **new :**\n  - ${time(archiveDuration.new as number)}`,
                        inline: true
                    });
                }if(rateLimit && rateLimit.new != rateLimit.old){
                    function rate(r: number) {
                        if(r === 0){
                            return `${guild.preferredLocale === 'th' ? 'ปิด' : 'off'}`;
                        }else if(r > 0 && r < 60){
                            return `${guild.preferredLocale === 'th' ? `${r}วินาที` : `${r}seconds`}`;
                        }else if(r >= 60 && r < 3600){
                            if(r == 60){
                                return `${guild.preferredLocale === 'th' ? `${r/60}นาที` : `${r/60}minute`}`;
                            }else if(r > 60){
                                return `${guild.preferredLocale === 'th' ? `${r/60}นาที` : `${r/60}minutes`}`;
                            };
                        }else if(r >= 3600){
                            if(r == 3600){
                                return `${guild.preferredLocale === 'th' ? `${(r/60)/60}ชั่วโมง` : `${(r/60)/60}hour`}`;
                            }else if(r > 3600){
                                return `${guild.preferredLocale === 'th' ? `${(r/60)/60}ชั่วโมง` : `${(r/60)/60}hours`}`;
                            };
                        };
                    };
                    embed.addFields({
                        name: guild.preferredLocale == 'th' ? 'โหมดช้า' : 'slow mode',
                        value: guild.preferredLocale == 'th'
                            ? `- **เก่า :**\n  - ${rate(rateLimit.old as number)}\n - **ใหม่ :**\n  - ${rate(rateLimit.new as number)}`
                            : `- **old :**\n  - ${rate(rateLimit.old as number)}\n - **new :**\n  - ${rate(rateLimit.new as number)}`,
                        inline: true
                    });
                }if(invitable && invitable.new != invitable.old){
                    embed.addFields({
                        name: guild.preferredLocale === 'th'
                            ? `ส่งคำเชิญ`
                            : `send an invitation`,
                        value: guild.preferredLocale === 'th'
                            ? `${invitable.new ? 'ใครก็ได้' : 'ผู้สร้างและผู้ดูแลเท่านั้น'}`
                            : `${invitable.new ? 'anyone' : 'creators and moderators only'}`,
                        inline: true
                    });
                }if(archived && archived.new != archived.old){
                    embed.setDescription(`${getThreadType(target.type, undefined, true)}  **${guild.preferredLocale == 'th'
                        ? 'เธรด `'+target.name+'` ได้ถูก'+`${archived.new ? 'ปิด' : 'เปิด'}`+'แล้ว'
                        : '`'+target.name+'` thread has been '+`${archived.new ? 'closed' : 'opened'}`+'.'
                    }**`);
                    embed.addFields({
                        name: guild.preferredLocale === 'th'
                            ? `${archived.new ? 'ปิด' : 'เปิด'}โดย`
                            : `${archived.new ? 'closed' : 'opened'} by`,
                        value: `<@${auditLogEntry.executorId}>`, inline: true
                    });
                }if(locked && locked.new != locked.old){
                    embed.setDescription(`${getThreadType(target.type, undefined, true)}  **${guild.preferredLocale == 'th'
                        ? 'เธรด `'+target.name+'` ได้ถูก'+`${locked.new ? 'ล็อก' : 'ปลดล็อก'}`+'แล้ว'
                        : '`'+target.name+'` thread has been '+`${locked.new ? 'locked' : 'unlocked'}`+'.'
                    }**`);
                    embed.addFields({
                        name: guild.preferredLocale === 'th'
                            ? `${locked.new ? 'ล็อก' : 'ปลดล็อก'}โดย`
                            : `${locked.new ? 'locked' : 'unlocked'} by`,
                        value: `<@${auditLogEntry.executorId}>`, inline: true
                    });
                }if(!archived && !locked){
                    embed.setDescription(`${getThreadType(target.type, undefined, true)}  **${guild.preferredLocale == 'th'
                        ? 'เธรด `'+target.name+'` ได้ถูกอัปเดตแล้ว'
                        : '`'+target.name+'` thread has been updated.'
                    }**`);
                    embed.addFields({ name: guild.preferredLocale === 'th' ? 'อัปเดตโดย' : 'updated by', value: `<@${auditLogEntry.executorId}>`, inline: true });
                };
                await channel.send({ embeds: [embed] });
            };
        };
    }else if(auditLogEntry.action == AuditLogEvent.ThreadDelete){
        if(auditLogSettings.thread_deleted){
            const channel = guild.channels.cache.get(auditLogSettings.thread_deleted);
            if(channel && channel.isSendable()){
                const executor = auditLogEntry.executor as User;
                const target = auditLogEntry.target as ThreadChannel;
                function getThreadType(type: number, locale: 'th' | 'en' = 'en', emoji: boolean = false): string {
                    const channelTypeMap: Record<'th' | 'en', Record<number, string>> = {
                        th: {
                            [ChannelType.AnnouncementThread]: 'เธรดประกาศ',
                            [ChannelType.PublicThread]: 'เธรดสาธารณะ',
                            [ChannelType.PrivateThread]: 'เธรดส่วนตัว',
                        },
                        en: {
                            [ChannelType.AnnouncementThread]: 'Announcement Thread',
                            [ChannelType.PublicThread]: 'Public Thread',
                            [ChannelType.PrivateThread]: 'Private Thread',
                        },
                    };
                    const channelEmojiMap: Record<number, string> = {
                        [ChannelType.AnnouncementThread]: '<:Thread:1299608267609346139>',
                        [ChannelType.PublicThread]: '<:Thread:1299608267609346139>',
                        [ChannelType.PrivateThread]: '<:ThreadPrivate:1299608248298635304>',
                    };
                
                    if(!emoji) return channelTypeMap[locale][type] || (locale === 'th' ? 'ประเภทช่องที่ไม่รู้จัก' : 'Unknown Channel Type');
                    else return channelEmojiMap[type] || '';
                };
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: guild.iconURL() || undefined })
                    .setDescription(`${getThreadType(target.type, undefined, true)}  **${guild.preferredLocale == 'th'
                        ? 'เธรด `'+target.name+'` ได้ถูกลบแล้ว'
                        : '`'+target.name+'` thread has been deleted.'
                    }**`)
                    .addFields(
                        { name: guild.preferredLocale === 'th' ? 'เธรด' : 'thread', value: `${target.name}`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'ประเภท' : 'type', value: `${getThreadType(target.type, guild.preferredLocale === 'th' ? 'th' : 'en')}`, inline: true },
                        { name: guild.preferredLocale === 'th' ? 'ลบโดย' : 'deleted by', value: `<@${auditLogEntry.executorId}>`, inline: true }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                    .setTimestamp()
                    .setColor('#864b8e')
                );
                await channel.send({ embeds: [embed] });
            };
        };
    };
});client.on('messageUpdate', async (oldM, newM) => {
    const guildId = newM.guildId;
    if(!guildId)return;
    const guild = await client.guilds.fetch(guildId);
    if(guild){
        let config = await this.guildConfigRepository.findOne({ where: { guildId } });
        if(!config){ return };
        const auditLogSettings: AuditLogSettings = JSON.parse(config?.auditLogSettings || '{}');
        if(auditLogSettings.message_edited){
            const channel = guild.channels.cache.get(auditLogSettings.message_edited);
            const userId = newM.author?.id;
            if(!userId)return;
            const user = client.users.cache.get(userId);
            if(channel && channel.isSendable() && oldM.content && newM.content && user && !user.bot){
                if(oldM.content.length && oldM.content.length > 1000){ return };
                if(newM.content.length && newM.content.length > 1000){ return };
                const link = `https://discord.com/channels/${guildId}/${channel.id}/${newM.id}`;
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() || undefined })
                    .setDescription(guild.preferredLocale === 'th'
                        ? `:pencil2:  **ข้อความส่งโดย <@${user.id}> ถูกแก้ไข ** [ข้อความ](${link})`
                        : `:pencil2:  **Message sent by <@${user.id}> has been edited. ** [message](${link})`
                    )
                    .addFields(
                        { name: guild.preferredLocale === 'th' ? 'เก่า' : 'old', value: '```'+`${oldM.content}`+'```' },
                        { name: guild.preferredLocale === 'th' ? 'ใหม่' : 'new', value: '```'+`${newM.content}`+'```' }
                    )
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                    .setTimestamp()
                    .setColor('#864b8e')
                );
                await channel.send({ embeds: [embed] });
            };
        };
    };
});client.on('messageDelete', async (message) => {
    // async function fetchExecutor(guild: Guild) {
    //     const entry = (await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MessageDelete })).entries.first();
    //     if(entry){
    //         console.log(entry.extra.channel);
    //         console.log(message.channel);
    //         if((entry.extra.channel as TextChannel).lastMessageId === message.channel.lastMessageId){
    //             return entry.executor as User;
    //         }else return message.author as User;
    //     };
    //     return undefined;
    // };
    const guildId = message.guildId;
    const guild = message.guild;
    if(!guildId || !guild)return;
    let config = await this.guildConfigRepository.findOne({ where: { guildId } });
    const auditLogSettings: AuditLogSettings = JSON.parse(config?.auditLogSettings || '{}');
    if(auditLogSettings.message_deleted){
        const channel = message.guild?.channels.cache.get(auditLogSettings.message_deleted);
        if(channel && channel.isSendable()){
            const user = message.author as User;
            // const executor = await fetchExecutor(guild);
            if(!user)return;
            let content = message.content;
            const embed = (new EmbedBuilder()
                .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() || undefined })
                .setDescription(`:wastebasket:  **${message.guild?.preferredLocale === 'th'
                    ? `ข้อความถูกส่งจาก <@${user.id}> ถูกลบแล้ว`
                    : `Message sent from <@${user.id}> has been deleted.`
                }**`)
                .addFields({ name: guild.preferredLocale === 'th' ? `ใน` : `in`, value: `<#${message.channelId}>` })
                .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                .setTimestamp()
                .setColor('#864b8e')
            );
            if(content){
                if(content.length > 1000){content = `${message.content?.substring(0, 1000)} ...`};
                // embed.addFields({ name: message.guild?.preferredLocale === 'th' ? `ข้อความ` : `message`, value: '```'+`${content}`+'```' });
                embed.addFields({ name: message.guild?.preferredLocale === 'th' ? `ข้อความ` : `message`, value: `${content}` });
            };
            await channel.send({ embeds: [embed] });
        };
    };
});client.on('messageDeleteBulk', async (messages, mChannel) => {
    async function fetchExecutor() {
        const entry = (await mChannel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MessageBulkDelete })).entries.first();
        if(entry){
            return entry.executor as User;
        };
        return undefined;
    };
    const executor = await fetchExecutor();
    const guildId = mChannel.guildId;
    const guild = mChannel.guild;
    if(!guildId || !guild || !executor)return;
    let config = await this.guildConfigRepository.findOne({ where: { guildId } });
    const auditLogSettings: AuditLogSettings = JSON.parse(config?.auditLogSettings || '{}');
    if(auditLogSettings.message_bulk_deleted){
        const channel = guild.channels.cache.get(auditLogSettings.message_bulk_deleted);
        if(channel && channel.isSendable()){
            const embed = (new EmbedBuilder()
                .setAuthor({ name: executor.username, iconURL: executor.displayAvatarURL() || undefined })
                .setDescription(`:wastebasket:  **${guild.preferredLocale === 'th'
                    ? `ข้อความถูกลบโดย <@${executor.id}> จำนวน ${messages.size} ข้อความ`
                    : `Messages deleted by <@${executor.id}> total ${messages.size} messages.`
                }**`)
                .addFields({ name: guild.preferredLocale === 'th' ? `ใน` : `in`, value: `<#${channel.id}>` })
                .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
                .setTimestamp()
                .setColor('#864b8e')
            );
            await channel.send({ embeds: [embed] });
        };
    };
});client.on('interactionCreate', async (interaction) => {
    // console.log(interaction);
    const guildId = interaction.guildId;
    const guild = interaction.guild
    if(!guildId || !guild)return;
    let config = await this.guildConfigRepository.findOne({ where: { guildId } });
    const auditLogSettings: AuditLogSettings = JSON.parse(config?.auditLogSettings || '{}');
    if(auditLogSettings.moderation_command_used){
        const channel = interaction.guild?.channels.cache.get(auditLogSettings.moderation_command_used);
        const user = interaction.member?.user as User;
        if(channel && channel.isSendable() && user){
            function getInteractionTypeName(type: InteractionType, locale: 'th' | 'en' = 'en'): string {
                const interactionTypeMap: Record<'th' | 'en', Record<InteractionType, string>> = {
                    th: {
                        [InteractionType.ApplicationCommand]: 'คำสั่งแอปพลิเคชัน',
                        [InteractionType.MessageComponent]: 'ส่วนประกอบข้อความ',
                        [InteractionType.ApplicationCommandAutocomplete]: 'เติมข้อความอัตโนมัติ',
                        [InteractionType.ModalSubmit]: 'ส่งโมดอล',
                        [InteractionType.Ping]: 'ปิง',
                    },
                    en: {
                        [InteractionType.ApplicationCommand]: 'Application Command',
                        [InteractionType.MessageComponent]: 'Message Component',
                        [InteractionType.ApplicationCommandAutocomplete]: 'Autocomplete',
                        [InteractionType.ModalSubmit]: 'Modal Submit',
                        [InteractionType.Ping]: 'Ping',
                    },
                };
            
                return (
                        interactionTypeMap[locale][type] ||
                        (locale === 'th' ? 'ประเภทการโต้ตอบที่ไม่รู้จัก' : 'Unknown Interaction Type')
                );
            };
            function getInteractionName() {
                if(interaction.isCommand()){
                    return interaction.commandName;
                }else return undefined;
            };
            if(getInteractionName()){
                const embed = (new EmbedBuilder()
                    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() || undefined })
                    .setDescription(`<:slash_mark:1227495506440224768>  **${interaction.guild?.preferredLocale === 'th'
                        ? `การโต้ตอบถูกสร้างขึ้น`
                        : `Interaction is created`
                    }**`)
                    .addFields(
                        { name: guild.preferredLocale === 'th' ? `ชื่อ` : `name`, value: `${getInteractionName()}` },
                        { name: guild.preferredLocale === 'th' ? `ประเภท` : `type`, value: `${getInteractionTypeName(interaction.type, guild.preferredLocale === 'th' ? 'th' : 'en')}` }
                    )
                    .setTimestamp()
                    .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() || undefined })
                );
                await channel.send({ embeds: [embed] });
            };
        };
    };
});


}catch(error){
  if(error instanceof DiscordAPIError){
      if(String(error.code).startsWith('10')){
          return process.stdout.write('');
      };
  };
  console.warn(chalk.red('[Camming AL]'), chalk.yellow(error));
}
}}