import { ButtonStyle, ButtonBuilder, CacheType, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, ChannelSelectMenuBuilder, ComponentType, DiscordAPIError, ButtonInteraction, Message, Guild, MessageFlags } from "discord.js";
import DiscordClient from "../client/client";
import { getRepository, Raw } from "typeorm";
import { GuildConfiguration } from "../typeorm/entities/GuildConfiguration";
import { InteractionElements } from "./interactionElements";
import { AuditLogSettings, logEvents } from "../types";
import { interactionCache } from "../utils/cacheUtils";
import { setTimeout as wait } from 'node:timers/promises';
import chalk from 'chalk';
import { parseDuration } from "../utils/functions";
import { Membership } from "../typeorm/entities/membership";
import { AppDataSource } from "../data-source";
const interactionElements = new InteractionElements;
const { ActionRowBuilder, EmbedBuilder } = require('discord.js');

type Locale = 'id' | 'da' | 'de' | 'en-GB' | 'en-US' | 'es-ES' | 'es-419' | 'fr' | 'hr' | 'it' | 'lt' | 'hu' | 'nl' | 'no' | 'pl' | 'pt-BR' | 'ro' | 'fi' | 'sv-SE' | 'vi' | 'tr' | 'cs' | 'el' | 'bg' | 'ru' | 'uk' | 'hi' | 'th' | 'zh-CN' | 'ja' | 'zh-TW' | 'ko';

export class buttons {
private readonly guildConfigRepository = AppDataSource.getRepository(GuildConfiguration)
private readonly membershipRepository = AppDataSource.getRepository(Membership)
buttons(interaction: Interaction<CacheType>, client: DiscordClient) {
async function cooldown(interaction: ButtonInteraction) {
  const userId = interaction.user.id;
  const customId = interaction.customId;
  const cooldownKey = `${userId}-${customId}`;
  const currentTimestamp = Date.now();
  if (client.cooldowns.has(cooldownKey)) {
    const expirationTime = client.cooldowns.get(cooldownKey)!;
    if (currentTimestamp < expirationTime) {
      const timeLeft = (expirationTime - currentTimestamp) / 1000;
      await interaction.reply({
        content: interaction.guild?.preferredLocale === 'th'
          ? `กรุณารออีก ${timeLeft.toFixed(1)} วินาทีก่อนจะใช้ปุ่มนี้อีกครั้ง`
          : `Please wait another ${timeLeft.toFixed(1)} seconds before using this button again.`,
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
let premium = await this.membershipRepository.findOne({ where: { serverIds: Raw((alias) => `JSON_CONTAINS(${alias}, '"${interaction.guildId}"')`) } });


//  =======================  [ Button ]  =======================  \\


if(interaction.isButton()){
  if(await cooldown(interaction))return;
  if (interaction.customId === 'commandList') {
    if (interaction.locale == 'th') {
      const command_back = new ButtonBuilder()
        .setCustomId('commandList_back')
        .setLabel('ย้อนกลับ')
        .setEmoji('↩️')
        .setStyle(ButtonStyle.Secondary);
      const command_general = new ButtonBuilder()
        .setCustomId('commandList_general')
        .setLabel('ทั่วไป')
        .setStyle(ButtonStyle.Primary);
        const command_admin = new ButtonBuilder()
          .setCustomId('commandList_admin')
          .setLabel('แอดมิน')
          .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder()
        .addComponents(command_back, command_general, command_admin);
      const helpEmbed = new EmbedBuilder()
        .setColor(0xf91a1a)
        .setTitle('**Camming Bot** รายการคำสั่ง')
        .setThumbnail(client.user?.avatarURL())
        .setDescription('โปรดเลือกหมวดหมู่ของคำสั่ง')
        .addFields({ name: '\u200B', value: '\u200B' })
        .setTimestamp()
        .setFooter({ text: client.user?.username, iconURL: client.user?.avatarURL() });
      await interaction.update({ embeds: [helpEmbed], components: [row] });
    } else {
      const command_back = new ButtonBuilder()
        .setCustomId('commandList_back')
        .setLabel('back')
        .setEmoji('↩️')
        .setStyle(ButtonStyle.Secondary);
      const command_general = new ButtonBuilder()
        .setCustomId('commandList_general')
        .setLabel('general')
        .setStyle(ButtonStyle.Primary);
      const command_admin = new ButtonBuilder()
        .setCustomId('commandList_admin')
        .setLabel('admin')
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder()
        .addComponents(command_back, command_general, command_admin);
      const helpEmbed = new EmbedBuilder()
        .setColor(0xf91a1a)
        .setTitle('**Camming Bot** command list')
        .setThumbnail(client.user?.avatarURL())
        .setDescription('Please select a command category.')
        .addFields({ name: '\u200B', value: '\u200B' })
        .setTimestamp()
        .setFooter({ text: client.user?.username, iconURL: client.user?.avatarURL() });
      await interaction.update({ embeds: [helpEmbed], components: [row] });
    }
  } else if (interaction.customId === 'commandList_back') {
    if (interaction.locale == 'th') {
      const command = new ButtonBuilder()
        .setCustomId('commandList')
        .setLabel('รายการคำสั่ง')
        .setStyle(ButtonStyle.Secondary);
      const invite = new ButtonBuilder()
        .setLabel('เชิญบอท')
        .setURL('https://discord.com/oauth2/authorize?client_id=1210178730836893719')
        .setStyle(ButtonStyle.Link);
      const website = new ButtonBuilder()
        .setLabel('เว็บไซต์')
        .setURL('https://camming.xyz/')
        .setStyle(ButtonStyle.Link);
      const discord = new ButtonBuilder()
        .setLabel('ดิสคอร์ด')
        .setURL('https://discord.gg/brxPZB3Jzy')
        .setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder()
        .addComponents(command, invite, website, discord);
      const helpEmbed = new EmbedBuilder()
        .setColor(0xf91a1a)
        .setTitle('**Camming Bot**')
        .setThumbnail(client.user?.avatarURL())
        .addFields(
          { name: 'Help & Support', value: 'เว็บไซต์ : https://camming.xyz/'+'\nดิสคอร์ด : [CammingSupport](https://discord.gg/brxPZB3Jzy)', inline: true },
          { name: 'เชิญ Camming BOT', value: '[Camming BETA](https://discord.com/oauth2/authorize?client_id=1210178730836893719)', inline: true },
          { name: '\u200B', value: '\u200B' },
        )
        .setTimestamp()
        .setFooter({ text: client.user?.username, iconURL: client.user?.avatarURL() });
      if (interaction.guild){
        const config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guildId as string } });
        helpEmbed.addFields(
          { name: 'เซิร์ฟเวอร์', value: interaction.guild?.name, inline: false },
          { name: 'คำนำหน้าคำสั่ง (prefix)', value: '**`'+config?.prefix+'`**', inline: false },
        )
      };
      await interaction.update({ embeds: [helpEmbed], components: [row] });
    } else {
      const command = new ButtonBuilder()
        .setCustomId('commandList')
        .setLabel('Command list')
        .setStyle(ButtonStyle.Secondary)
      const invite = new ButtonBuilder()
        .setLabel('invite bot')
        .setURL('https://discord.com/oauth2/authorize?client_id=1210178730836893719')
        .setStyle(ButtonStyle.Link);
      const website = new ButtonBuilder()
        .setLabel('website')
        .setURL('https://camming.xyz/')
        .setStyle(ButtonStyle.Link);
      const discord = new ButtonBuilder()
        .setLabel('discord')
        .setURL('https://discord.gg/brxPZB3Jzy')
        .setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder()
        .addComponents(command, invite, website, discord);
      const helpEmbed = new EmbedBuilder()
        .setColor(0xf91a1a)
        .setTitle('Camming Bot')
        .setThumbnail(client.user?.avatarURL())
        .addFields(
          { name: 'Help & Support', value: 'Website : https://camming.xyz/'+'\nDiscord : [CammingSupport](https://discord.gg/brxPZB3Jzy)', inline: true },
          { name: 'Get Camming BOT', value: '[Camming BETA](https://discord.com/oauth2/authorize?client_id=1210178730836893719)', inline: true },
          { name: '\u200B', value: '\u200B' },
        )
        .setTimestamp()
        .setFooter({ text: client.user?.username, iconURL: client.user?.avatarURL() });
      if (interaction.guild){
        const config = await this.guildConfigRepository.findOne({ where: { guildId: interaction.guildId as string } });
        helpEmbed.addFields(
          { name: 'Server', value: interaction.guild?.name, inline: false },
          { name: 'Command prefix', value: '**`'+config?.prefix+'`**', inline: false },
        )
      };
      await interaction.update({ embeds: [helpEmbed], components: [row] });
    }
  } else if (interaction.customId === 'commandList_general') {
    if (interaction.locale == 'th') {
      const command_back = new ButtonBuilder()
        .setCustomId('commandList')
        .setLabel('ย้อนกลับ')
        .setEmoji('↩️')
        .setStyle(ButtonStyle.Secondary);
      const row = new ActionRowBuilder()
        .addComponents(command_back);
      const helpEmbed = new EmbedBuilder()
        .setColor(0xf91a1a)
        .setTitle('**Camming Bot** รายการคำสั่ง')
        .setThumbnail(client.user?.avatarURL())
        .addFields({ name: '\u200B', value: '\u200B' })
        .addFields(
          { name: '/help', value: 'ข้อมูลบอทและรายการคำสั่ง' },
          { name: '/ping', value: 'ดูเวลาแฝงของบอท' },
          { name: '/prefix', value: 'ดูคำนำหน้าคำสั่ง' },
          { name: '/avatar', value: 'ดูรูปโปรไฟล์ของผู้ใช้ที่เลือก (ไม่เลือกผู้ใช้เพื่อดูของตัวเอง)' },
          { name: '/banner', value: 'ดูรูปแบนเนอร์ของผู้ใช้ที่เลือก (ไม่เลือกผู้ใช้เพื่อดูของตัวเอง)' },
          // { name: '', value: '' },
        )
        .setTimestamp()
        .setFooter({ text: client.user?.username, iconURL: client.user?.avatarURL() });
      await interaction.update({ embeds: [helpEmbed], components: [row] });
    } else {
      const command_back = new ButtonBuilder()
        .setCustomId('commandList')
        .setLabel('back')
        .setEmoji('↩️')
        .setStyle(ButtonStyle.Secondary);
      const row = new ActionRowBuilder()
        .addComponents(command_back);
      const helpEmbed = new EmbedBuilder()
        .setColor(0xf91a1a)
        .setTitle('**Camming Bot** command list')
        .setThumbnail(client.user?.avatarURL())
        .addFields({ name: '\u200B', value: '\u200B' })
        .addFields(
          { name: '/help', value: 'Bot info & Commands.' },
          { name: '/ping', value: 'See the latency of the bot.' },
          { name: '/prefix', value: 'See the command prefix.' },
          { name: '/avatar', value: 'View the profile picture of the selected user (If no user is selected, your own profile picture will be displayed)' },
          { name: '/banner', value: 'View the banner image of the selected user (if no user is selected, your own banner image will be displayed)' },
          // { name: '', value: '' },
        )
        .setTimestamp()
        .setFooter({ text: client.user?.username, iconURL: client.user?.avatarURL() });
      await interaction.update({ embeds: [helpEmbed], components: [row] });
    }
  } else if (interaction.customId === 'commandList_admin') {
    if(interaction.locale == 'th'){
      const command_back = new ButtonBuilder()
        .setCustomId('commandList')
        .setLabel('ย้อนกลับ')
        .setEmoji('↩️')
        .setStyle(ButtonStyle.Secondary);
      const row = new ActionRowBuilder()
        .addComponents(command_back);
      const helpEmbed = new EmbedBuilder()
        .setColor(0xf91a1a)
        .setTitle('**Camming Bot** รายการคำสั่ง')
        .setThumbnail(client.user?.avatarURL())
        .addFields({ name: '\u200B', value: '\u200B' })
        .addFields(
          { name: '/ban', value: 'แบนสมาชิกออกจากเซิร์ฟเวอร์' },
          { name: '/unban', value: 'ปลดแบนสมาชิก' },
          { name: '/kick', value: 'เตะสมาชิกออกจากเซิร์ฟเวอร์' },
          { name: '/prefix', value: 'กำหนดคำนำหน้าคำสั่งหรือดูคำนำหน้าคำสั่ง' },
          // { name: '', value: '' },
        )
        .setTimestamp()
        .setFooter({ text: client.user?.username, iconURL: client.user?.avatarURL() });
      await interaction.update({ embeds: [helpEmbed], components: [row] });
    } else {
      const command_back = new ButtonBuilder()
        .setCustomId('commandList')
        .setLabel('back')
        .setEmoji('↩️')
        .setStyle(ButtonStyle.Secondary);
      const row = new ActionRowBuilder()
        .addComponents(command_back);
      const helpEmbed = new EmbedBuilder()
        .setColor(0xf91a1a)
        .setTitle('**Camming Bot** command list')
        .setThumbnail(client.user?.avatarURL())
        .addFields({ name: '\u200B', value: '\u200B' })
        .addFields(
          { name: '/ban', value: 'Ban members from the server' },
          { name: '/unban', value: 'ปลดแบนสมาชิก' },
          { name: '/kick', value: 'Kick members from the server' },
          { name: '/prefix', value: 'Set command prefix or view command prefix' },
          // { name: '', value: '' },
        )
        .setTimestamp()
        .setFooter({ text: client.user?.username, iconURL: client.user?.avatarURL() });
      await interaction.update({ embeds: [helpEmbed], components: [row] });
    }
  }

  // Ban Command \\
  if(interaction.customId.startsWith('ban')){
    if(!interaction.guild)return;try{
    if(!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)){
      return await interaction.reply({ content: interactionElements.noAdminButtonPermission[interaction.locale || 'en-US'], ephemeral: true });
    }else if(interaction.customId === 'ban_confirm'){
      if(interaction.memberPermissions?.has('Administrator') || interaction.memberPermissions?.has('BanMembers')){
        const successMessages: Record<Locale, { title: string, userField: string, reasonField: string, noReason: string }> = {
          'id': { title: '🛫 Melarang {user} Berhasil', userField: 'Nama Pengguna', reasonField: 'Alasan', noReason: 'Tidak Ada Alasan' },
          'da': { title: '🛫 Ban {user} Lykkedes', userField: 'Brugernavn', reasonField: 'Grund', noReason: 'Ingen Grund Angivet' },
          'de': { title: '🛫 {user} erfolgreich verbannt', userField: 'Benutzername', reasonField: 'Grund', noReason: 'Kein Grund Angegeben' },
          'en-GB': { title: '🛫 Banned {user} Successfully', userField: 'Username', reasonField: 'Reason', noReason: 'No Reason Specified' },
          'en-US': { title: '🛫 Banned {user} Successfully', userField: 'Username', reasonField: 'Reason', noReason: 'No Reason Specified' },
          'es-ES': { title: '🛫 Prohibido {user} Exitosamente', userField: 'Nombre de Usuario', reasonField: 'Razón', noReason: 'Sin Razón Especificada' },
          'es-419': { title: '🛫 Prohibido {user} Exitosamente', userField: 'Nombre de Usuario', reasonField: 'Razón', noReason: 'Sin Razón Especificada' },
          'fr': { title: '🛫 Interdiction de {user} Réussie', userField: 'Nom d\'Utilisateur', reasonField: 'Raison', noReason: 'Aucune Raison Spécifiée' },
          'hr': { title: '🛫 Zabrana {user} Uspješna', userField: 'Korisničko Ime', reasonField: 'Razlog', noReason: 'Nema Navedenog Razloga' },
          'it': { title: '🛫 Vietato {user} con Successo', userField: 'Nome Utente', reasonField: 'Motivo', noReason: 'Nessun Motivo Specificato' },
          'lt': { title: '🛫 Draudimas {user} Sėkmingas', userField: 'Vartotojo Vardas', reasonField: 'Priežastis', noReason: 'Nenurodyta Priežastis' },
          'hu': { title: '🛫 {user} Sikeresen Kitiltva', userField: 'Felhasználónév', reasonField: 'Ok', noReason: 'Nincs Megadva Ok' },
          'nl': { title: '🛫 Verbanning {user} Succesvol', userField: 'Gebruikersnaam', reasonField: 'Reden', noReason: 'Geen Reden Opgegeven' },
          'no': { title: '🛫 Forbudt {user} Vellykket', userField: 'Brukernavn', reasonField: 'Årsak', noReason: 'Ingen Angitt Årsak' },
          'pl': { title: '🛫 Zbanowany {user} Pomyślnie', userField: 'Nazwa Użytkownika', reasonField: 'Powód', noReason: 'Nie Podano Powodu' },
          'pt-BR': { title: '🛫 Banido {user} Com Sucesso', userField: 'Nome de Usuário', reasonField: 'Motivo', noReason: 'Nenhum Motivo Especificado' },
          'ro': { title: '🛫 Interzis {user} cu Succes', userField: 'Nume Utilizator', reasonField: 'Motiv', noReason: 'Niciun Motiv Specificat' },
          'fi': { title: '🛫 Kielto {user} Onnistui', userField: 'Käyttäjänimi', reasonField: 'Syy', noReason: 'Ei Määriteltyä Syytä' },
          'sv-SE': { title: '🛫 Bannlyst {user} Framgångsrikt', userField: 'Användarnamn', reasonField: 'Orsak', noReason: 'Ingen Angiven Orsak' },
          'vi': { title: '🛫 Cấm {user} Thành Công', userField: 'Tên Người Dùng', reasonField: 'Lý Do', noReason: 'Không Có Lý Do Được Chỉ Định' },
          'tr': { title: '🛫 {user} Başarıyla Yasaklandı', userField: 'Kullanıcı Adı', reasonField: 'Neden', noReason: 'Belirtilen Neden Yok' },
          'cs': { title: '🛫 Zákaz {user} Úspěšný', userField: 'Uživatelské Jméno', reasonField: 'Důvod', noReason: 'Není Uveden Důvod' },
          'el': { title: '🛫 Απαγόρευση {user} Επιτυχής', userField: 'Όνομα Χρήστη', reasonField: 'Λόγος', noReason: 'Δεν Έχει Καθοριστεί Λόγος' },
          'bg': { title: '🛫 Забрана {user} Успешна', userField: 'Потребителско Име', reasonField: 'Причина', noReason: 'Не Е Посочена Причина' },
          'ru': { title: '🛫 Запрещено {user} Успешно', userField: 'Имя Пользователя', reasonField: 'Причина', noReason: 'Причина Не Указана' },
          'uk': { title: '🛫 Заборонено {user} Успішно', userField: 'Ім\'я Користувача', reasonField: 'Причина', noReason: 'Причина Не Вказана' },
          'hi': { title: '🛫 {user} को सफलतापूर्वक प्रतिबंधित किया गया', userField: 'उपयोगकर्ता नाम', reasonField: 'कारण', noReason: 'कोई कारण निर्दिष्ट नहीं किया गया' },
          'th': { title: '🛫 แบน {user} สำเร็จ', userField: 'ชื่อผู้ใช้', reasonField: 'เหตุผล', noReason: 'ไม่ได้ระบุเหตุผล' },
          'zh-CN': { title: '🛫 成功封禁 {user}', userField: '用户名', reasonField: '原因', noReason: '未指定原因' },
          'ja': { title: '🛫 {user} が正常に禁止されました', userField: 'ユーザー名', reasonField: '理由', noReason: '指定された理由はありません' },
          'zh-TW': { title: '🛫 成功封鎖 {user}', userField: '用戶名', reasonField: '原因', noReason: '未指定原因' },
          'ko': { title: '🛫 {user} 차단 성공', userField: '사용자 이름', reasonField: '이유', noReason: '이유를 지정하지 않음' }
        };
        const banFailureMessages: Record<Locale, { title: string, description: string }> = {
          'id': { title: '😥 Gagal melarang {user}', description: 'Pengguna yang ingin Anda larang mungkin memiliki posisi lebih tinggi dari bot atau mungkin tidak berada di server ini' },
          'da': { title: '😥 Kunne ikke banne {user}', description: 'Brugeren, du vil banne, kan have en højere rolle end botten eller muligvis ikke være i denne server' },
          'de': { title: '😥 Bann von {user} fehlgeschlagen', description: 'Der zu bannende Benutzer hat möglicherweise eine höhere Position als der Bot oder ist möglicherweise nicht auf diesem Server' },
          'en-GB': { title: '😥 Failed to ban {user}', description: 'The user you are trying to ban may have a higher role than the bot or may not be in this server' },
          'en-US': { title: '😥 Failed to ban {user}', description: 'The user you are trying to ban may have a higher role than the bot or may not be in this server' },
          'es-ES': { title: '😥 No se pudo banear a {user}', description: 'El usuario que estás intentando banear puede tener un rol superior al bot o puede que no esté en este servidor' },
          'es-419': { title: '😥 No se pudo banear a {user}', description: 'El usuario que estás intentando banear puede tener un rol superior al bot o puede que no esté en este servidor' },
          'fr': { title: '😥 Impossible de bannir {user}', description: 'L\'utilisateur que vous essayez de bannir peut avoir un rôle supérieur au bot ou ne pas être dans ce serveur' },
          'hr': { title: '😥 Neuspješno baniranje {user}', description: 'Korisnik kojeg pokušavate banirati možda ima višu ulogu od bota ili možda nije na ovom serveru' },
          'it': { title: '😥 Impossibile bannare {user}', description: 'L\'utente che stai cercando di bannare potrebbe avere un ruolo superiore al bot o potrebbe non essere in questo server' },
          'lt': { title: '😥 Nepavyko užblokuoti {user}', description: 'Vartotojas, kurį bandote užblokuoti, gali turėti aukštesnį vaidmenį nei botas arba gali nebūti šiame serveryje' },
          'hu': { title: '😥 Nem sikerült kitiltani {user}', description: 'A felhasználó, akit kitiltani próbálsz, lehet, hogy magasabb szerepköre van, mint a botnak, vagy lehet, hogy nincs ezen a szerveren' },
          'nl': { title: '😥 Niet gelukt om {user} te verbannen', description: 'De gebruiker die je probeert te verbannen, heeft mogelijk een hogere rol dan de bot of is mogelijk niet in deze server' },
          'no': { title: '😥 Klarte ikke å utestenge {user}', description: 'Brukeren du prøver å utestenge, kan ha en høyere rolle enn boten eller kan være utenfor denne serveren' },
          'pl': { title: '😥 Nie udało się zbanować {user}', description: 'Użytkownik, którego próbujesz zbanować, może mieć wyższą rolę niż bot lub może nie być na tym serwerze' },
          'pt-BR': { title: '😥 Falha ao banir {user}', description: 'O usuário que você está tentando banir pode ter um papel mais alto que o bot ou pode não estar neste servidor' },
          'ro': { title: '😥 Nu a reușit să interzică {user}', description: 'Utilizatorul pe care încerci să-l interzici poate avea un rol mai înalt decât botul sau poate nu este în acest server' },
          'fi': { title: '😥 Käyttäjän {user} porttikielto epäonnistui', description: 'Käyttäjä, jota yrität estää, saattaa olla korkeammassa asemassa kuin botti tai ei välttämättä ole tällä palvelimella' },
          'sv-SE': { title: '😥 Misslyckades med att banna {user}', description: 'Användaren du försöker banna kan ha en högre roll än boten eller kanske inte är i den här servern' },
          'vi': { title: '😥 Không thể cấm {user}', description: 'Người dùng bạn đang cố gắng cấm có thể có vai trò cao hơn bot hoặc có thể không có trong máy chủ này' },
          'tr': { title: '😥 {user} yasaklanamadı', description: 'Yasaklamaya çalıştığınız kullanıcı, bottan daha yüksek bir role sahip olabilir veya bu sunucuda olmayabilir' },
          'cs': { title: '😥 Nepodařilo se zabanovat {user}', description: 'Uživatel, kterého se pokoušíte zabanovat, může mít vyšší roli než bot nebo nemusí být na tomto serveru' },
          'el': { title: '😥 Αποτυχία απαγόρευσης {user}', description: 'Ο χρήστης που προσπαθείτε να απαγορεύσετε μπορεί να έχει υψηλότερο ρόλο από το bot ή να μην βρίσκεται σε αυτόν τον διακομιστή' },
          'bg': { title: '😥 Неуспешно забраняване на {user}', description: 'Потребителят, когото се опитвате да забраните, може да има по-висока роля от бота или може да не е в този сървър' },
          'ru': { title: '😥 Не удалось забанить {user}', description: 'Пользователь, которого вы пытаетесь забанить, может иметь более высокую роль, чем бот, или может отсутствовать на этом сервере' },
          'uk': { title: '😥 Не вдалося забанити {user}', description: 'Користувач, якого ви намагаєтесь забанити, може мати вищу роль, ніж бот, або може бути відсутнім на цьому сервері' },
          'hi': { title: '😥 {user} को बैन करने में विफल', description: 'जिस उपयोगकर्ता को आप बैन करने का प्रयास कर रहे हैं, वह बॉट से उच्च भूमिका वाला हो सकता है या हो सकता है कि वह इस सर्वर में नहीं है' },
          'th': { title: '😥 แบน {user} ไม่สำเร็จ', description: 'ผู้ใช้ที่ต้องการแบนอาจตำแหน่งสูงกว่าบอท หรืออาจไม่ได้อยู่ในเซิร์ฟเวอร์นี้' },
          'zh-CN': { title: '😥 未能禁用 {user}', description: '您试图禁用的用户可能拥有比机器人更高的角色或可能不在此服务器中' },
          'ja': { title: '😥 {user} を禁止できませんでした', description: '禁止しようとしているユーザーは、ボットより高い役割を持っているか、このサーバーに存在しない可能性があります' },
          'zh-TW': { title: '😥 無法禁止 {user}', description: '您嘗試禁止的用戶可能擁有比機器人更高的角色，或可能不在此伺服器中' },
          'ko': { title: '😥 {user} 을(를) 차단하지 못했습니다', description: '차단하려는 사용자가 봇보다 높은 역할을 가지고 있거나 이 서버에 없을 수 있습니다' },
        };
        
        const userId = interaction.message.embeds[0].fields[0].value.replace(/\D/g, '');
        if(!userId){
          await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
          await wait(10_000);
          const message = await interaction.fetchReply();
          await message.delete();
          return;
        };
        const user = (await client.users.fetch(userId));
        if(!user){
          try{
            return await interaction.update({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, embeds: [], components: [] });
          }catch{
            try{ return await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true }); }
            catch(error){ throw error }
          };
        };
    
        const messages_successMessages = successMessages[interaction.guildLocale || 'en-US'];
        const messages_banFailureMessages = banFailureMessages[interaction.guildLocale || 'en-US'];
      
        const userDisplayName = user?.displayName;
    
        try {
          if(interaction.message.embeds[0].fields[1].value != messages_successMessages.noReason){
            const reason = interaction.message.embeds[0].fields[1].value
            await interaction.guild?.bans.create(user, { reason: reason });
          } else await interaction.guild?.bans.create(user);
        } catch (error) {
          const embed = (new EmbedBuilder()
            .setAuthor({ name: userDisplayName, iconURL: user?.displayAvatarURL() })
            .setTitle(userDisplayName ? messages_banFailureMessages.title.replace('{user}', userDisplayName) : messages_banFailureMessages.title)
            .setThumbnail(user?.displayAvatarURL())
            .setDescription(messages_banFailureMessages.description)
            .addFields(
              { name: messages_successMessages.userField, value: `<@${user?.id}>  `+'(`'+user?.id+'`)' },
              { name: messages_successMessages.reasonField, value: interaction.message.embeds[0].fields[1].value ?? messages_successMessages.noReason },
              { name: '\u200B', value: '\u200B' },
            )
            .setColor(0xff4242)
            .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
            .setTimestamp()
          );
          await interaction.update({ embeds: [embed], components: [] });
          await wait(20_000);
          const message = await interaction.fetchReply();
          await message.delete();
          return;
        };
        const success_embed = (new EmbedBuilder()
          .setAuthor({ name: userDisplayName, iconURL: user?.displayAvatarURL() })
          .setTitle(userDisplayName ? messages_successMessages.title.replace('{user}', userDisplayName) : messages_successMessages.title)
          .setThumbnail(user?.displayAvatarURL())
          .addFields(
              { name: messages_successMessages.userField, value: `<@${user?.id}>  `+'(`'+user?.id+'`)' },
              { name: messages_successMessages.reasonField, value: interaction.message.embeds[0].fields[1].value ?? messages_successMessages.noReason },
              { name: '\u200B', value: '\u200B' },
          )
          .setColor(0xff4242)
          .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
          .setTimestamp()
        );
    
        const message = await interaction.update({ embeds: [success_embed], components: [] });
        await wait(10_000);
        await message.delete();
      } else {
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
      }
    }else if(interaction.customId === 'ban_cancel'){
      const unbanTitle: Record<Locale, string> = {
        id: 'Pembatalan Pemblokiran',
        da: 'Fortryd udelukkelse',
        de: 'Entbannung',
        'en-GB': 'Unban Cancelled',
        'en-US': 'Unban Cancelled',
        'es-ES': 'Desbaneo Cancelado',
        'es-419': 'Desbaneo Cancelado',
        fr: 'Annulation du bannissement',
        hr: 'Opoziv zabrane',
        it: 'Ban annullato',
        lt: 'Draudimo atšaukimas',
        hu: 'Tiltás visszavonása',
        nl: 'Ban opgeheven',
        no: 'Utestengelse opphevet',
        pl: 'Anulowano bana',
        'pt-BR': 'Banimento cancelado',
        ro: 'Ban anulat',
        fi: 'Porttikielto peruttu',
        'sv-SE': 'Avstängning upphävd',
        vi: 'Đã hủy cấm',
        tr: 'Yasaklama iptal edildi',
        cs: 'Zrušení zákazu',
        el: 'Ακύρωση αποκλεισμού',
        bg: 'Отмяна на блокирането',
        ru: 'Бан отменён',
        uk: 'Бан скасовано',
        hi: 'बैन रद्द किया गया',
        th: 'ยกเลิกการแบนแล้ว',
        'zh-CN': '已取消封禁',
        ja: 'BANが解除されました',
        'zh-TW': '已取消封鎖',
        ko: '차단 해제됨',
      };
      const userId = interaction.message.embeds[0].fields[0].value.replace(/\D/g, '');
      if(!userId){
        await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
        await wait(10_000);
        const message = await interaction.fetchReply();
        await message.delete();
        return;
      };
      const user = (await client.users.fetch(userId));
      if(!user){
        try{
          return await interaction.update({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, embeds: [], components: [] });
        }catch{
          try{ return await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true }); }
          catch(error){ throw error }
        };
      };
  
      const userDisplayName = user.displayName;
  
      const embed = new EmbedBuilder()
        .setAuthor({ name: userDisplayName, iconURL: user.displayAvatarURL() })
        .setTitle(unbanTitle[interaction.guildLocale || 'en-US'])
        .setThumbnail(user.displayAvatarURL())
        .addFields({ name: '\u200B', value: '\u200B' })
        .setColor(0xff4242)
        .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
        .setTimestamp();
      await interaction.update({ embeds: [embed], components: [] })
      await wait(10_000)
      const message = await interaction.fetchReply()
      await message.delete();
    }else if(interaction.customId === 'ban_reason'){
      return await interaction.showModal(interactionElements.ban_reason_modal(interaction));
    };
    }catch(error){ throw error };
  }if(interaction.customId.startsWith('unban')){
    if(!interaction.guild)return;try{
    if(!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)){
      return await interaction.reply({ content: interactionElements.noAdminButtonPermission[interaction.locale || 'en-US'], ephemeral: true });
    }else if(interaction.customId === 'unban_confirm'){
      const unbanSuccess: Record<Locale, string> = {
        id: '🛬 Berhasil membuka blokir {user}',
        da: '🛬 {user} er blevet ophævet',
        de: '🛬 {user} wurde erfolgreich entbannt',
        'en-GB': '🛬 Successfully unbanned {user}',
        'en-US': '🛬 Successfully unbanned {user}',
        'es-ES': '🛬 {user} ha sido desbaneado con éxito',
        'es-419': '🛬 {user} fue desbaneado correctamente',
        fr: '🛬 {user} a été débanni avec succès',
        hr: '🛬 {user} je uspješno odbaniran',
        it: '🛬 {user} è stato sbannato con successo',
        lt: '🛬 {user} sėkmingai atblokuotas',
        hu: '🛬 {user} sikeresen feloldva a tiltás alól',
        nl: '🛬 {user} is succesvol gedeblokkeerd',
        no: '🛬 {user} ble fjernet fra utestengelse',
        pl: '🛬 {user} został pomyślnie odbanowany',
        'pt-BR': '🛬 {user} foi desbanido com sucesso',
        ro: '🛬 {user} a fost debanat cu succes',
        fi: '🛬 {user} on onnistuneesti poistettu estolistalta',
        'sv-SE': '🛬 {user} har blivit avblockerad',
        vi: '🛬 Đã gỡ cấm {user} thành công',
        tr: '🛬 {user} başarıyla yasak kaldırıldı',
        cs: '🛬 {user} byl úspěšně odbanován',
        el: '🛬 Ο {user} απομπλοκαρίστηκε με επιτυχία',
        bg: '🛬 {user} беше успешно отблокиран',
        ru: '🛬 {user} успешно разбанен',
        uk: '🛬 {user} успішно розблоковано',
        hi: '🛬 {user} को सफलतापूर्वक अनबैन किया गया',
        th: '🛬 ปลดแบน {user} เรียบร้อยแล้ว',
        'zh-CN': '🛬 已成功解除 {user} 的封禁',
        ja: '🛬 {user} のBANを解除しました',
        'zh-TW': '🛬 已成功解除 {user} 的封鎖',
        ko: '🛬 {user}의 차단이 해제되었습니다',
      };
      const unbanFailureMessages: Record<Locale, { title: string, description: string }> = {
        'id': { title: '😥 Gagal membatalkan larangan {user}', description: 'Pengguna mungkin tidak ada dalam daftar larangan' },
        'da': { title: '😥 Kunne ikke ophæve forbuddet mod {user}', description: 'Brugeren er muligvis ikke bannet' },
        'de': { title: '😥 Entbannung von {user} fehlgeschlagen', description: 'Der Benutzer ist möglicherweise nicht gebannt' },
        'en-GB': { title: '😥 Failed to unban {user}', description: 'The user may not be banned' },
        'en-US': { title: '😥 Failed to unban {user}', description: 'The user may not be banned' },
        'es-ES': { title: '😥 No se pudo quitar el baneo a {user}', description: 'El usuario puede que no esté baneado' },
        'es-419': { title: '😥 No se pudo quitar el baneo a {user}', description: 'El usuario puede que no esté baneado' },
        'fr': { title: '😥 Impossible de débannir {user}', description: 'L\'utilisateur n\'est peut-être pas banni' },
        'hr': { title: '😥 Neuspješno uklanjanje zabrane za {user}', description: 'Korisnik možda nije baniran' },
        'it': { title: '😥 Impossibile rimuovere il ban da {user}', description: 'L\'utente potrebbe non essere bannato' },
        'lt': { title: '😥 Nepavyko atblokuoti {user}', description: 'Vartotojas galbūt nėra užblokuotas' },
        'hu': { title: '😥 Nem sikerült feloldani {user} tiltását', description: 'A felhasználó lehet, hogy nincs kitiltva' },
        'nl': { title: '😥 Niet gelukt om {user} te unbannen', description: 'De gebruiker is mogelijk niet verbannen' },
        'no': { title: '😥 Klarte ikke å oppheve utestengelsen av {user}', description: 'Brukeren er kanskje ikke utestengt' },
        'pl': { title: '😥 Nie udało się odbanować {user}', description: 'Użytkownik może nie być zbanowany' },
        'pt-BR': { title: '😥 Falha ao desbanir {user}', description: 'O usuário pode não estar banido' },
        'ro': { title: '😥 Nu s-a reușit debanarea lui {user}', description: 'Utilizatorul s-ar putea să nu fie banat' },
        'fi': { title: '😥 Käyttäjän {user} porttikiellon poisto epäonnistui', description: 'Käyttäjä ei ehkä ole porttikiellossa' },
        'sv-SE': { title: '😥 Misslyckades med att ta bort bannlysning av {user}', description: 'Användaren är kanske inte bannlyst' },
        'vi': { title: '😥 Không thể gỡ cấm {user}', description: 'Người dùng có thể không bị cấm' },
        'tr': { title: '😥 {user} yasağı kaldırılamadı', description: 'Kullanıcı yasaklı olmayabilir' },
        'cs': { title: '😥 Nepodařilo se odbanovat {user}', description: 'Uživatel možná není zabanován' },
        'el': { title: '😥 Αποτυχία άρσης απαγόρευσης για τον {user}', description: 'Ο χρήστης μπορεί να μην είναι αποκλεισμένος' },
        'bg': { title: '😥 Неуспешно премахване на забрана за {user}', description: 'Потребителят може да не е забранен' },
        'ru': { title: '😥 Не удалось разбанить {user}', description: 'Пользователь может быть не забанен' },
        'uk': { title: '😥 Не вдалося розбанити {user}', description: 'Користувач може не бути забаненим' },
        'hi': { title: '😥 {user} को अनबैन करने में विफल', description: 'संभव है कि उपयोगकर्ता बैन न हो' },
        'th': { title: '😥 ปลดแบน {user} ไม่สำเร็จ', description: 'ผู้ใช้อาจไม่ได้ถูกแบน' },
        'zh-CN': { title: '😥 未能解除对 {user} 的禁令', description: '该用户可能未被禁用' },
        'ja': { title: '😥 {user} の禁止を解除できませんでした', description: 'ユーザーが禁止されていない可能性があります' },
        'zh-TW': { title: '😥 無法解除 {user} 的禁令', description: '使用者可能未被禁止' },
        'ko': { title: '😥 {user} 의 차단 해제가 실패했습니다', description: '사용자가 차단되지 않았을 수 있습니다' },
      };
      const userId = interaction.message.embeds[0].fields[0].value.replace(/\D/g, '');
      if(!userId){
        await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
        await wait(10_000);
        const message = await interaction.fetchReply();
        await message.delete();
        return;
      };
      const user = (await client.users.fetch(userId));
      if(!user){
        try{
          return await interaction.update({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, embeds: [], components: [] });
        }catch{
          try{ return await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true }); }
          catch(error){ throw error }
        };
      };
      
      try{
        await interaction.guild.bans.remove(user, 'test');
      }catch{
        const embed = (new EmbedBuilder()
          .setAuthor({ name: user?.username, iconURL: user?.avatarURL() })
          .setTitle(unbanFailureMessages[interaction.guildLocale || 'en-US'].title)
          .setDescription(unbanFailureMessages[interaction.guildLocale || 'en-US'].description)
          .setThumbnail(user?.avatarURL())
          .addFields({ name: '\u200B', value: '\u200B' })
          .setColor(0xff4242)
          .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
          .setTimestamp()
        );
        const message = await interaction.update({ embeds: [embed], components: [] });
        await wait(10_000);
        await message.delete();
      }
      
      const userDisplayName = user.displayName;
      const title = userDisplayName ? unbanSuccess[interaction.guildLocale || 'en-US'].replace('{user}', userDisplayName) : unbanSuccess[interaction.guildLocale || 'en-US'];
      const embed = (new EmbedBuilder()
        .setAuthor({ name: user?.username, iconURL: user?.avatarURL() })
        .setTitle(title)
        .setThumbnail(user?.avatarURL())
        .addFields({ name: '\u200B', value: '\u200B' })
        .setColor(0xff4242)
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setTimestamp()
      );
      const message = await interaction.update({ embeds: [embed], components: [] });
      await wait(10_000);
      await message.delete();
    }else if(interaction.customId === 'unban_cancel'){
      const ununbanTitle: Record<Locale, string> = {
        id: 'Pembatalan Pembatalan Pemblokiran',
        da: 'Fortryd ophævelse af udelukkelse',
        de: 'Entbannung rückgängig gemacht',
        'en-GB': 'Unban Reverted',
        'en-US': 'Unban Reverted',
        'es-ES': 'Se revirtió el desbaneo',
        'es-419': 'Se revirtió el desbaneo',
        fr: 'Débannissement annulé',
        hr: 'Poništeno uklanjanje zabrane',
        it: 'Annullamento del Ban Annullato',
        lt: 'Atšaukto atblokavimo atšaukimas',
        hu: 'Tiltás visszaállítása',
        nl: 'Unban ongedaan gemaakt',
        no: 'Oppheving av utestengelse omgjort',
        pl: 'Cofnięto unbana',
        'pt-BR': 'Desbanimento revertido',
        ro: 'Anularea debanării',
        fi: 'Porttikiellon peruutus peruttu',
        'sv-SE': 'Avstängning återställd',
        vi: 'Đã hoàn tác bỏ cấm',
        tr: 'Yasak kaldırma geri alındı',
        cs: 'Zrušení odblokování',
        el: 'Αναίρεση άρσης αποκλεισμού',
        bg: 'Отмяна на деблокирането',
        ru: 'Разбан отменён',
        uk: 'Скасування розблокування',
        hi: 'अनबैन रद्द किया गया',
        th: 'ยกเลิกการปลดแบนแล้ว',
        'zh-CN': '已撤销解除封禁',
        ja: 'BAN解除が取り消されました',
        'zh-TW': '已撤銷解除封鎖',
        ko: '차단 해제 취소됨',
      };
      const userId = interaction.message.embeds[0].fields[0].value.replace(/\D/g, '');
      if(!userId){
        await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
        await wait(10_000);
        const message = await interaction.fetchReply();
        await message.delete();
        return;
      };
      const user = (await client.users.fetch(userId));
      if(!user){
        try{
          return await interaction.update({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, embeds: [], components: [] });
        }catch{
          try{ return await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true }); }
          catch(error){ throw error }
        };
      };
  
      const userDisplayName = user.displayName;
  
      const embed = new EmbedBuilder()
        .setAuthor({ name: userDisplayName, iconURL: user.displayAvatarURL() })
        .setTitle(ununbanTitle[interaction.guildLocale || 'en-US'])
        .setThumbnail(user.displayAvatarURL())
        .addFields({ name: '\u200B', value: '\u200B' })
        .setColor(0xff4242)
        .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
        .setTimestamp();
      await interaction.update({ embeds: [embed], components: [] })
      await wait(10_000)
      const message = await interaction.fetchReply()
      await message.delete();
    };
    }catch(error){ throw error };
  }

  // Kick Command \\
  if(interaction.customId.startsWith('kick')){
    if(!interaction.guild)return;try{
    if(!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)){
      return await interaction.reply({ content: interactionElements.noAdminButtonPermission[interaction.locale || 'en-US'], ephemeral: true });
    }else if(interaction.customId === 'kick_confirm'){
      if (interaction.memberPermissions?.has('Administrator') || interaction.memberPermissions?.has('KickMembers')) {
        const successMessages: Record<Locale, { title: string, userField: string, reasonField: string, noReason: string }> = {
          'id': { title: '👋 Mengeluarkan {user} Berhasil', userField: 'Nama Pengguna', reasonField: 'Alasan', noReason: 'Tidak Ada Alasan' },
          'da': { title: '👋 Udmeldelse af {user} Lykkedes', userField: 'Brugernavn', reasonField: 'Grund', noReason: 'Ingen Grund Angivet' },
          'de': { title: '👋 {user} erfolgreich gekickt', userField: 'Benutzername', reasonField: 'Grund', noReason: 'Kein Grund Angegeben' },
          'en-GB': { title: '👋 Kicked {user} Successfully', userField: 'Username', reasonField: 'Reason', noReason: 'No Reason Specified' },
          'en-US': { title: '👋 Kicked {user} Successfully', userField: 'Username', reasonField: 'Reason', noReason: 'No Reason Specified' },
          'es-ES': { title: '👋 Expulsado {user} Exitosamente', userField: 'Nombre de Usuario', reasonField: 'Razón', noReason: 'Sin Razón Especificada' },
          'es-419': { title: '👋 Expulsado {user} Exitosamente', userField: 'Nombre de Usuario', reasonField: 'Razón', noReason: 'Sin Razón Especificada' },
          'fr': { title: '👋 Expulsion de {user} Réussie', userField: 'Nom d\'Utilisateur', reasonField: 'Raison', noReason: 'Aucune Raison Spécifiée' },
          'hr': { title: '👋 Ispuštanje {user} Uspješno', userField: 'Korisničko Ime', reasonField: 'Razlog', noReason: 'Nema Navedenog Razloga' },
          'it': { title: '👋 {user} Espulso con Successo', userField: 'Nome Utente', reasonField: 'Motivo', noReason: 'Nessun Motivo Specificato' },
          'lt': { title: '👋 {user} Išmestas Sėkmingai', userField: 'Vartotojo Vardas', reasonField: 'Priežastis', noReason: 'Nenurodyta Priežastis' },
          'hu': { title: '👋 {user} Sikeresen Kirúgva', userField: 'Felhasználónév', reasonField: 'Ok', noReason: 'Nincs Megadva Ok' },
          'nl': { title: '👋 {user} Succesvol Verwijderd', userField: 'Gebruikersnaam', reasonField: 'Reden', noReason: 'Geen Reden Opgegeven' },
          'no': { title: '👋 Utestengt {user} Vellykket', userField: 'Brukernavn', reasonField: 'Årsak', noReason: 'Ingen Angitt Årsak' },
          'pl': { title: '👋 {user} Pomyślnie Wyrzucony', userField: 'Nazwa Użytkownika', reasonField: 'Powód', noReason: 'Nie Podano Powodu' },
          'pt-BR': { title: '👋 {user} Removido com Sucesso', userField: 'Nome de Usuário', reasonField: 'Motivo', noReason: 'Nenhum Motivo Especificado' },
          'ro': { title: '👋 {user} Îndepărtat cu Succes', userField: 'Nume Utilizator', reasonField: 'Motiv', noReason: 'Niciun Motiv Specificat' },
          'fi': { title: '👋 {user} Poistettu Onnistuneesti', userField: 'Käyttäjänimi', reasonField: 'Syy', noReason: 'Ei Määriteltyä Syytä' },
          'sv-SE': { title: '👋 {user} Framgångsrikt Utkastad', userField: 'Användarnamn', reasonField: 'Orsak', noReason: 'Ingen Angiven Orsak' },
          'vi': { title: '👋 {user} Đã Bị Kicked Thành Công', userField: 'Tên Người Dùng', reasonField: 'Lý Do', noReason: 'Không Có Lý Do Được Chỉ Định' },
          'tr': { title: '👋 {user} Başarıyla Atıldı', userField: 'Kullanıcı Adı', reasonField: 'Neden', noReason: 'Belirtilen Neden Yok' },
          'cs': { title: '👋 {user} Úspěšně Vykopnut', userField: 'Uživatelské Jméno', reasonField: 'Důvod', noReason: 'Není Uveden Důvod' },
          'el': { title: '👋 {user} Απελάθηκε Επιτυχώς', userField: 'Όνομα Χρήστη', reasonField: 'Λόγος', noReason: 'Δεν Έχει Καθοριστεί Λόγος' },
          'bg': { title: '👋 {user} Успешно Изгонен', userField: 'Потребителско Име', reasonField: 'Причина', noReason: 'Не Е Посочена Причина' },
          'ru': { title: '👋 {user} Успешно Кикнут', userField: 'Имя Пользователя', reasonField: 'Причина', noReason: 'Причина Не Указана' },
          'uk': { title: '👋 {user} Успішно Виключено', userField: 'Ім\'я Користувача', reasonField: 'Причина', noReason: 'Причина Не Вказана' },
          'hi': { title: '👋 {user} को सफलतापूर्वक बाहर किया गया', userField: 'उपयोगकर्ता नाम', reasonField: 'कारण', noReason: 'कोई कारण निर्दिष्ट नहीं किया गया' },
          'th': { title: '👋 เตะ {user} สำเร็จ', userField: 'ชื่อผู้ใช้', reasonField: 'เหตุผล', noReason: 'ไม่ได้ระบุเหตุผล' },
          'zh-CN': { title: '👋 成功踢出 {user}', userField: '用户名', reasonField: '原因', noReason: '未指定原因' },
          'ja': { title: '👋 {user} を正常に追放しました', userField: 'ユーザー名', reasonField: '理由', noReason: '指定された理由はありません' },
          'zh-TW': { title: '👋 成功踢出 {user}', userField: '用戶名', reasonField: '原因', noReason: '未指定原因' },
          'ko': { title: '👋 {user} 성공적으로 추방됨', userField: '사용자 이름', reasonField: '이유', noReason: '지정된 이유 없음' }
        };
        const kickFailureMessages: Record<Locale, { title: string, description: string }> = {
          'id': { title: '😥 Gagal mengeluarkan {user}', description: 'Pengguna yang ingin Anda keluarkan mungkin memiliki posisi lebih tinggi dari bot atau mungkin tidak berada di server ini' },
          'da': { title: '😥 Kunne ikke udstøde {user}', description: 'Brugeren, du vil udstøde, kan have en højere rolle end botten eller muligvis ikke være i denne server' },
          'de': { title: '😥 Kick von {user} fehlgeschlagen', description: 'Der zu kickende Benutzer hat möglicherweise eine höhere Position als der Bot oder ist möglicherweise nicht auf diesem Server' },
          'en-GB': { title: '😥 Failed to kick {user}', description: 'The user you are trying to kick may have a higher role than the bot or may not be in this server' },
          'en-US': { title: '😥 Failed to kick {user}', description: 'The user you are trying to kick may have a higher role than the bot or may not be in this server' },
          'es-ES': { title: '😥 No se pudo expulsar a {user}', description: 'El usuario que estás intentando expulsar puede tener un rol superior al bot o puede que no esté en este servidor' },
          'es-419': { title: '😥 No se pudo expulsar a {user}', description: 'El usuario que estás intentando expulsar puede tener un rol superior al bot o puede que no esté en este servidor' },
          'fr': { title: '😥 Impossible d\'expulser {user}', description: 'L\'utilisateur que vous essayez d\'expulser peut avoir un rôle plus élevé que le bot ou ne pas être sur ce serveur' },
          'hr': { title: '😥 Nije uspjelo izbacivanje {user}', description: 'Korisnik kojeg pokušavate izbaciti možda ima višu ulogu od bota ili možda nije na ovom poslužitelju' },
          'it': { title: '😥 Impossibile espellere {user}', description: 'L\'utente che stai cercando di espellere potrebbe avere un ruolo superiore al bot o potrebbe non essere su questo server' },
          'lt': { title: '😥 Nepavyko išmesti {user}', description: 'Naudotojas, kurį bandote pašalinti, gali turėti aukštesnį vaidmenį nei botas arba gali nebūti šiame serveriuje' },
          'hu': { title: '😥 Sikertelen kilépítés {user}', description: 'A felhasználó, akit ki akarsz rúgni, lehet, hogy magasabb szerepet tölt be, mint a bot, vagy lehet, hogy nincs ezen a szerveren' },
          'nl': { title: '😥 Mislukte verwijdering van {user}', description: 'De gebruiker die je probeert te verwijderen, kan een hogere rol hebben dan de bot of misschien niet op deze server zijn' },
          'no': { title: '😥 Kunne ikke kaste ut {user}', description: 'Brukeren du prøver å kaste ut, kan ha en høyere rolle enn boten eller kan hende ikke er på denne serveren' },
          'pl': { title: '😥 Nie udało się wyrzucić {user}', description: 'Użytkownik, którego próbujesz wyrzucić, może mieć wyższą rolę niż bot lub może nie być na tym serwerze' },
          'pt-BR': { title: '😥 Falha ao remover {user}', description: 'O usuário que você está tentando remover pode ter um papel mais alto que o bot ou pode não estar neste servidor' },
          'ro': { title: '😥 Nu am reușit să elimin {user}', description: 'Utilizatorul pe care încerci să-l elimini poate avea un rol mai mare decât botul sau poate să nu fie pe acest server' },
          'fi': { title: '😥 {user} poistaminen epäonnistui', description: 'Käyttäjällä, jota yrität poistaa, saattaa olla korkeamman tason rooli kuin botti tai hän ei ehkä ole tällä palvelimella' },
          'sv-SE': { title: '😥 Misslyckades med att kicka {user}', description: 'Användaren du försöker kicka kan ha en högre roll än botten eller kan vara frånvarande på denna server' },
          'vi': { title: '😥 Không thể kick {user}', description: 'Người dùng bạn đang cố gắng kick có thể có quyền cao hơn bot hoặc có thể không có mặt trên máy chủ này' },
          'tr': { title: '😥 {user} Atılamadı', description: 'Kaldırmak istediğiniz kullanıcı botun rolünden yüksek olabilir veya bu sunucuda olmayabilir' },
          'cs': { title: '😥 Selhalo vyhození {user}', description: 'Uživatel, kterého se pokoušíte vyhodit, může mít vyšší roli než bot nebo nemusí být na tomto serveru' },
          'el': { title: '😥 Αποτυχία αποπομπής του {user}', description: 'Ο χρήστης που προσπαθείτε να απελάσετε μπορεί να έχει υψηλότερο ρόλο από το bot ή μπορεί να μην είναι σε αυτόν τον διακομιστή' },
          'bg': { title: '😥 Неуспешно изгонване на {user}', description: 'Потребителят, когото се опитвате да изгоните, може да има по-висока роля от бота или може да не е на този сървър' },
          'ru': { title: '😥 Не удалось кикнуть {user}', description: 'Пользователь, которого вы пытаетесь кикнуть, может иметь более высокую роль, чем бот, или его может не быть на этом сервере' },
          'uk': { title: '😥 Не вдалося виключити {user}', description: 'Користувач, якого ви намагаєтеся виключити, може мати вищу роль, ніж бот, або можливо його немає на цьому сервері' },
          'hi': { title: '😥 {user} को बाहर करने में विफल', description: 'जिस उपयोगकर्ता को आप बाहर करने की कोशिश कर रहे हैं, वह बोट से अधिक उच्च भूमिका में हो सकता है या इस सर्वर पर नहीं हो सकता' },
          'th': { title: '😥 ไม่สามารถเตะ {user} ได้', description: 'ผู้ใช้ที่คุณพยายามเตะอาจมีตำแหน่งสูงกว่าบอทหรืออาจไม่อยู่ในเซิร์ฟเวอร์นี้' },
          'zh-CN': { title: '😥 踢出 {user} 失败', description: '您尝试踢出的用户可能拥有比机器人更高的角色，或者可能不在此服务器上' },
          'ja': { title: '😥 {user} の追放に失敗しました', description: '追放しようとしているユーザーは、ボットよりも高い役職を持っているか、サーバーにいない可能性があります' },
          'zh-TW': { title: '😥 無法踢出 {user}', description: '您嘗試踢出的用戶可能擁有比機器人更高的角色，或者可能不在此伺服器上' },
          'ko': { title: '😥 {user} 추방 실패', description: '추방하려는 사용자가 봇보다 높은 역할을 가졌거나 이 서버에 없을 수 있습니다' }
        };
    
        const userIdMatch = interaction.message.embeds[0].fields[0].value.match(/<@!?(\d+)>/);
        if (!userIdMatch) {
          await interaction.reply({ content: 'User not found!', ephemeral: true });
          await wait(10_000);
          const message = await interaction.fetchReply();
          await message.delete();
          return;
        };
        const userId = userIdMatch[1];
        const user = interaction.guild?.members.cache.get(userId);
        if(!user){
          try{
            return await interaction.update({ content: '❓・User not found', embeds: [], components: [] });
          }catch{
            try{ return await interaction.reply({ content: '❓・User not found', ephemeral: true }); }
            catch{ return }
          };
        };
    
        const messages_successMessages = successMessages[interaction.guildLocale || 'en-US'];
        const messages_banFailureMessages = kickFailureMessages[interaction.guildLocale || 'en-US'];
      
        const userDisplayName = user?.displayName || 'Unknown User';
        const userAvatarURL = user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
        try{
          if(interaction.message.embeds[0].fields[1].value != messages_successMessages.noReason){
            const reason = interaction.message.embeds[0].fields[1].value
            await user?.kick( reason );
          } else await user?.kick();
        }catch(error){
          const embed = (new EmbedBuilder()
            .setAuthor({ name: userDisplayName, iconURL: userAvatarURL })
            .setTitle(userDisplayName ? messages_banFailureMessages.title.replace('{user}', userDisplayName) : messages_banFailureMessages.title)
            .setThumbnail(userAvatarURL)
            .setDescription(messages_banFailureMessages.description)
            .addFields(
              { name: messages_successMessages.userField, value: `<@${user?.id}>  `+'(`'+user?.id+'`)' },
              { name: messages_successMessages.reasonField, value: interaction.message.embeds[0].fields[1].value ?? messages_successMessages.noReason },
              { name: '\u200B', value: '\u200B' },
            )
            .setColor(0xff4242)
            .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
            .setTimestamp()
          );
          const message = await interaction.update({ embeds: [embed], components: [] })
          await wait(20_000);
          await message.delete();
          return;
        };
    
        const success_embed = (new EmbedBuilder()
          .setAuthor({ name: userDisplayName, iconURL: userAvatarURL })
          .setTitle(userDisplayName ? messages_successMessages.title.replace('{user}', userDisplayName) : messages_successMessages.title)
          .setThumbnail(userAvatarURL)
          .addFields(
              { name: messages_successMessages.userField, value: `<@${user?.id}>  `+'(`'+user?.id+'`)' },
              { name: messages_successMessages.reasonField, value: interaction.message.embeds[0].fields[1].value ?? messages_successMessages.noReason },
              { name: '\u200B', value: '\u200B' },
          )
          .setColor(0xff4242)
          .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
          .setTimestamp()
        );
    
        const message = await interaction.update({ embeds: [success_embed], components: [] });
        await wait(20_000);
        await message.delete();
      } else {
        const permis_kickMessages: Record<Locale, string> = {
          'th': 'คุณไม่มีสิทธิ์ `เตะสมาชิก` เพื่อที่จะเตะสมาชิก',
          'id': 'Anda tidak punya hak untuk `menendang anggota` demi menendang anggota',
          'da': 'Du har ikke rettigheder til `at sparke medlem` for at sparke medlem',
          'de': 'Du hast keine Rechte um `Mitglied zu kicken` um Mitglied zu kicken',
          'en-GB': "You don't have rights to `kick member` in order to kick member",
          'en-US': "You don't have rights to `kick member` in order to kick member",
          'es-ES': 'No tienes derechos para `expulsar miembro` para expulsar miembro',
          'es-419': 'No tienes derechos para `expulsar miembro` para expulsar miembro',
          'fr': "Vous n'avez pas de droits pour `expulser membre` afin d'expulser membre",
          'hr': 'Nemate prava za `izbaciti člana` da izbacite člana',
          'it': 'Non hai diritti per `cacciare membro` per cacciare membro',
          'lt': 'Neturite teisių `išmesti narį` kad išmesti narį',
          'hu': 'Nincs joga `tagot kirúgni` hogy kirúgja a tagot',
          'nl': 'Je hebt geen rechten om `lid te schoppen` om lid te schoppen',
          'no': 'Du har ikke rettigheter til å `sparke medlem` for å sparke medlem',
          'pl': 'Nie masz praw do `wyrzucić członka` aby wyrzucić członka',
          'pt-BR': 'Você não tem direitos para `expelir membro` para expulsar membro',
          'ro': 'Nu aveți drepturi pentru a `împinge membru` pentru a împinge membru',
          'fi': 'Sinulla ei ole oikeuksia `potkaista jäsentä` jotta voit potkaista jäsentä',
          'sv-SE': 'Du har inga rättigheter att `sparka medlem` för att sparka medlem',
          'vi': 'Bạn không có quyền `đá thành viên` để đá thành viên',
          'tr': '`Üyeyi atmak` için haklarınız yok',
          'cs': 'Nemáte práva `vyloučit člena` pro vyloučení člena',
          'el': 'Δεν έχετε δικαιώματα για `απομάκρυνση μέλους` για να απομακρύνετε μέλος',
          'bg': 'Нямате права да `изгоните член` за да изгоните член',
          'ru': 'У вас нет прав `выгнать участника` чтобы выгнать участника',
          'uk': 'У вас немає прав `вигнати учасника` щоб вигнати учасника',
          'hi': 'आपके पास अधिकार नहीं हैं `सदस्य को बाहर निकालें` सदस्य को बाहर निकालने के लिए',
          'zh-CN': '你没有权利 `踢出成员` 来踢出成员',
          'ja': 'あなたには `メンバーを追い出す` 権限がありません',
          'zh-TW': '你沒有權利 `踢出成員` 來踢出成員',
          'ko': '당신에게는 `멤버를 내보낼` 권리가 없습니다'
      };
        await interaction.reply({ content: permis_kickMessages[interaction.locale || 'en-US'], ephemeral: true })
      }
    }else if(interaction.customId === 'kick_cancel'){
      const userId = interaction.message.embeds[0].fields[0].value.replace(/\D/g, '');
      if(!userId){
        await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
        await wait(10_000);
        const message = await interaction.fetchReply();
        await message.delete();
        return;
      };
      const user = interaction.guild.members.cache.get(userId);
      if(!user){
        try{
          return await interaction.update({ content: '❓・User not found', embeds: [], components: [] });
        }catch{
          try{ return await interaction.reply({ content: '❓・User not found', ephemeral: true }); }
          catch{ return }
        };
      };
  
      const cancelMessages: Record<Locale, { title: string }> = {
        'id': { title: '🚫 Pembatalan Pengeluaran {user}' },
        'da': { title: '🚫 Afbrydelse af Udflytning {user}' },
        'de': { title: '🚫 Kick-Abbruch von {user}' },
        'en-GB': { title: '🚫 Kick Cancellation for {user}' },
        'en-US': { title: '🚫 Kick Cancellation for {user}' },
        'es-ES': { title: '🚫 Cancelación de Expulsión de {user}' },
        'es-419': { title: '🚫 Cancelación de Expulsión de {user}' },
        'fr': { title: '🚫 Annulation de l\'expulsion de {user}' },
        'hr': { title: '🚫 Otkaženo izbacivanje {user}' },
        'it': { title: '🚫 Cancellazione del Kick di {user}' },
        'lt': { title: '🚫 Išmetimo Atšaukimas {user}' },
        'hu': { title: '🚫 {user} Kitiltásának Megszakítása' },
        'nl': { title: '🚫 Annulering van {user} Kick' },
        'no': { title: '🚫 Avbryt Kick av {user}' },
        'pl': { title: '🚫 Anulowanie Wyrzucenia {user}' },
        'pt-BR': { title: '🚫 Cancelamento de Kick de {user}' },
        'ro': { title: '🚫 Anulare Kick pentru {user}' },
        'fi': { title: '🚫 Kickin Peruutus {user}' },
        'sv-SE': { title: '🚫 Kick-avbokning för {user}' },
        'vi': { title: '🚫 Hủy Kick {user}' },
        'tr': { title: '🚫 {user} Kick İptali' },
        'cs': { title: '🚫 Zrušení Kicky pro {user}' },
        'el': { title: '🚫 Ακύρωση Αποβολής {user}' },
        'bg': { title: '🚫 Отмяна на Изгонването на {user}' },
        'ru': { title: '🚫 Отмена кика {user}' },
        'uk': { title: '🚫 Скасування вигнання {user}' },
        'hi': { title: '🚫 {user} के लिए किक रद्द' },
        'th': { title: '🚫 ยกเลิกการเตะ {user}' },
        'zh-CN': { title: '🚫 取消对 {user} 的踢出' },
        'ja': { title: '🚫 {user} のキックをキャンセルしました' },
        'zh-TW': { title: '🚫 取消對 {user} 的踢出' },
        'ko': { title: '🚫 {user} 차단 취소' }
      };
  
      const embed = new EmbedBuilder()
        .setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
        .setTitle(cancelMessages[interaction.guildLocale || 'en-US'].title.replace('{user}', user.displayName))
        .setThumbnail(user.displayAvatarURL())
        .addFields({ name: '\u200B', value: '\u200B' })
        .setColor(0xff4242)
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setTimestamp();
  
      const message = await interaction.update({ embeds: [embed], components: [] });
      await wait(10_000);
      await message.delete();
    }else if(interaction.customId === 'kick_reason'){
      return await interaction.showModal(interactionElements.kick_reason_modal(interaction));
    };
    }catch(error){ throw error };
  }

  // Timeout Command \\
  if(interaction.customId.startsWith('timeout')){
    if(!interaction.guild)return;try{
    if(!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) || !interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)){
      return await interaction.reply({ content: interactionElements.noAdminButtonPermission[interaction.locale || 'en-US'], ephemeral: true });
    }else if(interaction.customId === 'timeout_confirm'){
      const successMessages: Record<Locale, { title: string, userField: string, durationField: string, reasonField: string, noReason: string }> = {
        'id': { title: '🕛 Berhasil membisukan {user}', userField: 'Nama Pengguna', durationField: 'Durasi', reasonField: 'Alasan', noReason: 'Tidak Ada Alasan' },
        'da': { title: '🕛 {user} er blevet sat på timeout', userField: 'Brugernavn', durationField: 'Varighed', reasonField: 'Grund', noReason: 'Ingen Grund Angivet' },
        'de': { title: '🕛 {user} wurde erfolgreich stummgeschaltet', userField: 'Benutzername', durationField: 'Dauer', reasonField: 'Grund', noReason: 'Kein Grund Angegeben' },
        'en-GB': { title: '🕛 Successfully timed out {user}', userField: 'Username', durationField: 'Duration', reasonField: 'Reason', noReason: 'No Reason Specified' },
        'en-US': { title: '🕛 Successfully timed out {user}', userField: 'Username', durationField: 'Duration', reasonField: 'Reason', noReason: 'No Reason Specified' },
        'es-ES': { title: '🕛 Silenciado {user} exitosamente', userField: 'Nombre de Usuario', durationField: 'Duración', reasonField: 'Razón', noReason: 'Sin Razón Especificada' },
        'es-419': { title: '🕛 Silenciado {user} exitosamente', userField: 'Nombre de Usuario', durationField: 'Duración', reasonField: 'Razón', noReason: 'Sin Razón Especificada' },
        'fr': { title: '🕛 Mise en timeout de {user} réussie', userField: 'Nom d\'Utilisateur', durationField: 'Durée', reasonField: 'Raison', noReason: 'Aucune Raison Spécifiée' },
        'hr': { title: '🕛 Uspješno privremeno isključivanje {user}', userField: 'Korisničko Ime', durationField: 'Trajanje', reasonField: 'Razlog', noReason: 'Nema Navedenog Razloga' },
        'it': { title: '🕛 {user} silenziato temporaneamente con successo', userField: 'Nome Utente', durationField: 'Durata', reasonField: 'Motivo', noReason: 'Nessun Motivo Specificato' },
        'lt': { title: '🕛 Sėkmingai laikinai užtildytas {user}', userField: 'Vartotojo Vardas', durationField: 'Trukmė', reasonField: 'Priežastis', noReason: 'Nenurodyta Priežastis' },
        'hu': { title: '🕛 {user} sikeresen időkorlátozva', userField: 'Felhasználónév', durationField: 'Időtartam', reasonField: 'Ok', noReason: 'Nincs Megadva Ok' },
        'nl': { title: '🕛 {user} succesvol getimed-out', userField: 'Gebruikersnaam', durationField: 'Duur', reasonField: 'Reden', noReason: 'Geen Reden Opgegeven' },
        'no': { title: '🕛 {user} er satt på timeout', userField: 'Brukernavn', durationField: 'Varighet', reasonField: 'Årsak', noReason: 'Ingen Angitt Årsak' },
        'pl': { title: '🕛 Pomyślnie wyciszono {user}', userField: 'Nazwa Użytkownika', durationField: 'Czas trwania', reasonField: 'Powód', noReason: 'Nie Podano Powodu' },
        'pt-BR': { title: '🕛 Timeout em {user} aplicado com sucesso', userField: 'Nome de Usuário', durationField: 'Duração', reasonField: 'Motivo', noReason: 'Nenhum Motivo Especificado' },
        'ro': { title: '🕛 Timeout aplicat cu succes lui {user}', userField: 'Nume Utilizator', durationField: 'Durată', reasonField: 'Motiv', noReason: 'Niciun Motiv Specificat' },
        'fi': { title: '🕛 Käyttäjälle {user} onnistuneesti asetettu aikakatkaisu', userField: 'Käyttäjänimi', durationField: 'Kesto', reasonField: 'Syy', noReason: 'Ei Määriteltyä Syytä' },
        'sv-SE': { title: '🕛 Timeout för {user} har angetts', userField: 'Användarnamn', durationField: 'Varaktighet', reasonField: 'Orsak', noReason: 'Ingen Angiven Orsak' },
        'vi': { title: '🕛 Đã tạm ngưng hoạt động của {user} thành công', userField: 'Tên Người Dùng', durationField: 'Thời lượng', reasonField: 'Lý Do', noReason: 'Không Có Lý Do Được Chỉ Định' },
        'tr': { title: '🕛 {user} adlı kullanıcı başarıyla zaman aşımına uğratıldı', userField: 'Kullanıcı Adı', durationField: 'Süre', reasonField: 'Neden', noReason: 'Belirtilen Neden Yok' },
        'cs': { title: '🕛 Uživatel {user} byl úspěšně ztlumen', userField: 'Uživatelské Jméno', durationField: 'Trvání', reasonField: 'Důvod', noReason: 'Není Uveden Důvod' },
        'el': { title: '🕛 Η αναστολή του {user} ήταν επιτυχής', userField: 'Όνομα Χρήστη', durationField: 'Διάρκεια', reasonField: 'Λόγος', noReason: 'Δεν Έχει Καθοριστεί Λόγος' },
        'bg': { title: '🕛 Успешно даден таймаут на {user}', userField: 'Потребителско Име', durationField: 'Продължителност', reasonField: 'Причина', noReason: 'Не Е Посочена Причина' },
        'ru': { title: '🕛 Пользователю {user} успешно выдан тайм-аут', userField: 'Имя Пользователя', durationField: 'Длительность', reasonField: 'Причина', noReason: 'Причина Не Указана' },
        'uk': { title: '🕛 Користувачу {user} успішно надано тайм-аут', userField: 'Ім\'я Користувача', durationField: 'Тривалість', reasonField: 'Причина', noReason: 'Причина Не Вказана' },
        'hi': { title: '🕛 {user} को सफलतापूर्वक टाइमआउट किया गया', userField: 'उपयोगकर्ता नाम', durationField: 'अवधि', reasonField: 'कारण', noReason: 'कोई कारण निर्दिष्ट नहीं किया गया' },
        'th': { title: '🕛 พักการใช้งาน {user} สำเร็จ', userField: 'ชื่อผู้ใช้', durationField: 'ระยะเวลา', reasonField: 'เหตุผล', noReason: 'ไม่ได้ระบุเหตุผล' },
        'zh-CN': { title: '🕛 成功将 {user} 超时', userField: '用户名', durationField: '持续时间', reasonField: '原因', noReason: '未指定原因' },
        'ja': { title: '🕛 {user} をタイムアウトにしました', userField: 'ユーザー名', durationField: '期間', reasonField: '理由', noReason: '指定された理由はありません' },
        'zh-TW': { title: '🕛 成功將 {user} 超時', userField: '用戶名', durationField: '持續時間', reasonField: '原因', noReason: '未指定原因' },
        'ko': { title: '🕛 {user}에게 성공적으로 타임아웃을 적용했습니다', userField: '사용자 이름', durationField: '지속 시간', reasonField: '이유', noReason: '지정된 이유 없음' }
      };const timeoutFailureMessages: Record<Locale, { title: string, description: string }> = {
        'id': { title: '😥 Gagal membisukan {user}', description: 'Pengguna yang ingin Anda bisukan mungkin memiliki posisi lebih tinggi dari bot atau bot tidak memiliki izin untuk membisukan anggota ini' },
        'da': { title: '😥 Kunne ikke give {user} timeout', description: 'Brugeren, du vil give timeout, kan have en højere rolle end botten, eller botten har muligvis ikke tilladelse til at give medlemmer timeout' },
        'de': { title: '😥 Fehler beim Stummschalten von {user}', description: 'Der Benutzer, den Sie stummschalten möchten, hat möglicherweise eine höhere Position als der Bot, oder der Bot hat keine Berechtigung, Mitglieder stummzuschalten' },
        'en-GB': { title: '😥 Failed to timeout {user}', description: 'The user you are trying to timeout may have a higher role than the bot, or the bot may not have permission to timeout members' },
        'en-US': { title: '😥 Failed to timeout {user}', description: 'The user you are trying to timeout may have a higher role than the bot, or the bot may not have permission to timeout members' },
        'es-ES': { title: '😥 No se pudo silenciar a {user}', description: 'El usuario que estás intentando silenciar puede tener un rol superior al bot, o el bot puede no tener permiso para silenciar miembros' },
        'es-419': { title: '😥 No se pudo silenciar a {user}', description: 'El usuario que estás intentando silenciar puede tener un rol superior al bot, o el bot puede no tener permiso para silenciar miembros' },
        'fr': { title: '😥 Impossible de mettre en timeout {user}', description: 'L\'utilisateur que vous essayez de mettre en timeout peut avoir un rôle plus élevé que le bot, ou le bot n\'a peut-être pas la permission de mettre les membres en timeout' },
        'hr': { title: '😥 Nije uspjelo privremeno isključivanje {user}', description: 'Korisnik kojeg pokušavate privremeno isključiti možda ima višu ulogu od bota ili bot možda nema dopuštenje za privremeno isključivanje članova' },
        'it': { title: '😥 Impossibile silenziare temporaneamente {user}', description: 'L\'utente che stai cercando di silenziare temporaneamente potrebbe avere un ruolo superiore al bot, oppure il bot potrebbe non avere il permesso di silenziare i membri' },
        'lt': { title: '😥 Nepavyko laikinai užtildyti {user}', description: 'Naudotojas, kurį bandote laikinai užtildyti, gali turėti aukštesnį vaidmenį nei botas arba botas neturi leidimo laikinai užtildyti narius' },
        'hu': { title: '😥 Sikertelen időkorlátozás {user}', description: 'A felhasználó, akit időkorlátozni próbálsz, lehet, hogy magasabb szerepet tölt be, mint a bot, vagy a botnak nincs engedélye tagok időkorlátozására' },
        'nl': { title: '😥 Mislukte timeout van {user}', description: 'De gebruiker die je probeert te timen-out kan een hogere rol hebben dan de bot, of de bot heeft mogelijk geen toestemming om leden te timen-out' },
        'no': { title: '😥 Kunne ikke gi {user} timeout', description: 'Brukeren du prøver å gi timeout kan ha en høyere rolle enn boten, eller boten har kanskje ikke tillatelse til å gi medlemmer timeout' },
        'pl': { title: '😥 Nie udało się wyciszyć {user} na jakiś czas', description: 'Użytkownik, którego próbujesz wyciszyć na jakiś czas, może mieć wyższą rolę niż bot lub bot może nie mieć uprawnień do wyciszania członków' },
        'pt-BR': { title: '😥 Falha ao dar timeout em {user}', description: 'O usuário que você está tentando dar timeout pode ter um cargo superior ao do bot, ou o bot pode não ter permissão para dar timeout em membros' },
        'ro': { title: '😥 Nu am reușit să acord un timeout lui {user}', description: 'Utilizatorul căruia încerci să-i acorzi un timeout poate avea un rol mai mare decât botul sau botul s-ar putea să nu aibă permisiunea de a acorda timeout membrilor' },
        'fi': { title: '😥 Käyttäjän {user} aikakatkaisun asettaminen epäonnistui', description: 'Käyttäjällä, jolle yrität asettaa aikakatkaisua, saattaa olla korkeampi rooli kuin botilla, tai botilla ei ehkä ole lupaa asettaa jäsenille aikakatkaisua' },
        'sv-SE': { title: '😥 Misslyckades med att ge {user} en timeout', description: 'Användaren du försöker ge en timeout kan ha en högre roll än boten, eller så kanske boten inte har behörighet att ge medlemmar en timeout' },
        'vi': { title: '😥 Không thể tạm ngưng hoạt động của {user}', description: 'Người dùng bạn đang cố gắng tạm ngưng hoạt động có thể có quyền cao hơn bot hoặc bot có thể không có quyền tạm ngưng hoạt động của thành viên' },
        'tr': { title: '😥 {user} için zaman aşımı uygulanamadı', description: 'Zaman aşımı uygulamaya çalıştığınız kullanıcının botun rolünden yüksek bir rolü olabilir veya botun üyeleri zaman aşımına uğratma izni olmayabilir' },
        'cs': { title: '😥 Selhalo udělení časového limitu uživateli {user}', description: 'Uživatel, kterému se pokoušíte udělit časový limit, může mít vyšší roli než bot, nebo bot nemusí mít oprávnění udělovat členům časový limit' },
        'el': { title: '😥 Αποτυχία θέσης σε αναστολή του {user}', description: 'Ο χρήστης που προσπαθείτε να θέσετε σε αναστολή μπορεί να έχει υψηλότερο ρόλο από το bot ή το bot ενδέχεται να μην έχει την άδεια να θέτει μέλη σε αναστολή' },
        'bg': { title: '😥 Неуспешно даване на таймаут на {user}', description: 'Потребителят, на когото се опитвате да дадете таймаут, може да има по-висока роля от бота или ботът може да няма разрешение да дава таймаут на членове' },
        'ru': { title: '😥 Не удалось временно заблокировать {user}', description: 'Пользователь, которого вы пытаетесь временно заблокировать, может иметь более высокую роль, чем бот, или у бота может не быть разрешения на временную блокировку участников' },
        'uk': { title: '😥 Не вдалося тимчасово заблокувати {user}', description: 'Користувач, якого ви намагаєтеся тимчасово заблокувати, може мати вищу роль, ніж бот, або бот може не мати дозволу на тимчасове блокування учасників' },
        'hi': { title: '😥 {user} को टाइमआउट करने में विफल', description: 'जिस उपयोगकर्ता को आप टाइमआउट करने की कोशिश कर रहे हैं, उसके पास बॉट की तुलना में उच्च भूमिका हो सकती है, या बॉट के पास सदस्यों को टाइमआउट करने की अनुमति नहीं हो सकती है' },
        'th': { title: '😥 ไม่สามารถพักการใช้งาน {user} ได้', description: 'ผู้ใช้ที่คุณพยายามพักการใช้งานอาจมีตำแหน่งสูงกว่าบอท หรือบอทอาจไม่มีสิทธิ์พักการใช้งานสมาชิก' },
        'zh-CN': { title: '😥 无法对 {user} 执行禁言', description: '您尝试禁言的用户可能拥有比机器人更高的角色，或者机器人可能没有禁言成员的权限' },
        'ja': { title: '😥 {user} のタイムアウトに失敗しました', description: 'タイムアウトさせようとしているユーザーは、ボットよりも高い役職を持っているか、ボットにメンバーをタイムアウトさせる権限がない可能性があります' },
        'zh-TW': { title: '😥 無法對 {user} 執行禁言', description: '您嘗試禁言的用戶可能擁有比機器人更高的角色，或者機器人可能沒有禁言成員的權限' },
        'ko': { title: '😥 {user}에게 타임아웃을 적용하지 못했습니다', description: '타임아웃시키려는 사용자가 봇보다 높은 역할을 가졌거나, 봇에게 회원을 타임아웃시킬 권한이 없을 수 있습니다' }
      };
  
      const durationText = interaction.message.embeds[0].fields[1].value;
      const duration = parseDuration(durationText, interaction.guildLocale || 'en-US');
      const reason = interaction.message.embeds[0].fields[2].value;
      const userId = interaction.message.embeds[0].fields[0].value.replace(/\D/g, '');
      if(!userId){
        const message = await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
        await wait(10_000);
        await message.delete();
        return;
      };
      const user = interaction.guild?.members.cache.get(userId);
      if(!user){
        try{
          const message = await interaction.update({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, embeds: [], components: [] });
          await wait(10_000);
          return await message.delete();
        }catch{
          try{
            const message = await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, ephemeral: true });
            await wait(10_000);
            return await message.delete();
          }catch{ return }
        };
      };
  
      const messages_successMessages = successMessages[interaction.guildLocale || 'en-US'];
      const messages_timeoutFailureMessages = timeoutFailureMessages[interaction.guildLocale || 'en-US'];
  
      try{
        if(reason != messages_successMessages.noReason){
          await user.timeout(duration, reason);
        }else await user.timeout(duration);
      }catch(error){
        const embed = (new EmbedBuilder()
          .setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
          .setTitle(user.displayName ? messages_timeoutFailureMessages.title.replace('{user}', user.displayName) : messages_timeoutFailureMessages.title)
          .setThumbnail(user.displayAvatarURL())
          .setDescription(messages_timeoutFailureMessages.description)
          .addFields(
            { name: messages_successMessages.userField, value: `<@${user?.id}>  `+'(`'+user?.id+'`)' },
            { name: messages_successMessages.durationField, value: durationText },
            { name: messages_successMessages.reasonField, value: reason ?? messages_successMessages.noReason },
            { name: '\u200B', value: '\u200B' },
          )
          .setColor(0xff4242)
          .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
          .setTimestamp()
        );
        const message = await interaction.update({ embeds: [embed], components: [] })
        await wait(20_000);
        await message.delete();
        return;
      };
  
      const success_embed = (new EmbedBuilder()
        .setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
        .setTitle(user.displayName ? messages_successMessages.title.replace('{user}', user.displayName) : messages_successMessages.title)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
            { name: messages_successMessages.userField, value: `<@${user?.id}>  `+'(`'+user?.id+'`)' },
            { name: messages_successMessages.durationField, value: durationText },
            { name: messages_successMessages.reasonField, value: reason ?? messages_successMessages.noReason },
            { name: '\u200B', value: '\u200B' },
        )
        .setColor(0xff4242)
        .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
        .setTimestamp()
      );
  
      const message = await interaction.update({ embeds: [success_embed], components: [] });
      await wait(20_000);
      await message.delete();
    }else if(interaction.customId === 'timeout_cancel'){
      const userId = interaction.message.embeds[0].fields[0].value.replace(/\D/g, '');
      const user = interaction.guild.members.cache.get(userId);
  
      const cancelMessages: Record<Locale, { title: string }> = {
        'id': { title: '🚫 Pembatalan Pembisuan {user}' },
        'da': { title: '🚫 Annullering af Timeout for {user}' },
        'de': { title: '🚫 Abbruch der Stummschaltung von {user}' },
        'en-GB': { title: '🚫 Timeout Cancellation for {user}' },
        'en-US': { title: '🚫 Timeout Cancellation for {user}' },
        'es-ES': { title: '🚫 Cancelación del Silencio de {user}' },
        'es-419': { title: '🚫 Cancelación del Silencio de {user}' },
        'fr': { title: '🚫 Annulation du Timeout de {user}' },
        'hr': { title: '🚫 Otkaži privremeno isključivanje {user}' },
        'it': { title: '🚫 Annullamento del Timeout di {user}' },
        'lt': { title: '🚫 Laikino Užtildymo Atšaukimas {user}' },
        'hu': { title: '🚫 {user} Időkorlátozásának Megszakítása' },
        'nl': { title: '🚫 Annulering van Timeout voor {user}' },
        'no': { title: '🚫 Avbryt Timeout for {user}' },
        'pl': { title: '🚫 Anulowanie Wyciszenia {user}' },
        'pt-BR': { title: '🚫 Cancelamento do Timeout de {user}' },
        'ro': { title: '🚫 Anulare Timeout pentru {user}' },
        'fi': { title: '🚫 Aikakatkaisun Peruutus {user}' },
        'sv-SE': { title: '🚫 Avbokning av Timeout för {user}' },
        'vi': { title: '🚫 Hủy Tạm Ngưng Hoạt Động {user}' },
        'tr': { title: '🚫 {user} Zaman Aşımı İptali' },
        'cs': { title: '🚫 Zrušení Časového Limitu pro {user}' },
        'el': { title: '🚫 Ακύρωση Αναστολής {user}' },
        'bg': { title: '🚫 Отмяна на Времеаут за {user}' },
        'ru': { title: '🚫 Отмена тайм-аута для {user}' },
        'uk': { title: '🚫 Скасування тайм-ауту для {user}' },
        'hi': { title: '🚫 {user} के लिए टाइमआउट रद्द' },
        'th': { title: '🚫 ยกเลิกการพักการใช้งาน {user}' },
        'zh-CN': { title: '🚫 取消对 {user} 的禁言' },
        'ja': { title: '🚫 {user} のタイムアウトをキャンセルしました' },
        'zh-TW': { title: '🚫 取消對 {user} 的禁言' },
        'ko': { title: '🚫 {user} 타임아웃 취소' }
      };
  
      const embed = (new EmbedBuilder()
        .setAuthor({ name: user?.displayName || null, iconURL: user?.displayAvatarURL() || null })
        .setTitle(cancelMessages[interaction.guildLocale || 'en-US'].title.replace('{user}', user?.displayName || ''))
        .setThumbnail(user?.displayAvatarURL() || null)
        .addFields({ name: '\u200B', value: '\u200B' })
        .setColor(0xff4242)
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setTimestamp()
      );
  
      const message = await interaction.update({ embeds: [embed], components: [] });
      await wait(10_000);
      await message.delete();
    }else if(interaction.customId === 'timeout_reason'){
      return await interaction.showModal(interactionElements.timeout_reason_modal(interaction));
    };
    }catch(error){ throw error };
  }if(interaction.customId.startsWith('untimeout')){
    if(!interaction.guild)return;try{
    if(!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) || !interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)){
      return await interaction.reply({ content: interactionElements.noAdminButtonPermission[interaction.locale || 'en-US'], ephemeral: true });
    }else if(interaction.customId === 'untimeout_confirm'){
      const successUntimeoutMessages: Record<Locale, { title: string, userField: string }> = {
        'id': { title: '🔓 Berhasil mengakhiri pembisuan {user}', userField: 'Nama Pengguna' },
        'da': { title: '🔓 Timeout for {user} er fjernet', userField: 'Brugernavn' },
        'de': { title: '🔓 Stummschaltung von {user} erfolgreich aufgehoben', userField: 'Benutzername' },
        'en-GB': { title: '🔓 Successfully removed timeout from {user}', userField: 'Username' },
        'en-US': { title: '🔓 Successfully removed timeout from {user}', userField: 'Username' },
        'es-ES': { title: '🔓 Silencio de {user} removido exitosamente', userField: 'Nombre de Usuario' },
        'es-419': { title: '🔓 Silencio de {user} removido exitosamente', userField: 'Nombre de Usuario' },
        'fr': { title: '🔓 Timeout de {user} retiré avec succès', userField: 'Nom d\'Utilisateur' },
        'hr': { title: '🔓 Uspješno uklonjeno privremeno isključivanje za {user}', userField: 'Korisničko Ime' },
        'it': { title: '🔓 Timeout rimosso con successo da {user}', userField: 'Nome Utente' },
        'lt': { title: '🔓 Sėkmingai pašalintas {user} laikinas užtildymas', userField: 'Vartotojo Vardas' },
        'hu': { title: '🔓 {user} időkorlátozása sikeresen feloldva', userField: 'Felhasználónév' },
        'nl': { title: '🔓 Timeout van {user} succesvol verwijderd', userField: 'Gebruikersnaam' },
        'no': { title: '🔓 Timeout for {user} er fjernet', userField: 'Brukernavn' },
        'pl': { title: '🔓 Pomyślnie usunięto wyciszenie dla {user}', userField: 'Nazwa Użytkownika' },
        'pt-BR': { title: '🔓 Timeout de {user} removido com sucesso', userField: 'Nome de Usuário' },
        'ro': { title: '🔓 Timeout eliminat cu succes pentru {user}', userField: 'Nume Utilizator' },
        'fi': { title: '🔓 Aikakatkaisu käyttäjältä {user} poistettu onnistuneesti', userField: 'Käyttäjänimi' },
        'sv-SE': { title: '🔓 Timeout för {user} har tagits bort', userField: 'Användarnamn' },
        'vi': { title: '🔓 Đã gỡ bỏ tạm ngưng hoạt động của {user} thành công', userField: 'Tên Người Dùng' },
        'tr': { title: '🔓 {user} üzerindeki zaman aşımı başarıyla kaldırıldı', userField: 'Kullanıcı Adı' },
        'cs': { title: '🔓 Časový limit pro uživatele {user} byl úspěšně odebrán', userField: 'Uživatelské Jméno' },
        'el': { title: '🔓 Η αναστολή του {user} αφαιρέθηκε επιτυχώς', userField: 'Όνομα Χρήστη' },
        'bg': { title: '🔓 Времеаутът на {user} беше успешно премахнат', userField: 'Потребителско Име' },
        'ru': { title: '🔓 Тайм-аут для пользователя {user} успешно снят', userField: 'Имя Пользователя' },
        'uk': { title: '🔓 Тайм-аут для користувача {user} успішно знято', userField: 'Ім\'я Користувача' },
        'hi': { title: '🔓 {user} से सफलतापूर्वक टाइमआउट हटाया गया', userField: 'उपयोगकर्ता नाम' },
        'th': { title: '🔓 ยกเลิกการพักการใช้งาน {user} สำเร็จ', userField: 'ชื่อผู้ใช้' },
        'zh-CN': { title: '🔓 成功解除对 {user} 的禁言', userField: '用户名' },
        'ja': { title: '🔓 {user} のタイムアウトを正常に解除しました', userField: 'ユーザー名' },
        'zh-TW': { title: '🔓 成功解除對 {user} 的禁言', userField: '用戶名' },
        'ko': { title: '🔓 {user}의 타임아웃이 성공적으로 해제되었습니다', userField: '사용자 이름' }
      };
      const untimeoutFailureMessages: Record<Locale, { title: string, description: string }> = {
        'id': { title: '😥 Gagal mengakhiri pembisuan {user}', description: 'Pengguna yang ingin Anda pulihkanอาจมีตำแหน่งสูงกว่าบอท หรือบอทอาจไม่มีสิทธิ์ในการจัดการการหมดเวลาของสมาชิก' },
        'da': { title: '😥 Kunne ikke fjerne timeout for {user}', description: 'Brugeren, du vil fjerne timeout for, kan have en højere rolle end botten, eller botten har muligvis ikke tilladelse til at administrere timeouts for medlemmer' },
        'de': { title: '😥 Fehler beim Aufheben der Stummschaltung von {user}', description: 'Der Benutzer, dessen Stummschaltung Sie aufheben möchten, hat möglicherweise eine höhere Position als der Bot, oder der Bot hat keine Berechtigung zum Verwalten von Mitglieds-Timeouts' },
        'en-GB': { title: '😥 Failed to remove timeout from {user}', description: 'The user you are trying to remove the timeout from may have a higher role than the bot, or the bot may not have permission to manage member timeouts' },
        'en-US': { title: '😥 Failed to remove timeout from {user}', description: 'The user you are trying to remove the timeout from may have a higher role than the bot, or the bot may not have permission to manage member timeouts' },
        'es-ES': { title: '😥 No se pudo quitar el silencio a {user}', description: 'El usuario al que intentas quitar el silencio puede tener un rol superior al bot, o el bot puede no tener permiso para administrar los silencios de los miembros' },
        'es-419': { title: '😥 No se pudo quitar el silencio a {user}', description: 'El usuario al que intentas quitar el silencio puede tener un rol superior al bot, o el bot puede no tener permiso para administrar los silencios de los miembros' },
        'fr': { title: '😥 Impossible de retirer le timeout de {user}', description: 'L\'utilisateur dont vous essayez de retirer le timeout peut avoir un rôle plus élevé que le bot, ou le bot n\'a peut-être pas la permission de gérer les timeouts des membres' },
        'hr': { title: '😥 Nije uspjelo uklanjanje vremenskog ograničenja za {user}', description: 'Korisnik kojem pokušavate ukloniti vremensko ograničenje možda ima višu ulogu od bota ili bot možda nema dopuštenje za upravljanje vremenskim ograničenjima članova' },
        'it': { title: '😥 Impossibile rimuovere il timeout da {user}', description: 'L\'utente da cui stai cercando di rimuovere il timeout potrebbe avere un ruolo superiore al bot, oppure il bot potrebbe non avere il permesso di gestire i timeout dei membri' },
        'lt': { title: '😥 Nepavyko pašalinti {user} laiko apribojimo', description: 'Naudotojas, kuriam bandote pašalinti laiko apribojimą, gali turėti aukštesnį vaidmenį nei botas arba botas neturi leidimo valdyti narių laiko apribojimų' },
        'hu': { title: '😥 Sikertelen a timeout eltávolítása {user}-ról', description: 'A felhasználó, akiről el akarod távolítani a timeoutot, lehet, hogy magasabb szerepet tölt be, mint a bot, vagy a botnak nincs engedélye a tagok timeoutjainak kezelésére' },
        'nl': { title: '😥 Mislukte het verwijderen van de timeout van {user}', description: 'De gebruiker van wie je de timeout probeert te verwijderen, kan een hogere rol hebben dan de bot, of de bot heeft mogelijk geen toestemming om de timeouts van leden te beheren' },
        'no': { title: '😥 Kunne ikke fjerne timeouten fra {user}', description: 'Brukeren du prøver å fjerne timeouten fra, kan ha en høyere rolle enn boten, eller boten har kanskje ikke tillatelse til å administrere timeouts for medlemmer' },
        'pl': { title: '😥 Nie udało się usunąć limitu czasu dla {user}', description: 'Użytkownik, któremu próbujesz usunąć limit czasu, może mieć wyższą rolę niż bot lub bot może nie mieć uprawnień do zarządzania limitami czasu członków' },
        'pt-BR': { title: '😥 Falha ao remover o tempo limite de {user}', description: 'O usuário do qual você está tentando remover o tempo limite pode ter um cargo superior ao do bot, ou o bot pode não ter permissão para gerenciar os tempos limite dos membros' },
        'ro': { title: '😥 Nu am reușit să elimin timeout-ul pentru {user}', description: 'Utilizatorul pentru care încerci să elimini timeout-ul poate avea un rol mai mare decât botul sau botul s-ar putea să nu aibă permisiunea de a gestiona timeout-urile membrilor' },
        'fi': { title: '😥 Käyttäjän {user} aikakatkaisun poistaminen epäonnistui', description: 'Käyttäjällä, jolta yrität poistaa aikakatkaisua, saattaa olla korkeampi rooli kuin botilla, tai botilla ei ehkä ole lupaa hallita jäsenten aikakatkaisuja' },
        'sv-SE': { title: '😥 Misslyckades med att ta bort timeouten från {user}', description: 'Användaren du försöker ta bort timeouten från kan ha en högre roll än boten, eller så kanske boten inte har behörighet att hantera medlemmars timeouts' },
        'vi': { title: '😥 Không thể gỡ bỏ thời gian chờ của {user}', description: 'Người dùng bạn đang cố gắng gỡ bỏ thời gian chờ có thể có quyền cao hơn bot hoặc bot có thể không có quyền quản lý thời gian chờ của thành viên' },
        'tr': { title: '😥 {user} üzerindeki zaman aşımı kaldırılamadı', description: 'Zaman aşımını kaldırmaya çalıştığınız kullanıcının botun rolünden yüksek bir rolü olabilir veya botun üyelerin zaman aşımlarını yönetme izni olmayabilir' },
        'cs': { title: '😥 Selhalo odebrání časového limitu uživateli {user}', description: 'Uživatel, kterému se pokoušíte odebrat časový limit, může mít vyšší roli než bot, nebo bot nemusí mít oprávnění spravovat časové limity členů' },
        'el': { title: '😥 Αποτυχία κατάργησης της αναστολής του {user}', description: 'Ο χρήστης από τον οποίο προσπαθείτε να καταργήσετε την αναστολή μπορεί να έχει υψηλότερο ρόλο από το bot ή το bot ενδέχεται να μην έχει την άδεια να διαχειρίζεται τις αναστολές των μελών' },
        'bg': { title: '😥 Неуспешно премахване на таймаута на {user}', description: 'Потребителят, на когото се опитвате да премахнете таймаута, може да има по-висока роля от бота или ботът може да няма разрешение да управлява таймаутите на членове' },
        'ru': { title: '😥 Не удалось снять временную блокировку с {user}', description: 'Пользователь, с которого вы пытаетесь снять временную блокировку, может иметь более высокую роль, чем бот, или у бота может не быть разрешения на управление временными блокировками участников' },
        'uk': { title: '😥 Не вдалося зняти тимчасове блокування з {user}', description: 'Користувач, з якого ви намагаєтеся зняти тимчасове блокування, може мати вищу роль, ніж бот, або бот може не мати дозволу на керування тимчасовими блокуваннями учасників' },
        'hi': { title: '😥 {user} से टाइमआउट हटाने में विफल', description: 'जिस उपयोगकर्ता से आप टाइमआउट हटाने की कोशिश कर रहे हैं, उसके पास बॉट की तुलना में उच्च भूमिका हो सकती है, या बॉट के पास सदस्यों के टाइमआउट को प्रबंधित करने की अनुमति नहीं हो सकती है' },
        'th': { title: '😥 ไม่สามารถยกเลิกการพักการใช้งาน {user} ได้', description: 'ผู้ใช้ที่คุณพยายามยกเลิกการพักการใช้งานอาจมีตำแหน่งสูงกว่าบอท หรือบอทอาจไม่มีสิทธิ์ในการจัดการการพักการใช้งานสมาชิก' },
        'zh-CN': { title: '😥 无法解除对 {user} 的禁言', description: '您尝试解除禁言的用户可能拥有比机器人更高的角色，或者机器人可能没有管理成员禁言的权限' },
        'ja': { title: '😥 {user} のタイムアウト解除に失敗しました', description: 'タイムアウトを解除しようとしているユーザーは、ボットよりも高い役職を持っているか、ボットにメンバーのタイムアウトを管理する権限がない可能性があります' },
        'zh-TW': { title: '😥 無法解除對 {user} 的禁言', description: '您嘗試解除禁言的用戶可能擁有比機器人更高的角色，或者機器人可能沒有管理成員禁言的權限' },
        'ko': { title: '😥 {user}의 타임아웃 해제 실패', description: '타임아웃을 해제하려는 사용자가 봇보다 높은 역할을 가졌거나, 봇에게 회원 타임아웃을 관리할 권한이 없을 수 있습니다' }
      };
      
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
      
      try{
        await member.timeout(null);
      }catch{
        const embed = (new EmbedBuilder()
          .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
          .setTitle(untimeoutFailureMessages[interaction.guildLocale || 'en-US'].title.replace('{user}', member.displayName || ''))
          .setThumbnail(member.displayAvatarURL())
          .setDescription(untimeoutFailureMessages[interaction.guildLocale || 'en-US'].description)
          .addFields(
            { name: successUntimeoutMessages[interaction.guildLocale || 'en-US'].userField, value: `<@${member.id}>  `+'(`'+member.id+'`)' },
            { name: '\u200B', value: '\u200B' },
          )
          .setColor(0xff4242)
          .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
          .setTimestamp()
        );
        const message = await interaction.update({ embeds: [embed], components: [] })
        await wait(20_000);
        await message.delete();
        return;
      };
  
      const success_embed = (new EmbedBuilder()
        .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
        .setTitle(successUntimeoutMessages[interaction.guildLocale || 'en-US'].title.replace('{user}', member.displayName || ''))
        .setThumbnail(member.displayAvatarURL())
        .addFields(
            { name: successUntimeoutMessages[interaction.guildLocale || 'en-US'].userField, value: `<@${member.id}>  `+'(`'+member.id+'`)' },
            { name: '\u200B', value: '\u200B' },
        )
        .setColor(0xff4242)
        .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
        .setTimestamp()
      );
  
      const message = await interaction.update({ embeds: [success_embed], components: [] });
      await wait(20_000);
      await message.delete();
    }else if(interaction.customId === 'untimeout_cancel'){
      const userId = interaction.message.embeds[0].fields[0].value.replace(/\D/g, '');
      const user = interaction.guild.members.cache.get(userId);
  
      const cancelMessages: Record<Locale, { title: string }> = {
        'id': { title: '🚫 Batal Hapus Pembisuan {user}' },
        'da': { title: '🚫 Annuller Fjernelse af Timeout for {user}' },
        'de': { title: '🚫 Abbruch der Aufhebung der Stummschaltung von {user}' },
        'en-GB': { title: '🚫 Cancel Untimeout for {user}' },
        'en-US': { title: '🚫 Cancel Untimeout for {user}' },
        'es-ES': { title: '🚫 Cancelar Remover Silencio de {user}' },
        'es-419': { title: '🚫 Cancelar Remover Silencio de {user}' },
        'fr': { title: '🚫 Annuler la Suppression du Timeout de {user}' },
        'hr': { title: '🚫 Otkaži uklanjanje privremenog isključivanja za {user}' },
        'it': { title: '🚫 Annulla Rimozione Timeout per {user}' },
        'lt': { title: '🚫 Atšaukti {user} Laikino Užtildymo Panaikinimą' },
        'hu': { title: '🚫 {user} Timeout Eltávolításának Megszakítása' },
        'nl': { title: '🚫 Annuleren Ontgrendelen Timeout voor {user}' },
        'no': { title: '🚫 Avbryt Oppheving av Timeout for {user}' },
        'pl': { title: '🚫 Anuluj Usuwanie Wyciszenia dla {user}' },
        'pt-BR': { title: '🚫 Cancelar Remoção do Timeout de {user}' },
        'ro': { title: '🚫 Anulare Eliminare Timeout pentru {user}' },
        'fi': { title: '🚫 Peruuta Aikakatkaisun Poisto käyttäjältä {user}' },
        'sv-SE': { title: '🚫 Avbryt Återställning av Timeout för {user}' },
        'vi': { title: '🚫 Hủy Bỏ Gỡ Tạm Ngưng Hoạt Động {user}' },
        'tr': { title: '🚫 {user} Zaman Aşımı Kaldırma İptali' },
        'cs': { title: '🚫 Zrušit Odebrání Časového Limitu pro {user}' },
        'el': { title: '🚫 Ακύρωση Κατάργησης Αναστολής {user}' },
        'bg': { title: '🚫 Отмяна на Премахването на Времеаут за {user}' },
        'ru': { title: '🚫 Отмена снятия тайм-аута для {user}' },
        'uk': { title: '🚫 Скасувати зняття тайм-ауту для {user}' },
        'hi': { title: '🚫 {user} के लिए टाइमआउट रद्द करें' },
        'th': { title: '🚫 ยกเลิกลบการพักใช้งาน {user}' },
        'zh-CN': { title: '🚫 取消解除对 {user} 的禁言' },
        'ja': { title: '🚫 {user} のタイムアウト解除をキャンセルしました' },
        'zh-TW': { title: '🚫 取消解除對 {user} 的禁言' },
        'ko': { title: '🚫 {user} 타임아웃 해제 취소' }
      };
  
      const embed = (new EmbedBuilder()
        .setAuthor({ name: user?.displayName || null, iconURL: user?.displayAvatarURL() || null })
        .setTitle(cancelMessages[interaction.guildLocale || 'en-US'].title.replace('{user}', user?.displayName || ''))
        .setThumbnail(user?.displayAvatarURL() || null)
        .addFields({ name: '\u200B', value: '\u200B' })
        .setColor(0xff4242)
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setTimestamp()
      );
  
      const message = await interaction.update({ embeds: [embed], components: [] });
      await wait(10_000);
      await message.delete();
    };
    }catch(error){ throw error };
  }
  
  // Send Command \\
  if(interaction.customId.startsWith('send')){
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: interactionElements.noAdminButtonPermission[interaction.locale || 'en-US'],
        ephemeral: true
      });
    } else if (interaction.customId === 'send_message_edit') {
      const message = interaction.message.content;
      const modal = interactionElements.send_message_modal(interaction);
      modal.components[0].components[0].setValue(message);
      await interaction.showModal(modal);
    } else if (interaction.customId === 'send_message_cancel') {
      if(interaction.isRepliable()){
        try {
          await interaction.deferUpdate();
          await interaction.deleteReply();
        } catch (error) {
          console.error('Failed to handle interaction cancel:', error);
        }
      }
    } else if (interaction.customId === 'send_embed_cancel') {
      if(!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
        return await interaction.reply({ 
          content: interactionElements.noAdminButtonPermission[interaction.locale || 'en-US'], 
          ephemeral: true 
        });
      }
      if(interaction.isRepliable()){
        try {
          await interaction.deferUpdate();
          await interaction.deleteReply();
        } catch (error) {
          console.error('Failed to handle interaction cancel:', error);
        }
      }
    } else if (interaction.customId === 'send_embed_example') {
      await interaction.reply({
        content: interaction.locale == 'th'
          ? 'https://assets.camming.xyz/photos/discord/embed_example_th.webp'
          : 'https://assets.camming.xyz/photos/discord/embed_example_en.webp',
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('send_embed_example_delete')
              .setLabel(interaction.locale == 'th' ? 'ลบ' : 'delete')
              .setStyle(ButtonStyle.Danger)
            ,
          )
        ],
      });
    } else if (interaction.customId === 'send_embed_example_delete') {
      if(!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
        return await interaction.reply({ 
          content: interaction.locale === 'th' 
            ? 'คุณไม่มีสิทธิ์ `Administrator` เพื่อที่จะใช้ปุ่มนี้' 
            : 'You do not have `Administrator` privilege to use this button.', 
          ephemeral: true 
        });
      }
      if(interaction.isRepliable()){
        try {
          await interaction.deferUpdate();
          await interaction.deleteReply();
        } catch (error) {
          console.error('Failed to handle interaction cancel:', error);
        }
      }
    } else if (interaction.customId === 'send_embed_clear') {
      if(interaction.message.embeds[1]){
        await interaction.deferUpdate();
        await interaction.editReply({
          content: '',
          embeds: [interactionElements.send_embed_guide(interaction)]
        });
        await interaction.editReply({
          components: interactionElements.send_embed_button(interaction.message, interaction),
        });
      }else{return};
    } else if (interaction.customId === 'send_embed_submit') {
      if(interaction.message.embeds[1]){
        const embed = interaction.message.embeds[1];
        const components = [
          new ActionRowBuilder().addComponents(
              new ChannelSelectMenuBuilder()
                  .setCustomId('send_embed_channel')
                  .setPlaceholder(interaction.locale === 'th' ? 'โปรดเลือกช่องที่ต้องการส่งข้อความนี้' : 'Please select the channel to send this message')
                  .setChannelTypes(0, 2, 5, 10, 11, 12, 13, 14, 15, 16)
          ),
          new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                  .setCustomId('send_embed_edit')
                  .setLabel(interaction.locale === 'th' ? 'แก้ไข' : 'Edit')
                  .setStyle(ButtonStyle.Primary)
                  .setEmoji('✏️'),
              new ButtonBuilder()
                  .setCustomId('send_embed_cancel')
                  .setLabel(interaction.locale === 'th' ? 'ยกเลิก' : 'Cancel')
                  .setStyle(ButtonStyle.Danger)
                  .setEmoji({ name: 'wrong_mark', id: '1227494480446226493' }),
          ),
        ];
        try{
          await interaction.deferUpdate();
          await interaction.editReply({
            embeds: [embed],
            components: components,
          });
        }catch{
          try{
            await interaction.reply({
              embeds: [embed],
              components: components,
            });
          }catch(error){
            console.error(error);
          }
        };
      }else{return};
    } else if (interaction.customId === 'send_embed_edit') {
      if(interaction.message?.embeds[0]){
        const embed = interaction.message.embeds[0];
        try{
          await interaction.deferUpdate();
          await interaction.editReply({
            content: '',
            embeds: [interactionElements.send_embed_guide(interaction), embed]
          });
          await interaction.editReply({
            components: interactionElements.send_embed_button(interaction.message, interaction),
          });
        }catch(error){
          try{
            await interaction.reply({
              content: interaction.locale == 'th'
                ?`-# :warning: ไม่สามารถแก้ไขembedได้\n${error}\n\n
                  -# :warning: โปรดติดต่อนักพัฒนา [discord](https://discord.gg/brxPZB3Jzy)`
                :`-# :warning: Unable to edit embed\n${error}\n\n
                  -# :warning: Please contact the developer. [discord](https://discord.gg/brxPZB3Jzy)`
            });
          }catch(error){console.error(error);};
        }
      }else{return};
    } else if (interaction.customId === 'send_embed_author') {
      const modal = interactionElements.send_embed_author(interaction);
      if (interaction.message.embeds[1] && interaction.message.embeds[1].author) {
        const author = interaction.message.embeds[1].author;
        if (author.name) { modal.components[0].components[0].setValue(author.name); }
        if (author.url) { modal.components[1].components[0].setValue(author.url); }
        if (author.iconURL) { modal.components[2].components[0].setValue(author.iconURL); }
      }
      await interaction.showModal(modal);
    } else if (interaction.customId === 'send_embed_title') {
      const modal = interactionElements.send_embed_title(interaction);
      if (interaction.message.embeds[1] && interaction.message.embeds[1].title) {
        const title = interaction.message.embeds[1].title;
        const url = interaction.message.embeds[1].url;
        if (title) { modal.components[0].components[0].setValue(title); }
        if (url) { modal.components[1].components[0].setValue(url); }
      };
      await interaction.showModal(modal);
    } else if (interaction.customId === 'send_embed_description') {
      const modal = interactionElements.send_embed_description(interaction);
      if (interaction.message.embeds[1] && interaction.message.embeds[1].description) {
        const description = interaction.message.embeds[1].description;
        if (description) { modal.components[0].components[0].setValue(description); }
      };
      await interaction.showModal(modal);
    } else if (interaction.customId === 'send_embed_field1') {
      const modal = interactionElements.send_embed_field1(interaction);
      if (interaction.message.embeds[1] && interaction.message.embeds[1].fields[0]) {
        const field = interaction.message.embeds[1].fields[0];
        if (field.name) { modal.components[0].components[0].setValue(field.name); }
        if (field.value) { modal.components[1].components[0].setValue(field.value); }
        if (field.inline) { modal.components[2].components[0].setValue(`${field.inline}`); }
      };
      await interaction.showModal(modal);
    } else if (interaction.customId === 'send_embed_field2') {
      const modal = interactionElements.send_embed_field2(interaction);
      if (interaction.message.embeds[1] && interaction.message.embeds[1].fields[1]) {
        const field = interaction.message.embeds[1].fields[1];
        if (field.name) { modal.components[0].components[0].setValue(field.name); }
        if (field.value) { modal.components[1].components[0].setValue(field.value); }
        if (field.inline) { modal.components[2].components[0].setValue(`${field.inline}`); }
      };
      await interaction.showModal(modal);
    } else if (interaction.customId === 'send_embed_thumbnail') {
      const modal = interactionElements.send_embed_thumbnail(interaction);
      if (interaction.message.embeds[1] && interaction.message.embeds[1].thumbnail) {
        const thumbnail = interaction.message.embeds[1].thumbnail.url;
        if (thumbnail) { modal.components[0].components[0].setValue(thumbnail); }
      };
      await interaction.showModal(modal);
    } else if (interaction.customId === 'send_embed_image') {
      const modal = interactionElements.send_embed_image(interaction);
      if (interaction.message.embeds[1] && interaction.message.embeds[1].image) {
        const image = interaction.message.embeds[1].image.url;
        if (image) { modal.components[0].components[0].setValue(image); }
      };
      await interaction.showModal(modal);
    } else if (interaction.customId === 'send_embed_footer') {
      const modal = interactionElements.send_embed_footer(interaction);
      if (interaction.message.embeds[1] && interaction.message.embeds[1].footer) {
        const footer = interaction.message.embeds[1].footer;
        const timestamp = interaction.message.embeds[1].timestamp;
        const formatTimestamp = (timestamp: string) => {
          const date = new Date(timestamp);
      
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
      
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
      
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        };
        if (footer.text) { modal.components[0].components[0].setValue(footer.text); }
        if (footer.iconURL) { modal.components[1].components[0].setValue(footer.iconURL); }
        if (timestamp) { modal.components[2].components[0].setValue(formatTimestamp(timestamp)); }
      };
      await interaction.showModal(modal);
    } else if (interaction.customId === 'send_embed_color') {
      const modal = interactionElements.send_embed_color(interaction);
      await interaction.showModal(modal);
    }
  }
  
  // AuditLog Command \\
  if(interaction.customId.startsWith('audit_log')){
    if(!interaction.memberPermissions?.has(PermissionFlagsBits.ViewAuditLog)){
      await interaction.reply({
        content: interaction.locale == 'th'
          ? 'คุณไม่มีสิทธิ์ `administrator` เพื่อที่จะให้ปุ่มนี้'
          : 'You do not have `administrator` permission to use this button.',
        ephemeral: true
      });
    }else if(interaction.customId === 'audit_log_set_all'){
      const embed = interaction.message.embeds[0];
      const auditLogSettings: Record<string, string | null> = {};

      embed.fields.forEach(field => {
        const eventKey = field.name.toLowerCase().replace(/ /g, '_');
        const eventValue = field.value !== 'not set' && field.value !== 'ไม่ได้ตั้งค่า' 
          ? field.value.match(/<#(\d+)>/)?.[1] ?? null
          : null;
        auditLogSettings[eventKey] = eventValue;
      });
      const newEmbed = interactionElements.audit_log_embed(interaction);
      
      logEvents.forEach(event => {
        newEmbed.addFields({
          name: event.charAt(0).toUpperCase() + event.slice(1).replace(/_/g, ' '),
          value: auditLogSettings[event]
            ? `<#${auditLogSettings[event]}>`
            : (interaction.locale == 'th' ? 'ไม่ได้ตั้งค่า' : 'not set'),
          inline: true
        });
      });

      try{
        await interaction.deferUpdate();
        await interaction.editReply({
          embeds: [newEmbed],
          components: interactionElements.audit_log_select(interaction.customId, interaction)
        });
      }catch(error){
        try{ await interaction.reply({ content: `${error}` }); }
        catch{ console.error(`${error}`); };
      };
    }else if(interaction.customId === 'audit_log_disabled_all'){
      const embed = interactionElements.audit_log_embed(interaction);
      
      logEvents.forEach(event => {
        embed.addFields({
          name: event.charAt(0).toUpperCase() + event.slice(1).replace(/_/g, ' '),
          value: interaction.locale == 'th' ? 'ไม่ได้ตั้งค่า' : 'not set',
          inline: true
        });
      });

      try{
        await interaction.deferUpdate();
        await interaction.editReply({
          embeds: [embed],
          components: interactionElements.audit_log_button(interaction)
        });
      }catch(error){
        try{ await interaction.reply({ content: `${error}` }); }
        catch{ console.error(`${error}`); };
      };
    }else if(interaction.customId === 'audit_log_cancel'){
      if(interaction.message.components[0].type === ComponentType.ActionRow && interaction.message.components[0].components[0].type === ComponentType.ChannelSelect){
        const embed = interaction.message.embeds[0];
        const auditLogSettings: Record<string, string | null> = {};

        embed.fields.forEach(field => {
          const eventKey = field.name.toLowerCase().replace(/ /g, '_');
          const eventValue = field.value !== 'not set' && field.value !== 'ไม่ได้ตั้งค่า' 
            ? field.value.match(/<#(\d+)>/)?.[1] ?? null
            : null;
          auditLogSettings[eventKey] = eventValue;
        });
        const newEmbed = interactionElements.audit_log_embed(interaction);
        
        logEvents.forEach(event => {
          newEmbed.addFields({
            name: event.charAt(0).toUpperCase() + event.slice(1).replace(/_/g, ' '),
            value: auditLogSettings[event]
              ? `<#${auditLogSettings[event]}>`
              : (interaction.locale == 'th' ? 'ไม่ได้ตั้งค่า' : 'not set'),
            inline: true
          });
        });

        try{
          await interaction.deferUpdate();
          await interaction.editReply({
            embeds: [newEmbed],
            components: interactionElements.audit_log_button(interaction)
          });
        }catch(error){
          try{ await interaction.reply({ content: `${error}` }); }
          catch{ console.error(`${error}`); };
        };
      }else if(interaction.message.components[0].type === ComponentType.ActionRow && interaction.message.components[0].components[0].type === ComponentType.ChannelSelect){
        try{ await interaction.deferUpdate(); await interaction.deleteReply(); }
        catch(error){
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
      }else{
        try{ await interaction.reply({
          content: interaction.locale == 'th'
            ? 'ล้มเหลว! ไม่สามารถใช้ปุ่มยกเลิกได้\n'+
              '-# โปรดติดต่อนักพัฒนา [Discord](https://discord.com/channels/1018508978445099098/1134123486382657606)'
            : 'Failed! Unable to use cancel button\n'+
              '-# Please contact the developer [Discord](https://discord.com/channels/1018508978445099098/1134123486382657606)',
          ephemeral: true
        }); }
        catch(error){ console.error(`${error}`) };
      };
    }else if (interaction.customId === 'audit_log_confirm') {
      const embed = interaction.message.embeds[0];
      const auditLogSettings: Record<string, string | null> = {};
    
      embed.fields.forEach(field => {
        const eventKey = field.name.toLowerCase().replace(/ /g, '_');
        const eventValue = field.value !== 'not set' && field.value !== 'ไม่ได้ตั้งค่า' 
          ? field.value.match(/<#(\d+)>/)?.[1] ?? null
          : null;
    
        auditLogSettings[eventKey] = eventValue;
      });
    
      const guildId = interaction.guild?.id;
    
      try {
        const existingConfig = await this.guildConfigRepository.findOne({ where: { guildId } });
    
        if (existingConfig) {
          existingConfig.auditLogSettings = JSON.stringify(auditLogSettings);
          await this.guildConfigRepository.save(existingConfig);
        } else {
          const newConfig = this.guildConfigRepository.create({
            guildId,
            auditLogSettings: JSON.stringify(auditLogSettings)
          });
          await this.guildConfigRepository.save(newConfig);
        }
    
        try{
          await interaction.deferUpdate();
          await interaction.editReply({
            content: interaction.locale === 'th'
              ? '<:check_mark:1227490709871919104> บันทึกการตั้งค่า Audit Log สำเร็จ'
              : '<:check_mark:1227490709871919104> Audit Log settings saved successfully',
            embeds: [],
            components: []
          });
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
        }
      } catch (error) {
        console.error("Error saving audit log settings:", error);
    
        await interaction.reply({
          content: interaction.locale === 'th'
            ? 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า'
            : 'An error occurred while saving settings',
          ephemeral: true
        });
      }
    }
  }
  
  // User Command \\
  if(interaction.customId.startsWith('user')){
    if(!interaction.guild)return;try{
    let user = (await client.users.fetch(interaction.message.embeds[0].description?.match(/`(\d{17,20})`/)?.[1] || interaction.user.id, { force: true }));
    let member = await interaction.guild.members.fetch(user.id).catch(() => null);
    interactionCache.commandUser.add(interaction.guild.id, interaction.message.channel.id, interaction.message.id);
    await interaction.guild.bans.fetch();
    if(interaction.customId.startsWith('user_a_') && interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) && interaction.guild.members.cache.get(interaction.user.id)?.permissions.has(PermissionFlagsBits.Administrator)){
      if(interaction.customId === 'user_a_close'){
        await interaction.deferUpdate();
        return await interaction.deleteReply();
      }else if(interaction.customId === 'user_a_ban'){
        return await interaction.reply({ embeds: [interactionElements.ban_confirm_embed(user, null, interaction)], components: interactionElements.ban_button(interaction) });
      }else if(interaction.customId === 'user_a_unban'){
        return await interaction.reply({ embeds: [interactionElements.unban_confirm_embed(user, interaction)], components: interactionElements.unban_button(interaction) });
      }else if(interaction.customId === 'user_a_kick'){
        if(member?.kickable){
          return await interaction.reply({ embeds: [interactionElements.kick_confirm_embed(user, null, interaction)], components: interactionElements.kick_button(interaction) });
        }else return await interactionElements.user_update_message(interaction.guild);
      }else if(interaction.customId === 'user_a_timeout'){
        if(!member){
          const message = await interaction.reply({ content: `**?** ${interactionElements.userNotFound[interaction.locale || 'en-US']}`, embeds: [], components: [] });
          await wait(10_000);
          return await message.delete();
        };
        if(interaction.component.style == ButtonStyle.Success){
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
            await interactionElements.user_update_message(interaction.guild, interaction.message, interaction);
            return await interaction.followUp({ content: `😥 ${untimeoutFailMessage[interaction.locale || 'en-US']}`, ephemeral: true });
          }await interaction.reply({ embeds: [interactionElements.untimeout_confirm_embed(member, member.communicationDisabledUntilTimestamp, interaction)], components: interactionElements.untimeout_button(interaction) });
        }else{
          await interaction.reply({ embeds: [interactionElements.timeout_confirm_embed(member, 24 * 60 * 60 * 1000, null, interaction)], components: interactionElements.timeout_button(interaction) });
        };
      }else if(interaction.customId === 'user_a_reload'){
        return await interactionElements.user_update_message(interaction.guild, interaction.message, interaction);
      };
      
    }else if(interaction.customId === 'user_avatar'){
      await interactionElements.user_update_message(interaction.guild);
      return await interaction.reply({ embeds: [interactionElements.avatar_embed(user)], ephemeral: true });
    }else if(interaction.customId === 'user_banner'){
      await interactionElements.user_update_message(interaction.guild);
      return await interaction.reply({ embeds: [interactionElements.banner_embed(user)], ephemeral: true });
    }else{
      await interactionElements.user_update_message(interaction.guild);
      return await interaction.reply({ content: interactionElements.noAdminButtonPermission[interaction.locale || 'en-US'], ephemeral: true })
    }}catch(error){ throw error };
  }

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
      if(interaction.customId === 'welcome_status'){
        config = await this.guildConfigRepository.save({
            ...config,
            welcomeSetting: {
                ...config.welcomeSetting,
                welcome: {
                    ...config.welcomeSetting?.welcome,
                    isEnabled: !config.welcomeSetting?.welcome?.isEnabled
                }
            }
        });
      }if(interaction.customId === 'welcome_channel_status'){
        config = await this.guildConfigRepository.save({
            ...config,
            welcomeSetting: {
                ...config.welcomeSetting,
                welcome: {
                    ...config.welcomeSetting?.welcome,
                    isEnabled: config.welcomeSetting?.welcome?.isEnabled ?? false,
                    channel: {
                      ...config.welcomeSetting?.welcome?.channel,
                      isEnabled: !config.welcomeSetting?.welcome?.channel?.isEnabled
                    }
                }
            }
        });
      }if(interaction.customId === 'welcome_user_status'){
        config = await this.guildConfigRepository.save({
            ...config,
            welcomeSetting: {
                ...config.welcomeSetting,
                welcome: {
                    ...config.welcomeSetting?.welcome,
                    isEnabled: config.welcomeSetting?.welcome?.isEnabled ?? false,
                    user: {
                      ...config.welcomeSetting?.welcome?.user,
                      isEnabled: !config.welcomeSetting?.welcome?.user?.isEnabled
                    }
                }
            }
        });
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
      if(interaction.customId === 'goodbye_status'){
        config = await this.guildConfigRepository.save({
            ...config,
            welcomeSetting: {
                ...config.welcomeSetting,
                goodbye: {
                    ...config.welcomeSetting?.goodbye,
                    isEnabled: !config.welcomeSetting?.goodbye?.isEnabled
                }
            }
        });
      }if(interaction.customId === 'goodbye_channel_status'){
        config = await this.guildConfigRepository.save({
            ...config,
            welcomeSetting: {
                ...config.welcomeSetting,
                goodbye: {
                    ...config.welcomeSetting?.goodbye,
                    isEnabled: config.welcomeSetting?.goodbye?.isEnabled ?? false,
                    channel: {
                      ...config.welcomeSetting?.goodbye?.channel,
                      isEnabled: !config.welcomeSetting?.goodbye?.channel?.isEnabled
                    }
                }
            }
        });
      }if(interaction.customId === 'goodbye_user_status'){
        config = await this.guildConfigRepository.save({
            ...config,
            welcomeSetting: {
                ...config.welcomeSetting,
                goodbye: {
                    ...config.welcomeSetting?.goodbye,
                    isEnabled: config.welcomeSetting?.goodbye?.isEnabled ?? false,
                    user: {
                      ...config.welcomeSetting?.goodbye?.user,
                      isEnabled: !config.welcomeSetting?.goodbye?.user?.isEnabled
                    }
                }
            }
        });
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
          return process.stdout.write('');
      };
  };
  console.warn(chalk.red('[Camming BT]'), chalk.yellow(error));
}
})();
}
}