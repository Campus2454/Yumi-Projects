import { ButtonStyle, ButtonBuilder, ActionRowBuilder, EmbedBuilder, CacheType, Interaction, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, Guild, CommandInteractionOptionResolver, ChannelType, PermissionsBitField, GuildMember, CommandInteraction, ColorResolvable, DiscordAPIError, PresenceStatusData, ActivityType, MessageFlags, ComponentBuilder, TextDisplayBuilder, ThumbnailBuilder, TopLevelComponent, ContainerBuilder, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, MediaGalleryBuilder, MediaGalleryItemBuilder, Attachment, AttachmentBuilder, FileBuilder, StringSelectMenuOptionBuilder, ChannelSelectMenuBuilder } from "discord.js";
import DiscordClient from "../client/client";
// import { getRepository } from "typeorm";
import { GuildConfiguration } from "../typeorm/entities/GuildConfiguration";
import { InteractionElements } from "./interactionElements";
import { AuditLogSettings, logEvents } from "../types";
import chalk from "chalk";
import { Membership } from "../typeorm/entities/membership";
import { interactionCache } from "../utils/cacheUtils";
import { setTimeout as wait } from 'node:timers/promises';
import { AppDataSource } from "../data-source";
const interactionElements = new InteractionElements;
type Locale = 'id' | 'da' | 'de' | 'en-GB' | 'en-US' | 'es-ES' | 'es-419' | 'fr' | 'hr' | 'it' | 'lt' | 'hu' | 'nl' | 'no' | 'pl' | 'pt-BR' | 'ro' | 'fi' | 'sv-SE' | 'vi' | 'tr' | 'cs' | 'el' | 'bg' | 'ru' | 'uk' | 'hi' | 'th' | 'zh-CN' | 'ja' | 'zh-TW' | 'ko';

export class slashCommands {
private readonly guildConfigRepository = AppDataSource.getRepository(GuildConfiguration)
private readonly membershipRepository = AppDataSource.getRepository(Membership)
slashCommands(interaction: Interaction<CacheType>, client: DiscordClient) {
async function cooldown(interaction: CommandInteraction) {
  const userId = interaction.user.id;
  const commandName = interaction.commandName;
  const cooldownKey = `${userId}-${commandName}`;
  const currentTimestamp = Date.now();
  if (client.cooldowns.has(cooldownKey)) {
    const expirationTime = client.cooldowns.get(cooldownKey)!;
    if (currentTimestamp < expirationTime) {
      const timeLeft = (expirationTime - currentTimestamp) / 1000;
      await interaction.reply({
        content: interaction.guild?.preferredLocale === 'th'
          ? `กรุณารออีก ${timeLeft.toFixed(1)} วินาทีก่อนจะใช้คำสั่งนี้อีกครั้ง`
          : `Please wait another ${timeLeft.toFixed(1)} seconds before using this command again.`,
        ephemeral: true
      });
      return true;
    };
  };
  client.cooldowns.set(cooldownKey, currentTimestamp + 2000);
  return false;
};
(async () => {
try{
let config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guildId as string } });


//  =======================  [ Command ]  =======================  \\


if(interaction.isChatInputCommand()){
  if(await cooldown(interaction))return;
  if(interaction.commandName === 'prefix'){
    if(!interaction.guild){return await interaction.reply({ content: interactionElements.cannotUseCommand[interaction.locale || 'en-US'], ephemeral: true });}
    if(!config){
      const newConfig = this.guildConfigRepository.create({
        guildId: interaction.guild.id,
      });
      const savedConfig = await this.guildConfigRepository.save(newConfig);
      config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guildId as string } });
    };
    const prefixMessages = {
      'ja': `このサーバーのプレフィックスは次のとおりです: ${config?.prefix}`,
      'zh-CN': `该服务器的前缀是: ${config?.prefix}`,
      'id': `Awalan untuk server ini adalah ${config?.prefix}`,
      'da': `Præfikset for denne server er: ${config?.prefix}`,
      'de': `Präfix für diesen Server ist: ${config?.prefix}`,
      'es-ES': `El prefijo para este servidor es: ${config?.prefix}`,
      'es-419': `El prefijo para este servidor es: ${config?.prefix}`,
      'fr': `Le préfixe de ce serveur est: ${config?.prefix}`,
      'hr': `Prefiks za ovaj poslužitelj je: ${config?.prefix}`,
      'it': `Il prefisso per questo server è: ${config?.prefix}`,
      'lt': `Šio serverio priešdėlis yra: ${config?.prefix}`,
      'hu': `Ennek a szervernek az előtagja: ${config?.prefix}`,
      'nl': `Het voorvoegsel voor deze server is: ${config?.prefix}`,
      'no': `Prefikset for denne serveren er: ${config?.prefix}`,
      'pl': `Prefiks tego serwera to: ${config?.prefix}`,
      'ro': `Prefixul pentru acest server este: ${config?.prefix}`,
      'el': `Το πρόθεμα για αυτόν τον διακομιστή είναι: ${config?.prefix}`,
      'sv-SE': `Prefixet för denna server är: ${config?.prefix}`,
      'vi': `Tiền tố cho máy chủ này là: ${config?.prefix}`,
      'tr': `Bu sunucunun öneki: ${config?.prefix}`,
      'cs': `Předpona pro tento server je: ${config?.prefix}`,
      'bg': `Префиксът за този сървър е: ${config?.prefix}`,
      'ru': `Префикс для этого сервера: ${config?.prefix}`,
      'uk': `Префікс для цього сервера: ${config?.prefix}`,
      'hi': `इस सर्वर के लिए उपसर्ग है: ${config?.prefix}`,
      'ko': `이 서버의 접두사는 다음과 같습니다.: ${config?.prefix}`,
      'pt-BR': `O prefixo para este servidor é: ${config?.prefix}`,
      'fi': `Tämän palvelimen etuliite on: ${config?.prefix}`,
      'th': `Prefix ของเซิร์ฟเวอร์นี้คือ: ${config?.prefix}`,
      'zh-TW': `該伺服器的前綴是: ${config?.prefix}`,
      'en-GB': `The command prefix of this server is: ${config?.prefix}`,
      'en-US': `The command prefix of this server is: ${config?.prefix}`
    };
    if(interaction.options.get('prefix')?.value){
      if(!interaction.memberPermissions?.has('Administrator')){
        const permis_message = interactionElements.permis_admin_edit[interaction.locale || 'en-US'];
        const prefixMessage = prefixMessages[interaction.locale || 'en-US'];
        const message = `${permis_message}\n\n${prefixMessage}`;
        return await interaction.reply({ content: message, ephemeral: true });
      };
      const newPrefix = interaction.options.get('prefix')?.value?.toString();
      await this.guildConfigRepository.save({
        ...config,
        prefix: newPrefix,
      });
      config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guildId as string } });
      const commandPrefixSetMessages = {
        'id': `Prefix perintah diatur ke: ${newPrefix}`,
        'da': `Kommandopræfikset er sat til: ${newPrefix}`,
        'de': `Das Befehl-Präfix wurde gesetzt auf: ${newPrefix}`,
        'en-GB': `The command prefix is set to: ${newPrefix}`,
        'en-US': `The command prefix is set to: ${newPrefix}`,
        'es-ES': `El prefijo de comando se ha establecido en: ${newPrefix}`,
        'es-419': `El prefijo de comando se ha establecido en: ${newPrefix}`,
        'fr': `Le préfixe de commande est défini sur : ${newPrefix}`,
        'hr': `Prefiks naredbi postavljen je na: ${newPrefix}`,
        'it': `Il prefisso dei comandi è impostato su: ${newPrefix}`,
        'lt': `Komandų priešdėlis nustatytas į: ${newPrefix}`,
        'hu': `A parancs prefix beállítva: ${newPrefix}`,
        'nl': `Het opdrachtprefix is ingesteld op: ${newPrefix}`,
        'no': `Kommandoprefikset er satt til: ${newPrefix}`,
        'pl': `Prefiks poleceń został ustawiony na: ${newPrefix}`,
        'pt-BR': `O prefixo de comando foi definido para: ${newPrefix}`,
        'ro': `Prefixul comenzii este setat la: ${newPrefix}`,
        'fi': `Komentoetuliite on asetettu arvoon: ${newPrefix}`,
        'sv-SE': `Kommandoprefixet är inställt på: ${newPrefix}`,
        'vi': `Tiền tố lệnh được đặt thành: ${newPrefix}`,
        'tr': `Komut ön eki şu şekilde ayarlandı: ${newPrefix}`,
        'cs': `Předpona příkazů je nastavena na: ${newPrefix}`,
        'el': `Το πρόθεμα εντολών έχει οριστεί σε: ${newPrefix}`,
        'bg': `Командният префикс е зададен на: ${newPrefix}`,
        'ru': `Префикс команд установлен на: ${newPrefix}`,
        'uk': `Префікс команд установлено на: ${newPrefix}`,
        'hi': `कमांड प्रीफ़िक्स सेट है: ${newPrefix}`,
        'th': `Prefix ถูกตั้งเป็น: ${newPrefix}`,
        'zh-CN': `命令前缀已设置为：${newPrefix}`,
        'ja': `コマンドプレフィックスは次のように設定されています: ${newPrefix}`,
        'zh-TW': `命令前綴已設定為：${newPrefix}`,
        'ko': `명령어 접두사가 다음과 같이 설정되었습니다: ${newPrefix}`
      };
      return await interaction.reply({ content: commandPrefixSetMessages[interaction.locale || 'en-US'], ephemeral: true });
    };
    await interaction.reply({ content: prefixMessages[interaction.locale || 'en-US'], ephemeral: true });
  }else if(interaction.commandName === 'welcome'){
    if(!interaction.guild)return;
    try{
      if(!interaction.memberPermissions?.has('Administrator')){
        const content = interactionElements.permis_admin_edit[interaction.locale || 'en-US'];
        return await interaction.reply({ content, ephemeral: true });
      }if(!config){
        const newConfig = this.guildConfigRepository.create({ guildId: interaction.guild.id });
        await this.guildConfigRepository.save(newConfig);
        config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guild.id } }) as GuildConfiguration;
      };
      await interaction.reply({ flags: MessageFlags.IsComponentsV2, components: interactionElements.welcome_component(interaction, config) });
    }catch(err){
      throw err;
    }
  }else if(interaction.commandName === 'goodbye'){
    if(!interaction.guild)return;
    try{
      if(!interaction.memberPermissions?.has('Administrator')){
        const content = interactionElements.permis_admin_edit[interaction.locale || 'en-US'];
        return await interaction.reply({ content, ephemeral: true });
      }if(!config){
        const newConfig = this.guildConfigRepository.create({ guildId: interaction.guild.id });
        await this.guildConfigRepository.save(newConfig);
        config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guild.id } }) as GuildConfiguration;
      };
      await interaction.reply({ flags: MessageFlags.IsComponentsV2, components: interactionElements.goodbye_component(interaction, config) });
    }catch(err){
      throw err;
    }
  }else if(interaction.commandName === 'log'){
    if (interaction.guild){
      if (config == undefined){
        const newConfig = this.guildConfigRepository.create({
        guildId: interaction.guild.id,
        });
        await this.guildConfigRepository.save(newConfig);
        config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guildId as string } });
      }
      if (interaction.memberPermissions?.has('Administrator')) {
        const Channel = interaction.options.get('channel')?.channel;
        const updateChannel = await this.guildConfigRepository.save({
          ...config,
          logChannelId: Channel?.id,
        });
        client.configs.set(interaction.guildId!, updateChannel)
        if (interaction.locale == 'th'){await interaction.reply(`ตั้งค่าช่องในการส่งบันทึกการตรวจสอบแล้ว! ${Channel}`);
        } else if (interaction.locale == 'es-ES'){await interaction.reply(`No tienes derechos. Administrador para arreglar ${Channel}`);
        } else if (interaction.locale == 'en-US'){await interaction.reply(`The channel for sending audit logs has been set! in ${Channel}`);
        } else if (interaction.locale == 'zh-CN'){await interaction.reply(`審計日誌發送通道已設定！ 在 ${Channel}`);
        } else if (interaction.locale == 'ja'){await interaction.reply(`監査ログを送信するチャネルが設定されました。 で ${Channel}`);
        } else if (interaction.locale == 'zh-TW'){await interaction.reply(`审计日志发送通道已设置！ 在 ${Channel}`);
        } else if (interaction.locale == 'ko'){await interaction.reply(`감사 로그 전송 채널이 설정되었습니다! ~에 ${Channel}`);
        } else if (interaction.locale == 'id'){await interaction.reply(`Saluran untuk mengirimkan log audit telah ditetapkan! di dalam ${Channel}`);
        } else if (interaction.locale == 'da'){await interaction.reply(`Kanalen til at sende revisionslogfiler er blevet indstillet! i ${Channel}`);
        } else if (interaction.locale == 'de'){await interaction.reply(`Der Kanal zum Senden von Audit-Logs wurde festgelegt! In ${Channel}`);
        } else if (interaction.locale == 'fr'){await interaction.reply(`Le canal d'envoi des journaux d'audit a été défini ! dans ${Channel}`);
        } else if (interaction.locale == 'vi'){await interaction.reply(`Kênh gửi nhật ký kiểm tra đã được thiết lập! TRONG ${Channel}`);
        } else await interaction.reply(`The channel for sending audit logs has been set! in ${Channel}`);
      } else {
        const message = interactionElements.permis_admin_edit[interaction.locale] || "You don't have rights. `Administrator` in order to fix";
        await interaction.reply({ content: message, ephemeral: true });
        // if (interaction.locale == 'th'){await interaction.reply({ content: 'คุณไม่มีสิทธิ์ `Administrator` เพื่อที่จะแก้ไข', ephemeral: true });
        // } else if (interaction.locale == 'es-ES'){await interaction.reply({ content: 'No tienes derechos. Administrador para arreglar', ephemeral: true });
        // } else if (interaction.locale == 'en-US'){await interaction.reply({ content: "You don't have rights. Administrator in order to fix", ephemeral: true });
        // } else if (interaction.locale == 'zh-CN'){await interaction.reply({ content: '你沒有權利。 行政人員 為了修復', ephemeral: true });
        // } else if (interaction.locale == 'ja'){await interaction.reply({ content: 'あなたには権利がありません。 管理者 直すために', ephemeral: true });
        // } else if (interaction.locale == 'zh-TW'){await interaction.reply({ content: '你没有权利。 行政人员 为了修复', ephemeral: true });
        // } else if (interaction.locale == 'ko'){await interaction.reply({ content: '당신에게는 권리가 없습니다. 관리자 고치기 위해', ephemeral: true });
        // } else if (interaction.locale == 'id'){await interaction.reply({ content: 'Anda tidak punya hak. Administrator untuk memperbaikinya', ephemeral: true });
        // } else if (interaction.locale == 'da'){await interaction.reply({ content: 'Du har ikke rettigheder. Administrator for at rette op', ephemeral: true });
        // } else if (interaction.locale == 'de'){await interaction.reply({ content: 'Du hast keine Rechte. Administrator um es zu beheben', ephemeral: true });
        // } else if (interaction.locale == 'fr'){await interaction.reply({ content: "Vous n'avez pas de droits. Administrateur afin de réparer", ephemeral: true });
        // } else if (interaction.locale == 'vi'){await interaction.reply({ content: 'Bạn không có quyền. Người quản lý để khắc phục', ephemeral: true });
        // } else await interaction.reply({ content: "You don't have rights. `Administrator` to edit.", ephemeral: true });
      };
    } else {
      await interaction.reply({ content: interactionElements.cannotUseCommand[interaction.locale] || 'The command cannot be used here.', ephemeral: true })
    };
  }else if(interaction.commandName === 'ping'){
    await interaction.reply('🏓 **Pong**!  <a:loading2:1231898437474193498>');
    let ping = Math.round(client.ws.ping);
    let loop = 0;
    do {if (ping < 0){
      loop++;
      await wait(1000);
      ping = Math.round(client.ws.ping);
    }} while(ping < 0 && loop < 30);
    await wait(ping * 2);
    if (ping >= 999){
      await interaction.editReply('🏓 **Pong**!  <a:loading:1211212089947979807>'+' `'+ping+'ms`');
    } else if (ping >= 501){
      await interaction.editReply('🏓 **Pong**!  <:ping3:1231145932436017213>'+' `'+ping+'ms`');
    } else if (ping >= 401 && ping <= 500){
      await interaction.editReply('🏓 **Pong**!  <:ping2:1231145930317762600>'+' `'+ping+'ms`');
    } else if (ping >= 251 && ping <= 400){
      await interaction.editReply('🏓 **Pong**!  <:ping1:1231145926710530130>'+' `'+ping+'ms`');
    } else if (ping >= 0 && ping <= 250){
      await interaction.editReply('🏓 **Pong**!  <:ping:1231145924898586685>'+' `'+ping+'ms`');
    } else if (ping == -1){await interaction.editReply('🏓 **Pong**!  Error to checking latency. Please try again.');
    } else {await interaction.editReply('🏓 **Pong**!  Error to checking latency. `'+ping+'ms`')}
  }else if(interaction.commandName === 'help'){
    const command = new ButtonBuilder()
      .setCustomId('commandList')
      .setLabel(interactionElements.actions[interaction.locale || 'en-US'].commandsList)
      .setStyle(ButtonStyle.Secondary)
      // .setDisabled(true);
    const invite = new ButtonBuilder()
      .setLabel(interactionElements.actions[interaction.locale || 'en-US'].inviteBot)
      .setURL('https://discord.com/oauth2/authorize?client_id=1210178730836893719')
      .setStyle(ButtonStyle.Link);
    const website = new ButtonBuilder()
      .setLabel(interactionElements.actions[interaction.locale || 'en-US'].website)
      .setURL('https://camming.xyz/')
      .setStyle(ButtonStyle.Link);
    const discord = new ButtonBuilder()
      .setLabel(interactionElements.actions[interaction.locale || 'en-US'].discord)
      .setURL('https://discord.gg/brxPZB3Jzy')
      .setStyle(ButtonStyle.Link);
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(command, invite, website, discord);
    const helpEmbed = new EmbedBuilder()
      .setColor(0xf91a1a)
      .setTitle('**Camming Bot**')
      .setThumbnail(client.user?.avatarURL() || null)
      .addFields(
        { name: 'Help & Support', value: `${interactionElements.actions[interaction.locale || 'en-US'].website} : https://camming.xyz/ \n${interactionElements.actions[interaction.locale || 'en-US'].discord} : [CammingSupport](https://discord.gg/brxPZB3Jzy)`, inline: true },
        { name: 'Get Camming BOT', value: '[Camming BETA](https://discord.com/oauth2/authorize?client_id=1210178730836893719)', inline: true },
        { name: '\u200B', value: '\u200B' },
      )
      .setTimestamp()
      .setFooter(client.user && { text: client.user.username, iconURL: client.user.avatarURL() || undefined });
    if (interaction.guild){
      helpEmbed.addFields(
        { name: 'Server', value: interaction.guild?.name, inline: false },
        { name: 'Command prefix', value: '**`'+config?.prefix+'`**', inline: false },
      )
    };
    await interaction.reply({ embeds: [helpEmbed], components: [row], ephemeral: true });
  }else if(interaction.commandName === 'ban'){
    if(interaction.guild){
      if(interaction.memberPermissions?.has('Administrator') || interaction.memberPermissions?.has('BanMembers')){
        if(interaction.appPermissions?.has('Administrator') || interaction.appPermissions?.has('BanMembers')){
          const user = await client.users.fetch(interaction.options.getUser('user', true).id);
          const reason = interaction.options.getString('reason');
          await interaction.reply({ embeds: [interactionElements.ban_confirm_embed(user, reason, interaction)], components: interactionElements.ban_button(interaction) });
        
        }else await interaction.reply({ content: 'Command is Error!!', ephemeral: true });
      }else{
        const permis_banMessages: Record<Locale, string> = {
          'th': 'คุณไม่มีสิทธิ์ `แบนสมาชิก` เพื่อที่จะแบนสมาชิก',
          'id': 'Anda tidak punya hak untuk `melarang anggota` demi melarang anggota',
          'da': 'Du har ikke rettigheder til `forbyde medlem` for at forbyde medlem',
          'de': 'Du hast keine Rechte um `Mitglied zu verbannen` um Mitglied zu verbannen',
          'en-GB': "You don't have rights to `ban member` in order to ban member",
          'en-US': "You don't have rights to `ban member` in order to ban member",
          'es-ES': 'No tienes derechos para `prohibir miembro` para prohibir miembro',
          'es-419': 'No tienes derechos para `prohibir miembro` para prohibir miembro',
          'fr': "Vous n'avez pas de droits pour `bannir membre` afin de bannir membre",
          'hr': 'Nemate prava za `zabraniti člana` da zabranite člana',
          'it': 'Non hai diritti per `vietare membro` per vietare membro',
          'lt': 'Neturite teisių `uždrausti narį` kad uždraustumėte narį',
          'hu': 'Nincs joga `tagot kitiltani` hogy kitiltsa a tagot',
          'nl': 'Je hebt geen rechten om `lid te verbannen` om lid te verbannen',
          'no': 'Du har ikke rettigheter til å `forby medlem` for å forby medlem',
          'pl': 'Nie masz praw do `zakazać członka` aby zakazać członka',
          'pt-BR': 'Você não tem direitos para `banir membro` para banir membro',
          'ro': 'Nu aveți drepturi pentru a `interzice membru` pentru a interzice membru',
          'fi': 'Sinulla ei ole oikeuksia `kieltää jäsentä` jotta voit kieltää jäsentä',
          'sv-SE': 'Du har inga rättigheter att `förbjuda medlem` för att förbjuda medlem',
          'vi': 'Bạn không có quyền `cấm thành viên` để cấm thành viên',
          'tr': '`Üyeyi yasaklamak` için haklarınız yok',
          'cs': 'Nemáte práva `zakázat člena` pro zakázání člena',
          'el': 'Δεν έχετε δικαιώματα για `απαγόρευση μέλους` για να απαγορεύσετε μέλος',
          'bg': 'Нямате права да `забраните член` за да забраните член',
          'ru': 'У вас нет прав `запретить участника` чтобы запретить участника',
          'uk': 'У вас немає прав `заборонити учасника` щоб заборонити учасника',
          'hi': 'आपके पास अधिकार नहीं हैं `सदस्य को प्रतिबंधित करें` सदस्य को प्रतिबंधित करने के लिए',
          'zh-CN': '你没有权利 `禁止成员` 来禁止成员',
          'ja': 'あなたには `メンバーを禁止する` 権限がありません',
          'zh-TW': '你没有权利 `禁止成员` 来禁止成员',
          'ko': '당신에게는 `멤버를 금지할` 권리가 없습니다'
        };
        await interaction.reply({ content: permis_banMessages[interaction.locale || 'en-US'], ephemeral: true })
      };
    } else {
      await interaction.reply({ content: interactionElements.cannotUseCommand[interaction.locale || 'en-US'], ephemeral: true })
    };
  }else if(interaction.commandName === 'unban'){
    if(interaction.guild){
      if(interaction.memberPermissions?.has('Administrator') || interaction.memberPermissions?.has('BanMembers')){
        if(interaction.appPermissions?.has('Administrator') || interaction.appPermissions?.has('BanMembers')){
          const user = interaction.options.get('user')?.user;
          if(user){
            return await interaction.reply({ embeds: [interactionElements.unban_confirm_embed(user, interaction)], components: interactionElements.unban_button(interaction) })
          }else{
            try{
              return await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
            }catch{ return; };
          };
        }else await interaction.reply({ content: 'Command is Error!!', ephemeral: true });
      }else{
        const permis_unbanMessages: Record<Locale, string> = {
          'th': 'คุณไม่มีสิทธิ์ `แบนสมาชิก` เพื่อที่จะปลดแบนสมาชิก',
          'id': 'Anda tidak punya hak untuk `melarang anggota` demi membatalkan pelarangan anggota',
          'da': 'Du har ikke rettigheder til `forbyde medlem` for at ophæve forbuddet mod medlemmet',
          'de': 'Du hast keine Rechte um `Mitglied zu verbannen` um die Verbannung des Mitglieds aufzuheben',
          'en-GB': "You don't have rights to `ban member` in order to unban member",
          'en-US': "You don't have rights to `ban member` in order to unban member",
          'es-ES': 'No tienes derechos para `prohibir miembro` para levantar la prohibición del miembro',
          'es-419': 'No tienes derechos para `prohibir miembro` para levantar la prohibición del miembro',
          'fr': "Vous n'avez pas de droits pour `bannir membre` afin de lever la bannière du membre",
          'hr': 'Nemate prava za `zabraniti člana` da poništite zabranu člana',
          'it': 'Non hai diritti per `vietare membro` per annullare il divieto del membro',
          'lt': 'Neturite teisių `uždrausti narį` kad panaikintumėte nario draudimą',
          'hu': 'Nincs joga `tagot kitiltani` hogy feloldja a tag kitiltását',
          'nl': 'Je hebt geen rechten om `lid te verbannen` om het verbod van het lid op te heffen',
          'no': 'Du har ikke rettigheter til å `forby medlem` for å oppheve forbudet mot medlemmet',
          'pl': 'Nie masz praw do `zakazać członka` aby cofnąć zakaz członka',
          'pt-BR': 'Você não tem direitos para `banir membro` para desbloquear membro',
          'ro': 'Nu aveți drepturi pentru a `interzice membru` pentru a anula interdicția membrului',
          'fi': 'Sinulla ei ole oikeuksia `kieltää jäsentä` jotta voit kumota jäsenen kiellon',
          'sv-SE': 'Du har inga rättigheter att `förbjuda medlem` för att häva förbudet mot medlemmen',
          'vi': 'Bạn không có quyền `cấm thành viên` để bỏ cấm thành viên',
          'tr': '`Üyeyi yasaklamak` için haklarınız yok',
          'cs': 'Nemáte práva `zakázat člena` pro zrušení zákazu člena',
          'el': 'Δεν έχετε δικαιώματα για `απαγόρευση μέλους` για να αναιρέσετε την απαγόρευση του μέλους',
          'bg': 'Нямате права да `забраните член` за да отмените забраната на члена',
          'ru': 'У вас нет прав `запретить участника` чтобы снять запрет с участника',
          'uk': 'У вас немає прав `заборонити учасника` щоб зняти заборону з учасника',
          'hi': 'आपके पास अधिकार नहीं हैं `सदस्य को प्रतिबंधित करें` सदस्य पर से प्रतिबंध हटाने के लिए',
          'zh-CN': '你没有权利 `禁止成员` 来取消禁止成员',
          'ja': 'あなたには `メンバーを禁止する` 権限がありません',
          'zh-TW': '你没有权利 `禁止成员` 来取消禁止成员',
          'ko': '당신에게는 `멤버를 금지할` 권리가 없습니다'
        };
        await interaction.reply({ content: permis_unbanMessages[interaction.locale || 'en-US'], ephemeral: true })
      }
    }else{
      await interaction.reply({ content: interactionElements.cannotUseCommand[interaction.locale || 'en-US'], ephemeral: true })
    };
  }else if(interaction.commandName === 'banlist'){
    const locale = interaction.guildLocale == 'th' ? 'th' : 'en';
    const messages = {
      noGuild: locale === 'th' ? 'คำสั่งนี้ใช้ได้เฉพาะในเซิร์ฟเวอร์เท่านั้น!' : 'This command can only be used in a server!',
      noBans: locale === 'th' ? 'ไม่มีผู้ใช้ที่ถูกแบนในเซิร์ฟเวอร์นี้!' : 'There are no banned users in this server!',
      error: locale === 'th' ? 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ที่ถูกแบน!' : 'An error occurred while fetching the banned users!',
      banListTitle: locale === 'th' ? 'รายการผู้ใช้ที่ถูกแบน' : 'Banned Users List',
      next: locale === 'th' ? 'หน้าถัดไป' : 'Next Page',
      prev: locale === 'th' ? 'หน้าก่อนหน้า' : 'Previous Page',
    };
    if(!interaction.guild){ return await interaction.reply(messages.noGuild); };

    try {
      const bans = await interaction.guild.bans.fetch();
      if (bans.size === 0) {
          await interaction.reply(messages.noBans);
          return;
      }

      const sortedBans = Array.from(bans.values());
      let currentPage = 0;

      const getPaginatedBans = (page: number) => {
        const start = page * 25;
        const end = start + 25;
        const pageBans = sortedBans.slice(start, end);
        return pageBans.map(ban => `- ${ban.user.tag} (${ban.user.id})`).join('\n');
      };

      const createActionRow = (page: number) => {
        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('banListPrevPage')
              .setLabel(messages.prev)
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId('banListNextPage')
              .setLabel(messages.next)
              .setStyle(ButtonStyle.Primary)
              .setDisabled((page + 1) * 25 >= sortedBans.length),
          );
          return row;
      };

      const updateReply = async (page: number) => {
        currentPage = page;
        if(interaction.deferred)await interaction.editReply({
          content: `**${messages.banListTitle} (Page ${page + 1}):**\n${getPaginatedBans(page)}`,
          components: [createActionRow(page)],
        });
      };

      await interaction.reply({
        content: `**${messages.banListTitle} (Page 1):**\n${getPaginatedBans(currentPage)}`,
        components: [createActionRow(currentPage)],
      });

      if (interaction.channel?.isTextBased() && !interaction.channel.isDMBased()) {
        const collector = interaction.channel.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          time: 5_000, // 60_000
        });
      
        collector.on('collect', async (i) => {
          if (i.customId === 'banListNextPage') {
            await i.deferUpdate();
            await updateReply(currentPage + 1);
          } else if (i.customId === 'banListPrevPage') {
            await i.deferUpdate();
            await updateReply(currentPage - 1);
          }
        });
      
        collector.on('end', () => {
          if(interaction.deferred) interaction.editReply({ components: [] });
        });
      }

    }catch(error){ console.error(error) }
  }else if(interaction.commandName === 'test1'){
    const files = [new AttachmentBuilder('https://assets.camming.xyz/photos/logo/CammingLogo2.webp').setName('CammingLogo2')];
    const components = [
      new SectionBuilder().addTextDisplayComponents(m=>m.setContent('message')).setThumbnailAccessory(t=>t.setURL('https://assets.camming.xyz/photos/logo/CammingLogo2.webp')),
      (new ContainerBuilder()
        .setAccentColor(0xff4c4c)
        .addTextDisplayComponents(text=>text.setContent('test'))
        .addSeparatorComponents(separator=>separator.setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents(text=>text.setContent('test'))
        .addMediaGalleryComponents(media=>media
          .addItems(item=>item
            .setURL('https://assets.camming.xyz/photos/logo/CammingLogo2.webp')
            .setDescription('CammingLogo')
          ).addItems(item=>item
            .setURL('https://assets.camming.xyz/photos/logo/CammingLogo2.webp')
            .setDescription('CammingLogo')
          ).addItems(item=>item
            .setURL('https://assets.camming.xyz/photos/logo/CammingLogo2.webp')
            .setDescription('CammingLogo')
          )
        ).addFileComponents(file=>file
          .setURL('attachment://CammingLogo2')
          .setSpoiler(true)
        ).addSectionComponents(section=>section
          .addTextDisplayComponents(text=>text.setContent('TEST'))
          .setButtonAccessory(b=>b.setCustomId('test')
            .setLabel('test')
            .setStyle(ButtonStyle.Secondary)
          )
        ).addSectionComponents(section=>section
          .addTextDisplayComponents(text=>text.setContent('TEST'))
          .setButtonAccessory(b=>b.setCustomId('test2')
            .setLabel('test')
            .setStyle(ButtonStyle.Secondary)
          )
        ).setSpoiler(true)
      ),
      (new FileBuilder()
        .setURL('attachment://CammingLogo2')
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('example_button').setLabel('Click Me').setStyle(1),
      ),
      new TextDisplayBuilder().setContent('Contentttttttttttttttttttt!!!!!!!!!!!'),
      new SeparatorBuilder(),
      new MediaGalleryBuilder().addItems(i=>i.setURL('https://assets.camming.xyz/photos/logo/CammingLogo2.webp')),
    ];
    interaction.reply({ flags: MessageFlags.IsComponentsV2, components: components, files: files });
  }else if(interaction.commandName === 'kick'){
    if(!interaction.guild)return;
    if(!interaction.memberPermissions?.has('Administrator') || !interaction.memberPermissions?.has('KickMembers')){
      return await interaction.reply({ content: interactionElements.noAdminCommandPermission[interaction.locale || 'en-US'], ephemeral: true })
    }else if(!interaction.appPermissions?.has('Administrator') || !interaction.appPermissions?.has('KickMembers')){
      return await interaction.reply({ content: 'Command is Error!!', ephemeral: true });
    };

    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', false)
    return await interaction.reply({ embeds: [interactionElements.kick_confirm_embed(user, reason, interaction)], components: interactionElements.kick_button(interaction) });
  }else if(interaction.commandName === 'banner'){
    const user = interaction.options.get('user')?.user || interaction.member?.user;
    const userFetch = user ? await client.users.fetch(user.id, { force: true }) : null;
    if(userFetch)await interaction.reply({ embeds: [interactionElements.banner_embed(userFetch)], ephemeral: true });
  }else if(interaction.commandName === 'avatar'){
    const user = interaction.options.get('user')?.user || interaction.member?.user;
    const userFetch = user ? await client.users.fetch(user.id, { force: true }) : null;
    if(userFetch)await interaction.reply({ embeds: [interactionElements.avatar_embed(userFetch)], ephemeral: true });
  }else if(interaction.commandName === 'send'){
    if(interaction.guild){
      if(interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
        if(interaction.locale == 'th'){
          const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('send_option')
              .setPlaceholder('โปรดเลือกประเภท')
              .addOptions([
                {
                  value: 'message',
                  label: 'ข้อความ',
                  description: 'ส่งข้อความ',
                },
                {
                  value: 'embed',
                  label: 'ฝัง',
                  description: 'ส่งข้อความฝัง หรือ embed',
                },
              ])
            ,
          );
  
          await interaction.reply({ 
            content: '-# :warning: หากคุณต้องการใช้อีโมจิที่อัพโหลด คุณต้องใช้รหัสอีโมจิของคุณ **<:**ชื่ออิโมจิ**:**ID อิโมจิ**>** `ตัวอย่าง <:CammingLogo3:1230131027029135431>` และโปรดใช้เฉพาะอีโมจิที่อยู่บนเซิร์ฟเวอร์ที่ใช้คำสั่งนี้เท่านั้น',
            components: [row],
            ephemeral: true,
          });
        }else{
          const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('send_option')
              .setPlaceholder('Please select type')
              .addOptions([
                {
                  value: 'message',
                  label: 'message',
                  description: 'Send message',
                },
                {
                  value: 'embed',
                  label: 'embed',
                  description: 'Send embed message',
                },
              ])
            ,
          );
  
          await interaction.reply({ 
            content: '-# :warning: If you want to use uploaded emojis, you must use your emoji code **<:**emoji name**:**emoji ID**>** `example <:CammingLogo3:1230131027029135431>` and please only use emojis that are on the server that uses this command',
            components: [row],
            ephemeral: true,
          });
        }
      }else{
        await interaction.reply({ content: interactionElements.noAdminCommandPermission[interaction.locale || 'en-US'], ephemeral: true })
      }
    }
  }else if(interaction.commandName === 'clear'){
    const numberOfMessages = ((interaction.options as CommandInteractionOptionResolver).getInteger('number') as number) || 1;
    const user = interaction.options.get('user')?.user;

    const member = interaction.member;
    if (member instanceof GuildMember && !member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return await interaction.reply({
            content: interactionElements.noAdminCommandPermission[interaction.locale || 'en-US'],
            ephemeral: true
        });
    }

    if (interaction.channel && interaction.channel.type != ChannelType.DM) {
      try {
          const messages = await interaction.channel.messages.fetch({ limit: numberOfMessages });
          const filteredMessages = user 
              ? messages.filter(msg => msg.author.id === user.id && (Date.now() - msg.createdTimestamp <= 14 * 24 * 60 * 60 * 1000))
              : messages.filter(msg => (Date.now() - msg.createdTimestamp <= 14 * 24 * 60 * 60 * 1000));

          if (filteredMessages.size > 0 && !interaction.channel.isDMBased()) {
              await interaction.channel.bulkDelete(filteredMessages);
              await interaction.reply(interaction.locale === 'th'
                  ? `Deleted ${filteredMessages.size} message(s) ${user ? `from ${user.username} ` : ''}succeed.`
                  : `ลบ ${filteredMessages.size} ข้อความ ${user ? `ของ ${user.username} ` : ''}สำเร็จ.`
              );
          } else {
              await interaction.reply({ content: interaction.locale === 'th'
                  ? `ไม่พบข้อความที่สามารถลบได้`
                  : `No messages available to delete`,
                  ephemeral: true
              });
          }
      } catch (error) {
          try{
            await interaction.reply({ content: `Error deleting messages:\n${error}`, ephemeral: true });
          }catch{
            throw error;
          };
      }
    } else {
      await interaction.reply({ content: 'This command can only be used in guild channels.', ephemeral: true });
    }

    setTimeout(async () => {
      try {
        await interaction.fetchReply()
            .then(async () => { await interaction.deleteReply(); });
      } catch (error) {
        throw error;
      }
    }, 5000);
  }else if(interaction.commandName === 'audit_log'){
    if(interaction.memberPermissions?.has(PermissionFlagsBits.ViewAuditLog)){
      const guildId = interaction.guild?.id;
      let config = await this.guildConfigRepository.findOne({ where: { guildId } });
      if (!config) {
        config = this.guildConfigRepository.create({
          guildId,
          auditLogSettings: JSON.stringify({})
        });
        await this.guildConfigRepository.save(config);
      };
      const auditLogSettings: AuditLogSettings = JSON.parse(config?.auditLogSettings || '{}');
      const embed = interactionElements.audit_log_embed(interaction);

      logEvents.forEach(event => {
        if (!auditLogSettings[event as keyof AuditLogSettings]) {
          auditLogSettings[event as keyof AuditLogSettings] = null;
        }
      });
      logEvents.forEach(event => {
        embed.addFields({
            name: event.charAt(0).toUpperCase() + event.slice(1).replace(/_/g, ' '),
            value: auditLogSettings[event as keyof AuditLogSettings]
              ? `<#${auditLogSettings[event as keyof AuditLogSettings]}>`
              : (interaction.locale == 'th' ? 'ไม่ได้ตั้งค่า' : 'not set'),
            inline: true
        });
      });

      await interaction.reply({ embeds: [embed], components: interactionElements.audit_log_button(interaction) });
      // const updatePrefix = await this.guildConfigRepository.save({
      //   ...config,
      //   prefix: newPrefix,
      // });
      // client.configs.set(interaction.guildId!, updatePrefix)
    }else{
      await interaction.reply({
        content: interactionElements.noAdminCommandPermission[interaction.locale || 'en-US'],
        ephemeral: true
      });
    };
  }else if(interaction.commandName === 'role'){
    if(!interaction.guild)return;
    if(!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)){
      const permis_manageRolesCommand: Record<Locale, string> = {
        'th': 'คุณไม่มีสิทธิ์ `จัดการบทบาท` เพื่อใช้คำสั่งนี้',
        'id': 'Anda tidak memiliki hak `mengelola peran` untuk menggunakan perintah ini',
        'da': 'Du har ikke rettigheder til `administrere roller` for at bruge denne kommando',
        'de': 'Du hast keine Rechte für `Rollen verwalten`, um diesen Befehl zu verwenden',
        'en-GB': "You do not have `manage roles` permission to use this command",
        'en-US': "You do not have `manage roles` permission to use this command",
        'es-ES': 'No tienes permiso para `Gestionar roles` para usar este comando',
        'es-419': 'No tienes permiso para `Gestionar roles` para usar este comando',
        'fr': "Vous n'avez pas la permission `Gérer les rôles` pour utiliser cette commande",
        'hr': 'Nemate pravo `upravljati ulogama` za korištenje ove naredbe',
        'it': 'Non hai il permesso di `Gestire ruoli` per usare questo comando',
        'lt': 'Neturite teisės `tvarkyti vaidmenis`, kad naudotumėte šį komandą',
        'hu': 'Nincs jogosultságod `Szerepkörök kezelése` ennek a parancsnak a használatához',
        'nl': 'Je hebt geen rechten om `rollen te beheren` om deze opdracht te gebruiken',
        'no': 'Du har ikke rettigheter til å `administrere roller` for å bruke denne kommandoen',
        'pl': 'Nie masz uprawnień do `zarządzania rolami` aby używać tego polecenia',
        'pt-BR': 'Você não tem permissão para `Gerenciar Cargos` para usar este comando',
        'ro': 'Nu aveți permisiunea de a `gestiona roluri` pentru a utiliza această comandă',
        'fi': 'Sinulla ei ole oikeuksia `hallita rooleja` tämän komennon käyttöön',
        'sv-SE': 'Du har inga rättigheter att `hantera roller` för att använda det här kommandot',
        'vi': 'Bạn không có quyền `quản lý vai trò` để sử dụng lệnh này',
        'tr': '`Rolleri yönetme` izniniz yok, bu komutu kullanmak için',
        'cs': 'Nemáte oprávnění `spravovat role`, abyste mohli použít tento příkaz',
        'el': 'Δεν έχετε δικαιώματα για `διαχείριση ρόλων` για να χρησιμοποιήσετε αυτή την εντολή',
        'bg': 'Нямате права за `управление на роли`, за да използвате тази команда',
        'ru': 'У вас нет прав на `управление ролями`, чтобы использовать эту команду',
        'uk': 'У вас немає прав на `керування ролями`, щоб використовувати цю команду',
        'hi': 'आपके पास `रोल प्रबंधित करने` का अधिकार नहीं है इस कमांड को उपयोग करने के लिए',
        'zh-CN': '你没有 `管理角色` 权限，无法使用此命令',
        'ja': 'このコマンドを使用するには `ロール管理` 権限がありません',
        'zh-TW': '你沒有 `管理角色` 權限，無法使用此命令',
        'ko': '이 명령을 사용하려면 `역할 관리` 권한이 없습니다'
      };      
      return await interaction.reply({ content: permis_manageRolesCommand[interaction.locale || 'en-US'], ephemeral: true });
    };

    await interaction.deferReply();

    const replyBotPermission = async() => {
      const permis_manageRoles: Record<Locale, string> = {
        'th': 'บอทไม่มีสิทธิ์ `จัดการบทบาท` หรือบทบาทนี้สูงกว่าบอท',
        'id': 'Bot tidak memiliki hak `mengelola peran` atau peran ini lebih tinggi dari bot',
        'da': 'Bot har ikke rettigheder til at `administrere roller` eller denne rolle er højere end botten',
        'de': 'Der Bot hat nicht die Rechte für `Rollen verwalten` oder diese Rolle ist höher als der Bot',
        'en-GB': "The bot does not have the `Manage Roles` permission or this role is higher than the bot",
        'en-US': "The bot does not have the `Manage Roles` permission or this role is higher than the bot",
        'es-ES': 'El bot no tiene el permiso `Gestionar roles` o este rol es más alto que el bot',
        'es-419': 'El bot no tiene el permiso `Gestionar roles` o este rol es más alto que el bot',
        'fr': "Le bot n'a pas la permission `Gérer les rôles` ou ce rôle est plus élevé que celui du bot",
        'hr': 'Bot nema pravo `upravljati ulogama` ili je ova uloga viša od bota',
        'it': 'Il bot non ha il permesso di `Gestire ruoli` o questo ruolo è più alto del bot',
        'lt': 'Bot neturi teisės `tvarkyti vaidmenis` arba ši rolė yra aukštesnė nei bot',
        'hu': 'A botnak nincs jogosultsága a `Szerepkörök kezelése` vagy ez a szerep magasabb, mint a bot',
        'nl': 'De bot heeft geen rechten om `rollen te beheren` of deze rol is hoger dan de bot',
        'no': 'Boten har ikke rettigheter til å `administrere roller` eller denne rollen er høyere enn boten',
        'pl': 'Bot nie ma uprawnień do `zarządzania rolami` lub ta rola jest wyższa od bota',
        'pt-BR': 'O bot não tem permissão para `Gerenciar Cargos` ou este cargo é mais alto que o bot',
        'ro': 'Botul nu are permisiunea de a `gestiona roluri` sau acest rol este mai sus decât botul',
        'fi': 'Bottilla ei ole oikeuksia `hallita rooleja` tai tämä rooli on korkeampi kuin botti',
        'sv-SE': 'Botten har inte rättigheter att `hantera roller` eller så är denna roll högre än botten',
        'vi': 'Bot không có quyền `quản lý vai trò` hoặc vai trò này cao hơn bot',
        'tr': 'Bot, `Rolleri yönetme` iznine sahip değil ya da bu rol botu geçiyor',
        'cs': 'Bot nemá oprávnění `spravovat role` nebo je tato role vyšší než bot',
        'el': 'Το bot δεν έχει δικαιώματα για `διαχείριση ρόλων` ή αυτή η θέση είναι υψηλότερη από του bot',
        'bg': 'Ботът няма разрешения за `управление на роли` или тази роля е по-висока от бота',
        'ru': 'Бот не имеет прав на `управление ролями`, или эта роль выше, чем у бота',
        'uk': 'Бот не має прав на `керування ролями`, або ця роль вища за бота',
        'hi': 'बॉट के पास `रोल प्रबंधित करने` का अधिकार नहीं है, या यह भूमिका बॉट से उच्च है',
        'zh-CN': '机器人没有 `管理角色` 权限，或者此角色比机器人更高',
        'ja': 'ボットには `ロール管理` 権限がないか、このロールがボットよりも上位です',
        'zh-TW': '機器人沒有 `管理角色` 權限，或者此角色比機器人更高',
        'ko': '봇은 `역할 관리` 권한이 없거나 이 역할이 봇보다 높습니다'
      };
      return await interaction.editReply({ content: permis_manageRoles[interaction.guildLocale || 'en-US'] });
    };
    const subCommand = interaction.options.getSubcommand();

    if(subCommand === 'add'){
      const user = await interaction.guild.members.fetch(interaction.options.getUser('user', true).id);
      const role = await interaction.guild.roles.fetch(interaction.options.getRole('role', true).id);
      try{
        if(!role || !role.editable)return await replyBotPermission();

        await user.roles.add(role);
        if(user.roles.cache.has(role.id)){
          const success_addRole: Record<Locale, string> = {
            'th': `เพิ่มบทบาท <@&${role.id}> ให้กับ <@${user.id}> เรียบร้อยแล้ว`,
            'id': `Berhasil menambahkan peran <@&${role.id}> ke <@${user.id}>`,
            'da': `Succesfult tilføjet rolle <@&${role.id}> til <@${user.id}>`,
            'de': `Erfolgreich Rolle <@&${role.id}> zu <@${user.id}> hinzugefügt`,
            'en-GB': `Successfully added role <@&${role.id}> to <@${user.id}>.`,
            'en-US': `Successfully added role <@&${role.id}> to <@${user.id}>.`,
            'es-ES': `Se añadió correctamente el rol <@&${role.id}> a <@${user.id}>.`,
            'es-419': `Se añadió correctamente el rol <@&${role.id}> a <@${user.id}>.`,
            'fr': `Rôle <@&${role.id}> ajouté avec succès à <@${user.id}>.`,
            'hr': `Uloga <@&${role.id}> uspješno dodana korisniku <@${user.id}>.`,
            'it': `Ruolo <@&${role.id}> aggiunto con successo a <@${user.id}>.`,
            'lt': `Sėkmingai priskirtas vaidmuo <@&${role.id}> vartotojui <@${user.id}>.`,
            'hu': `Sikeresen hozzáadva a szerepkör <@&${role.id}> a felhasználóhoz <@${user.id}>.`,
            'nl': `Rol <@&${role.id}> succesvol toegevoegd aan <@${user.id}>.`,
            'no': `Rolle <@&${role.id}> ble vellykket lagt til <@${user.id}>.`,
            'pl': `Pomyślnie dodano rolę <@&${role.id}> do <@${user.id}>.`,
            'pt-BR': `Papel <@&${role.id}> adicionado com sucesso a <@${user.id}>.`,
            'ro': `Rolul <@&${role.id}> a fost adăugat cu succes la <@${user.id}>.`,
            'fi': `Rooli <@&${role.id}> lisätty onnistuneesti käyttäjälle <@${user.id}>.`,
            'sv-SE': `Roll <@&${role.id}> har framgångsrikt lagts till <@${user.id}>.`,
            'vi': `Thêm vai trò <@&${role.id}> cho <@${user.id}> thành công.`,
            'tr': `<@${user.id}> kullanıcısına <@&${role.id}> rolü başarıyla eklendi.`,
            'cs': `Úspěšně přidána role <@&${role.id}> uživateli <@${user.id}>.`,
            'el': `Προστέθηκε με επιτυχία ο ρόλος <@&${role.id}> στον χρήστη <@${user.id}>.`,
            'bg': `Успешно добавена роля <@&${role.id}> на потребителя <@${user.id}>.`,
            'ru': `У вас успешно добавлена роль <@&${role.id}> пользователю <@${user.id}>.`,
            'uk': `Успішно додано роль <@&${role.id}> користувачу <@${user.id}>.`,
            'hi': `सफलता से भूमिका <@&${role.id}> को <@${user.id}> को जोड़ा गया।`,
            'zh-CN': `成功将角色 <@&${role.id}> 添加到 <@${user.id}>。`,
            'ja': `あなたにロール <@&${role.id}> を正常に追加しました <@${user.id}>.`,
            'zh-TW': `成功將角色 <@&${role.id}> 添加到 <@${user.id}>。`,
            'ko': `이 명령을 사용하려면 역할 <@&${role.id}> 을(를) 성공적으로 추가했습니다 <@${user.id}>.`
          };
          const embed = (new EmbedBuilder()
            .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
            .setTitle('Add Role Successfully')
            .setDescription(success_addRole[interaction.guild.preferredLocale || 'en-US'])
            .setFooter(client.user && { text: client.user.tag, iconURL: client.user.displayAvatarURL() })
            .setColor('#85ff00'))
          return await interaction.editReply({ embeds: [embed] });
        }else{
          const error_addRole: Record<Locale, string> = {
            'th': `บทบาทอาจจะไม่ถูกเพิ่มให้ <@${user.id}> เนื่องจากข้อผิดพลาดบางอย่าง`,
            'id': `Peran mungkin tidak ditambahkan ke <@${user.id}> karena beberapa kesalahan`,
            'da': `Rollen blev muligvis ikke tilføjet til <@${user.id}> på grund af nogle fejl`,
            'de': `Die Rolle wurde möglicherweise nicht zu <@${user.id}> hinzugefügt aufgrund einiger Fehler`,
            'en-GB': `The role might not have been added to <@${user.id}> due to some errors.`,
            'en-US': `The role might not have been added to <@${user.id}> due to some errors.`,
            'es-ES': `El rol podría no haber sido agregado a <@${user.id}> debido a algunos errores.`,
            'es-419': `El rol podría no haber sido agregado a <@${user.id}> debido a algunos errores.`,
            'fr': `Le rôle n'a peut-être pas été ajouté à <@${user.id}> en raison de certaines erreurs.`,
            'hr': `Uloga možda nije dodana korisniku <@${user.id}> zbog nekih pogrešaka.`,
            'it': `Il ruolo potrebbe non essere stato aggiunto a <@${user.id}> a causa di alcuni errori.`,
            'lt': `Rolis galbūt nebuvo pridėtas vartotojui <@${user.id}> dėl kai kurių klaidų.`,
            'hu': `A szerep esetleg nem lett hozzáadva a felhasználóhoz <@${user.id}> néhány hiba miatt.`,
            'nl': `De rol is mogelijk niet toegevoegd aan <@${user.id}> vanwege enkele fouten.`,
            'no': `Rollen ble kanskje ikke lagt til <@${user.id}> på grunn av noen feil.`,
            'pl': `Rola mogła nie zostać dodana do <@${user.id}> z powodu kilku błędów.`,
            'pt-BR': `O papel pode não ter sido adicionado a <@${user.id}> devido a alguns erros.`,
            'ro': `Rolul poate că nu a fost adăugat la <@${user.id}> din cauza unor erori.`,
            'fi': `Roolia ei ehkä lisätty käyttäjälle <@${user.id}> joidenkin virheiden vuoksi.`,
            'sv-SE': `Rollen kanske inte lades till <@${user.id}> på grund av några fel.`,
            'vi': `Vai trò có thể chưa được thêm vào <@${user.id}> do một số lỗi.`,
            'tr': `Rol, bazı hatalar nedeniyle <@${user.id}> kullanıcısına eklenmemiş olabilir.`,
            'cs': `Rola možná nebyla přidána uživateli <@${user.id}> kvůli některým chybám.`,
            'el': `Ο ρόλος ενδέχεται να μην προστέθηκε στον χρήστη <@${user.id}> λόγω ορισμένων σφαλμάτων.`,
            'bg': `Ролята може да не е добавена към потребителя <@${user.id}> поради някои грешки.`,
            'ru': `Роль возможно не была добавлена пользователю <@${user.id}> из-за некоторых ошибок.`,
            'uk': `Роль, ймовірно, не була додана користувачу <@${user.id}> через деякі помилки.`,
            'hi': `कुछ त्रुटियों के कारण भूमिका <@${user.id}> को नहीं जोड़ी जा सकी।`,
            'zh-CN': `由于一些错误，角色可能未成功添加到 <@${user.id}>。`,
            'ja': `いくつかのエラーにより、役職が <@${user.id}> に追加されていない可能性があります。`,
            'zh-TW': `由於一些錯誤，角色可能未成功添加到 <@${user.id}>。`,
            'ko': `일부 오류로 인해 역할이 <@${user.id}>에 추가되지 않았을 수 있습니다.`
          };          
          const embed = (new EmbedBuilder()
            .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
            .setTitle('Add Role Error')
            .setDescription(error_addRole[interaction.guild.preferredLocale || 'en-US'])
            .setFooter(client.user && { text: client.user.tag, iconURL: client.user.displayAvatarURL() })
            .setColor('#ff4c4c'))
          return await interaction.editReply({ embeds: [embed] });
        };
      }catch(error){
        const embed = (new EmbedBuilder()
          .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
          .setTitle('Multiple Role Error')
          .setDescription(`${(error instanceof Error) ? error.message : error}`)
          .setFooter(client.user && { text: client.user.tag, iconURL: client.user.displayAvatarURL() })
          .setColor('#ff4c4c')
        );
        try{return await interaction.followUp({ content: `${(error instanceof Error) ? error.message : error}`, embeds: [embed] });}
        catch(followUpError){
          return console.error(
            chalk.red(` - ✖ RoleCommand Error`),
            (error instanceof Error) ? error.message : error,
            '\n',chalk.yellow(`  - ✖ RoleCommand Sending Error:`),
            (followUpError instanceof Error) ? followUpError.message : followUpError
          );
        };
      };
    }else if(subCommand === 'remove'){
      const user = await interaction.guild.members.fetch(interaction.options.getUser('user', true).id);
      const role = await interaction.guild.roles.fetch(interaction.options.getRole('role', true).id);
      if(!role || !role.editable)return replyBotPermission();
      try{
        await user.roles.remove(role);
        if(!user.roles.cache.has(role.id)){
          const success_removeRole: Record<Locale, string> = {
            'th': `ลบบทบาท <@&${role.id}> ออกจาก <@${user.id}> สำเร็จแล้ว`,
            'id': `Berhasil menghapus peran <@&${role.id}> dari <@${user.id}>.`,
            'da': `Rollen <@&${role.id}> blev fjernet fra <@${user.id}>.`,
            'de': `Die Rolle <@&${role.id}> wurde erfolgreich von <@${user.id}> entfernt.`,
            'en-GB': `Successfully removed role <@&${role.id}> from <@${user.id}>.`,
            'en-US': `Successfully removed role <@&${role.id}> from <@${user.id}>.`,
            'es-ES': `Se eliminó correctamente el rol <@&${role.id}> de <@${user.id}>.`,
            'es-419': `Se eliminó correctamente el rol <@&${role.id}> de <@${user.id}>.`,
            'fr': `Le rôle <@&${role.id}> a été supprimé avec succès de <@${user.id}>.`,
            'hr': `Uloga <@&${role.id}> je uspješno uklonjena s <@${user.id}>.`,
            'it': `Il ruolo <@&${role.id}> è stato rimosso con successo da <@${user.id}>.`,
            'lt': `Sėkmingai pašalintas vaidmuo <@&${role.id}> iš <@${user.id}>.`,
            'hu': `A(z) <@&${role.id}> szerep sikeresen eltávolítva a <@${user.id}> felhasználótól.`,
            'nl': `Rol <@&${role.id}> is succesvol verwijderd van <@${user.id}>.`,
            'no': `Rollen <@&${role.id}> ble fjernet fra <@${user.id}>.`,
            'pl': `Pomyślnie usunięto rolę <@&${role.id}> od <@${user.id}>.`,
            'pt-BR': `A função <@&${role.id}> foi removida com sucesso de <@${user.id}>.`,
            'ro': `Rolul <@&${role.id}> a fost eliminat cu succes de la <@${user.id}>.`,
            'fi': `Rooli <@&${role.id}> poistettiin onnistuneesti käyttäjältä <@${user.id}>.`,
            'sv-SE': `Rollen <@&${role.id}> har tagits bort från <@${user.id}>.`,
            'vi': `Vai trò <@&${role.id}> đã được xóa khỏi <@${user.id}> thành công.`,
            'tr': `<@&${role.id}> rolü başarıyla <@${user.id}> kullanıcısından kaldırıldı.`,
            'cs': `Role <@&${role.id}> byla úspěšně odebrána z <@${user.id}>.`,
            'el': `Ο ρόλος <@&${role.id}> αφαιρέθηκε επιτυχώς από <@${user.id}>.`,
            'bg': `Ролята <@&${role.id}> беше успешно премахната от <@${user.id}>.`,
            'ru': `Роль <@&${role.id}> успешно удалена у <@${user.id}>.`,
            'uk': `Роль <@&${role.id}> успішно видалено у <@${user.id}>.`,
            'hi': `<@&${role.id}> भूमिका को सफलतापूर्वक <@${user.id}> से हटा दिया गया है।`,
            'zh-CN': `成功将角色 <@&${role.id}> 从 <@${user.id}> 移除。`,
            'ja': `<@&${role.id}> の役職が <@${user.id}> から正常に削除されました。`,
            'zh-TW': `成功將角色 <@&${role.id}> 從 <@${user.id}> 移除。`,
            'ko': `<@&${role.id}> 역할이 <@${user.id}>에서 성공적으로 제거되었습니다.`
          };
          const embed = (new EmbedBuilder()
            .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
            .setTitle('Remove Role Successfully')
            .setDescription(success_removeRole[interaction.guild.preferredLocale || 'en-US'])
            .setFooter(client.user && { text: client.user.tag, iconURL: client.user.displayAvatarURL() })
            .setColor('#85ff00'))
          return await interaction.editReply({ embeds: [embed] });
        }else{
          const error_removeRole: Record<Locale, string> = {
            'th': `บทบาทอาจจะไม่ถูกลบออกจาก <@${user.id}> เนื่องจากข้อผิดพลาดบางอย่าง`,
            'id': `Peran mungkin tidak dihapus dari <@${user.id}> karena beberapa kesalahan.`,
            'da': `Rollen blev muligvis ikke fjernet fra <@${user.id}> på grund af nogle fejl.`,
            'de': `Die Rolle wurde möglicherweise nicht von <@${user.id}> entfernt aufgrund einiger Fehler.`,
            'en-GB': `The role might not have been removed from <@${user.id}> due to some errors.`,
            'en-US': `The role might not have been removed from <@${user.id}> due to some errors.`,
            'es-ES': `El rol podría no haber sido eliminado de <@${user.id}> debido a algunos errores.`,
            'es-419': `El rol podría no haber sido eliminado de <@${user.id}> debido a algunos errores.`,
            'fr': `Le rôle n'a peut-être pas été supprimé de <@${user.id}> en raison de certaines erreurs.`,
            'hr': `Uloga možda nije uklonjena s korisnika <@${user.id}> zbog nekih pogrešaka.`,
            'it': `Il ruolo potrebbe non essere stato rimosso da <@${user.id}> a causa di alcuni errori.`,
            'lt': `Rolis galbūt nebuvo pašalintas iš vartotojo <@${user.id}> dėl kai kurių klaidų.`,
            'hu': `A(z) <@${user.id}> felhasználótól esetleg nem lett eltávolítva a szerep néhány hiba miatt.`,
            'nl': `De rol is mogelijk niet verwijderd van <@${user.id}> vanwege enkele fouten.`,
            'no': `Rollen ble kanskje ikke fjernet fra <@${user.id}> på grunn av noen feil.`,
            'pl': `Rola mogła nie zostać usunięta od <@${user.id}> z powodu kilku błędów.`,
            'pt-BR': `O papel pode não ter sido removido de <@${user.id}> devido a alguns erros.`,
            'ro': `Rolul poate că nu a fost eliminat de la <@${user.id}> din cauza unor erori.`,
            'fi': `Roolia ei ehkä poistettu käyttäjältä <@${user.id}> joidenkin virheiden vuoksi.`,
            'sv-SE': `Rollen kanske inte togs bort från <@${user.id}> på grund av några fel.`,
            'vi': `Vai trò có thể chưa được xóa khỏi <@${user.id}> do một số lỗi.`,
            'tr': `<@${user.id}> kullanıcısından rol bazı hatalar nedeniyle kaldırılmamış olabilir.`,
            'cs': `Role možná nebyla odebrána uživateli <@${user.id}> kvůli některým chybám.`,
            'el': `Ο ρόλος ενδέχεται να μην αφαιρέθηκε από τον χρήστη <@${user.id}> λόγω ορισμένων σφαλμάτων.`,
            'bg': `Ролята може да не е премахната от потребителя <@${user.id}> поради някои грешки.`,
            'ru': `Роль возможно не была удалена у пользователя <@${user.id}> из-за некоторых ошибок.`,
            'uk': `Роль, ймовірно, не була видалена у користувача <@${user.id}> через деякі помилки.`,
            'hi': `<@${user.id}> से भूमिका कुछ त्रुटियों के कारण नहीं हटाई जा सकी।`,
            'zh-CN': `由于一些错误，可能未能成功从 <@${user.id}> 移除角色。`,
            'ja': `いくつかのエラーにより、役職が <@${user.id}> から削除されていない可能性があります。`,
            'zh-TW': `由於一些錯誤，可能未能成功從 <@${user.id}> 移除角色。`,
            'ko': `일부 오류로 인해 역할이 <@${user.id}>에서 제거되지 않았을 수 있습니다.`
          };
          const embed = (new EmbedBuilder()
            .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
            .setTitle('Remove Role Error')
            .setDescription(error_removeRole[interaction.guild.preferredLocale || 'en-US'])
            .setFooter(client.user && { text: client.user.tag, iconURL: client.user.displayAvatarURL() })
            .setColor('#ff4c4c'))
          return await interaction.editReply({ embeds: [embed] });
        };
      }catch(error){
        const embed = (new EmbedBuilder()
          .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
          .setTitle('Multiple Role Error')
          .setDescription(`${(error instanceof Error) ? error.message : error}`)
          .setFooter(client.user && { text: client.user.tag, iconURL: client.user.displayAvatarURL() })
          .setColor('#ff4c4c')
        );
        try{return await interaction.followUp({ content: `${(error instanceof Error) ? error.message : error}`, embeds: [embed] });}
        catch(followUpError){
          return console.error(
            chalk.red(` - ✖ RoleCommand Error`),
            (error instanceof Error) ? error.message : error,
            '\n',chalk.yellow(`  - ✖ RoleCommand Sending Error:`),
            (followUpError instanceof Error) ? followUpError.message : followUpError
          );
        };
      };
    }else if(subCommand === 'multiple'){
      const role = await interaction.guild.roles.fetch(interaction.options.getRole('role', true).id);
      const add_or_remove = interaction.options.getString('add_or_remove', true);
      const pick_type = interaction.options.getString('pick_type', true);
      const all_that_a_role = interaction.options.getRole('all_that_a_role');
      if(!role || !role.editable)return replyBotPermission();
      if(pick_type == 'all_that_a_role' && !all_that_a_role){
        const type_error_all_that_a_role: Record<Locale, string> = {
          'th': 'คุณเลือกประเภท `ทั้งหมดที่มีบทบาท` แต่ไม่ได้กำหนดบทบาทใน `ทั้งหมดที่มีบทบาท`',
          'id': 'Anda memilih jenis `all_that_a_role` tetapi Anda tidak menentukan peran di `all_that_a_role`',
          'da': 'Du valgte typen `all_that_a_role`, men du definerede ikke en rolle i `all_that_a_role`',
          'de': 'Du hast den Typ `all_that_a_role` ausgewählt, aber keine Rolle in `all_that_a_role` definiert',
          'en-GB': 'You selected the type `all_that_a_role` but you did not define a role in `all_that_a_role`',
          'en-US': 'You selected the type `all_that_a_role` but you did not define a role in `all_that_a_role`',
          'es-ES': 'Seleccionaste el tipo `all_that_a_role`, pero no definiste un rol en `all_that_a_role`',
          'es-419': 'Seleccionaste el tipo `all_that_a_role`, pero no definiste un rol en `all_that_a_role`',
          'fr': 'Vous avez sélectionné le type `all_that_a_role`, mais vous n\'avez pas défini de rôle dans `all_that_a_role`',
          'hr': 'Odabrali ste vrstu `all_that_a_role`, ali niste definirali ulogu u `all_that_a_role`',
          'it': 'Hai selezionato il tipo `all_that_a_role`, ma non hai definito un ruolo in `all_that_a_role`',
          'lt': 'Pasirinkote tipą `all_that_a_role`, bet nenustatėte vaidmens `all_that_a_role`',
          'hu': 'Kiválasztottad a(z) `all_that_a_role` típust, de nem határoztál meg szerepet a(z) `all_that_a_role`-ban',
          'nl': 'Je hebt het type `all_that_a_role` geselecteerd, maar je hebt geen rol gedefinieerd in `all_that_a_role`',
          'no': 'Du valgte typen `all_that_a_role`, men du definerte ikke en rolle i `all_that_a_role`',
          'pl': 'Wybrałeś typ `all_that_a_role`, ale nie zdefiniowałeś roli w `all_that_a_role`',
          'pt-BR': 'Você selecionou o tipo `all_that_a_role`, mas não definiu um papel em `all_that_a_role`',
          'ro': 'Ați selectat tipul `all_that_a_role`, dar nu ați definit un rol în `all_that_a_role`',
          'fi': 'Valitsit tyypin `all_that_a_role`, mutta et määritellyt roolia kohdassa `all_that_a_role`',
          'sv-SE': 'Du valde typen `all_that_a_role`, men du definierade ingen roll i `all_that_a_role`',
          'vi': 'Bạn đã chọn loại `all_that_a_role`, nhưng bạn chưa xác định vai trò trong `all_that_a_role`',
          'tr': '`all_that_a_role` türünü seçtiniz, ancak `all_that_a_role` içinde bir rol tanımlamadınız',
          'cs': 'Vybrali jste typ `all_that_a_role`, ale nedefinovali jste roli v `all_that_a_role`',
          'el': 'Επιλέξατε τον τύπο `all_that_a_role`, αλλά δεν ορίσατε ρόλο στο `all_that_a_role`',
          'bg': 'Избрахте типа `all_that_a_role`, но не сте задали роля в `all_that_a_role`',
          'ru': 'Вы выбрали тип `all_that_a_role`, но не указали роль в `all_that_a_role`',
          'uk': 'Ви вибрали тип `all_that_a_role`, але не вказали роль у `all_that_a_role`',
          'hi': 'आपने प्रकार `all_that_a_role` चुना लेकिन आपने `all_that_a_role` में कोई भूमिका परिभाषित नहीं की',
          'zh-CN': '您选择了类型 `all_that_a_role`，但您没有在 `all_that_a_role` 中定义角色',
          'ja': 'タイプ `all_that_a_role` を選択しましたが、`all_that_a_role` に役職が定義されていません',
          'zh-TW': '您選擇了類型 `all_that_a_role`，但您沒有在 `all_that_a_role` 中定義角色',
          'ko': '`all_that_a_role` 유형을 선택했지만 `all_that_a_role`에 역할을 정의하지 않았습니다.'
        };
        const embed = (new EmbedBuilder()
          .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
          .setTitle(`${add_or_remove.slice(0,1).toUpperCase()+add_or_remove.slice(1)} multiple roles Error`)
          .setDescription(type_error_all_that_a_role[interaction.locale || 'en-US'])
          .setFooter(client.user && { text: client.user.tag, iconURL: client.user.displayAvatarURL() })
          .setColor('#ff4c4c')
        );
        return await interaction.editReply({ embeds: [embed] });
      };
      try{
        if(add_or_remove == 'add'){
          const role_add_success: Record<Locale, {'all_members': string, 'all_bots': string, 'all_users': string, 'all_roles': string}> = {
            th: {
              all_members: `สำเร็จในการเพิ่มบทบาท <@&${role.id}> ให้กับสมาชิกทั้งหมด.`,
              all_bots: `สำเร็จในการเพิ่มบทบาท <@&${role.id}> ให้กับบอททั้งหมด.`,
              all_users: `สำเร็จในการเพิ่มบทบาท <@&${role.id}> ให้กับผู้ใช้ทั้งหมด.`,
              all_roles: `สำเร็จในการเพิ่มบทบาท <@&${role.id}> ให้กับสมาชิกทั้งหมดที่มีบทบาท <@&${all_that_a_role?.id}>.`
            },
            id: {
              all_members: `Berhasil menambahkan peran <@&${role.id}> ke semua anggota.`,
              all_bots: `Berhasil menambahkan peran <@&${role.id}> ke semua bot.`,
              all_users: `Berhasil menambahkan peran <@&${role.id}> ke semua pengguna.`,
              all_roles: `Berhasil menambahkan peran <@&${role.id}> ke semua anggota dengan peran <@&${all_that_a_role?.id}>.`
            },
            da: {
              all_members: `Succesfult tilføjet rollen <@&${role.id}> til alle medlemmer.`,
              all_bots: `Succesfult tilføjet rollen <@&${role.id}> til alle bots.`,
              all_users: `Succesfult tilføjet rollen <@&${role.id}> til alle brugere.`,
              all_roles: `Succesfult tilføjet rollen <@&${role.id}> til alle medlemmer med rollen <@&${all_that_a_role?.id}>.`
            },
            de: {
              all_members: `Erfolgreich Rolle <@&${role.id}> zu allen Mitgliedern hinzugefügt.`,
              all_bots: `Erfolgreich Rolle <@&${role.id}> zu allen Bots hinzugefügt.`,
              all_users: `Erfolgreich Rolle <@&${role.id}> zu allen Benutzern hinzugefügt.`,
              all_roles: `Erfolgreich Rolle <@&${role.id}> zu allen Mitgliedern mit Rolle <@&${all_that_a_role?.id}> hinzugefügt.`
            },
            'en-GB': {
              all_members: `Successfully added role <@&${role.id}> to all members.`,
              all_bots: `Successfully added role <@&${role.id}> to all bots.`,
              all_users: `Successfully added role <@&${role.id}> to all users.`,
              all_roles: `Successfully added role <@&${role.id}> to all members with role <@&${all_that_a_role?.id}>.`
            },
            'en-US': {
              all_members: `Successfully added role <@&${role.id}> to all members.`,
              all_bots: `Successfully added role <@&${role.id}> to all bots.`,
              all_users: `Successfully added role <@&${role.id}> to all users.`,
              all_roles: `Successfully added role <@&${role.id}> to all members with role <@&${all_that_a_role?.id}>.`
            },
            'es-ES': {
              all_members: `Se agregó con éxito el rol <@&${role.id}> a todos los miembros.`,
              all_bots: `Se agregó con éxito el rol <@&${role.id}> a todos los bots.`,
              all_users: `Se agregó con éxito el rol <@&${role.id}> a todos los usuarios.`,
              all_roles: `Se agregó con éxito el rol <@&${role.id}> a todos los miembros con el rol <@&${all_that_a_role?.id}>.`
            },
            'es-419': {
              all_members: `Se agregó con éxito el rol <@&${role.id}> a todos los miembros.`,
              all_bots: `Se agregó con éxito el rol <@&${role.id}> a todos los bots.`,
              all_users: `Se agregó con éxito el rol <@&${role.id}> a todos los usuarios.`,
              all_roles: `Se agregó con éxito el rol <@&${role.id}> a todos los miembros con el rol <@&${all_that_a_role?.id}>.`
            },
            fr: {
              all_members: `Rôle <@&${role.id}> ajouté avec succès à tous les membres.`,
              all_bots: `Rôle <@&${role.id}> ajouté avec succès à tous les bots.`,
              all_users: `Rôle <@&${role.id}> ajouté avec succès à tous les utilisateurs.`,
              all_roles: `Rôle <@&${role.id}> ajouté avec succès à tous les membres avec le rôle <@&${all_that_a_role?.id}>.`
            },
            hr: {
              all_members: `Uspješno dodan role <@&${role.id}> svim članovima.`,
              all_bots: `Uspješno dodan role <@&${role.id}> svim botovima.`,
              all_users: `Uspješno dodan role <@&${role.id}> svim korisnicima.`,
              all_roles: `Uspješno dodan role <@&${role.id}> svim članovima s rolom <@&${all_that_a_role?.id}>.`
            },
            it: {
              all_members: `Ruolo <@&${role.id}> aggiunto con successo a tutti i membri.`,
              all_bots: `Ruolo <@&${role.id}> aggiunto con successo a tutti i bot.`,
              all_users: `Ruolo <@&${role.id}> aggiunto con successo a tutti gli utenti.`,
              all_roles: `Ruolo <@&${role.id}> aggiunto con successo a tutti i membri con il ruolo <@&${all_that_a_role?.id}>.`
            },
            lt: {
              all_members: `Sėkmingai pridėta rolė <@&${role.id}> visiems nariams.`,
              all_bots: `Sėkmingai pridėta rolė <@&${role.id}> visiems botams.`,
              all_users: `Sėkmingai pridėta rolė <@&${role.id}> visiems vartotojams.`,
              all_roles: `Sėkmingai pridėta rolė <@&${role.id}> visiems nariams su role <@&${all_that_a_role?.id}>.`
            },
            hu: {
              all_members: `Sikeresen hozzáadva a <@&${role.id}> szerep minden tagnak.`,
              all_bots: `Sikeresen hozzáadva a <@&${role.id}> szerep minden botnak.`,
              all_users: `Sikeresen hozzáadva a <@&${role.id}> szerep minden felhasználónak.`,
              all_roles: `Sikeresen hozzáadva a <@&${role.id}> szerep minden tagnak, akinek szerepe <@&${all_that_a_role?.id}> van.`
            },
            nl: {
              all_members: `Rol <@&${role.id}> succesvol toegevoegd aan alle leden.`,
              all_bots: `Rol <@&${role.id}> succesvol toegevoegd aan alle bots.`,
              all_users: `Rol <@&${role.id}> succesvol toegevoegd aan alle gebruikers.`,
              all_roles: `Rol <@&${role.id}> succesvol toegevoegd aan alle leden met de rol <@&${all_that_a_role?.id}>.`
            },
            no: {
              all_members: `Rolle <@&${role.id}> ble vellykket lagt til alle medlemmer.`,
              all_bots: `Rolle <@&${role.id}> ble vellykket lagt til alle bots.`,
              all_users: `Rolle <@&${role.id}> ble vellykket lagt til alle brukere.`,
              all_roles: `Rolle <@&${role.id}> ble vellykket lagt til alle medlemmer med rolle <@&${all_that_a_role?.id}>.`
            },
            pl: {
              all_members: `Pomyślnie dodano rolę <@&${role.id}> do wszystkich członków.`,
              all_bots: `Pomyślnie dodano rolę <@&${role.id}> do wszystkich botów.`,
              all_users: `Pomyślnie dodano rolę <@&${role.id}> do wszystkich użytkowników.`,
              all_roles: `Pomyślnie dodano rolę <@&${role.id}> do wszystkich członków z rolą <@&${all_that_a_role?.id}>.`
            },
            'pt-BR': {
              all_members: `Sucesso ao adicionar o cargo <@&${role.id}> a todos os membros.`,
              all_bots: `Sucesso ao adicionar o cargo <@&${role.id}> a todos os bots.`,
              all_users: `Sucesso ao adicionar o cargo <@&${role.id}> a todos os usuários.`,
              all_roles: `Sucesso ao adicionar o cargo <@&${role.id}> a todos os membros com o cargo <@&${all_that_a_role?.id}>.`
            },
            ro: {
              all_members: `Rolul <@&${role.id}> a fost adăugat cu succes tuturor membrilor.`,
              all_bots: `Rolul <@&${role.id}> a fost adăugat cu succes tuturor bot-urilor.`,
              all_users: `Rolul <@&${role.id}> a fost adăugat cu succes tuturor utilizatorilor.`,
              all_roles: `Rolul <@&${role.id}> a fost adăugat cu succes tuturor membrilor cu rolul <@&${all_that_a_role?.id}>.`
            },
            fi: {
              all_members: `Rooli <@&${role.id}> lisättiin onnistuneesti kaikille jäsenille.`,
              all_bots: `Rooli <@&${role.id}> lisättiin onnistuneesti kaikille boteille.`,
              all_users: `Rooli <@&${role.id}> lisättiin onnistuneesti kaikille käyttäjille.`,
              all_roles: `Rooli <@&${role.id}> lisättiin onnistuneesti kaikille jäsenille, joilla on rooli <@&${all_that_a_role?.id}>.`
            },
            'sv-SE': {
              all_members: `Rollen <@&${role.id}> lades framgångsrikt till alla medlemmar.`,
              all_bots: `Rollen <@&${role.id}> lades framgångsrikt till alla bots.`,
              all_users: `Rollen <@&${role.id}> lades framgångsrikt till alla användare.`,
              all_roles: `Rollen <@&${role.id}> lades framgångsrikt till alla medlemmar med rollen <@&${all_that_a_role?.id}>.`
            },
            vi: {
              all_members: `Thêm vai trò <@&${role.id}> thành công cho tất cả các thành viên.`,
              all_bots: `Thêm vai trò <@&${role.id}> thành công cho tất cả các bot.`,
              all_users: `Thêm vai trò <@&${role.id}> thành công cho tất cả các người dùng.`,
              all_roles: `Thêm vai trò <@&${role.id}> thành công cho tất cả các thành viên có vai trò <@&${all_that_a_role?.id}>.`
            },
            tr: {
              all_members: `Rol <@&${role.id}> tüm üyelere başarıyla eklendi.`,
              all_bots: `Rol <@&${role.id}> tüm botlara başarıyla eklendi.`,
              all_users: `Rol <@&${role.id}> tüm kullanıcılara başarıyla eklendi.`,
              all_roles: `Rol <@&${role.id}> tüm üyelere başarıyla eklendi, rolü <@&${all_that_a_role?.id}> olanlarla.`
            },
            cs: {
              all_members: `Role <@&${role.id}> bylo úspěšně přidáno všem členům.`,
              all_bots: `Role <@&${role.id}> bylo úspěšně přidáno všem botům.`,
              all_users: `Role <@&${role.id}> bylo úspěšně přidáno všem uživatelům.`,
              all_roles: `Role <@&${role.id}> bylo úspěšně přidáno všem členům s rolí <@&${all_that_a_role?.id}>.`
            },
            el: {
              all_members: `Ο ρόλος <@&${role.id}> προστέθηκε με επιτυχία σε όλα τα μέλη.`,
              all_bots: `Ο ρόλος <@&${role.id}> προστέθηκε με επιτυχία σε όλα τα bots.`,
              all_users: `Ο ρόλος <@&${role.id}> προστέθηκε με επιτυχία σε όλους τους χρήστες.`,
              all_roles: `Ο ρόλος <@&${role.id}> προστέθηκε με επιτυχία σε όλα τα μέλη με το ρόλο <@&${all_that_a_role?.id}>.`
            },
            bg: {
              all_members: `Ролята <@&${role.id}> беше успешно добавена към всички членове.`,
              all_bots: `Ролята <@&${role.id}> беше успешно добавена към всички ботове.`,
              all_users: `Ролята <@&${role.id}> беше успешно добавена към всички потребители.`,
              all_roles: `Ролята <@&${role.id}> беше успешно добавена към всички членове с ролята <@&${all_that_a_role?.id}>.`
            },
            ru: {
              all_members: `Роль <@&${role.id}> успешно добавлена всем участникам.`,
              all_bots: `Роль <@&${role.id}> успешно добавлена всем ботам.`,
              all_users: `Роль <@&${role.id}> успешно добавлена всем пользователям.`,
              all_roles: `Роль <@&${role.id}> успешно добавлена всем участникам с ролью <@&${all_that_a_role?.id}>.`
            },
            uk: {
              all_members: `Роль <@&${role.id}> успішно додано всім учасникам.`,
              all_bots: `Роль <@&${role.id}> успішно додано всім ботам.`,
              all_users: `Роль <@&${role.id}> успішно додано всім користувачам.`,
              all_roles: `Роль <@&${role.id}> успішно додано всім учасникам з роллю <@&${all_that_a_role?.id}>.`
            },
            hi: {
              all_members: `रोल <@&${role.id}> को सभी सदस्यों में सफलतापूर्वक जोड़ा गया।`,
              all_bots: `रोल <@&${role.id}> को सभी बॉट्स में सफलतापूर्वक जोड़ा गया।`,
              all_users: `रोल <@&${role.id}> को सभी उपयोगकर्ताओं में सफलतापूर्वक जोड़ा गया।`,
              all_roles: `रोल <@&${role.id}> को सभी सदस्यों में सफलतापूर्वक जोड़ा गया जिनके पास रोल <@&${all_that_a_role?.id}> है।`
            },
            'zh-CN': {
              all_members: `成功将角色 <@&${role.id}> 添加到所有成员。`,
              all_bots: `成功将角色 <@&${role.id}> 添加到所有机器人。`,
              all_users: `成功将角色 <@&${role.id}> 添加到所有用户。`,
              all_roles: `成功将角色 <@&${role.id}> 添加到所有具有角色 <@&${all_that_a_role?.id}> 的成员。`
            },
            ja: {
              all_members: `役職<@&${role.id}>を全メンバーに正常に追加しました。`,
              all_bots: `役職<@&${role.id}>を全ボットに正常に追加しました。`,
              all_users: `役職<@&${role.id}>を全ユーザーに正常に追加しました。`,
              all_roles: `役職<@&${role.id}>を役職<@&${all_that_a_role?.id}>のある全メンバーに正常に追加しました。`
            },
            'zh-TW': {
              all_members: `成功將角色 <@&${role.id}> 添加到所有成員。`,
              all_bots: `成功將角色 <@&${role.id}> 添加到所有機器人。`,
              all_users: `成功將角色 <@&${role.id}> 添加到所有用戶。`,
              all_roles: `成功將角色 <@&${role.id}> 添加到所有擁有角色 <@&${all_that_a_role?.id}> 的成員。`
            },
            ko: {
              all_members: `역할 <@&${role.id}>을 모든 멤버에게 성공적으로 추가했습니다.`,
              all_bots: `역할 <@&${role.id}>을 모든 봇에게 성공적으로 추가했습니다.`,
              all_users: `역할 <@&${role.id}>을 모든 사용자에게 성공적으로 추가했습니다.`,
              all_roles: `역할 <@&${role.id}>을 역할 <@&${all_that_a_role?.id}>이 있는 모든 멤버에게 성공적으로 추가했습니다.`
            }
          };
          const role_add_error: Record<Locale, {'all_members': string, 'all_bots': string, 'all_users': string, 'all_roles': string}> = {
            th: {
              all_members: 'ไม่สามารถเพิ่มบทบาทให้กับสมาชิกทั้งหมดได้เนื่องจากเกิดข้อผิดพลาด',
              all_bots: 'ไม่สามารถเพิ่มบทบาทให้กับบอททั้งหมดได้เนื่องจากเกิดข้อผิดพลาด',
              all_users: 'ไม่สามารถเพิ่มบทบาทให้กับผู้ใช้ทั้งหมดได้เนื่องจากเกิดข้อผิดพลาด',
              all_roles: `ไม่สามารถเพิ่มบทบาทให้กับสมาชิกทั้งหมดที่มีบทบาท <@&${all_that_a_role?.id}> ได้เนื่องจากเกิดข้อผิดพลาด`
            },
            id: {
              all_members: 'Tidak dapat menambahkan peran ke semua anggota karena beberapa kesalahan',
              all_bots: 'Tidak dapat menambahkan peran ke semua bot karena beberapa kesalahan',
              all_users: 'Tidak dapat menambahkan peran ke semua pengguna karena beberapa kesalahan',
              all_roles: `Tidak dapat menambahkan peran ke semua anggota dengan peran <@&${all_that_a_role?.id}> karena beberapa kesalahan`
            },
            da: {
              all_members: 'Kunne ikke tilføje roller til alle medlemmer på grund af nogle fejl',
              all_bots: 'Kunne ikke tilføje roller til alle bots på grund af nogle fejl',
              all_users: 'Kunne ikke tilføje roller til alle brugere på grund af nogle fejl',
              all_roles: `Kunne ikke tilføje roller til alle medlemmer med rollen <@&${all_that_a_role?.id}> på grund af nogle fejl`
            },
            de: {
              all_members: 'Rollen konnten aufgrund von Fehlern nicht allen Mitgliedern hinzugefügt werden',
              all_bots: 'Rollen konnten aufgrund von Fehlern nicht allen Bots hinzugefügt werden',
              all_users: 'Rollen konnten aufgrund von Fehlern nicht allen Benutzern hinzugefügt werden',
              all_roles: `Rollen konnten aufgrund von Fehlern nicht allen Mitgliedern mit der Rolle <@&${all_that_a_role?.id}> hinzugefügt werden`
            },
            'en-GB': {
              all_members: 'Could not add roles to all members due to some errors',
              all_bots: 'Could not add roles to all bots due to some errors',
              all_users: 'Could not add roles to all users due to some errors',
              all_roles: `Could not add roles to all members with role <@&${all_that_a_role?.id}> due to some errors`
            },
            'en-US': {
              all_members: 'Could not add roles to all members due to some errors',
              all_bots: 'Could not add roles to all bots due to some errors',
              all_users: 'Could not add roles to all users due to some errors',
              all_roles: `Could not add roles to all members with role <@&${all_that_a_role?.id}> due to some errors`
            },
            'es-ES': {
              all_members: 'No se pudieron agregar roles a todos los miembros debido a algunos errores',
              all_bots: 'No se pudieron agregar roles a todos los bots debido a algunos errores',
              all_users: 'No se pudieron agregar roles a todos los usuarios debido a algunos errores',
              all_roles: `No se pudieron agregar roles a todos los miembros con el rol <@&${all_that_a_role?.id}> debido a algunos errores`
            },
            'es-419': {
              all_members: 'No se pudieron agregar roles a todos los miembros debido a algunos errores',
              all_bots: 'No se pudieron agregar roles a todos los bots debido a algunos errores',
              all_users: 'No se pudieron agregar roles a todos los usuarios debido a algunos errores',
              all_roles: `No se pudieron agregar roles a todos los miembros con el rol <@&${all_that_a_role?.id}> debido a algunos errores`
            },
            fr: {
              all_members: 'Impossible d\'ajouter des rôles à tous les membres en raison de certaines erreurs',
              all_bots: 'Impossible d\'ajouter des rôles à tous les bots en raison de certaines erreurs',
              all_users: 'Impossible d\'ajouter des rôles à tous les utilisateurs en raison de certaines erreurs',
              all_roles: `Impossible d\'ajouter des rôles à tous les membres avec le rôle <@&${all_that_a_role?.id}> en raison de certaines erreurs`
            },
            hr: {
              all_members: 'Nije moguće dodati uloge svim članovima zbog nekih pogrešaka',
              all_bots: 'Nije moguće dodati uloge svim botovima zbog nekih pogrešaka',
              all_users: 'Nije moguće dodati uloge svim korisnicima zbog nekih pogrešaka',
              all_roles: `Nije moguće dodati uloge svim članovima s ulogom <@&${all_that_a_role?.id}> zbog nekih pogrešaka`
            },
            it: {
              all_members: 'Impossibile aggiungere ruoli a tutti i membri a causa di alcuni errori',
              all_bots: 'Impossibile aggiungere ruoli a tutti i bot a causa di alcuni errori',
              all_users: 'Impossibile aggiungere ruoli a tutti gli utenti a causa di alcuni errori',
              all_roles: `Impossibile aggiungere ruoli a tutti i membri con il ruolo <@&${all_that_a_role?.id}> a causa di alcuni errori`
            },
            lt: {
              all_members: 'Nepavyko pridėti vaidmenų visiems nariams dėl tam tikrų klaidų',
              all_bots: 'Nepavyko pridėti vaidmenų visiems botams dėl tam tikrų klaidų',
              all_users: 'Nepavyko pridėti vaidmenų visiems vartotojams dėl tam tikrų klaidų',
              all_roles: `Nepavyko pridėti vaidmenų visiems nariams su vaidmeniu <@&${all_that_a_role?.id}> dėl tam tikrų klaidų`
            },
            hu: {
              all_members: 'Nem sikerült szerepeket hozzáadni minden tagnak néhány hiba miatt',
              all_bots: 'Nem sikerült szerepeket hozzáadni minden botnak néhány hiba miatt',
              all_users: 'Nem sikerült szerepeket hozzáadni minden felhasználónak néhány hiba miatt',
              all_roles: `Nem sikerült szerepeket hozzáadni minden tagnak, akinek szerepe van <@&${all_that_a_role?.id}> néhány hiba miatt`
            },
            nl: {
              all_members: 'Kon geen rollen toevoegen aan alle leden vanwege enkele fouten',
              all_bots: 'Kon geen rollen toevoegen aan alle bots vanwege enkele fouten',
              all_users: 'Kon geen rollen toevoegen aan alle gebruikers vanwege enkele fouten',
              all_roles: `Kon geen rollen toevoegen aan alle leden met de rol <@&${all_that_a_role?.id}> vanwege enkele fouten`
            },
            no: {
              all_members: 'Kunne ikke legge til roller til alle medlemmer på grunn av noen feil',
              all_bots: 'Kunne ikke legge til roller til alle bots på grunn av noen feil',
              all_users: 'Kunne ikke legge til roller til alle brukere på grunn av noen feil',
              all_roles: `Kunne ikke legge til roller til alle medlemmer med rollen <@&${all_that_a_role?.id}> på grunn av noen feil`
            },
            pl: {
              all_members: 'Nie udało się dodać ról do wszystkich członków z powodu niektórych błędów',
              all_bots: 'Nie udało się dodać ról do wszystkich botów z powodu niektórych błędów',
              all_users: 'Nie udało się dodać ról do wszystkich użytkowników z powodu niektórych błędów',
              all_roles: `Nie udało się dodać ról do wszystkich członków z rolą <@&${all_that_a_role?.id}> z powodu niektórych błędów`
            },
            'pt-BR': {
              all_members: 'Não foi possível adicionar funções a todos os membros devido a alguns erros',
              all_bots: 'Não foi possível adicionar funções a todos os bots devido a alguns erros',
              all_users: 'Não foi possível adicionar funções a todos os usuários devido a alguns erros',
              all_roles: `Não foi possível adicionar funções a todos os membros com a função <@&${all_that_a_role?.id}> devido a alguns erros`
            },
            ro: {
              all_members: 'Nu s-au putut adăuga roluri tuturor membrilor din cauza unor erori',
              all_bots: 'Nu s-au putut adăuga roluri tuturor boturilor din cauza unor erori',
              all_users: 'Nu s-au putut adăuga roluri tuturor utilizatorilor din cauza unor erori',
              all_roles: `Nu s-au putut adăuga roluri tuturor membrilor cu rolul <@&${all_that_a_role?.id}> din cauza unor erori`
            },
            fi: {
              all_members: 'Roolien lisääminen kaikille jäsenille epäonnistui joidenkin virheiden takia',
              all_bots: 'Roolien lisääminen kaikille boteille epäonnistui joidenkin virheiden takia',
              all_users: 'Roolien lisääminen kaikille käyttäjille epäonnistui joidenkin virheiden takia',
              all_roles: `Roolien lisääminen kaikille jäsenille, joilla on rooli <@&${all_that_a_role?.id}> epäonnistui joidenkin virheiden takia`
            },
            'sv-SE': {
              all_members: 'Kunde inte lägga till roller till alla medlemmar på grund av vissa fel',
              all_bots: 'Kunde inte lägga till roller till alla bots på grund av vissa fel',
              all_users: 'Kunde inte lägga till roller till alla användare på grund av vissa fel',
              all_roles: `Kunde inte lägga till roller till alla medlemmar med rollen <@&${all_that_a_role?.id}> på grund av vissa fel`
            },
            vi: {
              all_members: 'Không thể thêm vai trò cho tất cả các thành viên do một số lỗi',
              all_bots: 'Không thể thêm vai trò cho tất cả các bot do một số lỗi',
              all_users: 'Không thể thêm vai trò cho tất cả các người dùng do một số lỗi',
              all_roles: `Không thể thêm vai trò cho tất cả các thành viên với vai trò <@&${all_that_a_role?.id}> do một số lỗi`
            },
            tr: {
              all_members: 'Bazı hatalar nedeniyle tüm üyelere roller eklenemedi',
              all_bots: 'Bazı hatalar nedeniyle tüm botlara roller eklenemedi',
              all_users: 'Bazı hatalar nedeniyle tüm kullanıcılara roller eklenemedi',
              all_roles: `Bazı hatalar nedeniyle <@&${all_that_a_role?.id}> rolüne sahip tüm üyelere roller eklenemedi`
            },
            cs: {
              all_members: 'Nepodařilo se přidat role všem členům kvůli některým chybám',
              all_bots: 'Nepodařilo se přidat role všem botům kvůli některým chybám',
              all_users: 'Nepodařilo se přidat role všem uživatelům kvůli některým chybám',
              all_roles: `Nepodařilo se přidat role všem členům s rolí <@&${all_that_a_role?.id}> kvůli některým chybám`
            },
            el: {
              all_members: 'Δεν ήταν δυνατό να προστεθούν ρόλοι σε όλα τα μέλη λόγω κάποιων σφαλμάτων',
              all_bots: 'Δεν ήταν δυνατό να προστεθούν ρόλοι σε όλους τους bots λόγω κάποιων σφαλμάτων',
              all_users: 'Δεν ήταν δυνατό να προστεθούν ρόλοι σε όλους τους χρήστες λόγω κάποιων σφαλμάτων',
              all_roles: `Δεν ήταν δυνατό να προστεθούν ρόλοι σε όλα τα μέλη με τον ρόλο <@&${all_that_a_role?.id}> λόγω κάποιων σφαλμάτων`
            },
            bg: {
              all_members: 'Не беше възможно да се добавят роли на всички членове поради някои грешки',
              all_bots: 'Не беше възможно да се добавят роли на всички ботове поради някои грешки',
              all_users: 'Не беше възможно да се добавят роли на всички потребители поради някои грешки',
              all_roles: `Не беше възможно да се добавят роли на всички членове с роля <@&${all_that_a_role?.id}> поради някои грешки`
            },
            ru: {
              all_members: 'Не удалось добавить роли всем участникам из-за некоторых ошибок',
              all_bots: 'Не удалось добавить роли всем ботам из-за некоторых ошибок',
              all_users: 'Не удалось добавить роли всем пользователям из-за некоторых ошибок',
              all_roles: `Не удалось добавить роли всем участникам с ролью <@&${all_that_a_role?.id}> из-за некоторых ошибок`
            },
            uk: {
              all_members: 'Не вдалося додати ролі всім учасникам через деякі помилки',
              all_bots: 'Не вдалося додати ролі всім ботам через деякі помилки',
              all_users: 'Не вдалося додати ролі всім користувачам через деякі помилки',
              all_roles: `Не вдалося додати ролі всім учасникам з роллю <@&${all_that_a_role?.id}> через деякі помилки`
            },
            hi: {
              all_members: 'कुछ त्रुटियों के कारण सभी सदस्यों को भूमिका नहीं जोड़ सका',
              all_bots: 'कुछ त्रुटियों के कारण सभी बॉट्स को भूमिका नहीं जोड़ सका',
              all_users: 'कुछ त्रुटियों के कारण सभी उपयोगकर्ताओं को भूमिका नहीं जोड़ सका',
              all_roles: `कुछ त्रुटियों के कारण <@&${all_that_a_role?.id}> भूमिका वाले सभी सदस्यों को भूमिका नहीं जोड़ सका`
            },
            'zh-CN': {
              all_members: '由于某些错误，无法将角色添加到所有成员',
              all_bots: '由于某些错误，无法将角色添加到所有机器人',
              all_users: '由于某些错误，无法将角色添加到所有用户',
              all_roles: `由于某些错误，无法将角色添加到具有角色<@&${all_that_a_role?.id}>的所有成员`
            },
            ja: {
              all_members: 'いくつかのエラーのため、すべてのメンバーに役割を追加できませんでした',
              all_bots: 'いくつかのエラーのため、すべてのボットに役割を追加できませんでした',
              all_users: 'いくつかのエラーのため、すべてのユーザーに役割を追加できませんでした',
              all_roles: `いくつかのエラーのため、役割<@&${all_that_a_role?.id}>を持つすべてのメンバーに役割を追加できませんでした`
            },
            'zh-TW': {
              all_members: '由於一些錯誤，無法將角色新增至所有成員',
              all_bots: '由於一些錯誤，無法將角色新增至所有機器人',
              all_users: '由於一些錯誤，無法將角色新增至所有用戶',
              all_roles: `由於一些錯誤，無法將角色新增至具有角色<@&${all_that_a_role?.id}>的所有成員`
            },
            ko: {
              all_members: '일부 오류로 인해 모든 구성원에게 역할을 추가할 수 없습니다',
              all_bots: '일부 오류로 인해 모든 봇에게 역할을 추가할 수 없습니다',
              all_users: '일부 오류로 인해 모든 사용자에게 역할을 추가할 수 없습니다',
              all_roles: `일부 오류로 인해 역할 <@&${all_that_a_role?.id}>를 가진 모든 구성원에게 역할을 추가할 수 없습니다`
            }
          };
          if(pick_type == 'all'){
            const allUser = (await interaction.guild.members.fetch()).filter((user)=>!user.roles.cache.has(role.id));
            const usersWithRole = (await Promise.all(
              allUser.map(async(user)=>{
                await user.roles.add(role);
                return user.roles.cache.has(role.id);
              })
            )).filter((hasRole) => hasRole === true).length;
            if((usersWithRole == allUser.size)){
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Add Role Successfully')
                .setDescription(role_add_success[interaction.guild?.preferredLocale || 'en-US'].all_members)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allUser.size} members` }
                )
                .setFooter(client.user && { text: client.user.tag, iconURL: client.user.displayAvatarURL() })
                .setColor('#85ff00')
              );
              return await interaction.editReply({ embeds: [embed] });
            }else{
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Add Role Error')
                .setDescription(role_add_error[interaction.guild?.preferredLocale || 'en-US'].all_members)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allUser.size} members` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#ff4c4c'))
              return await interaction.editReply({ embeds: [embed] });
            };
          }else
          if(pick_type == 'humans'){
            const allHumans = (await interaction.guild.members.fetch()).filter((user)=>!user.user.bot && !user.roles.cache.has(role.id));
            const usersWithRole = (await Promise.all(
              allHumans.map(async(user)=>{
                await user.roles.add(role);
                return user.roles.cache.has(role.id);
              })
            )).filter((hasRole) => hasRole === true).length;
            if((usersWithRole == allHumans.size)){
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Add Role Successfully')
                .setDescription(role_add_success[interaction.guild?.preferredLocale || 'en-US'].all_users)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allHumans.size} users` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#85ff00')
              );
              return await interaction.editReply({ embeds: [embed] });
            }else{
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Add Role Error')
                .setDescription(role_add_error[interaction.guild?.preferredLocale || 'en-US'].all_users)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allHumans.size} users` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#ff4c4c'))
              return await interaction.editReply({ embeds: [embed] });
            };
          }else
          if(pick_type == 'bots'){
            const allBots = (await interaction.guild.members.fetch()).filter((user)=>user.user.bot && !user.roles.cache.has(role.id));
            const usersWithRole = (await Promise.all(
              allBots.map(async(user)=>{
                await user.roles.add(role);
                return user.roles.cache.has(role.id);
              })
            )).filter((hasRole) => hasRole === true).length;
            if((usersWithRole == allBots.size)){
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Add Role Successfully')
                .setDescription(role_add_success[interaction.guild?.preferredLocale || 'en-US'].all_bots)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allBots.size} bots` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#85ff00')
              );
              return await interaction.editReply({ embeds: [embed] });
            }else{
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Add Role Error')
                .setDescription(role_add_error[interaction.guild?.preferredLocale || 'en-US'].all_bots)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allBots.size} bots` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#ff4c4c'))
              return await interaction.editReply({ embeds: [embed] });
            };
          }else
          if(pick_type == 'all_that_a_role' && all_that_a_role){
            const allThatARole = (await interaction.guild.members.fetch()).filter((user)=>user.roles.cache.has(all_that_a_role.id) && !user.roles.cache.has(role.id));
            const usersWithRole = (await Promise.all(
              allThatARole.map(async(user)=>{
                await user.roles.add(role);
                return user.roles.cache.has(role.id);
              })
            )).filter((hasRole) => hasRole === true).length;
            if((usersWithRole == allThatARole.size)){
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Add Role Successfully')
                .setDescription(role_add_success[interaction.guild?.preferredLocale || 'en-US'].all_roles)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allThatARole.size} members` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#85ff00')
              );
              return await interaction.editReply({ embeds: [embed] });
            }else{
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Add Role Error')
                .setDescription(role_add_error[interaction.guild?.preferredLocale || 'en-US'].all_roles)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allThatARole.size} members` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#ff4c4c'))
              return await interaction.editReply({ embeds: [embed] });
            };
          };
        }else if(add_or_remove == 'remove'){
          const role_remove_success: Record<Locale, {'all_members': string, 'all_bots': string, 'all_users': string, 'all_roles': string}> = {
            th: {
              all_members: `สำเร็จในการลบบทบาท <@&${role.id}> จากสมาชิกทั้งหมด.`,
              all_bots: `สำเร็จในการลบบทบาท <@&${role.id}> จากบอททั้งหมด.`,
              all_users: `สำเร็จในการลบบทบาท <@&${role.id}> จากผู้ใช้ทั้งหมด.`,
              all_roles: `สำเร็จในการลบบทบาท <@&${role.id}> จากสมาชิกทั้งหมดที่มีบทบาท <@&${all_that_a_role?.id}>.`
            },
            id: {
              all_members: `Berhasil menghapus peran <@&${role.id}> dari semua anggota.`,
              all_bots: `Berhasil menghapus peran <@&${role.id}> dari semua bot.`,
              all_users: `Berhasil menghapus peran <@&${role.id}> dari semua pengguna.`,
              all_roles: `Berhasil menghapus peran <@&${role.id}> dari semua anggota dengan peran <@&${all_that_a_role?.id}>.`
            },
            da: {
              all_members: `Succesfult fjernet rollen <@&${role.id}> fra alle medlemmer.`,
              all_bots: `Succesfult fjernet rollen <@&${role.id}> fra alle bots.`,
              all_users: `Succesfult fjernet rollen <@&${role.id}> fra alle brugere.`,
              all_roles: `Succesfult fjernet rollen <@&${role.id}> fra alle medlemmer med rollen <@&${all_that_a_role?.id}>.`
            },
            de: {
              all_members: `Erfolgreich Rolle <@&${role.id}> von allen Mitgliedern entfernt.`,
              all_bots: `Erfolgreich Rolle <@&${role.id}> von allen Bots entfernt.`,
              all_users: `Erfolgreich Rolle <@&${role.id}> von allen Benutzern entfernt.`,
              all_roles: `Erfolgreich Rolle <@&${role.id}> von allen Mitgliedern mit Rolle <@&${all_that_a_role?.id}> entfernt.`
            },
            'en-GB': {
              all_members: `Successfully removed role <@&${role.id}> from all members.`,
              all_bots: `Successfully removed role <@&${role.id}> from all bots.`,
              all_users: `Successfully removed role <@&${role.id}> from all users.`,
              all_roles: `Successfully removed role <@&${role.id}> from all members with role <@&${all_that_a_role?.id}>.`
            },
            'en-US': {
              all_members: `Successfully removed role <@&${role.id}> from all members.`,
              all_bots: `Successfully removed role <@&${role.id}> from all bots.`,
              all_users: `Successfully removed role <@&${role.id}> from all users.`,
              all_roles: `Successfully removed role <@&${role.id}> from all members with role <@&${all_that_a_role?.id}>.`
            },
            'es-ES': {
              all_members: `Se eliminó con éxito el rol <@&${role.id}> de todos los miembros.`,
              all_bots: `Se eliminó con éxito el rol <@&${role.id}> de todos los bots.`,
              all_users: `Se eliminó con éxito el rol <@&${role.id}> de todos los usuarios.`,
              all_roles: `Se eliminó con éxito el rol <@&${role.id}> de todos los miembros con el rol <@&${all_that_a_role?.id}>.`
            },
            'es-419': {
              all_members: `Se eliminó con éxito el rol <@&${role.id}> de todos los miembros.`,
              all_bots: `Se eliminó con éxito el rol <@&${role.id}> de todos los bots.`,
              all_users: `Se eliminó con éxito el rol <@&${role.id}> de todos los usuarios.`,
              all_roles: `Se eliminó con éxito el rol <@&${role.id}> de todos los miembros con el rol <@&${all_that_a_role?.id}>.`
            },
            fr: {
              all_members: `Rôle <@&${role.id}> supprimé avec succès de tous les membres.`,
              all_bots: `Rôle <@&${role.id}> supprimé avec succès de tous les bots.`,
              all_users: `Rôle <@&${role.id}> supprimé avec succès de tous les utilisateurs.`,
              all_roles: `Rôle <@&${role.id}> supprimé avec succès de tous les membres avec le rôle <@&${all_that_a_role?.id}>.`
            },
            hr: {
              all_members: `Uspješno uklonjen role <@&${role.id}> svim članovima.`,
              all_bots: `Uspješno uklonjen role <@&${role.id}> svim botovima.`,
              all_users: `Uspješno uklonjen role <@&${role.id}> svim korisnicima.`,
              all_roles: `Uspješno uklonjen role <@&${role.id}> svim članovima s rolom <@&${all_that_a_role?.id}>.`
            },
            it: {
              all_members: `Ruolo <@&${role.id}> rimosso con successo da tutti i membri.`,
              all_bots: `Ruolo <@&${role.id}> rimosso con successo da tutti i bot.`,
              all_users: `Ruolo <@&${role.id}> rimosso con successo da tutti gli utenti.`,
              all_roles: `Ruolo <@&${role.id}> rimosso con successo da tutti i membri con il ruolo <@&${all_that_a_role?.id}>.`
            },
            lt: {
              all_members: `Sėkmingai pašalinta rolė <@&${role.id}> iš visų narių.`,
              all_bots: `Sėkmingai pašalinta rolė <@&${role.id}> iš visų botų.`,
              all_users: `Sėkmingai pašalinta rolė <@&${role.id}> iš visų vartotojų.`,
              all_roles: `Sėkmingai pašalinta rolė <@&${role.id}> iš visų narių su role <@&${all_that_a_role?.id}>.`
            },
            hu: {
              all_members: `Sikeresen eltávolítva a <@&${role.id}> szerep minden tagnak.`,
              all_bots: `Sikeresen eltávolítva a <@&${role.id}> szerep minden botnak.`,
              all_users: `Sikeresen eltávolítva a <@&${role.id}> szerep minden felhasználónak.`,
              all_roles: `Sikeresen eltávolítva a <@&${role.id}> szerep minden tagnak, akinek szerepe <@&${all_that_a_role?.id}> van.`
            },
            nl: {
              all_members: `Rol <@&${role.id}> succesvol verwijderd bij alle leden.`,
              all_bots: `Rol <@&${role.id}> succesvol verwijderd bij alle bots.`,
              all_users: `Rol <@&${role.id}> succesvol verwijderd bij alle gebruikers.`,
              all_roles: `Rol <@&${role.id}> succesvol verwijderd bij alle leden met de rol <@&${all_that_a_role?.id}>.`
            },
            no: {
              all_members: `Rolle <@&${role.id}> ble vellykket fjernet fra alle medlemmer.`,
              all_bots: `Rolle <@&${role.id}> ble vellykket fjernet fra alle bots.`,
              all_users: `Rolle <@&${role.id}> ble vellykket fjernet fra alle brukere.`,
              all_roles: `Rolle <@&${role.id}> ble vellykket fjernet fra alle medlemmer med rolle <@&${all_that_a_role?.id}>.`
            },
            pl: {
              all_members: `Pomyślnie usunięto rolę <@&${role.id}> ze wszystkich członków.`,
              all_bots: `Pomyślnie usunięto rolę <@&${role.id}> ze wszystkich botów.`,
              all_users: `Pomyślnie usunięto rolę <@&${role.id}> ze wszystkich użytkowników.`,
              all_roles: `Pomyślnie usunięto rolę <@&${role.id}> ze wszystkich członków z rolą <@&${all_that_a_role?.id}>.`
            },
            'pt-BR': {
              all_members: `Sucesso ao remover o cargo <@&${role.id}> de todos os membros.`,
              all_bots: `Sucesso ao remover o cargo <@&${role.id}> de todos os bots.`,
              all_users: `Sucesso ao remover o cargo <@&${role.id}> de todos os usuários.`,
              all_roles: `Sucesso ao remover o cargo <@&${role.id}> de todos os membros com o cargo <@&${all_that_a_role?.id}>.`
            },
            ro: {
              all_members: `Rolul <@&${role.id}> a fost eliminat cu succes de la toți membrii.`,
              all_bots: `Rolul <@&${role.id}> a fost eliminat cu succes de la toți botii.`,
              all_users: `Rolul <@&${role.id}> a fost eliminat cu succes de la toți utilizatorii.`,
              all_roles: `Rolul <@&${role.id}> a fost eliminat cu succes de la toți membrii cu rolul <@&${all_that_a_role?.id}>.`
            },
            fi: {
              all_members: `Rooli <@&${role.id}> poistettiin onnistuneesti kaikilta jäseniltä.`,
              all_bots: `Rooli <@&${role.id}> poistettiin onnistuneesti kaikilta boteilta.`,
              all_users: `Rooli <@&${role.id}> poistettiin onnistuneesti kaikilta käyttäjiltä.`,
              all_roles: `Rooli <@&${role.id}> poistettiin onnistuneesti kaikilta jäseniltä, joilla oli rooli <@&${all_that_a_role?.id}>.`
            },
            'sv-SE': {
              all_members: `Rollen <@&${role.id}> togs bort framgångsrikt från alla medlemmar.`,
              all_bots: `Rollen <@&${role.id}> togs bort framgångsrikt från alla bots.`,
              all_users: `Rollen <@&${role.id}> togs bort framgångsrikt från alla användare.`,
              all_roles: `Rollen <@&${role.id}> togs bort framgångsrikt från alla medlemmar med rollen <@&${all_that_a_role?.id}>.`
            },
            vi: {
              all_members: `Đã xóa thành công vai trò <@&${role.id}> từ tất cả thành viên.`,
              all_bots: `Đã xóa thành công vai trò <@&${role.id}> từ tất cả bot.`,
              all_users: `Đã xóa thành công vai trò <@&${role.id}> từ tất cả người dùng.`,
              all_roles: `Đã xóa thành công vai trò <@&${role.id}> từ tất cả thành viên có vai trò <@&${all_that_a_role?.id}>.`
            },
            tr: {
              all_members: `<@&${role.id}> rolü başarıyla tüm üyelerden silindi.`,
              all_bots: `<@&${role.id}> rolü başarıyla tüm botlardan silindi.`,
              all_users: `<@&${role.id}> rolü başarıyla tüm kullanıcılardan silindi.`,
              all_roles: `<@&${role.id}> rolü başarıyla, <@&${all_that_a_role?.id}> rolüne sahip tüm üyelere silindi.`
            },
            cs: {
              all_members: `Roli <@&${role.id}> byla úspěšně odstraněna ze všech členů.`,
              all_bots: `Roli <@&${role.id}> byla úspěšně odstraněna ze všech botů.`,
              all_users: `Roli <@&${role.id}> byla úspěšně odstraněna ze všech uživatelů.`,
              all_roles: `Roli <@&${role.id}> byla úspěšně odstraněna ze všech členů s rolí <@&${all_that_a_role?.id}>.`
            },
            el: {
              all_members: `Η ρόλος <@&${role.id}> αφαιρέθηκε επιτυχώς από όλα τα μέλη.`,
              all_bots: `Η ρόλος <@&${role.id}> αφαιρέθηκε επιτυχώς από όλα τα bots.`,
              all_users: `Η ρόλος <@&${role.id}> αφαιρέθηκε επιτυχώς από όλους τους χρήστες.`,
              all_roles: `Η ρόλος <@&${role.id}> αφαιρέθηκε επιτυχώς από όλα τα μέλη με τον ρόλο <@&${all_that_a_role?.id}>.`
            },
            bg: {
              all_members: `Ролята <@&${role.id}> беше успешно премахната от всички членове.`,
              all_bots: `Ролята <@&${role.id}> беше успешно премахната от всички ботове.`,
              all_users: `Ролята <@&${role.id}> беше успешно премахната от всички потребители.`,
              all_roles: `Ролята <@&${role.id}> беше успешно премахната от всички членове с роля <@&${all_that_a_role?.id}>.`
            },
            ru: {
              all_members: `Роль <@&${role.id}> была успешно удалена у всех участников.`,
              all_bots: `Роль <@&${role.id}> была успешно удалена у всех ботов.`,
              all_users: `Роль <@&${role.id}> была успешно удалена у всех пользователей.`,
              all_roles: `Роль <@&${role.id}> была успешно удалена у всех участников с ролью <@&${all_that_a_role?.id}>.`
            },
            uk: {
              all_members: `Роль <@&${role.id}> була успішно видалена у всіх учасників.`,
              all_bots: `Роль <@&${role.id}> була успішно видалена у всіх ботів.`,
              all_users: `Роль <@&${role.id}> була успішно видалена у всіх користувачів.`,
              all_roles: `Роль <@&${role.id}> була успішно видалена у всіх учасників з роллю <@&${all_that_a_role?.id}>.`
            },
            hi: {
              all_members: `रोल <@&${role.id}> को सभी सदस्यों से सफलतापूर्वक हटा दिया गया।`,
              all_bots: `रोल <@&${role.id}> को सभी बोट्स से सफलतापूर्वक हटा दिया गया।`,
              all_users: `रोल <@&${role.id}> को सभी उपयोगकर्ताओं से सफलतापूर्वक हटा दिया गया।`,
              all_roles: `रोल <@&${role.id}> को सभी उपयोगकर्ताओं से सफलतापूर्वक हटा दिया गया जिनके पास <@&${all_that_a_role?.id}> रोल था।`
            },
            'zh-CN': {
              all_members: `已成功从所有成员中移除角色 <@&${role.id}>.`,
              all_bots: `已成功从所有机器人中移除角色 <@&${role.id}>.`,
              all_users: `已成功从所有用户中移除角色 <@&${role.id}>.`,
              all_roles: `已成功从所有具有角色 <@&${all_that_a_role?.id}> 的成员中移除角色 <@&${role.id}>.`
            },
            ja: {
              all_members: `ロール <@&${role.id}> はすべてのメンバーから正常に削除されました。`,
              all_bots: `ロール <@&${role.id}> はすべてのボットから正常に削除されました。`,
              all_users: `ロール <@&${role.id}> はすべてのユーザーから正常に削除されました。`,
              all_roles: `ロール <@&${role.id}> はロール <@&${all_that_a_role?.id}> を持つすべてのメンバーから正常に削除されました。`
            },
            'zh-TW': {
              all_members: `已成功從所有成員中移除角色 <@&${role.id}>.`,
              all_bots: `已成功從所有機器人中移除角色 <@&${role.id}>.`,
              all_users: `已成功從所有用戶中移除角色 <@&${role.id}>.`,
              all_roles: `已成功從所有具有角色 <@&${all_that_a_role?.id}> 的成員中移除角色 <@&${role.id}>.`
            },
            ko: {
              all_members: `역할 <@&${role.id}>을 모든 멤버에서 성공적으로 제거했습니다.`,
              all_bots: `역할 <@&${role.id}>을 모든 봇에서 성공적으로 제거했습니다.`,
              all_users: `역할 <@&${role.id}>을 모든 사용자에서 성공적으로 제거했습니다.`,
              all_roles: `역할 <@&${role.id}>을 역할 <@&${all_that_a_role?.id}>을 가진 모든 멤버에서 성공적으로 제거했습니다.`
            }
          };
          const role_remove_error: Record<Locale, {'all_members': string, 'all_bots': string, 'all_users': string, 'all_roles': string}> = {
            th: {
              all_members: 'ไม่สามารถลบบทบาทให้กับสมาชิกทั้งหมดได้เนื่องจากเกิดข้อผิดพลาด',
              all_bots: 'ไม่สามารถลบบทบาทให้กับบอททั้งหมดได้เนื่องจากเกิดข้อผิดพลาด',
              all_users: 'ไม่สามารถลบบทบาทให้กับผู้ใช้ทั้งหมดได้เนื่องจากเกิดข้อผิดพลาด',
              all_roles: `ไม่สามารถลบบทบาทให้กับสมาชิกทั้งหมดที่มีบทบาท <@&${all_that_a_role?.id}> ได้เนื่องจากเกิดข้อผิดพลาด`
            },
            id: {
              all_members: 'Tidak dapat menghapus peran dari semua anggota karena beberapa kesalahan',
              all_bots: 'Tidak dapat menghapus peran dari semua bot karena beberapa kesalahan',
              all_users: 'Tidak dapat menghapus peran dari semua pengguna karena beberapa kesalahan',
              all_roles: `Tidak dapat menghapus peran dari semua anggota dengan peran <@&${all_that_a_role?.id}> karena beberapa kesalahan`
            },
            da: {
              all_members: 'Kunne ikke fjerne roller fra alle medlemmer på grund af nogle fejl',
              all_bots: 'Kunne ikke fjerne roller fra alle bots på grund af nogle fejl',
              all_users: 'Kunne ikke fjerne roller fra alle brugere på grund af nogle fejl',
              all_roles: `Kunne ikke fjerne roller fra alle medlemmer med rollen <@&${all_that_a_role?.id}> på grund af nogle fejl`
            },
            de: {
              all_members: 'Rollen konnten aufgrund von Fehlern nicht von allen Mitgliedern entfernt werden',
              all_bots: 'Rollen konnten aufgrund von Fehlern nicht von allen Bots entfernt werden',
              all_users: 'Rollen konnten aufgrund von Fehlern nicht von allen Benutzern entfernt werden',
              all_roles: `Rollen konnten aufgrund von Fehlern nicht von allen Mitgliedern mit der Rolle <@&${all_that_a_role?.id}> entfernt werden`
            },
            'en-GB': {
              all_members: 'Could not remove roles from all members due to some errors',
              all_bots: 'Could not remove roles from all bots due to some errors',
              all_users: 'Could not remove roles from all users due to some errors',
              all_roles: `Could not remove roles from all members with role <@&${all_that_a_role?.id}> due to some errors`
            },
            'en-US': {
              all_members: 'Could not remove roles from all members due to some errors',
              all_bots: 'Could not remove roles from all bots due to some errors',
              all_users: 'Could not remove roles from all users due to some errors',
              all_roles: `Could not remove roles from all members with role <@&${all_that_a_role?.id}> due to some errors`
            },
            'es-ES': {
              all_members: 'No se pudieron eliminar roles de todos los miembros debido a algunos errores',
              all_bots: 'No se pudieron eliminar roles de todos los bots debido a algunos errores',
              all_users: 'No se pudieron eliminar roles de todos los usuarios debido a algunos errores',
              all_roles: `No se pudieron eliminar roles de todos los miembros con el rol <@&${all_that_a_role?.id}> debido a algunos errores`
            },
            'es-419': {
              all_members: 'No se pudieron eliminar roles de todos los miembros debido a algunos errores',
              all_bots: 'No se pudieron eliminar roles de todos los bots debido a algunos errores',
              all_users: 'No se pudieron eliminar roles de todos los usuarios debido a algunos errores',
              all_roles: `No se pudieron eliminar roles de todos los miembros con el rol <@&${all_that_a_role?.id}> debido a algunos errores`
            },
            fr: {
              all_members: 'Impossible de supprimer des rôles de tous les membres en raison de certaines erreurs',
              all_bots: 'Impossible de supprimer des rôles de tous les bots en raison de certaines erreurs',
              all_users: 'Impossible de supprimer des rôles de tous les utilisateurs en raison de certaines erreurs',
              all_roles: `Impossible de supprimer des rôles de tous les membres avec le rôle <@&${all_that_a_role?.id}> en raison de certaines erreurs`
            },
            hr: {
              all_members: 'Nije moguće ukloniti uloge svim članovima zbog nekih pogrešaka',
              all_bots: 'Nije moguće ukloniti uloge svim botovima zbog nekih pogrešaka',
              all_users: 'Nije moguće ukloniti uloge svim korisnicima zbog nekih pogrešaka',
              all_roles: `Nije moguće ukloniti uloge svim članovima s ulogom <@&${all_that_a_role?.id}> zbog nekih pogrešaka`
            },
            it: {
              all_members: 'Impossibile rimuovere i ruoli da tutti i membri a causa di alcuni errori',
              all_bots: 'Impossibile rimuovere i ruoli da tutti i bot a causa di alcuni errori',
              all_users: 'Impossibile rimuovere i ruoli da tutti gli utenti a causa di alcuni errori',
              all_roles: `Impossibile rimuovere i ruoli da tutti i membri con il ruolo <@&${all_that_a_role?.id}> a causa di alcuni errori`
            },
            lt: {
              all_members: 'Nepavyko pašalinti vaidmenų visiems nariams dėl tam tikrų klaidų',
              all_bots: 'Nepavyko pašalinti vaidmenų visiems botams dėl tam tikrų klaidų',
              all_users: 'Nepavyko pašalinti vaidmenų visiems vartotojams dėl tam tikrų klaidų',
              all_roles: `Nepavyko pašalinti vaidmenų visiems nariams su vaidmeniu <@&${all_that_a_role?.id}> dėl tam tikrų klaidų`
            },
            hu: {
              all_members: 'Nem sikerült eltávolítani szerepeket minden tagnak néhány hiba miatt',
              all_bots: 'Nem sikerült eltávolítani szerepeket minden botnak néhány hiba miatt',
              all_users: 'Nem sikerült eltávolítani szerepeket minden felhasználónak néhány hiba miatt',
              all_roles: `Nem sikerült eltávolítani szerepeket minden tagnak, akinek szerepe van <@&${all_that_a_role?.id}> néhány hiba miatt`
            },
            nl: {
              all_members: 'Kon geen rollen verwijderen van alle leden vanwege enkele fouten',
              all_bots: 'Kon geen rollen verwijderen van alle bots vanwege enkele fouten',
              all_users: 'Kon geen rollen verwijderen van alle gebruikers vanwege enkele fouten',
              all_roles: `Kon geen rollen verwijderen van alle leden met de rol <@&${all_that_a_role?.id}> vanwege enkele fouten`
            },
            no: {
              all_members: 'Kunne ikke fjerne roller fra alle medlemmer på grunn av noen feil',
              all_bots: 'Kunne ikke fjerne roller fra alle bots på grunn av noen feil',
              all_users: 'Kunne ikke fjerne roller fra alle brukere på grunn av noen feil',
              all_roles: `Kunne ikke fjerne roller fra alle medlemmer med rollen <@&${all_that_a_role?.id}> på grunn av noen feil`
            },
            pl: {
              all_members: 'Nie udało się usunąć ról wszystkim członkom z powodu niektórych błędów',
              all_bots: 'Nie udało się usunąć ról wszystkim botom z powodu niektórych błędów',
              all_users: 'Nie udało się usunąć ról wszystkim użytkownikom z powodu niektórych błędów',
              all_roles: `Nie udało się usunąć ról wszystkim członkom z rolą <@&${all_that_a_role?.id}> z powodu niektórych błędów`
            },
            'pt-BR': {
              all_members: 'Não foi possível remover funções de todos os membros devido a alguns erros',
              all_bots: 'Não foi possível remover funções de todos os bots devido a alguns erros',
              all_users: 'Não foi possível remover funções de todos os usuários devido a alguns erros',
              all_roles: `Não foi possível remover funções de todos os membros com a função <@&${all_that_a_role?.id}> devido a alguns erros`
            },
            ro: {
              all_members: 'Nu s-au putut elimina roluri tuturor membrilor din cauza unor erori',
              all_bots: 'Nu s-au putut elimina roluri tuturor boturilor din cauza unor erori',
              all_users: 'Nu s-au putut elimina roluri tuturor utilizatorilor din cauza unor erori',
              all_roles: `Nu s-au putut elimina roluri tuturor membrilor cu rolul <@&${all_that_a_role?.id}> din cauza unor erori`
            },
            fi: {
              all_members: 'Roolien poistaminen kaikilta jäseniltä epäonnistui joidenkin virheiden takia',
              all_bots: 'Roolien poistaminen kaikilta boteilta epäonnistui joidenkin virheiden takia',
              all_users: 'Roolien poistaminen kaikilta käyttäjiltä epäonnistui joidenkin virheiden takia',
              all_roles: `Roolien poistaminen kaikilta jäseniltä roolilla <@&${all_that_a_role?.id}> epäonnistui joidenkin virheiden takia`
            },
            'sv-SE': {
              all_members: 'Det gick inte att ta bort roller från alla medlemmar på grund av några fel',
              all_bots: 'Det gick inte att ta bort roller från alla bots på grund av några fel',
              all_users: 'Det gick inte att ta bort roller från alla användare på grund av några fel',
              all_roles: `Det gick inte att ta bort roller från alla medlemmar med rollen <@&${all_that_a_role?.id}> på grund av några fel`
            },
            vi: {
              all_members: 'Không thể xóa vai trò khỏi tất cả các thành viên do một số lỗi',
              all_bots: 'Không thể xóa vai trò khỏi tất cả các bot do một số lỗi',
              all_users: 'Không thể xóa vai trò khỏi tất cả người dùng do một số lỗi',
              all_roles: `Không thể xóa vai trò khỏi tất cả các thành viên có vai trò <@&${all_that_a_role?.id}> do một số lỗi`
            },
            tr: {
              all_members: 'Tüm üyelerden roller çıkarılamadı, bazı hatalar nedeniyle',
              all_bots: 'Tüm botlardan roller çıkarılamadı, bazı hatalar nedeniyle',
              all_users: 'Tüm kullanıcılardan roller çıkarılamadı, bazı hatalar nedeniyle',
              all_roles: `Tüm üyelerden <@&${all_that_a_role?.id}> rolüne sahip olanlardan roller çıkarılamadı, bazı hatalar nedeniyle`
            },
            cs: {
              all_members: 'Nemohly být odstraněny role všem členům kvůli některým chybám',
              all_bots: 'Nemohly být odstraněny role všem botům kvůli některým chybám',
              all_users: 'Nemohly být odstraněny role všem uživatelům kvůli některým chybám',
              all_roles: `Nemohly být odstraněny role všem členům s rolí <@&${all_that_a_role?.id}> kvůli některým chybám`
            },
            el: {
              all_members: 'Δεν ήταν δυνατή η αφαίρεση ρόλων από όλα τα μέλη λόγω ορισμένων σφαλμάτων',
              all_bots: 'Δεν ήταν δυνατή η αφαίρεση ρόλων από όλα τα bots λόγω ορισμένων σφαλμάτων',
              all_users: 'Δεν ήταν δυνατή η αφαίρεση ρόλων από όλους τους χρήστες λόγω ορισμένων σφαλμάτων',
              all_roles: `Δεν ήταν δυνατή η αφαίρεση ρόλων από όλα τα μέλη με το ρόλο <@&${all_that_a_role?.id}> λόγω ορισμένων σφαλμάτων`
            },
            bg: {
              all_members: 'Не може да се премахнат роли от всички членове поради някои грешки',
              all_bots: 'Не може да се премахнат роли от всички ботове поради някои грешки',
              all_users: 'Не може да се премахнат роли от всички потребители поради някои грешки',
              all_roles: `Не може да се премахнат роли от всички членове с роля <@&${all_that_a_role?.id}> поради някои грешки`
            },
            ru: {
              all_members: 'Не удалось удалить роли у всех участников из-за некоторых ошибок',
              all_bots: 'Не удалось удалить роли у всех ботов из-за некоторых ошибок',
              all_users: 'Не удалось удалить роли у всех пользователей из-за некоторых ошибок',
              all_roles: `Не удалось удалить роли у всех участников с ролью <@&${all_that_a_role?.id}> из-за некоторых ошибок`
            },
            uk: {
              all_members: 'Не вдалося видалити ролі у всіх учасників через деякі помилки',
              all_bots: 'Не вдалося видалити ролі у всіх ботів через деякі помилки',
              all_users: 'Не вдалося видалити ролі у всіх користувачів через деякі помилки',
              all_roles: `Не вдалося видалити ролі у всіх учасників з роллю <@&${all_that_a_role?.id}> через деякі помилки`
            },
            hi: {
              all_members: 'कुछ त्रुटियों के कारण सभी सदस्यों से भूमिकाएँ हटाई नहीं जा सकीं',
              all_bots: 'कुछ त्रुटियों के कारण सभी बॉट्स से भूमिकाएँ हटाई नहीं जा सकीं',
              all_users: 'कुछ त्रुटियों के कारण सभी उपयोगकर्ताओं से भूमिकाएँ हटाई नहीं जा सकीं',
              all_roles: `कुछ त्रुटियों के कारण सभी सदस्यों से <@&${all_that_a_role?.id}> भूमिका हटाई नहीं जा सकीं`
            },
            'zh-CN': {
              all_members: '由于一些错误，无法从所有成员中删除角色',
              all_bots: '由于一些错误，无法从所有机器人中删除角色',
              all_users: '由于一些错误，无法从所有用户中删除角色',
              all_roles: `由于一些错误，无法从所有具有角色<@&${all_that_a_role?.id}>的成员中删除角色`
            },
            ja: {
              all_members: 'いくつかのエラーが発生したため、すべてのメンバーから役職を削除できませんでした',
              all_bots: 'いくつかのエラーが発生したため、すべてのボットから役職を削除できませんでした',
              all_users: 'いくつかのエラーが発生したため、すべてのユーザーから役職を削除できませんでした',
              all_roles: `いくつかのエラーが発生したため、役職<@&${all_that_a_role?.id}>を持つすべてのメンバーから役職を削除できませんでした`
            },
            'zh-TW': {
              all_members: '由於一些錯誤，無法從所有成員中刪除角色',
              all_bots: '由於一些錯誤，無法從所有機器人中刪除角色',
              all_users: '由於一些錯誤，無法從所有用戶中刪除角色',
              all_roles: `由於一些錯誤，無法從所有具有角色<@&${all_that_a_role?.id}>的成員中刪除角色`
            },
            ko: {
              all_members: '몇 가지 오류로 인해 모든 멤버에서 역할을 제거할 수 없습니다',
              all_bots: '몇 가지 오류로 인해 모든 봇에서 역할을 제거할 수 없습니다',
              all_users: '몇 가지 오류로 인해 모든 사용자에서 역할을 제거할 수 없습니다',
              all_roles: `몇 가지 오류로 인해 역할<@&${all_that_a_role?.id}>가 있는 모든 멤버에서 역할을 제거할 수 없습니다`
            }
          };
          if(pick_type == 'all'){
            const allUser = (await interaction.guild.members.fetch()).filter((user)=>user.roles.cache.has(role.id));
            const usersWithRole = (await Promise.all(
              allUser.map(async(user)=>{
                await user.roles.remove(role);
                return !user.roles.cache.has(role.id);
              })
            )).filter((hasRole) => hasRole === true).length;
            if((usersWithRole == allUser.size)){
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Remove Role Successfully')
                .setDescription(role_remove_success[interaction.guild?.preferredLocale || 'en-US'].all_members)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allUser.size} members` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#85ff00')
              );
              return await interaction.editReply({ embeds: [embed] });
            }else{
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Remove Role Error')
                .setDescription(role_remove_error[interaction.guild?.preferredLocale || 'en-US'].all_members)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allUser.size} members` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#ff4c4c'))
              return await interaction.editReply({ embeds: [embed] });
            };
          }else
          if(pick_type == 'humans'){
            const allHumans = (await interaction.guild.members.fetch()).filter((user)=>!user.user.bot && user.roles.cache.has(role.id));
            const usersWithRole = (await Promise.all(
              allHumans.map(async(user)=>{
                await user.roles.remove(role);
                return !user.roles.cache.has(role.id);
              })
            )).filter((hasRole) => hasRole === true).length;
            if((usersWithRole == allHumans.size)){
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Remove Role Successfully')
                .setDescription(role_remove_success[interaction.guild?.preferredLocale || 'en-US'].all_users)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allHumans.size} users` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#85ff00')
              );
              return await interaction.editReply({ embeds: [embed] });
            }else{
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Remove Role Error')
                .setDescription(role_remove_error[interaction.guild?.preferredLocale || 'en-US'].all_users)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allHumans.size} users` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#ff4c4c'))
              return await interaction.editReply({ embeds: [embed] });
            };
          }else
          if(pick_type == 'bots'){
            const allBots = (await interaction.guild.members.fetch()).filter((user)=>user.user.bot && user.roles.cache.has(role.id));
            const usersWithRole = (await Promise.all(
              allBots.map(async(user)=>{
                await user.roles.remove(role);
                return !user.roles.cache.has(role.id);
              })
            )).filter((hasRole) => hasRole === true).length;
            if((usersWithRole == allBots.size)){
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Remove Role Successfully')
                .setDescription(role_remove_success[interaction.guild?.preferredLocale || 'en-US'].all_bots)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allBots.size} bots` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#85ff00')
              );
              return await interaction.editReply({ embeds: [embed] });
            }else{
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Remove Role Error')
                .setDescription(role_remove_error[interaction.guild?.preferredLocale || 'en-US'].all_bots)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allBots.size} bots` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#ff4c4c'))
              return await interaction.editReply({ embeds: [embed] });
            };
          }else
          if(pick_type == 'all_that_a_role' && all_that_a_role){
            const allThatARole = (await interaction.guild.members.fetch()).filter((user)=>user.roles.cache.has(all_that_a_role.id) && user.roles.cache.has(role.id));
            const usersWithRole = (await Promise.all(
              allThatARole.map(async(user)=>{
                await user.roles.remove(role);
                return !user.roles.cache.has(role.id);
              })
            )).filter((hasRole) => hasRole === true).length;
            if((usersWithRole == allThatARole.size)){
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Remove Role Successfully')
                .setDescription(role_remove_success[interaction.guild?.preferredLocale || 'en-US'].all_roles)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allThatARole.size} members` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#85ff00')
              );
              return await interaction.editReply({ embeds: [embed] });
            }else{
              const embed = (new EmbedBuilder()
                .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
                .setTitle('Remove Role Error')
                .setDescription(role_remove_error[interaction.guild?.preferredLocale || 'en-US'].all_roles)
                .addFields(
                  { name: 'Changing', value: `${usersWithRole}/${allThatARole.size} members` }
                )
                .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
                .setColor('#ff4c4c'))
              return await interaction.editReply({ embeds: [embed] });
            };
          };
        };
      }
      catch(error){
        const embed = (new EmbedBuilder()
          .setAuthor({ name: 'Role Command', iconURL: 'https://cdn.discordapp.com/emojis/1227495506440224768.png' })
          .setTitle('Multiple Role Error')
          .setDescription(`${(error instanceof Error) ? error.message : error}`)
          .setFooter(client.user && { text: client.user?.tag, iconURL: client.user?.displayAvatarURL() })
          .setColor('#ff4c4c')
        );
        try{return await interaction.followUp({ content: `${(error instanceof Error) ? error.message : error}`, embeds: [embed] });}
        catch(followUpError){
          return console.error(
            chalk.red(` - ✖ RoleCommand Error`),
            (error instanceof Error) ? error.message : error,
            '\n',chalk.yellow(`  - ✖ RoleCommand Sending Error:`),
            (followUpError instanceof Error) ? followUpError.message : followUpError
          );
        };
      };
    }
  }else if(interaction.commandName === 'bot'){
    const subCommand = interaction.options.getSubcommand();

    try{
      if(subCommand == 'status'){
        const status = interaction.options.getString('status', true) as PresenceStatusData;
        interaction.client.user.setStatus(status);
        await interaction.reply({ content: 'เปลี่ยนสถานะสำเร็จ!', ephemeral: true });
      }if(subCommand == 'activity'){
        const name = interaction.options.getString('name', false);
        const type = interaction.options.getNumber('type', false) as ActivityType | null;

        if(name){
          interaction.client.user.setActivity({
            name: name,
            type: type || 0
          })
        }

        await interaction.reply({ content: 'เปลี่ยนสถานะกิจกรรมสำเร็จ!', ephemeral: true });
      }
    }catch(error){
      return console.error(error);
    }
  }else if(interaction.commandName === 'user'){
    if(!interaction.guild)return;
    if(!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
      return await interaction.reply({ content: interactionElements.noAdminCommandPermission[interaction.locale || 'en-US'], ephemeral: true });
    };

    await interaction.deferReply();

    const user = await client.users.fetch(interaction.options.getUser('user', false)?.id || interaction.user.id);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    await interaction.guild.bans.fetch();
    try{
      const message = await interaction.editReply({ embeds: [interactionElements.user_embed(user, member, interaction.guild)], components: interactionElements.user_button(user, member, interaction.guild) });
      return interactionCache.commandUser.add(interaction.guild.id, message.channel.id, message.id);
    }catch(error){
      throw error;
    }
  }else if(interaction.commandName === 'timeout'){
    if(!interaction.guild)return;
    if(!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
      return await interaction.reply({ content: interactionElements.noAdminCommandPermission[interaction.locale || 'en-US'], ephemeral: true });
    };

    const user = interaction.options.getUser('user', true);
    const duration = interaction.options.getNumber('duration', true);
    const reason = interaction.options.getString('reason', false);
    const member = await interaction.guild.members.fetch(user.id);
    return await interaction.reply({ embeds: [interactionElements.timeout_confirm_embed(member, duration, reason, interaction)], components: interactionElements.timeout_button(interaction) });
  }else if(interaction.commandName === 'untimeout'){
    if(!interaction.guild)return;
    if(!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
      return await interaction.reply({ content: interactionElements.noAdminCommandPermission[interaction.locale || 'en-US'], ephemeral: true });
    };
    const user = interaction.options.getUser('user', true);
    const member = await interaction.guild.members.fetch(user.id);
    if(!member.communicationDisabledUntilTimestamp || member.communicationDisabledUntilTimestamp < Date.now()){
      const untimeoutFailMessage: Record<Locale, string> = {
        id: 'Pengguna mungkin belum kehabisan waktu',
        da: 'Brugeren er måske ikke blevet timeoutet',
        de: 'Der Benutzer wurde möglicherweise nicht gesperrt',
        'en-GB': 'User may not have timed out',
        'en-US': 'User may not have timed out',
        'es-ES': 'El usuario puede no haber sido expulsado',
        'es-419': 'El usuario puede no haber sido expulsado',
        fr: 'L\'utilisateur n\'a peut-être pas été mis en timeout',
        hr: 'Korisnik možda nije izbačen',
        it: 'L\'utente potrebbe non essere stato espulso',
        lt: 'Naudotojas gali būti nebuvo užblokuotas',
        hu: 'A felhasználó lehet, hogy nem lett időkorlátozva',
        nl: 'De gebruiker is mogelijk niet geblokkeerd',
        no: 'Brukeren kan hende ikke har blitt timeoutet',
        pl: 'Użytkownik może nie zostać czasowo zablokowany',
        'pt-BR': 'O usuário pode não ter sido desconectado',
        ro: 'Utilizatorul poate că nu a fost temporar blocat',
        fi: 'Käyttäjää ei ehkä ole aikarajattu',
        'sv-SE': 'Användaren kanske inte har blivit timeoutad',
        vi: 'Người dùng có thể chưa bị hết thời gian',
        tr: 'Kullanıcı zaman aşımına uğramamış olabilir',
        cs: 'Uživatel nemusí být zablokován',
        el: 'Ο χρήστης ενδέχεται να μην έχει αποκλειστεί',
        bg: 'Потребителят може да не е бил изключен',
        ru: 'Пользователь может не быть заблокирован',
        uk: 'Користувач може не бути заблокований',
        hi: 'उपयोगकर्ता को टाइमआउट नहीं किया गया हो सकता है',
        th: 'ผู้ใช้อาจไม่ได้ถูกหมดเวลา',
        'zh-CN': '用户可能没有被限制时间',
        ja: 'ユーザーはタイムアウトしていない可能性があります',
        'zh-TW': '用戶可能沒有被限制時間',
        ko: '사용자가 시간 초과되지 않았을 수 있습니다',
      };
      return await interaction.reply({ content: `😥 ${untimeoutFailMessage[interaction.locale || 'en-US']}`, ephemeral: true });
    };
    const duration = member.communicationDisabledUntilTimestamp;
    return await interaction.reply({ embeds: [interactionElements.untimeout_confirm_embed(member, duration, interaction)], components: interactionElements.untimeout_button(interaction) });
  }
}


}catch(error){
  if(error instanceof DiscordAPIError){
    if(String(error.code).startsWith('10')){
        return;
    };
    return console.warn(chalk.red('[Camming SC]'), chalk.yellow(error));
  }else{
    // return console.error(error);
    return console.warn(chalk.red('[Camming SC]'), chalk.yellow(error));
  };
}
})();
}
}