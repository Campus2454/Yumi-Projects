import chalk from "chalk";
import { ButtonStyle, ButtonBuilder, ModalBuilder, CacheType, Interaction, TextInputBuilder, TextInputStyle, PermissionFlagsBits, Message, ComponentType, ChannelSelectMenuBuilder, ChannelType, GuildMember, User, Guild, StringSelectMenuBuilder, ContainerBuilder, SeparatorSpacingSize, TopLevelComponent } from "discord.js";
import { interactionCache } from "../utils/cacheUtils";
import { formatDuration } from "../utils/functions";
import { GuildConfiguration } from "../typeorm/entities/GuildConfiguration";
const { ActionRowBuilder, EmbedBuilder } = require('discord.js');

export type Locale = 'id' | 'da' | 'de' | 'en-GB' | 'en-US' | 'es-ES' | 'es-419' | 'fr' | 'hr' | 'it' | 'lt' | 'hu' | 'nl' | 'no' | 'pl' | 'pt-BR' | 'ro' | 'fi' | 'sv-SE' | 'vi' | 'tr' | 'cs' | 'el' | 'bg' | 'ru' | 'uk' | 'hi' | 'th' | 'zh-CN' | 'ja' | 'zh-TW' | 'ko';

export class InteractionElements {
confirm_ban_message: Record<Locale, { title: string, description: string, userField: string, reasonField: string, noReason: string }> = {
  'id': { title: 'Anda ingin melarang {user}?', description: 'Tekan tombol di bawah untuk melanjutkan', userField: 'Nama pengguna', reasonField: 'Alasan', noReason: 'Tidak ada alasan' },
  'da': { title: 'Vil du forbyde {user}?', description: 'Tryk på knappen nedenfor for at fortsætte', userField: 'Brugernavn', reasonField: 'Grund', noReason: 'Ingen grund angivet' },
  'de': { title: 'Möchten Sie {user} verbannen?', description: 'Drücken Sie die Schaltfläche unten, um fortzufahren', userField: 'Benutzername', reasonField: 'Grund', noReason: 'Kein Grund angegeben' },
  'en-GB': { title: 'Do you want to ban {user}?', description: 'Press the button below to proceed', userField: 'Username', reasonField: 'Reason', noReason: 'No reason provided' },
  'en-US': { title: 'Do you want to ban {user}?', description: 'Press the button below to proceed', userField: 'Username', reasonField: 'Reason', noReason: 'No reason provided' },
  'es-ES': { title: '¿Quieres prohibir a {user}?', description: 'Presiona el botón de abajo para continuar', userField: 'Nombre de usuario', reasonField: 'Razón', noReason: 'No se proporcionó ninguna razón' },
  'es-419': { title: '¿Quieres prohibir a {user}?', description: 'Presiona el botón de abajo para continuar', userField: 'Nombre de usuario', reasonField: 'Razón', noReason: 'No se proporcionó ninguna razón' },
  'fr': { title: 'Voulez-vous bannir {user} ?', description: 'Appuyez sur le bouton ci-dessous pour continuer', userField: 'Nom d\'utilisateur', reasonField: 'Raison', noReason: 'Aucune raison fournie' },
  'hr': { title: 'Želite li zabraniti {user}?', description: 'Pritisnite gumb ispod za nastavak', userField: 'Korisničko ime', reasonField: 'Razlog', noReason: 'Nema razloga' },
  'it': { title: 'Vuoi vietare {user}?', description: 'Premi il pulsante qui sotto per procedere', userField: 'Nome utente', reasonField: 'Motivo', noReason: 'Nessun motivo fornito' },
  'lt': { title: 'Ar norite uždrausti {user}?', description: 'Paspauskite žemiau esantį mygtuką, kad tęstumėte', userField: 'Vartotojo vardas', reasonField: 'Priežastis', noReason: 'Nėra nurodytos priežasties' },
  'hu': { title: 'Szeretnéd kitiltani {user}?', description: 'Nyomd meg a lenti gombot a folytatáshoz', userField: 'Felhasználónév', reasonField: 'Indok', noReason: 'Nincs megadott indok' },
  'nl': { title: 'Wil je {user} verbannen?', description: 'Druk op de knop hieronder om door te gaan', userField: 'Gebruikersnaam', reasonField: 'Reden', noReason: 'Geen reden opgegeven' },
  'no': { title: 'Vil du forby {user}?', description: 'Trykk på knappen nedenfor for å fortsette', userField: 'Brukernavn', reasonField: 'Grunn', noReason: 'Ingen grunn angitt' },
  'pl': { title: 'Czy chcesz zakazać {user}?', description: 'Naciśnij przycisk poniżej, aby kontynuować', userField: 'Nazwa użytkownika', reasonField: 'Powód', noReason: 'Nie podano powodu' },
  'pt-BR': { title: 'Você quer banir {user}?', description: 'Pressione o botão abaixo para continuar', userField: 'Nome de usuário', reasonField: 'Razão', noReason: 'Nenhuma razão fornecida' },
  'ro': { title: 'Doriți să interziceți {user}?', description: 'Apăsați butonul de mai jos pentru a continua', userField: 'Nume de utilizator', reasonField: 'Motiv', noReason: 'Niciun motiv furnizat' },
  'fi': { title: 'Haluatko kieltää {user}?', description: 'Paina alla olevaa painiketta jatkaaksesi', userField: 'Käyttäjätunnus', reasonField: 'Syy', noReason: 'Ei annettu syytä' },
  'sv-SE': { title: 'Vill du förbjuda {user}?', description: 'Tryck på knappen nedan för att fortsätta', userField: 'Användarnamn', reasonField: 'Anledning', noReason: 'Ingen anledning angiven' },
  'vi': { title: 'Bạn có muốn cấm {user} không?', description: 'Nhấn nút bên dưới để tiếp tục', userField: 'Tên người dùng', reasonField: 'Lý do', noReason: 'Không có lý do' },
  'tr': { title: '{user} yasaklamak istiyor musunuz?', description: 'Devam etmek için aşağıdaki düğmeye basın', userField: 'Kullanıcı adı', reasonField: 'Sebep', noReason: 'Sebep belirtilmemiş' },
  'cs': { title: 'Chcete zakázat {user}?', description: 'Pokračujte stisknutím tlačítka níže', userField: 'Uživatelské jméno', reasonField: 'Důvod', noReason: 'Žádný důvod' },
  'el': { title: 'Θέλετε να απαγορεύσετε τον {user};', description: 'Πατήστε το κουμπί παρακάτω για να συνεχίσετε', userField: 'Όνομα χρήστη', reasonField: 'Λόγος', noReason: 'Χωρίς αιτία' },
  'bg': { title: 'Искате ли да забраните {user}?', description: 'Натиснете бутона по-долу, за да продължите', userField: 'Потребителско име', reasonField: 'Причина', noReason: 'Няма предоставена причина' },
  'ru': { title: 'Вы хотите запретить {user}?', description: 'Нажмите кнопку ниже, чтобы продолжить', userField: 'Имя пользователя', reasonField: 'Причина', noReason: 'Причина не указана' },
  'uk': { title: 'Ви хочете заборонити {user}?', description: 'Натисніть кнопку нижче, щоб продовжити', userField: 'Ім\'я користувача', reasonField: 'Причина', noReason: 'Причина не вказана' },
  'hi': { title: 'क्या आप {user} को प्रतिबंधित करना चाहते हैं?', description: 'जारी रखने के लिए नीचे दिए गए बटन को दबाएँ', userField: 'उपयोगकर्ता नाम', reasonField: 'कारण', noReason: 'कोई कारण नहीं दिया गया' },
  'th': { title: 'คุณต้องการแบน {user} หรือไม่?', description: 'กดปุ่มด้านล่างเพื่อดำเนินการ', userField: 'ชื่อผู้ใช้', reasonField: 'เหตุผล', noReason: 'ไม่ได้ระบุเหตุผล' },
  'zh-CN': { title: '您想禁止 {user} 吗？', description: '按下面的按钮继续', userField: '用户名', reasonField: '原因', noReason: '没有提供理由' },
  'ja': { title: '{user} を禁止しますか？', description: '続行するには下のボタンを押してください', userField: 'ユーザー名', reasonField: '理由', noReason: '理由が提供されていません' },
  'zh-TW': { title: '您想禁止 {user} 嗎？', description: '按下面的按鈕繼續', userField: '用戶名', reasonField: '原因', noReason: '沒有提供理由' },
  'ko': { title: '{user}를 금지하시겠습니까?', description: '계속하려면 아래 버튼을 누르세요', userField: '사용자 이름', reasonField: '이유', noReason: '제공된 이유 없음' }
};confirm_unban_message: Record<Locale, { title: string, description: string, userField: string, reasonField: string }> = {
  'id': { title: 'Anda ingin membatalkan larangan {user}?', description: 'Tekan tombol di bawah untuk melanjutkan', userField: 'Nama pengguna', reasonField: 'Alasan' },
  'da': { title: 'Vil du ophæve forbuddet mod {user}?', description: 'Tryk på knappen nedenfor for at fortsætte', userField: 'Brugernavn', reasonField: 'Grund' },
  'de': { title: 'Möchten Sie das Verbot für {user} aufheben?', description: 'Drücken Sie die Schaltfläche unten, um fortzufahren', userField: 'Benutzername', reasonField: 'Grund' },
  'en-GB': { title: 'Do you want to unban {user}?', description: 'Press the button below to proceed', userField: 'Username', reasonField: 'Reason' },
  'en-US': { title: 'Do you want to unban {user}?', description: 'Press the button below to proceed', userField: 'Username', reasonField: 'Reason' },
  'es-ES': { title: '¿Quieres levantar el veto a {user}?', description: 'Presiona el botón de abajo para continuar', userField: 'Nombre de usuario', reasonField: 'Razón' },
  'es-419': { title: '¿Quieres levantar el veto a {user}?', description: 'Presiona el botón de abajo para continuar', userField: 'Nombre de usuario', reasonField: 'Razón' },
  'fr': { title: 'Voulez-vous lever l’interdiction de {user} ?', description: 'Appuyez sur le bouton ci-dessous pour continuer', userField: 'Nom d\'utilisateur', reasonField: 'Raison' },
  'hr': { title: 'Želite li ukloniti zabranu za {user}?', description: 'Pritisnite gumb ispod za nastavak', userField: 'Korisničko ime', reasonField: 'Razlog' },
  'it': { title: 'Vuoi rimuovere il ban su {user}?', description: 'Premi il pulsante qui sotto per procedere', userField: 'Nome utente', reasonField: 'Motivo' },
  'lt': { title: 'Ar norite atšaukti {user} uždraudimą?', description: 'Paspauskite žemiau esantį mygtuką, kad tęstumėte', userField: 'Vartotojo vardas', reasonField: 'Priežastis' },
  'hu': { title: 'Szeretnéd feloldani {user} kitiltását?', description: 'Nyomd meg a lenti gombot a folytatáshoz', userField: 'Felhasználónév', reasonField: 'Indok' },
  'nl': { title: 'Wil je het verbod voor {user} opheffen?', description: 'Druk op de knop hieronder om door te gaan', userField: 'Gebruikersnaam', reasonField: 'Reden' },
  'no': { title: 'Vil du oppheve forbudet mot {user}?', description: 'Trykk på knappen nedenfor for å fortsette', userField: 'Brukernavn', reasonField: 'Grunn' },
  'pl': { title: 'Czy chcesz zdjąć zakaz dla {user}?', description: 'Naciśnij przycisk poniżej, aby kontynuować', userField: 'Nazwa użytkownika', reasonField: 'Powód' },
  'pt-BR': { title: 'Você quer desbloquear {user}?', description: 'Pressione o botão abaixo para continuar', userField: 'Nome de usuário', reasonField: 'Razão' },
  'ro': { title: 'Doriți să ridicați interdicția pentru {user}?', description: 'Apăsați butonul de mai jos pentru a continua', userField: 'Nume de utilizator', reasonField: 'Motiv' },
  'fi': { title: 'Haluatko poistaa {user} eston?', description: 'Paina alla olevaa painiketta jatkaaksesi', userField: 'Käyttäjätunnus', reasonField: 'Syy' },
  'sv-SE': { title: 'Vill du ta bort förbudet mot {user}?', description: 'Tryck på knappen nedan för att fortsätta', userField: 'Användarnamn', reasonField: 'Anledning' },
  'vi': { title: 'Bạn có muốn gỡ cấm {user} không?', description: 'Nhấn nút bên dưới để tiếp tục', userField: 'Tên người dùng', reasonField: 'Lý do' },
  'tr': { title: '{user} için yasaklamayı kaldırmak istiyor musunuz?', description: 'Devam etmek için aşağıdaki düğmeye basın', userField: 'Kullanıcı adı', reasonField: 'Sebep' },
  'cs': { title: 'Chcete zrušit zákaz pro {user}?', description: 'Pokračujte stisknutím tlačítka níže', userField: 'Uživatelské jméno', reasonField: 'Důvod' },
  'el': { title: 'Θέλετε να αφαιρέσετε την απαγόρευση για τον {user};', description: 'Πατήστε το κουμπί παρακάτω για να συνεχίσετε', userField: 'Όνομα χρήστη', reasonField: 'Λόγος' },
  'bg': { title: 'Искате ли да премахнете забраната за {user}?', description: 'Натиснете бутона по-долу, за да продължите', userField: 'Потребителско име', reasonField: 'Причина' },
  'ru': { title: 'Вы хотите снять запрет с {user}?', description: 'Нажмите кнопку ниже, чтобы продолжить', userField: 'Имя пользователя', reasonField: 'Причина' },
  'uk': { title: 'Ви хочете зняти заборону з {user}?', description: 'Натисніть кнопку нижче, щоб продовжити', userField: 'Ім\'я користувача', reasonField: 'Причина' },
  'hi': { title: 'क्या आप {user} को प्रतिबंध हटाना चाहते हैं?', description: 'जारी रखने के लिए नीचे दिए गए बटन को दबाएँ', userField: 'उपयोगकर्ता नाम', reasonField: 'कारण' },
  'th': { title: 'คุณต้องการปลดแบน {user} หรือไม่?', description: 'กดปุ่มด้านล่างเพื่อดำเนินการ', userField: 'ชื่อผู้ใช้', reasonField: 'เหตุผล' },
  'zh-CN': { title: '您想解除对 {user} 的禁令吗？', description: '按下面的按钮继续', userField: '用户名', reasonField: '原因' },
  'ja': { title: ' {user} の禁止を解除しますか？', description: '続行するには下のボタンを押してください', userField: 'ユーザー名', reasonField: '理由' },
  'zh-TW': { title: '您想解除 {user} 的禁令嗎？', description: '按下面的按鈕繼續', userField: '用戶名', reasonField: '原因' },
  'ko': { title: '{user}에 대한 금지를 해제하시겠습니까?', description: '계속하려면 아래 버튼을 누르세요', userField: '사용자 이름', reasonField: '이유' }
};confirm_kick_message: Record<Locale, { title: string, description: string, userField: string, reasonField: string, noReason: string }> = {
  'id': { title: 'Anda ingin mengeluarkan {user}?', description: 'Tekan tombol di bawah untuk melanjutkan', userField: 'Nama pengguna', reasonField: 'Alasan', noReason: 'Tidak ada alasan' },
  'da': { title: 'Vil du smide {user} ud?', description: 'Tryk på knappen nedenfor for at fortsætte', userField: 'Brugernavn', reasonField: 'Grund', noReason: 'Ingen grund angivet' },
  'de': { title: 'Möchten Sie {user} kicken?', description: 'Drücken Sie die Schaltfläche unten, um fortzufahren', userField: 'Benutzername', reasonField: 'Grund', noReason: 'Kein Grund angegeben' },
  'en-GB': { title: 'Do you want to kick {user}?', description: 'Press the button below to proceed', userField: 'Username', reasonField: 'Reason', noReason: 'No reason provided' },
  'en-US': { title: 'Do you want to kick {user}?', description: 'Press the button below to proceed', userField: 'Username', reasonField: 'Reason', noReason: 'No reason provided' },
  'es-ES': { title: '¿Quieres expulsar a {user}?', description: 'Presiona el botón de abajo para continuar', userField: 'Nombre de usuario', reasonField: 'Razón', noReason: 'No se proporcionó ninguna razón' },
  'es-419': { title: '¿Quieres expulsar a {user}?', description: 'Presiona el botón de abajo para continuar', userField: 'Nombre de usuario', reasonField: 'Razón', noReason: 'No se proporcionó ninguna razón' },
  'fr': { title: 'Voulez-vous expulser {user} ?', description: 'Appuyez sur le bouton ci-dessous pour continuer', userField: 'Nom d\'utilisateur', reasonField: 'Raison', noReason: 'Aucune raison fournie' },
  'hr': { title: 'Želite li izbaciti {user}?', description: 'Pritisnite gumb ispod za nastavak', userField: 'Korisničko ime', reasonField: 'Razlog', noReason: 'Nema razloga' },
  'it': { title: 'Vuoi espellere {user}?', description: 'Premi il pulsante qui sotto per procedere', userField: 'Nome utente', reasonField: 'Motivo', noReason: 'Nessun motivo fornito' },
  'lt': { title: 'Ar norite išmesti {user}?', description: 'Paspauskite žemiau esantį mygtuką, kad tęstumėte', userField: 'Vartotojo vardas', reasonField: 'Priežastis', noReason: 'Nėra nurodytos priežasties' },
  'hu': { title: 'Szeretnéd kirúgni {user}?', description: 'Nyomd meg a lenti gombot a folytatáshoz', userField: 'Felhasználónév', reasonField: 'Indok', noReason: 'Nincs megadott indok' },
  'nl': { title: 'Wil je {user} kicken?', description: 'Druk op de knop hieronder om door te gaan', userField: 'Gebruikersnaam', reasonField: 'Reden', noReason: 'Geen reden opgegeven' },
  'no': { title: 'Vil du kaste ut {user}?', description: 'Trykk på knappen nedenfor for å fortsette', userField: 'Brukernavn', reasonField: 'Grunn', noReason: 'Ingen grunn angitt' },
  'pl': { title: 'Czy chcesz wyrzucić {user}?', description: 'Naciśnij przycisk poniżej, aby kontynuować', userField: 'Nazwa użytkownika', reasonField: 'Powód', noReason: 'Nie podano powodu' },
  'pt-BR': { title: 'Você quer expulsar {user}?', description: 'Pressione o botão abaixo para continuar', userField: 'Nome de usuário', reasonField: 'Razão', noReason: 'Nenhuma razão fornecida' },
  'ro': { title: 'Doriți să excludeți {user}?', description: 'Apăsați butonul de mai jos pentru a continua', userField: 'Nume de utilizator', reasonField: 'Motiv', noReason: 'Niciun motiv furnizat' },
  'fi': { title: 'Haluatko potkaista {user}?', description: 'Paina alla olevaa painiketta jatkaaksesi', userField: 'Käyttäjätunnus', reasonField: 'Syy', noReason: 'Ei annettu syytä' },
  'sv-SE': { title: 'Vill du sparka {user}?', description: 'Tryck på knappen nedan för att fortsätta', userField: 'Användarnamn', reasonField: 'Anledning', noReason: 'Ingen anledning angiven' },
  'vi': { title: 'Bạn có muốn đá {user} không?', description: 'Nhấn nút bên dưới để tiếp tục', userField: 'Tên người dùng', reasonField: 'Lý do', noReason: 'Không có lý do' },
  'tr': { title: '{user} atmak istiyor musunuz?', description: 'Devam etmek için aşağıdaki düğmeye basın', userField: 'Kullanıcı adı', reasonField: 'Sebep', noReason: 'Sebep belirtilmemiş' },
  'cs': { title: 'Chcete vykopnout {user}?', description: 'Pokračujte stisknutím tlačítka níže', userField: 'Uživatelské jméno', reasonField: 'Důvod', noReason: 'Žádný důvod' },
  'el': { title: 'Θέλετε να αποβάλλετε τον {user};', description: 'Πατήστε το κουμπί παρακάτω για να συνεχίσετε', userField: 'Όνομα χρήστη', reasonField: 'Λόγος', noReason: 'Χωρίς αιτία' },
  'bg': { title: 'Искате ли да изгоните {user}?', description: 'Натиснете бутона по-долу, за да продължите', userField: 'Потребителско име', reasonField: 'Причина', noReason: 'Няма предоставена причина' },
  'ru': { title: 'Вы хотите выгнать {user}?', description: 'Нажмите кнопку ниже, чтобы продолжить', userField: 'Имя пользователя', reasonField: 'Причина', noReason: 'Причина не указана' },
  'uk': { title: 'Ви хочете вигнати {user}?', description: 'Натисніть кнопку нижче, щоб продовжити', userField: 'Ім\'я користувача', reasonField: 'Причина', noReason: 'Причина не вказана' },
  'hi': { title: 'क्या आप {user} को निकालना चाहते हैं?', description: 'जारी रखने के लिए नीचे दिए गए बटन को दबाएँ', userField: 'उपयोगकर्ता नाम', reasonField: 'कारण', noReason: 'कोई कारण नहीं दिया गया' },
  'th': { title: 'คุณต้องการเตะ {user} หรือไม่?', description: 'กดปุ่มด้านล่างเพื่อดำเนินการ', userField: 'ชื่อผู้ใช้', reasonField: 'เหตุผล', noReason: 'ไม่ได้ระบุเหตุผล' },
  'zh-CN': { title: '您想踢出 {user} 吗？', description: '按下面的按钮继续', userField: '用户名', reasonField: '原因', noReason: '没有提供理由' },
  'ja': { title: '{user} をキックしますか？', description: '続行するには下のボタンを押してください', userField: 'ユーザー名', reasonField: '理由', noReason: '理由が提供されていません' },
  'zh-TW': { title: '您想踢出 {user} 嗎？', description: '按下面的按鈕繼續', userField: '用戶名', reasonField: '原因', noReason: '沒有提供理由' },
  'ko': { title: '{user}를 추방하시겠습니까?', description: '계속하려면 아래 버튼을 누르세요', userField: '사용자 이름', reasonField: '이유', noReason: '제공된 이유 없음' }
};confirm_timeout_message: Record<Locale, { title: string, description: string, userField: string, durationField: string, reasonField: string, noReason: string }> = {
  'id': { title: 'Anda ingin memberi waktu habis {user}?', description: 'Tekan tombol di bawah untuk melanjutkan', userField: 'Nama pengguna', durationField: 'Durasi', reasonField: 'Alasan', noReason: 'Tidak ada alasan' },
  'da': { title: 'Vil du give {user} timeout?', description: 'Tryk på knappen nedenfor for at fortsætte', userField: 'Brugernavn', durationField: 'Varighed', reasonField: 'Grund', noReason: 'Ingen grund angivet' },
  'de': { title: 'Möchten Sie die Zeit für {user} ablaufen lassen?', description: 'Drücken Sie die Schaltfläche unten, um fortzufahren', userField: 'Benutzername', durationField: 'Dauer', reasonField: 'Grund', noReason: 'Kein Grund angegeben' },
  'en-GB': { title: 'Do you want to timeout {user}?', description: 'Press the button below to proceed', userField: 'Username', durationField: 'Duration', reasonField: 'Reason', noReason: 'No reason provided' },
  'en-US': { title: 'Do you want to timeout {user}?', description: 'Press the button below to proceed', userField: 'Username', durationField: 'Duration', reasonField: 'Reason', noReason: 'No reason provided' },
  'es-ES': { title: '¿Quieres agotar el tiempo de {user}?', description: 'Presiona el botón de abajo para continuar', userField: 'Nombre de usuario', durationField: 'Duración', reasonField: 'Razón', noReason: 'No se proporcionó ninguna razón' },
  'es-419': { title: '¿Quieres agotar el tiempo de {user}?', description: 'Presiona el botón de abajo para continuar', userField: 'Nombre de usuario', durationField: 'Duración', reasonField: 'Razón', noReason: 'No se proporcionó ninguna razón' },
  'fr': { title: 'Voulez-vous mettre {user} en timeout ?', description: 'Appuyez sur le bouton ci-dessous pour continuer', userField: 'Nom d\'utilisateur', durationField: 'Durée', reasonField: 'Raison', noReason: 'Aucune raison fournie' },
  'hr': { title: 'Želite li da istekne vrijeme za {user}?', description: 'Pritisnite gumb ispod za nastavak', userField: 'Korisničko ime', durationField: 'Trajanje', reasonField: 'Razlog', noReason: 'Nema razloga' },
  'it': { title: 'Vuoi far scadere il tempo di {user}?', description: 'Premi il pulsante qui sotto per procedere', userField: 'Nome utente', durationField: 'Durata', reasonField: 'Motivo', noReason: 'Nessun motivo fornito' },
  'lt': { title: 'Ar norite, kad baigtųsi {user} laikas?', description: 'Paspauskite žemiau esantį mygtuką, kad tęstumėte', userField: 'Vartotojo vardas', durationField: 'Trukmė', reasonField: 'Priežastis', noReason: 'Nėra nurodytos priežasties' },
  'hu': { title: 'Szeretnéd lejáratni {user} idejét?', description: 'Nyomd meg a lenti gombot a folytatáshoz', userField: 'Felhasználónév', durationField: 'Időtartam', reasonField: 'Indok', noReason: 'Nincs megadott indok' },
  'nl': { title: 'Wil je de tijd van {user} laten verlopen?', description: 'Druk op de knop hieronder om door te gaan', userField: 'Gebruikersnaam', durationField: 'Duur', reasonField: 'Reden', noReason: 'Geen reden opgegeven' },
  'no': { title: 'Vil du gi {user} en timeout?', description: 'Trykk på knappen nedenfor for å fortsette', userField: 'Brukernavn', durationField: 'Varighet', reasonField: 'Grunn', noReason: 'Ingen grunn angitt' },
  'pl': { title: 'Czy chcesz, aby upłynął czas dla {user}?', description: 'Naciśnij przycisk poniżej, aby kontynuować', userField: 'Nazwa użytkownika', durationField: 'Czas trwania', reasonField: 'Powód', noReason: 'Nie podano powodu' },
  'pt-BR': { title: 'Você quer dar um tempo limite para {user}?', description: 'Pressione o botão abaixo para continuar', userField: 'Nome de usuário', durationField: 'Duração', reasonField: 'Razão', noReason: 'Nenhuma razão fornecida' },
  'ro': { title: 'Doriți să acordați un timeout lui {user}?', description: 'Apăsați butonul de mai jos pentru a continua', userField: 'Nume de utilizator', durationField: 'Durată', reasonField: 'Motiv', noReason: 'Niciun motiv furnizat' },
  'fi': { title: 'Haluatko antaa aikakatkaisun käyttäjälle {user}?', description: 'Paina alla olevaa painiketta jatkaaksesi', userField: 'Käyttäjätunnus', durationField: 'Kesto', reasonField: 'Syy', noReason: 'Ei annettu syytä' },
  'sv-SE': { title: 'Vill du ge {user} en timeout?', description: 'Tryck på knappen nedan för att fortsätta', userField: 'Användarnamn', durationField: 'Varaktighet', reasonField: 'Anledning', noReason: 'Ingen anledning angiven' },
  'vi': { title: 'Bạn có muốn hết thời gian của {user} không?', description: 'Nhấn nút bên dưới để tiếp tục', userField: 'Tên người dùng', durationField: 'Thời lượng', reasonField: 'Lý do', noReason: 'Không có lý do' },
  'tr': { title: '{user} için zaman aşımı uygulamak istiyor musunuz?', description: 'Devam etmek için aşağıdaki düğmeye basın', userField: 'Kullanıcı adı', durationField: 'Süre', reasonField: 'Sebep', noReason: 'Sebep belirtilmemiş' },
  'cs': { title: 'Chcete, aby uživateli {user} vypršel čas?', description: 'Pokračujte stisknutím tlačítka níže', userField: 'Uživatelské jméno', durationField: 'Trvání', reasonField: 'Důvod', noReason: 'Žádný důvod' },
  'el': { title: 'Θέλετε να λήξει ο χρόνος του {user};', description: 'Πατήστε το κουμπί παρακάτω για να συνεχίσετε', userField: 'Όνομα χρήστη', durationField: 'Διάρκεια', reasonField: 'Λόγος', noReason: 'Χωρίς αιτία' },
  'bg': { title: 'Искате ли да изтече времето на {user}?', description: 'Натиснете бутона по-долу, за да продължите', userField: 'Потребителско име', durationField: 'Продължителност', reasonField: 'Причина', noReason: 'Няма предоставена причина' },
  'ru': { title: 'Вы хотите, чтобы истекло время у {user}?', description: 'Нажмите кнопку ниже, чтобы продолжить', userField: 'Имя пользователя', durationField: 'Длительность', reasonField: 'Причина', noReason: 'Причина не указана' },
  'uk': { title: 'Ви хочете, щоб закінчився час у {user}?', description: 'Натисніть кнопку нижче, щоб продовжити', userField: 'Ім\'я користувача', durationField: 'Тривалість', reasonField: 'Причина', noReason: 'Причина не вказана' },
  'hi': { title: 'क्या आप {user} का समय समाप्त करना चाहते हैं?', description: 'जारी रखने के लिए नीचे दिए गए बटन को दबाएँ', userField: 'उपयोगकर्ता नाम', durationField: 'अवधि', reasonField: 'कारण', noReason: 'कोई कारण नहीं दिया गया' },
  'th': { title: 'คุณต้องการหมดเวลา {user} หรือไม่?', description: 'กดปุ่มด้านล่างเพื่อดำเนินการ', userField: 'ชื่อผู้ใช้', durationField: 'ระยะเวลา', reasonField: 'เหตุผล', noReason: 'ไม่ได้ระบุเหตุผล' },
  'zh-CN': { title: '您想让 {user} 超时吗？', description: '按下面的按钮继续', userField: '用户名', durationField: '持续时间', reasonField: '原因', noReason: '没有提供理由' },
  'ja': { title: '{user} のタイムアウトを実行しますか？', description: '続行するには下のボタンを押してください', userField: 'ユーザー名', durationField: '期間', reasonField: '理由', noReason: '理由が提供されていません' },
  'zh-TW': { title: '您想讓 {user} 超時嗎？', description: '按下面的按鈕繼續', userField: '用戶名', durationField: '持續時間', reasonField: '原因', noReason: '沒有提供理由' },
  'ko': { title: '{user}의 시간을 만료시키겠습니까?', description: '계속하려면 아래 버튼을 누르세요', userField: '사용자 이름', durationField: '지속 시간', reasonField: '이유', noReason: '제공된 이유 없음' }
};confirm_untimeout_message: Record<Locale, { title: string, description: string, userField: string, untilField: string }> = {
  'id': { title: 'Anda ingin mengakhiri waktu habis {user}?', description: 'Tekan tombol di bawah untuk melanjutkan', userField: 'Nama pengguna', untilField: 'Hingga' },
  'da': { title: 'Vil du fjerne timeout for {user}?', description: 'Tryk på knappen nedenfor for at fortsætte', userField: 'Brugernavn', untilField: 'Indtil' },
  'de': { title: 'Möchten Sie die Stummschaltung von {user} aufheben?', description: 'Drücken Sie die Schaltfläche unten, um fortzufahren', userField: 'Benutzername', untilField: 'Bis' },
  'en-GB': { title: 'Do you want to remove the timeout from {user}?', description: 'Press the button below to proceed', userField: 'Username', untilField: 'Until' },
  'en-US': { title: 'Do you want to remove the timeout from {user}?', description: 'Press the button below to proceed', userField: 'Username', untilField: 'Until' },
  'es-ES': { title: '¿Quieres quitar el silencio a {user}?', description: 'Presiona el botón de abajo para continuar', userField: 'Nombre de usuario', untilField: 'Hasta' },
  'es-419': { title: '¿Quieres quitar el silencio a {user}?', description: 'Presiona el botón de abajo para continuar', userField: 'Nombre de usuario', untilField: 'Hasta' },
  'fr': { title: 'Voulez-vous retirer le timeout de {user} ?', description: 'Appuyez sur le bouton ci-dessous pour continuer', userField: 'Nom d\'utilisateur', untilField: 'Jusqu\'à' },
  'hr': { title: 'Želite li ukloniti vremensko ograničenje za {user}?', description: 'Pritisnite gumb ispod za nastavak', userField: 'Korisničko ime', untilField: 'Do' },
  'it': { title: 'Vuoi rimuovere il timeout da {user}?', description: 'Premi il pulsante qui sotto per procedere', userField: 'Nome utente', untilField: 'Fino a' },
  'lt': { title: 'Ar norite pašalinti {user} laiko apribojimą?', description: 'Paspauskite žemiau esantį mygtuką, kad tęstumėte', userField: 'Vartotojo vardas', untilField: 'Iki' },
  'hu': { title: 'Szeretnéd feloldani a timeoutot {user}-ról?', description: 'Nyomd meg a lenti gombot a folytatáshoz', userField: 'Felhasználónév', untilField: 'Amíg' },
  'nl': { title: 'Wil je de timeout van {user} verwijderen?', description: 'Druk op de knop hieronder om door te gaan', userField: 'Gebruikersnaam', untilField: 'Tot' },
  'no': { title: 'Vil du fjerne timeouten fra {user}?', description: 'Trykk på knappen nedenfor for å fortsette', userField: 'Brukernavn', untilField: 'Til' },
  'pl': { title: 'Czy chcesz usunąć limit czasu dla {user}?', description: 'Naciśnij przycisk poniżej, aby kontynuować', userField: 'Nazwa użytkownika', untilField: 'Do' },
  'pt-BR': { title: 'Você quer remover o tempo limite de {user}?', description: 'Pressione o botão abaixo para continuar', userField: 'Nome de usuário', untilField: 'Até' },
  'ro': { title: 'Doriți să eliminați timeout-ul pentru {user}?', description: 'Apăsați butonul de mai jos pentru a continua', userField: 'Nume de utilizator', untilField: 'Până la' },
  'fi': { title: 'Haluatko poistaa aikakatkaisun käyttäjältä {user}?', description: 'Paina alla olevaa painiketta jatkaaksesi', userField: 'Käyttäjätunnus', untilField: 'Aikaan' },
  'sv-SE': { title: 'Vill du ta bort timeouten från {user}?', description: 'Tryck på knappen nedan för att fortsätta', userField: 'Användarnamn', untilField: 'Tills' },
  'vi': { title: 'Bạn có muốn gỡ bỏ thời gian chờ của {user} không?', description: 'Nhấn nút bên dưới để tiếp tục', userField: 'Tên người dùng', untilField: 'Đến' },
  'tr': { title: '{user} üzerindeki zaman aşımını kaldırmak istiyor musunuz?', description: 'Devam etmek için aşağıdaki düğmeye basın', userField: 'Kullanıcı adı', untilField: 'Kadar' },
  'cs': { title: 'Chcete odebrat časový limit uživateli {user}?', description: 'Pokračujte stisknutím tlačítka níže', userField: 'Uživatelské jméno', untilField: 'Do' },
  'el': { title: 'Θέλετε να αφαιρέσετε την αναστολή από τον {user};', description: 'Πατήστε το κουμπί παρακάτω για να συνεχίσετε', userField: 'Όνομα χρήστη', untilField: 'Μέχρι' },
  'bg': { title: 'Искате ли да премахнете времеаута на {user}?', description: 'Натиснете бутона по-долу, за да продължите', userField: 'Потребителско име', untilField: 'До' },
  'ru': { title: 'Вы хотите снять временную блокировку с {user}?', description: 'Нажмите кнопку ниже, чтобы продолжить', userField: 'Имя пользователя', untilField: 'До' },
  'uk': { title: 'Ви хочете зняти тимчасове блокування з {user}?', description: 'Натисніть кнопку нижче, щоб продовжити', userField: 'Ім\'я користувача', untilField: 'До' },
  'hi': { title: 'क्या आप {user} से टाइमआउट हटाना चाहते हैं?', description: 'जारी रखने के लिए नीचे दिए गए बटन को दबाएँ', userField: 'उपयोगकर्ता नाम', untilField: 'तक' },
  'th': { title: 'คุณต้องการยกเลิกการหมดเวลา {user} หรือไม่?', description: 'กดปุ่มด้านล่างเพื่อดำเนินการ', userField: 'ชื่อผู้ใช้', untilField: 'จนถึง' },
  'zh-CN': { title: '您想解除 {user} 的超时吗？', description: '按下面的按钮继续', userField: '用户名', untilField: '直到' },
  'ja': { title: '{user} のタイムアウトを解除しますか？', description: '続行するには下のボタンを押してください', userField: 'ユーザー名', untilField: 'まで' },
  'zh-TW': { title: '您想解除 {user} 的超時嗎？', description: '按下面的按鈕繼續', userField: '用戶名', untilField: '直到' },
  'ko': { title: '{user}의 타임아웃을 해제하시겠습니까?', description: '계속하려면 아래 버튼을 누르세요', userField: '사용자 이름', untilField: '까지' }
};permis_admin_edit: Record<Locale, string> = {
    'th': 'คุณไม่มีสิทธิ์ `ผู้ดูแลระบบ` เพื่อที่จะแก้ไข',
    'id': 'Anda tidak punya hak. `Administrator` untuk memperbaikinya',
    'da': 'Du har ikke rettigheder. `Administrator` for at rette op',
    'de': 'Du hast keine Rechte. `Administrator` um es zu beheben',
    'en-GB': "You don't have rights. `Administrator` in order to fix",
    'en-US': "You don't have rights. `Administrator` in order to fix",
    'es-ES': 'No tienes derechos. `Administrador` para arreglar',
    'es-419': 'No tienes derechos. `Administrador` para arreglar',
    'fr': "Vous n'avez pas de droits. `Administrateur` afin de réparer",
    'hr': 'Nemate prava. `Administrator` za popravak',
    'it': 'Non hai diritti. `Administrator` per risolvere',
    'lt': 'Neturite teisių. `Administrator` kad pataisytumėte',
    'hu': 'Nincs joga. `Administrator` hogy kijavítsa',
    'nl': 'Je hebt geen rechten. `Administrator` om te herstellen',
    'no': 'Du har ikke rettigheter. `Administrator` for å rette opp',
    'pl': 'Nie masz praw. `Administrator` aby naprawić',
    'pt-BR': 'Você não tem direitos. `Administrator` para corrigir',
    'ro': 'Nu aveți drepturi. `Administrator` pentru a remedia',
    'fi': 'Sinulla ei ole oikeuksia. `Administrator` korjata',
    'sv-SE': 'Du har inga rättigheter. `Administrator` för att åtgärda',
    'vi': 'Bạn không có quyền. `Người quản lý` để khắc phục',
    'tr': 'Haklarınız yok. `Administrator` düzeltmek için',
    'cs': 'Nemáte práva. `Administrator` pro opravu',
    'el': 'Δεν έχετε δικαιώματα. `Administrator` για να διορθώσετε',
    'bg': 'Нямате права. `Administrator` за да поправите',
    'ru': 'У вас нет прав. `Administrator` чтобы исправить',
    'uk': 'У вас немає прав. `Administrator` щоб виправити',
    'hi': 'आपके पास अधिकार नहीं हैं। `Administrator` इसे ठीक करने के लिए',
    'zh-CN': '你沒有權利。 `行政人員` 為了修復',
    'ja': 'あなたには権利がありません。 `管理者` 直すために',
    'zh-TW': '你没有权利。 `行政人员` 为了修复',
    'ko': '당신에게는 권리가 없습니다. `관리자` 고치기 위해'
};cannotUseCommand: Record<Locale, string> = {
'th': 'ไม่สามารถใช้คำสั่งที่นี่ได้',
'id': 'Anda tidak punya hak untuk menggunakan perintah ini di sini.',
'da': 'Denne kommando kan ikke bruges her.',
'de': 'Dieser Befehl kann hier nicht verwendet werden.',
'en-GB': "The command cannot be used here.",
'en-US': "The command cannot be used here.",
'es-ES': 'Este comando no se puede utilizar aquí.',
'es-419': 'No se puede usar este comando aquí.',
'fr': "La commande ne peut pas être utilisée ici.",
'hr': 'Naredba se ne može koristiti ovdje.',
'it': 'Il comando non può essere utilizzato qui.',
'lt': 'Šią komandą negalima naudoti čia.',
'hu': 'Ezt a parancsot nem lehet itt használni.',
'nl': 'Dit commando kan hier niet worden gebruikt.',
'no': 'Denne kommandoen kan ikke brukes her.',
'pl': 'Tego polecenia nie można użyć tutaj.',
'pt-BR': 'O comando não pode ser usado aqui.',
'ro': 'Această comandă nu poate fi utilizată aici.',
'fi': 'Tätä komentoa ei voi käyttää täällä.',
'sv-SE': 'Kommandot kan inte användas här.',
'vi': 'Lệnh không thể được sử dụng ở đây.',
'tr': 'Bu komut burada kullanılamaz.',
'cs': 'Tento příkaz nelze použít zde.',
'el': 'Η εντολή δεν μπορεί να χρησιμοποιηθεί εδώ.',
'bg': 'Командата не може да се използва тук.',
'ru': 'Команда не может быть использована здесь.',
'uk': 'Команда не може бути використана тут.',
'hi': 'यहाँ कोई आदेश नहीं दिया जा सकता।',
'zh-CN': '这个命令不能在这里使用。',
'ja': 'このコマンドはここでは使用できません。',
'zh-TW': '這個命令無法在這裡使用。',
'ko': '이 명령은 여기에서 사용할 수 없습니다.'
};functionToggleMessages: Record<Locale, { enabled: string; disabled: string }> = {
    id: {
      enabled: 'Fungsi ini telah berhasil diaktifkan',
      disabled: 'Fungsi ini telah berhasil dinonaktifkan',
    },
    da: {
      enabled: 'Denne funktion er blevet aktiveret',
      disabled: 'Denne funktion er blevet deaktiveret',
    },
    de: {
      enabled: 'Diese Funktion wurde erfolgreich aktiviert',
      disabled: 'Diese Funktion wurde erfolgreich deaktiviert',
    },
    'en-GB': {
      enabled: 'This function has been successfully enabled',
      disabled: 'This function has been successfully disabled',
    },
    'en-US': {
      enabled: 'This function has been successfully enabled',
      disabled: 'This function has been successfully disabled',
    },
    'es-ES': {
      enabled: 'Esta función se ha habilitado correctamente',
      disabled: 'Esta función se ha deshabilitado correctamente',
    },
    'es-419': {
      enabled: 'Esta función se ha habilitado correctamente',
      disabled: 'Esta función se ha deshabilitado correctamente',
    },
    fr: {
      enabled: 'Cette fonction a été activée avec succès',
      disabled: 'Cette fonction a été désactivée avec succès',
    },
    hr: {
      enabled: 'Ova funkcija je uspješno omogućena',
      disabled: 'Ova funkcija je uspješno onemogućena',
    },
    it: {
      enabled: 'Questa funzione è stata attivata con successo',
      disabled: 'Questa funzione è stata disattivata con successo',
    },
    lt: {
      enabled: 'Ši funkcija sėkmingai įjungta',
      disabled: 'Ši funkcija sėkmingai išjungta',
    },
    hu: {
      enabled: 'Ez a funkció sikeresen engedélyezve lett',
      disabled: 'Ez a funkció sikeresen letiltva lett',
    },
    nl: {
      enabled: 'Deze functie is succesvol ingeschakeld',
      disabled: 'Deze functie is succesvol uitgeschakeld',
    },
    no: {
      enabled: 'Denne funksjonen er aktivert',
      disabled: 'Denne funksjonen er deaktivert',
    },
    pl: {
      enabled: 'Ta funkcja została pomyślnie włączona',
      disabled: 'Ta funkcja została pomyślnie wyłączona',
    },
    'pt-BR': {
      enabled: 'Esta função foi ativada com sucesso',
      disabled: 'Esta função foi desativada com sucesso',
    },
    ro: {
      enabled: 'Această funcție a fost activată cu succes',
      disabled: 'Această funcție a fost dezactivată cu succes',
    },
    fi: {
      enabled: 'Tämä toiminto on otettu käyttöön',
      disabled: 'Tämä toiminto on poistettu käytöstä',
    },
    'sv-SE': {
      enabled: 'Den här funktionen har aktiverats',
      disabled: 'Den här funktionen har inaktiverats',
    },
    vi: {
      enabled: 'Chức năng này đã được kích hoạt thành công',
      disabled: 'Chức năng này đã được vô hiệu hóa thành công',
    },
    tr: {
      enabled: 'Bu işlev başarıyla etkinleştirildi',
      disabled: 'Bu işlev başarıyla devre dışı bırakıldı',
    },
    cs: {
      enabled: 'Tato funkce byla úspěšně povolena',
      disabled: 'Tato funkce byla úspěšně zakázána',
    },
    el: {
      enabled: 'Αυτή η λειτουργία ενεργοποιήθηκε με επιτυχία',
      disabled: 'Αυτή η λειτουργία απενεργοποιήθηκε με επιτυχία',
    },
    bg: {
      enabled: 'Тази функция беше успешно активирана',
      disabled: 'Тази функция беше успешно деактивирана',
    },
    ru: {
      enabled: 'Эта функция была успешно включена',
      disabled: 'Эта функция была успешно отключена',
    },
    uk: {
      enabled: 'Ця функція була успішно увімкнена',
      disabled: 'Ця функція була успішно вимкнена',
    },
    hi: {
      enabled: 'यह फ़ंक्शन सफलतापूर्वक सक्षम किया गया है',
      disabled: 'यह फ़ंक्शन सफलतापूर्वक अक्षम किया गया है',
    },
    th: {
      enabled: 'เปิดใช้งานฟังก์ชันนี้สำเร็จ',
      disabled: 'ปิดใช้งานฟังก์ชันนี้สำเร็จ',
    },
    'zh-CN': {
      enabled: '此功能已成功启用',
      disabled: '此功能已成功禁用',
    },
    ja: {
      enabled: 'この機能が正常に有効化されました',
      disabled: 'この機能が正常に無効化されました',
    },
    'zh-TW': {
      enabled: '此功能已成功啟用',
      disabled: '此功能已成功停用',
    },
    ko: {
      enabled: '이 기능이 성공적으로 활성화되었습니다',
      disabled: '이 기능이 성공적으로 비활성화되었습니다',
    },
};channelNotFoundMessages: Record<Locale, string> = {
  id: 'Bot tidak dapat menemukan saluran yang Anda tentukan, atau bot mungkin tidak memiliki izin untuk melihat saluran tersebut',
  da: 'Botten kunne ikke finde den kanal, du angav, eller botten har muligvis ikke tilladelse til at se den kanal',
  de: 'Der Bot konnte den angegebenen Kanal nicht finden, oder der Bot hat möglicherweise keine Berechtigung, diesen Kanal zu sehen',
  'en-GB': 'The bot could not find the channel you specified, or the bot may not have permission to view that channel',
  'en-US': 'The bot could not find the channel you specified, or the bot may not have permission to view that channel',
  'es-ES': 'El bot no pudo encontrar el canal que especificaste o puede que no tenga permiso para ver ese canal',
  'es-419': 'El bot no pudo encontrar el canal que especificaste o puede que no tenga permiso para ver ese canal',
  fr: 'Le bot n’a pas pu trouver la chaîne que vous avez spécifiée ou il se peut qu’il n’ait pas la permission de voir cette chaîne',
  hr: 'Bot nije mogao pronaći kanal koji ste naveli ili možda nema dopuštenje za pregled tog kanala',
  it: 'Il bot non è riuscito a trovare il canale specificato o potrebbe non avere il permesso di visualizzare quel canale',
  lt: 'Botas negalėjo rasti jūsų nurodyto kanalo arba gali neturėti teisės peržiūrėti šio kanalo',
  hu: 'A bot nem találta meg az általad megadott csatornát, vagy nincs engedélye megtekinteni azt a csatornát',
  nl: 'De bot kon het kanaal dat je hebt opgegeven niet vinden of heeft mogelijk geen toestemming om dat kanaal te bekijken',
  no: 'Botten kunne ikke finne kanalen du spesifiserte, eller botten har kanskje ikke tillatelse til å se den kanalen',
  pl: 'Bot nie znalazł określonego kanału lub może nie mieć uprawnień do jego przeglądania',
  'pt-BR': 'O bot não conseguiu encontrar o canal especificado ou pode não ter permissão para visualizar esse canal',
  ro: 'Botul nu a găsit canalul specificat sau este posibil să nu aibă permisiunea de a vizualiza acel canal',
  fi: 'Botti ei löytänyt määrittämääsi kanavaa, tai botti ei välttämättä ole saanut lupaa nähdä kyseistä kanavaa',
  'sv-SE': 'Botten kunde inte hitta kanalen du angav, eller botten har kanske inte behörighet att visa den kanalen',
  vi: 'Bot không thể tìm thấy kênh bạn đã chỉ định hoặc bot có thể không có quyền xem kênh đó',
  tr: 'Bot, belirttiğiniz kanalı bulamadı veya o kanalı görüntüleme iznine sahip olmayabilir',
  cs: 'Bot nemohl najít kanál, který jste zadali, nebo nemusí mít oprávnění tento kanál zobrazit',
  el: 'Το bot δεν μπόρεσε να βρει το κανάλι που καθορίσατε ή μπορεί να μην έχει άδεια να δει αυτό το κανάλι',
  bg: 'Ботът не можа да намери посочения канал или може да няма разрешение да го прегледа',
  ru: 'Бот не смог найти указанный канал или, возможно, у него нет прав на просмотр этого канала',
  uk: 'Бот не зміг знайти вказаний канал або, можливо, у нього немає прав для перегляду цього каналу',
  hi: 'बॉट आपके द्वारा निर्दिष्ट चैनल को नहीं ढूंढ सका, या हो सकता है कि बॉट को उस चैनल को देखने की अनुमति न हो',
  th: 'บอทไม่พบช่องที่คุณกำหนด หรือบอทอาจไม่มีสิทธิ์ในการดูช่องนั้น',
  'zh-CN': '机器人无法找到您指定的频道，或者机器人可能没有查看该频道的权限',
  ja: 'ボットは指定されたチャンネルを見つけることができないか、そのチャンネルを見る権限がない可能性があります',
  'zh-TW': '機器人無法找到您指定的頻道，或者機器人可能沒有查看該頻道的權限',
  ko: '봇이 지정한 채널을 찾을 수 없거나 해당 채널을 볼 권한이 없을 수 있습니다',
};additionalSettingsMessages: Record<Locale, (link: string) => string> = {
  'id': (link) => `Pengaturan tambahan dapat dilakukan di situs web [camming.xyz](${link})`,
  'da': (link) => `Yderligere indstillinger kan foretages på webstedet [camming.xyz](${link})`,
  'de': (link) => `Zusätzliche Einstellungen können auf der Website [camming.xyz](${link}) vorgenommen werden`,
  'en-GB': (link) => `Additional settings can be configured on the website [camming.xyz](${link})`,
  'en-US': (link) => `Additional settings can be configured on the website [camming.xyz](${link})`,
  'es-ES': (link) => `Ajustes adicionales se pueden configurar en el sitio web [camming.xyz](${link})`,
  'es-419': (link) => `Ajustes adicionales se pueden configurar en el sitio web [camming.xyz](${link})`,
  'fr': (link) => `Des paramètres supplémentaires peuvent être configurés sur le site [camming.xyz](${link})`,
  'hr': (link) => `Dodatne postavke možete konfigurirati na web stranici [camming.xyz](${link})`,
  'it': (link) => `Impostazioni aggiuntive possono essere configurate sul sito [camming.xyz](${link})`,
  'lt': (link) => `Papildomus nustatymus galite atlikti svetainėje [camming.xyz](${link})`,
  'hu': (link) => `További beállítások elérhetők a weboldalon: [camming.xyz](${link})`,
  'nl': (link) => `Aanvullende instellingen kunnen worden geconfigureerd op de website [camming.xyz](${link})`,
  'no': (link) => `Tilleggsinnstillinger kan konfigureres på nettstedet [camming.xyz](${link})`,
  'pl': (link) => `Dodatkowe ustawienia można skonfigurować na stronie [camming.xyz](${link})`,
  'pt-BR': (link) => `Configurações adicionais podem ser feitas no site [camming.xyz](${link})`,
  'ro': (link) => `Setările suplimentare pot fi configurate pe site-ul [camming.xyz](${link})`,
  'fi': (link) => `Lisäasetuksia voi tehdä verkkosivulla [camming.xyz](${link})`,
  'sv-SE': (link) => `Ytterligare inställningar kan göras på webbplatsen [camming.xyz](${link})`,
  'vi': (link) => `Có thể cấu hình thêm các cài đặt tại trang web [camming.xyz](${link})`,
  'tr': (link) => `Ek ayarları [camming.xyz](${link}) sitesinden yapabilirsiniz`,
  'cs': (link) => `Další nastavení lze provést na webu [camming.xyz](${link})`,
  'el': (link) => `Πρόσθετες ρυθμίσεις μπορούν να διαμορφωθούν στον ιστότοπο [camming.xyz](${link})`,
  'bg': (link) => `Допълнителни настройки могат да бъдат направени на сайта [camming.xyz](${link})`,
  'ru': (link) => `Дополнительные настройки можно выполнить на сайте [camming.xyz](${link})`,
  'uk': (link) => `Додаткові налаштування можна виконати на сайті [camming.xyz](${link})`,
  'hi': (link) => `अतिरिक्त सेटिंग्स वेबसाइट [camming.xyz](${link}) पर कॉन्फ़िगर की जा सकती हैं`,
  'th': (link) => `ตั้งค่าเพิ่มเติมที่เว็บไซต์ [camming.xyz](${link})`,
  'zh-CN': (link) => `可在网站 [camming.xyz](${link}) 上进行其他设置`,
  'ja': (link) => `追加の設定はウェブサイト [camming.xyz](${link}) で行えます`,
  'zh-TW': (link) => `可在網站 [camming.xyz](${link}) 上進行其他設定`,
  'ko': (link) => `추가 설정은 웹사이트 [camming.xyz](${link})에서 구성할 수 있습니다`,
};premiumRequiredMessages: Record<Locale, (tier: number) => string> = {
  id: (tier) => `Perintah ini memerlukan anggota premium **tingkat ${tier}** atau lebih tinggi\n> **Berlangganan premium di [camming.xyz](https://camming.xyz/dashboard)**`,
  da: (tier) => `Denne kommando kræver et premium-medlem **niveau ${tier}** eller højere\n> **Abonner på premium på [camming.xyz](https://camming.xyz/dashboard)**`,
  de: (tier) => `Dieser Befehl erfordert ein Premium-Mitglied **Stufe ${tier}** oder höher\n> **Abonnieren Sie Premium unter [camming.xyz](https://camming.xyz/dashboard)**`,
  'en-GB': (tier) => `This command requires a premium member **tier ${tier}** or higher\n> **Subscribe to premium at [camming.xyz](https://camming.xyz/dashboard)**`,
  'en-US': (tier) => `This command requires a premium member **tier ${tier}** or higher\n> **Subscribe to premium at [camming.xyz](https://camming.xyz/dashboard)**`,
  'es-ES': (tier) => `Este comando requiere un miembro premium **nivel ${tier}** o superior\n> **Suscríbete a premium en [camming.xyz](https://camming.xyz/dashboard)**`,
  'es-419': (tier) => `Este comando requiere un miembro premium **nivel ${tier}** o superior\n> **Suscríbete a premium en [camming.xyz](https://camming.xyz/dashboard)**`,
  fr: (tier) => `Cette commande nécessite un membre premium **niveau ${tier}** ou supérieur\n> **Abonnez-vous au premium sur [camming.xyz](https://camming.xyz/dashboard)**`,
  hr: (tier) => `Ova naredba zahtijeva premium člana **razina ${tier}** ili višu\n> **Pretplatite se na premium na [camming.xyz](https://camming.xyz/dashboard)**`,
  it: (tier) => `Questo comando richiede un membro premium **livello ${tier}** o superiore\n> **Abbonati a premium su [camming.xyz](https://camming.xyz/dashboard)**`,
  lt: (tier) => `Šiai komandai reikalingas premium narys **lygio ${tier}** ar aukštesnio\n> **Prenumeruokite premium adresu [camming.xyz](https://camming.xyz/dashboard)**`,
  hu: (tier) => `Ehhez a parancshoz prémium tag szükséges **${tier}. szint** vagy magasabb\n> **Iratkozz fel a prémiumra a [camming.xyz](https://camming.xyz/dashboard)**`,
  nl: (tier) => `Deze opdracht vereist een premium-lid **niveau ${tier}** of hoger\n> **Abonneer op premium op [camming.xyz](https://camming.xyz/dashboard)**`,
  no: (tier) => `Denne kommandoen krever et premium-medlem **nivå ${tier}** eller høyere\n> **Abonner på premium på [camming.xyz](https://camming.xyz/dashboard)**`,
  pl: (tier) => `To polecenie wymaga członkostwa premium **poziomu ${tier}** lub wyższego\n> **Zasubskrybuj premium na [camming.xyz](https://camming.xyz/dashboard)**`,
  'pt-BR': (tier) => `Este comando requer um membro premium **nível ${tier}** ou superior\n> **Assine o premium em [camming.xyz](https://camming.xyz/dashboard)**`,
  ro: (tier) => `Această comandă necesită un membru premium **nivelul ${tier}** sau mai mare\n> **Abonați-vă la premium pe [camming.xyz](https://camming.xyz/dashboard)**`,
  fi: (tier) => `Tämä komento vaatii premium-jäsenyyden **tasoa ${tier}** tai korkeampaa\n> **Tilaa premium osoitteessa [camming.xyz](https://camming.xyz/dashboard)**`,
  'sv-SE': (tier) => `Detta kommando kräver ett premium-medlemskap **nivå ${tier}** eller högre\n> **Prenumerera på premium på [camming.xyz](https://camming.xyz/dashboard)**`,
  vi: (tier) => `Lệnh này yêu cầu thành viên premium **cấp độ ${tier}** trở lên\n> **Đăng ký premium tại [camming.xyz](https://camming.xyz/dashboard)**`,
  tr: (tier) => `Bu komut, premium üyesi **seviyesi ${tier}** veya daha yüksek gerektirir\n> **Premium'a [camming.xyz](https://camming.xyz/dashboard) adresinden abone olun**`,
  cs: (tier) => `Tento příkaz vyžaduje člena premium **úrovně ${tier}** nebo vyšší\n> **Přihlaste se k premium na [camming.xyz](https://camming.xyz/dashboard)**`,
  el: (tier) => `Αυτή η εντολή απαιτεί μέλος premium **επίπεδο ${tier}** ή υψηλότερο\n> **Εγγραφείτε στο premium στο [camming.xyz](https://camming.xyz/dashboard)**`,
  bg: (tier) => `Тази команда изисква премиум член **ниво ${tier}** или по-високо\n> **Абонирайте се за премиум на [camming.xyz](https://camming.xyz/dashboard)**`,
  ru: (tier) => `Эта команда требует премиум-членство **уровня ${tier}** или выше\n> **Подпишитесь на премиум на [camming.xyz](https://camming.xyz/dashboard)**`,
  uk: (tier) => `Ця команда вимагає преміум-учасника **рівня ${tier}** або вище\n> **Підпишіться на преміум на [camming.xyz](https://camming.xyz/dashboard)**`,
  hi: (tier) => `इस कमांड के लिए प्रीमियम सदस्यता **स्तर ${tier}** या उससे ऊपर की आवश्यकता है\n> **प्रीमियम की सदस्यता [camming.xyz](https://camming.xyz/dashboard) पर लें**`,
  th: (tier) => `คำสั่งนี้จำเป็นต้องมีสมาชิกพรีเมี่ยม **ระดับที่ ${tier}** หรือสูงกว่า\n> **สมัครสมาชิกพรีเมี่ยมได้ที่ [camming.xyz](https://camming.xyz/dashboard)**`,
  'zh-CN': (tier) => `此命令需要高级会员 **等级 ${tier}** 或更高\n> **在 [camming.xyz](https://camming.xyz/dashboard) 订阅高级会员**`,
  ja: (tier) => `このコマンドは、プレミアムメンバーシップ **レベル ${tier}** 以上が必要です\n> **[camming.xyz](https://camming.xyz/dashboard) でプレミアムに登録してください**`,
  'zh-TW': (tier) => `此指令需要高級會員 **等級 ${tier}** 或更高\n> **在 [camming.xyz](https://camming.xyz/dashboard) 訂閱高級會員**`,
  ko: (tier) => `이 명령은 프리미엄 멤버십 **레벨 ${tier}** 이상이 필요합니다\n> **[camming.xyz](https://camming.xyz/dashboard)에서 프리미엄을 구독하세요**`,
};noAdminCommandPermission: Record<Locale, string> = {
  id: 'Anda tidak memiliki izin `Administrator` untuk menggunakan perintah ini',
  da: 'Du har ikke `Administrator`-tilladelser til at bruge denne kommando',
  de: 'Du hast keine `Administrator`-Berechtigung, um diesen Befehl zu verwenden',
  'en-GB': 'You do not have `Administrator` permission to use this command',
  'en-US': 'You do not have `Administrator` permission to use this command',
  'es-ES': 'No tienes permiso de `Administrador` para usar este comando',
  'es-419': 'No tienes permiso de `Administrador` para usar este comando',
  fr: 'Vous n’avez pas la permission `Administrateur` pour utiliser cette commande',
  hr: 'Nemate `Administrator` dopuštenje za korištenje ove naredbe',
  it: 'Non hai il permesso di `Amministratore` per usare questo comando',
  lt: 'Neturite `Administratoriaus` leidimo naudoti šią komandą',
  hu: 'Nincs `Adminisztrátor` jogosultságod ennek a parancsnak a használatához',
  nl: 'Je hebt geen `Beheerder`-rechten om dit commando te gebruiken',
  no: 'Du har ikke `Administrator`-tillatelse til å bruke denne kommandoen',
  pl: 'Nie masz uprawnień `Administratora`, aby użyć tej komendy',
  'pt-BR': 'Você não tem permissão de `Administrador` para usar este comando',
  ro: 'Nu aveți permisiunea de `Administrator` pentru a utiliza această comandă',
  fi: 'Sinulla ei ole `Ylläpitäjä`-oikeuksia käyttääksesi tätä komentoa',
  'sv-SE': 'Du har inte `Administratör`-behörighet för att använda det här kommandot',
  vi: 'Bạn không có quyền `Quản trị viên` để sử dụng lệnh này',
  tr: 'Bu komutu kullanmak için `Yönetici` izniniz yok',
  cs: 'Nemáte oprávnění `Administrátora` k použití tohoto příkazu',
  el: 'Δεν έχετε δικαιώματα `Διαχειριστή` για να χρησιμοποιήσετε αυτήν την εντολή',
  bg: 'Нямате `Администратор` права, за да използвате тази команда',
  ru: 'У вас нет прав `Администратора`, чтобы использовать эту команду',
  uk: 'Ви не маєте дозволу `Адміністратора`, щоб використати цю команду',
  hi: 'इस कमांड का उपयोग करने के लिए आपके पास `प्रशासक` अनुमति नहीं है',
  th: 'คุณไม่มีสิทธิ์ `ผู้ดูแลระบบ` เพื่อที่จะใช้งานคำสั่งนี้',
  'zh-CN': '你没有 `管理员` 权限来使用此命令',
  ja: 'このコマンドを使用するには、`管理者` 権限が必要です',
  'zh-TW': '你沒有 `管理員` 權限來使用此指令',
  ko: '이 명령을 사용하려면 `관리자` 권한이 필요합니다',
};noAdminButtonPermission: Record<Locale, string> = {
  id: 'Anda tidak memiliki izin `Administrator` untuk menggunakan tombol ini',
  da: 'Du har ikke `Administrator`-tilladelser til at bruge denne knap',
  de: 'Du hast keine `Administrator`-Berechtigung, um diese Schaltfläche zu verwenden',
  'en-GB': 'You do not have `Administrator` permission to use this button',
  'en-US': 'You do not have `Administrator` permission to use this button',
  'es-ES': 'No tienes permiso de `Administrador` para usar este botón',
  'es-419': 'No tienes permiso de `Administrador` para usar este botón',
  fr: 'Vous n’avez pas la permission `Administrateur` pour utiliser ce bouton',
  hr: 'Nemate `Administrator` dopuštenje za korištenje ovog gumba',
  it: 'Non hai il permesso di `Amministratore` per usare questo pulsante',
  lt: 'Neturite `Administratoriaus` leidimo naudoti šį mygtuką',
  hu: 'Nincs `Adminisztrátor` jogosultságod ennek a gombnak a használatához',
  nl: 'Je hebt geen `Beheerder`-rechten om deze knop te gebruiken',
  no: 'Du har ikke `Administrator`-tillatelse til å bruke denne knappen',
  pl: 'Nie masz uprawnień `Administratora`, aby użyć tego przycisku',
  'pt-BR': 'Você não tem permissão de `Administrador` para usar este botão',
  ro: 'Nu aveți permisiunea de `Administrator` pentru a utiliza acest buton',
  fi: 'Sinulla ei ole `Ylläpitäjä`-oikeuksia käyttääksesi tätä painiketta',
  'sv-SE': 'Du har inte `Administratör`-behörighet för att använda den här knappen',
  vi: 'Bạn không có quyền `Quản trị viên` để sử dụng nút này',
  tr: 'Bu düğmeyi kullanmak için `Yönetici` izniniz yok',
  cs: 'Nemáte oprávnění `Administrátora` k použití tohoto tlačítka',
  el: 'Δεν έχετε δικαιώματα `Διαχειριστή` για να χρησιμοποιήσετε αυτό το κουμπί',
  bg: 'Нямате `Администратор` права, за да използвате този бутон',
  ru: 'У вас нет прав `Администратора`, чтобы использовать эту кнопку',
  uk: 'Ви не маєте дозволу `Адміністратора`, щоб використати цю кнопку',
  hi: 'इस बटन का उपयोग करने के लिए आपके पास `प्रशासक` अनुमति नहीं है',
  th: 'คุณไม่มีสิทธิ์ `ผู้ดูแลระบบ` เพื่อที่จะใช้งานปุ่มนี้',
  'zh-CN': '你没有 `管理员` 权限来使用此按钮',
  ja: 'このボタンを使用するには、`管理者` 権限が必要です',
  'zh-TW': '你沒有 `管理員` 權限來使用此按鈕',
  ko: '이 버튼을 사용하려면 `관리자` 권한이 필요합니다',
};userNotFound: Record<Locale, string> = {
  id: 'Pengguna tidak ditemukan',
  da: 'Bruger ikke fundet',
  de: 'Benutzer nicht gefunden',
  'en-GB': 'User not found',
  'en-US': 'User not found',
  'es-ES': 'Usuario no encontrado',
  'es-419': 'Usuario no encontrado',
  fr: 'Utilisateur non trouvé',
  hr: 'Korisnik nije pronađen',
  it: 'Utente non trovato',
  lt: 'Vartotojas nerastas',
  hu: 'Felhasználó nem található',
  nl: 'Gebruiker niet gevonden',
  no: 'Bruker ikke funnet',
  pl: 'Użytkownik nie znaleziony',
  'pt-BR': 'Usuário não encontrado',
  ro: 'Utilizator negăsit',
  fi: 'Käyttäjää ei löytynyt',
  'sv-SE': 'Användare hittades inte',
  vi: 'Không tìm thấy người dùng',
  tr: 'Kullanıcı bulunamadı',
  cs: 'Uživatel nenalezen',
  el: 'Ο χρήστης δεν βρέθηκε',
  bg: 'Потребителят не е намерен',
  ru: 'Пользователь не найден',
  uk: 'Користувача не знайдено',
  hi: 'यूज़र नहीं मिला',
  th: 'ไม่พบผู้ใช้',
  'zh-CN': '未找到用户',
  ja: 'ユーザーが見つかりません',
  'zh-TW': '找不到使用者',
  ko: '사용자를 찾을 수 없습니다',
};actions: Record<Locale, { ban: string; kick: string; timeout: string; user: string; created: string; joined: string; avatar: string; banner: string; refresh: string; commands: string; commandsList: string; inviteBot: string; website: string; discord: string; previous: string; next: string; setAll: string; disabledAll: string; cancel: string; save: string; close: string; message: string; embed: string; example: string; clear: string; clearAll: string; submit: string; open: string; unban: string; removeTimeout: string; duration: string; reason: string; optional: string; confirm: string; timeoutUntil: string; status: string; enable: string; disable: string; }> = {
    'en-US': { kick: 'Kick', ban: 'Ban', timeout: 'Timeout', user: 'User', created: 'Created', joined: 'Joined', avatar: 'Avatar', banner: 'Banner', refresh: 'Refresh', commands: 'Commands', commandsList: 'Commands list', inviteBot: 'Invite bot', website: 'Website', discord: 'Discord', previous: 'Previous', next: 'Next', setAll: 'Set All', disabledAll: 'Disabled All', cancel: 'Cancel', save: 'Save', close: 'Close', message: 'Message', embed: 'Embed', example: 'Example', clear: 'Clear', clearAll: 'Clear All', submit: 'Submit', open: 'Open', unban: 'Unban', removeTimeout: 'Remove Timeout', duration: 'Duration', reason: 'Reason', optional: 'Optional', confirm: 'Confirm', timeoutUntil: 'Timeout Until', status: 'Status', enable: 'Enable', disable: 'Disable' },
    'en-GB': { kick: 'Kick', ban: 'Ban', timeout: 'Timeout', user: 'User', created: 'Created', joined: 'Joined', avatar: 'Avatar', banner: 'Banner', refresh: 'Refresh', commands: 'Commands', commandsList: 'Commands list', inviteBot: 'Invite bot', website: 'Website', discord: 'Discord', previous: 'Previous', next: 'Next', setAll: 'Set All', disabledAll: 'Disabled All', cancel: 'Cancel', save: 'Save', close: 'Close', message: 'Message', embed: 'Embed', example: 'Example', clear: 'Clear', clearAll: 'Clear All', submit: 'Submit', open: 'Open', unban: 'Unban', removeTimeout: 'Remove Timeout', duration: 'Duration', reason: 'Reason', optional: 'Optional', confirm: 'Confirm', timeoutUntil: 'Timeout Until', status: 'Status', enable: 'Enable', disable: 'Disable' },
    'th': { kick: 'เตะ', ban: 'แบน', timeout: 'หมดเวลา', user: 'ผู้ใช้', created: 'สร้างเมื่อ', joined: 'เข้าร่วมเมื่อ', avatar: 'รูปโปรไฟล์', banner: 'แบนเนอร์', refresh: 'รีเฟรช', commands: 'คำสั่ง', commandsList: 'รายการคำสั่ง', inviteBot: 'เชิญบอท', website: 'เว็บไซต์', discord: 'ดิสคอร์ด', previous: 'ก่อนหน้า', next: 'ถัดไป', setAll: 'ตั้งค่าทั้งหมด', disabledAll: 'ปิดทั้งหมด', cancel: 'ยกเลิก', save: 'บันทึก', close: 'ปิด', message: 'ข้อความ', embed: 'ฝัง', example: 'ตัวอย่าง', clear: 'ล้าง', clearAll: 'ล้างทั้งหมด', submit: 'ส่ง', open: 'เปิด', unban: 'เลิกแบน', removeTimeout: 'ลบการหมดเวลา', duration: 'ระยะเวลา', reason: 'เหตุผล', optional: 'ไม่จำเป็น', confirm: 'ยืนยัน', timeoutUntil: 'หมดเวลาถึง', status: 'สถานะ', enable: 'เปิดใช้งาน', disable: 'ปิดใช้งาน' },
    'id': { kick: 'Tendang', ban: 'Larangan', timeout: 'Waktu Habis', user: 'Pengguna', created: 'Dibuat', joined: 'Bergabung', avatar: 'Avatar', banner: 'Spanduk', refresh: 'Segarkan', commands: 'Perintah', commandsList: 'Daftar Perintah', inviteBot: 'Undang bot', website: 'Situs web', discord: 'Discord', previous: 'Sebelumnya', next: 'Berikutnya', setAll: 'Atur Semua', disabledAll: 'Nonaktifkan Semua', cancel: 'Batal', save: 'Simpan', close: 'Tutup', message: 'Pesan', embed: 'Embed', example: 'Contoh', clear: 'Bersihkan', clearAll: 'Bersihkan Semua', submit: 'Kirim', open: 'Buka', unban: 'Buka Larangan', removeTimeout: 'Hapus Waktu Habis', duration: 'Durasi', reason: 'Alasan', optional: 'Tidak wajib', confirm: 'Konfirmasi', timeoutUntil: 'Waktu Habis Sampai', status: 'Status', enable: 'Aktifkan', disable: 'Nonaktifkan' },
    'da': { kick: 'Spark', ban: 'Forbud', timeout: 'Timeout', user: 'Bruger', created: 'Oprettet', joined: 'Tilmeldt', avatar: 'Avatar', banner: 'Banner', refresh: 'Opdater', commands: 'Kommandorer', commandsList: 'Kommandoliste', inviteBot: 'Inviter bot', website: 'Hjemmeside', discord: 'Discord', previous: 'Forrige', next: 'Næste', setAll: 'Indstil Alle', disabledAll: 'Deaktiver Alle', cancel: 'Annuller', save: 'Gem', close: 'Luk', message: 'Besked', embed: 'Embed', example: 'Eksempel', clear: 'Ryd', clearAll: 'Ryd Alle', submit: 'Indsend', open: 'Åbn', unban: 'Ophæv forbud', removeTimeout: 'Fjern Timeout', duration: 'Varighed', reason: 'Årsag', optional: 'Valgfrit', confirm: 'Bekræft', timeoutUntil: 'Timeout Indtil', status: 'Status', enable: 'Aktivér', disable: 'Deaktivér' },
    'de': { kick: 'Kicken', ban: 'Sperren', timeout: 'Zeitüberschreitung', user: 'Benutzer', created: 'Erstellt', joined: 'Beigetreten', avatar: 'Avatar', banner: 'Banner', refresh: 'Aktualisieren', commands: 'Befehle', commandsList: 'Befehlsliste', inviteBot: 'Bot einladen', website: 'Website', discord: 'Discord', previous: 'Vorherige', next: 'Nächste', setAll: 'Alles Einstellen', disabledAll: 'Alle Deaktivieren', cancel: 'Abbrechen', save: 'Speichern', close: 'Schließen', message: 'Nachricht', embed: 'Embed', example: 'Beispiel', clear: 'Leeren', clearAll: 'Alles Leeren', submit: 'Absenden', open: 'Öffnen', unban: 'Entsperren', removeTimeout: 'Timeout Entfernen', duration: 'Dauer', reason: 'Grund', optional: 'Nicht erforderlich', confirm: 'Bestätigen', timeoutUntil: 'Timeout Bis', status: 'Status', enable: 'Aktivieren', disable: 'Deaktivieren' },
    'es-ES': { kick: 'Patear', ban: 'Prohibir', timeout: 'Tiempo agotado', user: 'Usuario', created: 'Creado', joined: 'Unido', avatar: 'Avatar', banner: 'Banner', refresh: 'Actualizar', commands: 'Comandos', commandsList: 'Lista de comandos', inviteBot: 'Invitar bot', website: 'Sitio web', discord: 'Discord', previous: 'Anterior', next: 'Siguiente', setAll: 'Configurar Todo', disabledAll: 'Deshabilitar Todo', cancel: 'Cancelar', save: 'Guardar', close: 'Cerrar', message: 'Mensaje', embed: 'Embed', example: 'Ejemplo', clear: 'Limpiar', clearAll: 'Limpiar Todo', submit: 'Enviar', open: 'Abrir', unban: 'Quitar prohibición', removeTimeout: 'Eliminar tiempo agotado', duration: 'Duración', reason: 'Razón', optional: 'Opcional (no obligatorio)', confirm: 'Confirmar', timeoutUntil: 'Timeout Hasta', status: 'Estado', enable: 'Activar', disable: 'Desactivar' },
    'es-419': { kick: 'Patear', ban: 'Prohibir', timeout: 'Tiempo agotado', user: 'Usuario', created: 'Creado', joined: 'Unido', avatar: 'Avatar', banner: 'Banner', refresh: 'Actualizar', commands: 'Comandos', commandsList: 'Lista de comandos', inviteBot: 'Invitar bot', website: 'Sitio web', discord: 'Discord', previous: 'Anterior', next: 'Siguiente', setAll: 'Configurar Todo', disabledAll: 'Deshabilitar Todo', cancel: 'Cancelar', save: 'Guardar', close: 'Cerrar', message: 'Mensaje', embed: 'Embed', example: 'Ejemplo', clear: 'Limpiar', clearAll: 'Limpiar Todo', submit: 'Enviar', open: 'Abrir', unban: 'Quitar prohibición', removeTimeout: 'Eliminar tiempo agotado', duration: 'Duración', reason: 'Razón', optional: 'Opcional (no obligatorio)', confirm: 'Confirmar', timeoutUntil: 'Timeout Hasta', status: 'Estado', enable: 'Activar', disable: 'Desactivar' },
    'fr': { kick: 'Expulser', ban: 'Interdire', timeout: 'Délai écoulé', user: 'Utilisateur', created: 'Créé', joined: 'Rejoint', avatar: 'Avatar', banner: 'Bannière', refresh: 'Rafraîchir', commands: 'Commandes', commandsList: 'Liste des commandes', inviteBot: 'Inviter le bot', website: 'Site web', discord: 'Discord', previous: 'Précédent', next: 'Suivant', setAll: 'Tout Configurer', disabledAll: 'Tout Désactiver', cancel: 'Annuler', save: 'Sauvegarder', close: 'Fermer', message: 'Message', embed: 'Embed', example: 'Exemple', clear: 'Effacer', clearAll: 'Tout Effacer', submit: 'Soumettre', open: 'Ouvrir', unban: 'Révoquer l\'interdiction', removeTimeout: 'Supprimer le délai', duration: 'Durée', reason: 'Raison', optional: 'Facultatif', confirm: 'Confirmer', timeoutUntil: 'Expiration du délai', status: 'Statut', enable: 'Activer', disable: 'Désactiver' },
    'hr': { kick: 'Izbaciti', ban: 'Zabrana', timeout: 'Isteklo vrijeme', user: 'Korisnik', created: 'Kreirano', joined: 'Pridruženo', avatar: 'Avatar', banner: 'Banner', refresh: 'Osvježi', commands: 'Komande', commandsList: 'Popis komandi', inviteBot: 'Pozovi bot', website: 'Web stranica', discord: 'Discord', previous: 'Prethodni', next: 'Sljedeći', setAll: 'Postavi Sve', disabledAll: 'Onemogući Sve', cancel: 'Otkaži', save: 'Spremi', close: 'Zatvori', message: 'Poruka', embed: 'Embed', example: 'Primjer', clear: 'Očisti', clearAll: 'Očisti Sve', submit: 'Pošalji', open: 'Otvori', unban: 'Ukloni zabranu', removeTimeout: 'Ukloni vremensko ograničenje', duration: 'Trajanje', reason: 'Razlog', optional: 'Neobavezno', confirm: 'Potvrdi', timeoutUntil: 'Istječe za', status: 'Status', enable: 'Omogući', disable: 'Onemogući' },
    'it': { kick: 'Calciare', ban: 'Bannare', timeout: 'Tempo scaduto', user: 'Utente', created: 'Creato', joined: 'Unito', avatar: 'Avatar', banner: 'Banner', refresh: 'Ricarica', commands: 'Comandi', commandsList: 'Elenco comandi', inviteBot: 'Invita bot', website: 'Sito web', discord: 'Discord', previous: 'Precedente', next: 'Successivo', setAll: 'Imposta Tutto', disabledAll: 'Disabilita Tutto', cancel: 'Annulla', save: 'Salva', close: 'Chiudi', message: 'Messaggio', embed: 'Embed', example: 'Esempio', clear: 'Pulisci', clearAll: 'Pulisci Tutto', submit: 'Invia', open: 'Apri', unban: 'Rimuovi ban', removeTimeout: 'Rimuovi timeout', duration: 'Durata', reason: 'Motivo', optional: 'Opzionale (non necessario)', confirm: 'Conferma', timeoutUntil: 'Timeout Fino A', status: 'Stato', enable: 'Abilita', disable: 'Disabilita' },
    'lt': { kick: 'Spardyti', ban: 'Uždrausti', timeout: 'Laiko pabaiga', user: 'Vartotojas', created: 'Sukurtas', joined: 'Prisijungęs', avatar: 'Avataras', banner: 'Baneris', refresh: 'Atnaujinti', commands: 'Komandos', commandsList: 'Komandų sąrašas', inviteBot: 'Pakviesti botą', website: 'Tinklalapis', discord: 'Discord', previous: 'Ankstesnis', next: 'Kitas', setAll: 'Nustatyti Visus', disabledAll: 'Išjungti Visus', cancel: 'Atšaukti', save: 'Išsaugoti', close: 'Uždaryti', message: 'Žinutė', embed: 'Embed', example: 'Pavyzdys', clear: 'Išvalyti', clearAll: 'Išvalyti Visus', submit: 'Pateikti', open: 'Atidaryti', unban: 'Atšaukti draudimą', removeTimeout: 'Panaikinti laiko apribojimą', duration: 'Trukmė', reason: 'Priežastis', optional: 'Nebūtina', confirm: 'Patvirtinti', timeoutUntil: 'Laiko apribojimas baigsis iki', status: 'Būsena', enable: 'Įgalinti', disable: 'Išjungti' },
    'hu': { kick: 'Kirúgás', ban: 'Büntetés', timeout: 'Időkorlát', user: 'Felhasználó', created: 'Létrehozva', joined: 'Csatlakozva', avatar: 'Profilkép', banner: 'Banner', refresh: 'Frissítés', commands: 'Parancsok', commandsList: 'Parancsok listája', inviteBot: 'Bot meghívása', website: 'Weboldal', discord: 'Discord', previous: 'Előző', next: 'Következő', setAll: 'Mindent Beállít', disabledAll: 'Mindent Letilt', cancel: 'Mégse', save: 'Mentés', close: 'Bezár', message: 'Üzenet', embed: 'Embed', example: 'Példa', clear: 'Töröl', clearAll: 'Mindet Töröl', submit: 'Küldés', open: 'Megnyit', unban: 'Feloldás', removeTimeout: 'Timeout eltávolítása', duration: 'Időtartam', reason: 'Ok', optional: 'Nem kötelező', confirm: 'Megerősít', timeoutUntil: 'Timeout vége', status: 'Állapot', enable: 'Engedélyez', disable: 'Letilt' },
    'nl': { kick: 'Schoppen', ban: 'Verbannen', timeout: 'Tijdslimiet', user: 'Gebruiker', created: 'Aangemaakt', joined: 'Geweest', avatar: 'Avatar', banner: 'Banner', refresh: 'Vernieuwen', commands: 'Opdrachten', commandsList: 'Opdrachtenlijst', inviteBot: 'Bot uitnodigen', website: 'Website', discord: 'Discord', previous: 'Vorige', next: 'Volgende', setAll: 'Stel Alles In', disabledAll: 'Schakel Alles Uit', cancel: 'Annuleren', save: 'Opslaan', close: 'Sluiten', message: 'Bericht', embed: 'Embed', example: 'Voorbeeld', clear: 'Wissen', clearAll: 'Alles Wissen', submit: 'Verzenden', open: 'Openen', unban: 'Debannen', removeTimeout: 'Timeout verwijderen', duration: 'Duur', reason: 'Reden', optional: 'Optioneel (niet verplicht)', confirm: 'Bevestigen', timeoutUntil: 'Timeout Tot', status: 'Status', enable: 'Inschakelen', disable: 'Uitschakelen' },
    'no': { kick: 'Spark', ban: 'Forbud', timeout: 'Timeout', user: 'Bruker', created: 'Opprettet', joined: 'Blandet', avatar: 'Avatar', banner: 'Banner', refresh: 'Oppdater', commands: 'Kommandoer', commandsList: 'Kommando liste', inviteBot: 'Inviter bot', website: 'Nettside', discord: 'Discord', previous: 'Forrige', next: 'Neste', setAll: 'Sett Alle', disabledAll: 'Deaktiver Alle', cancel: 'Avbryt', save: 'Lagre', close: 'Lukk', message: 'Melding', embed: 'Embed', example: 'Eksempel', clear: 'Tøm', clearAll: 'Tøm Alle', submit: 'Send', open: 'Åpne', unban: 'Opphev forbud', removeTimeout: 'Fjern Timeout', duration: 'Varighet', reason: 'Grunn', optional: 'Valgfritt (ikke nødvendig)', confirm: 'Bekreft', timeoutUntil: 'Timeout Utløper', status: 'Status', enable: 'Aktiver', disable: 'Deaktiver' },
    'pl': { kick: 'Wyrzucenie', ban: 'Zabronienie', timeout: 'Limit czasu', user: 'Użytkownik', created: 'Utworzony', joined: 'Dołączony', avatar: 'Avatar', banner: 'Baner', refresh: 'Odśwież', commands: 'Komendy', commandsList: 'Lista komend', inviteBot: 'Zaproś bota', website: 'Strona internetowa', discord: 'Discord', previous: 'Poprzedni', next: 'Następny', setAll: 'Ustaw Wszystko', disabledAll: 'Wyłącz Wszystko', cancel: 'Anuluj', save: 'Zapisz', close: 'Zamknij', message: 'Wiadomość', embed: 'Embed', example: 'Przykład', clear: 'Wyczyść', clearAll: 'Wyczyść Wszystko', submit: 'Wyślij', open: 'Otwórz', unban: 'Odbanuj', removeTimeout: 'Usuń Limit Czasu', duration: 'Czas trwania', reason: 'Powód', optional: 'Opcjonalny (nieobowiązkowy)', confirm: 'Potwierdź', timeoutUntil: 'Limit Czasu Do', status: 'Status', enable: 'Włącz', disable: 'Wyłącz' },
    'pt-BR': { kick: 'Expulsar', ban: 'Banir', timeout: 'Tempo esgotado', user: 'Usuário', created: 'Criado', joined: 'Entrou', avatar: 'Avatar', banner: 'Banner', refresh: 'Atualizar', commands: 'Comandos', commandsList: 'Lista de comandos', inviteBot: 'Convidar bot', website: 'Website', discord: 'Discord', previous: 'Anterior', next: 'Próximo', setAll: 'Definir Todos', disabledAll: 'Desabilitar Todos', cancel: 'Cancelar', save: 'Salvar', close: 'Fechar', message: 'Mensagem', embed: 'Embed', example: 'Exemplo', clear: 'Limpar', clearAll: 'Limpar Tudo', submit: 'Enviar', open: 'Abrir', unban: 'Desbanir', removeTimeout: 'Remover Timeout', duration: 'Duração', reason: 'Razão', optional: 'Opcional (não obrigatório)', confirm: 'Confirmar', timeoutUntil: 'Tempo Esgotado Até', status: 'Status', enable: 'Habilitar', disable: 'Desabilitar' },
    'ro': { kick: 'Kick', ban: 'Interzis', timeout: 'Timp epuizat', user: 'Utilizator', created: 'Creat', joined: 'Intrat', avatar: 'Avatar', banner: 'Banner', refresh: 'Reîmprospătează', commands: 'Comenzi', commandsList: 'Lista comenzilor', inviteBot: 'Invită bot', website: 'Website', discord: 'Discord', previous: 'Anterior', next: 'Următorul', setAll: 'Setează Tot', disabledAll: 'Dezactivează Tot', cancel: 'Anulează', save: 'Salvează', close: 'Închide', message: 'Mesaj', embed: 'Embed', example: 'Exemplu', clear: 'Curăță', clearAll: 'Curăță Tot', submit: 'Trimite', open: 'Deschide', unban: 'Deblochează', removeTimeout: 'Elimină Timeout', duration: 'Durată', reason: 'Motiv', optional: 'Opțional (nu este necesar)', confirm: 'Confirmă', timeoutUntil: 'Timeout Până La', status: 'Status', enable: 'Activează', disable: 'Dezactivează' },
    'fi': { kick: 'Potkaista', ban: 'Estä', timeout: 'Aikaraja', user: 'Käyttäjä', created: 'Luotu', joined: 'Liittynyt', avatar: 'Avatar', banner: 'Banneri', refresh: 'Päivitä', commands: 'Komennot', commandsList: 'Komentoluettelo', inviteBot: 'Kutsu botti', website: 'Verkkosivusto', discord: 'Discord', previous: 'Edellinen', next: 'Seuraava', setAll: 'Aseta Kaikki', disabledAll: 'Poista Kaikki Käytöstä', cancel: 'Peruuta', save: 'Tallenna', close: 'Sulje', message: 'Viesti', embed: 'Embed', example: 'Esimerkki', clear: 'Tyhjennä', clearAll: 'Tyhjennä Kaikki', submit: 'Lähetä', open: 'Avaa', unban: 'Poista esto', removeTimeout: 'Poista aikaraja', duration: 'Kesto', reason: 'Syy', optional: 'Valinnainen (ei pakollinen)', confirm: 'Vahvista', timeoutUntil: 'Aikakatkaisu päättyy', status: 'Tila', enable: 'Ota käyttöön', disable: 'Poista käytöstä' },
    'sv-SE': { kick: 'Spark', ban: 'Förbjuda', timeout: 'Timeout', user: 'Användare', created: 'Skapad', joined: 'Gick med', avatar: 'Avatar', banner: 'Banner', refresh: 'Uppdatera', commands: 'Kommandon', commandsList: 'Kommandolista', inviteBot: 'Bjud in bot', website: 'Webbplats', discord: 'Discord', previous: 'Föregående', next: 'Nästa', setAll: 'Ställ In Alla', disabledAll: 'Inaktivera Alla', cancel: 'Avbryt', save: 'Spara', close: 'Stäng', message: 'Meddelande', embed: 'Embed', example: 'Exempel', clear: 'Rensa', clearAll: 'Rensa Alla', submit: 'Skicka', open: 'Öppna', unban: 'Ta bort förbud', removeTimeout: 'Ta bort Timeout', duration: 'Varaktighet', reason: 'Anledning', optional: 'Valfri (inte nödvändig)', confirm: 'Bekräfta', timeoutUntil: 'Timeout Utgår', status: 'Status', enable: 'Aktivera', disable: 'Inaktivera' },
    'vi': { kick: 'Đá', ban: 'Cấm', timeout: 'Hết thời gian', user: 'Người dùng', created: 'Tạo', joined: 'Tham gia', avatar: 'Hình đại diện', banner: 'Biểu ngữ', refresh: 'Làm mới', commands: 'Lệnh', commandsList: 'Danh sách lệnh', inviteBot: 'Mời bot', website: 'Trang web', discord: 'Discord', previous: 'Trước', next: 'Tiếp theo', setAll: 'Cài Đặt Tất Cả', disabledAll: 'Vô Hiệu Hóa Tất Cả', cancel: 'Hủy', save: 'Lưu', close: 'Đóng', message: 'Tin nhắn', embed: 'Embed', example: 'Ví dụ', clear: 'Xóa', clearAll: 'Xóa Tất Cả', submit: 'Gửi', open: 'Mở', unban: 'Bỏ cấm', removeTimeout: 'Gỡ Timeout', duration: 'Thời lượng', reason: 'Lý do', optional: 'Tùy chọn (không bắt buộc)', confirm: 'Xác nhận', timeoutUntil: 'Thời gian chờ đến', status: 'Trạng thái', enable: 'Bật', disable: 'Tắt' },
    'tr': { kick: 'Tekme', ban: 'Yasakla', timeout: 'Zaman aşımı', user: 'Kullanıcı', created: 'Oluşturuldu', joined: 'Katıldı',avatar: 'Avatar', banner: 'Afiş', refresh: 'Yenile', commands: 'Komutlar', commandsList: 'Komutlar listesi', inviteBot: 'Botu davet et', website: 'Web sitesi', discord: 'Discord', previous: 'Önceki', next: 'Sonraki', setAll: 'Tümünü Ayarla', disabledAll: 'Tümünü Devre Dışı Bırak', cancel: 'İptal', save: 'Kaydet', close: 'Kapat', message: 'Mesaj', embed: 'Embed', example: 'Örnek', clear: 'Temizle', clearAll: 'Tümünü Temizle', submit: 'Gönder', open: 'Aç', unban: 'Yasağı kaldır', removeTimeout: 'Timeout\'u kaldır', duration: 'Süre', reason: 'Neden', optional: 'İsteğe bağlı (gerekli değil)', confirm: 'Onayla', timeoutUntil: 'Zaman Aşımı Süresi', status: 'Durum', enable: 'Etkinleştir', disable: 'Devre Dışı Bırak' },
    'cs': { kick: 'Vykopnout', ban: 'Zákaz', timeout: 'Časový limit', user: 'Uživatel', created: 'Vytvořeno', joined: 'Připojeno', avatar: 'Avatar', banner: 'Banner', refresh: 'Obnovit', commands: 'Příkazy', commandsList: 'Seznam příkazů', inviteBot: 'Pozvat bota', website: 'Webová stránka', discord: 'Discord', previous: 'Předchozí', next: 'Další', setAll: 'Nastavit vše', disabledAll: 'Zakázat vše', cancel: 'Zrušit', save: 'Uložit', close: 'Zavřít', message: 'Zpráva', embed: 'Embed', example: 'Příklad', clear: 'Vymazat', clearAll: 'Vymazat vše', submit: 'Odeslat', open: 'Otevřít', unban: 'Zrušit zákaz', removeTimeout: 'Odstranit časový limit', duration: 'Trvání', reason: 'Důvod', optional: 'Volitelný (není povinný)', confirm: 'Potvrdit', timeoutUntil: 'Časový limit do', status: 'Stav', enable: 'Povolit', disable: 'Zakázat' },
    'el': { kick: 'Αποβολή', ban: 'Απαγόρευση', timeout: 'Χρόνος λήξης', user: 'Χρήστης', created: 'Δημιουργήθηκε', joined: 'Εντάχθηκε', avatar: 'Άβαταρ', banner: 'Μπανέρη', refresh: 'Ανανέωση', commands: 'Εντολές', commandsList: 'Λίστα εντολών', inviteBot: 'Προσκαλέστε το bot', website: 'Ιστοσελίδα', discord: 'Discord', previous: 'Προηγούμενο', next: 'Επόμενο', setAll: 'Ορίστε Όλα', disabledAll: 'Απενεργοποιήστε Όλα', cancel: 'Ακύρωση', save: 'Αποθήκευση', close: 'Κλείσιμο', message: 'Μήνυμα', embed: 'Embed', example: 'Παράδειγμα', clear: 'Εκκαθάριση', clearAll: 'Εκκαθάριση Όλων', submit: 'Υποβολή', open: 'Ανοιγμα', unban: 'Αίρεση αποκλεισμού', removeTimeout: 'Αφαίρεση χρονικού ορίου', duration: 'Διάρκεια', reason: 'Λόγος', optional: 'Προαιρετικός (δεν είναι απαραίτητο)', confirm: 'Επιβεβαίωση', timeoutUntil: 'Λήξη Χρόνου Αναμονής', status: 'Κατάσταση', enable: 'Ενεργοποίηση', disable: 'Απενεργοποίηση' },
    'bg': { kick: 'Изгони', ban: 'Забрани', timeout: 'Изтекло време', user: 'Потребител', created: 'Създадено', joined: 'Присъединил се', avatar: 'Аватар', banner: 'Банер', refresh: 'Освежи', commands: 'Команди', commandsList: 'Списък с команди', inviteBot: 'Покани бот', website: 'Уебсайт', discord: 'Discord', previous: 'Предишен', next: 'Следващ', setAll: 'Задай Всички', disabledAll: 'Деактивирай Всички', cancel: 'Отказ', save: 'Запази', close: 'Затвори', message: 'Съобщение', embed: 'Embed', example: 'Пример', clear: 'Изчисти', clearAll: 'Изчисти Всички', submit: 'Изпрати', open: 'Отвори', unban: 'Премахни забрана', removeTimeout: 'Премахни ограничението за време', duration: 'Продължителност', reason: 'Причина', optional: 'Незадължителен', confirm: 'Потвърди', timeoutUntil: 'Времето за изчакване до', status: 'Статус', enable: 'Активиране', disable: 'Деактивиране' },
    'ru': { kick: 'Кикнуть', ban: 'Забанить', timeout: 'Время истекло', user: 'Пользователь', created: 'Создано', joined: 'Присоединился', avatar: 'Аватар', banner: 'Баннер', refresh: 'Обновить', commands: 'Команды', commandsList: 'Список команд', inviteBot: 'Пригласить бота', website: 'Вебсайт', discord: 'Discord', previous: 'Предыдущий', next: 'Следующий', setAll: 'Установить Все', disabledAll: 'Отключить Все', cancel: 'Отменить', save: 'Сохранить', close: 'Закрыть', message: 'Сообщение', embed: 'Embed', example: 'Пример', clear: 'Очистить', clearAll: 'Очистить Все', submit: 'Отправить', open: 'Открыть', unban: 'Разбанить', removeTimeout: 'Удалить тайм-аут', duration: 'Продолжительность', reason: 'Причина', optional: 'Необязательный', confirm: 'Подтвердить', timeoutUntil: 'Тайм-аут до', status: 'Статус', enable: 'Включить', disable: 'Выключить' },
    'uk': { kick: 'Вигнати', ban: 'Заборонити', timeout: 'Час вичерпано', user: 'Користувач', created: 'Створено', joined: 'Приєднано', avatar: 'Аватар', banner: 'Банер', refresh: 'Оновити', commands: 'Команди', commandsList: 'Список команд', inviteBot: 'Запросити бота', website: 'Вебсайт', discord: 'Discord', previous: 'Попередній', next: 'Наступний', setAll: 'Встановити Все', disabledAll: 'Вимкнути Все', cancel: 'Скасувати', save: 'Зберегти', close: 'Закрити', message: 'Повідомлення', embed: 'Embed', example: 'Приклад', clear: 'Очистити', clearAll: 'Очистити Все', submit: 'Надіслати', open: 'Відкрити', unban: 'Розбанити', removeTimeout: 'Видалити тайм-аут', duration: 'Тривалість', reason: 'Причина', optional: 'Необов\'язковий', confirm: 'Підтвердити', timeoutUntil: 'Тайм-аут до', status: 'Статус', enable: 'Увімкнути', disable: 'Вимкнути' },
    'hi': { kick: 'किक', ban: 'बैन', timeout: 'समय समाप्त', user: 'उपयोगकर्ता', created: 'निर्मित', joined: 'जुड़ा', avatar: 'अवतार', banner: 'बैनर', refresh: 'रिफ्रेश', commands: 'कमांड्स', commandsList: 'कमांड्स की सूची', inviteBot: 'बोट को निमंत्रण दें', website: 'वेबसाइट', discord: 'Discord', previous: 'पिछला', next: 'अगला', setAll: 'सब सेट करें', disabledAll: 'सब अक्षम करें', cancel: 'रद्द करें', save: 'सहेजें', close: 'बंद करें', message: 'संदेश', embed: 'एम्बेड', example: 'उदाहरण', clear: 'साफ़ करें', clearAll: 'सभी साफ़ करें', submit: 'प्रस्तुत करें', open: 'खोलें', unban: 'अनबैन', removeTimeout: 'टाइमआउट हटाएँ', duration: 'अवधि', reason: 'कारण', optional: 'वैकल्पिक (ज़रूरी नहीं)', confirm: 'पुष्टि करें', timeoutUntil: 'समय समाप्त होने तक', status: 'स्थिति', enable: 'सक्षम करें', disable: 'अक्षम करें' },
    'zh-CN': { kick: '踢出', ban: '禁用', timeout: '超时', user: '用户', created: '创建', joined: '加入', avatar: '头像', banner: '横幅', refresh: '刷新', commands: '命令', commandsList: '命令列表', inviteBot: '邀请机器人', website: '网站', discord: 'Discord', previous: '上一个', next: '下一个', setAll: '设置所有', disabledAll: '禁用所有', cancel: '取消', save: '保存', close: '关闭', message: '消息', embed: '嵌入', example: '例子', clear: '清除', clearAll: '清除所有', submit: '提交', open: '打开', unban: '解除禁令', removeTimeout: '移除超时', duration: '持续时间', reason: '原因', optional: '可选的 (不必需)', confirm: '确认', timeoutUntil: '超时至', status: '状态', enable: '启用', disable: '禁用' },
    'ja': { kick: 'キック', ban: '禁止', timeout: 'タイムアウト', user: 'ユーザー', created: '作成日', joined: '参加日', avatar: 'アバター', banner: 'バナー', refresh: '更新', commands: 'コマンド', commandsList: 'コマンド一覧', inviteBot: 'ボットを招待', website: 'ウェブサイト', discord: 'Discord', previous: '前', next: '次', setAll: 'すべて設定', disabledAll: 'すべて無効化', cancel: 'キャンセル', save: '保存', close: '閉じる', message: 'メッセージ', embed: '埋め込み', example: '例', clear: 'クリア', clearAll: 'すべてクリア', submit: '送信', open: '開く', unban: '禁止解除', removeTimeout: 'タイムアウト削除', duration: '期間', reason: '理由', optional: '任意 (必須ではない)', confirm: '確認', timeoutUntil: 'タイムアウト終了', status: 'ステータス', enable: '有効化', disable: '無効化' },
    'zh-TW': { kick: '踢出', ban: '禁用', timeout: '超時', user: '用戶', created: '創建', joined: '加入', avatar: '頭像', banner: '橫幅', refresh: '刷新', commands: '命令', commandsList: '命令列表', inviteBot: '邀請機器人', website: '網站', discord: 'Discord', previous: '上一個', next: '下一個', setAll: '設置所有', disabledAll: '禁用所有', cancel: '取消', save: '保存', close: '關閉', message: '訊息', embed: '嵌入', example: '例子', clear: '清除', clearAll: '清除所有', submit: '提交', open: '打開', unban: '解除禁用', removeTimeout: '移除超時', duration: '持續時間', reason: '原因', optional: '可選的 (非必要)', confirm: '確認', timeoutUntil: '超時至', status: '狀態', enable: '啟用', disable: '停用' },
    'ko': { kick: '강제퇴장', ban: '차단', timeout: '시간초과', user: '사용자', created: '생성됨', joined: '참여함', avatar: '아바타', banner: '배너', refresh: '새로고침', commands: '명령어', commandsList: '명령어 목록', inviteBot: '봇 초대', website: '웹사이트', discord: 'Discord', previous: '이전', next: '다음', setAll: '모두 설정', disabledAll: '모두 비활성화', cancel: '취소', save: '저장', close: '닫기', message: '메시지', embed: '임베드', example: '예시', clear: '지우기', clearAll: '모두 지우기', submit: '제출', open: '열기', unban: '차단 해제', removeTimeout: '타임아웃 제거', duration: '기간', reason: '사유', optional: '선택 사항 (필수 아님)', confirm: '확인', timeoutUntil: '타임아웃 만료', status: '상태', enable: '활성화', disable: '비활성화' }
};timeUnit: Record<Locale, { year: [string, string], month: [string, string], week: [string, string], day: [string, string], hour: [string, string], min: [string, string], sec: [string, string], }> = {
    'en-GB': { year: ['year', 'years'], month: ['month', 'months'], week: ['week', 'weeks'], day: ['day', 'days'], hour: ['hour', 'hours'], min: ['minute', 'minutes'], sec: ['second', 'seconds'] },
    'en-US': { year: ['year', 'years'], month: ['month', 'months'], week: ['week', 'weeks'], day: ['day', 'days'], hour: ['hour', 'hours'], min: ['minute', 'minutes'], sec: ['second', 'seconds'] },
    'th': { year: ['ปี', 'ปี'], month: ['เดือน', 'เดือน'], week: ['อาทิตย์', 'อาทิตย์'], day: ['วัน', 'วัน'], hour: ['ชั่วโมง', 'ชั่วโมง'], min: ['นาที', 'นาที'], sec: ['วินาที', 'วินาที'] },
    'id': { year: ['tahun', 'tahun'], month: ['bulan', 'bulan'], week: ['minggu', 'minggu'], day: ['hari', 'hari'], hour: ['jam', 'jam'], min: ['menit', 'menit'], sec: ['detik', 'detik'] },
    'da': { year: ['år', 'år'], month: ['måned', 'måneder'], week: ['uge', 'uger'], day: ['dag', 'dage'], hour: ['time', 'timer'], min: ['minut', 'minutter'], sec: ['sekund', 'sekunder'] },
    'de': { year: ['Jahr', 'Jahre'], month: ['Monat', 'Monate'], week: ['Woche', 'Wochen'], day: ['Tag', 'Tage'], hour: ['Stunde', 'Stunden'], min: ['Minute', 'Minuten'], sec: ['Sekunde', 'Sekunden'] },
    'es-ES': { year: ['año', 'años'], month: ['mes', 'meses'], week: ['semana', 'semanas'], day: ['día', 'días'], hour: ['hora', 'horas'], min: ['minuto', 'minutos'], sec: ['segundo', 'segundos'] },
    'es-419': { year: ['año', 'años'], month: ['mes', 'meses'], week: ['semana', 'semanas'], day: ['día', 'días'], hour: ['hora', 'horas'], min: ['minuto', 'minutos'], sec: ['segundo', 'segundos'] },
    'fr': { year: ['an', 'ans'], month: ['mois', 'mois'], week: ['semaine', 'semaines'], day: ['jour', 'jours'], hour: ['heure', 'heures'], min: ['minute', 'minutes'], sec: ['seconde', 'secondes'] },
    'hr': { year: ['godina', 'godina'], month: ['mjesec', 'mjeseci'], week: ['tjedan', 'tjedana'], day: ['dan', 'dana'], hour: ['sat', 'sati'], min: ['minuta', 'minuta'], sec: ['sekunda', 'sekundi'] },
    'it': { year: ['anno', 'anni'], month: ['mese', 'mesi'], week: ['settimana', 'settimane'], day: ['giorno', 'giorni'], hour: ['ora', 'ore'], min: ['minuto', 'minuti'], sec: ['secondo', 'secondi'] },
    'lt': { year: ['metus', 'metų'], month: ['mėnesį', 'mėnesių'], week: ['savaitę', 'savaičių'], day: ['dieną', 'dienų'], hour: ['valandą', 'valandų'], min: ['minutę', 'minučių'], sec: ['sekundę', 'sekundžių'] },
    'hu': { year: ['év', 'év'], month: ['hónap', 'hónap'], week: ['hét', 'hét'], day: ['nap', 'nap'], hour: ['óra', 'óra'], min: ['perc', 'perc'], sec: ['másodperc', 'másodperc'] },
    'nl': { year: ['jaar', 'jaar'], month: ['maand', 'maanden'], week: ['week', 'weken'], day: ['dag', 'dagen'], hour: ['uur', 'uur'], min: ['minuut', 'minuten'], sec: ['seconde', 'seconden'] },
    'no': { year: ['år', 'år'], month: ['måned', 'måneder'], week: ['uke', 'uker'], day: ['dag', 'dager'], hour: ['time', 'timer'], min: ['minutt', 'minutter'], sec: ['sekund', 'sekunder'] },
    'pl': { year: ['rok', 'lat'], month: ['miesiąc', 'miesięcy'], week: ['tydzień', 'tygodni'], day: ['dzień', 'dni'], hour: ['godzina', 'godzin'], min: ['minuta', 'minut'], sec: ['sekunda', 'sekund'] },
    'pt-BR': { year: ['ano', 'anos'], month: ['mês', 'meses'], week: ['semana', 'semanas'], day: ['dia', 'dias'], hour: ['hora', 'horas'], min: ['minuto', 'minutos'], sec: ['segundo', 'segundos'] },
    'ro': { year: ['an', 'ani'], month: ['lună', 'luni'], week: ['săptămână', 'săptămâni'], day: ['zi', 'zile'], hour: ['oră', 'ore'], min: ['minut', 'minute'], sec: ['secundă', 'secunde'] },
    'fi': { year: ['vuosi', 'vuotta'], month: ['kuukausi', 'kuukautta'], week: ['viikko', 'viikkoa'], day: ['päivä', 'päivää'], hour: ['tunti', 'tuntia'], min: ['minuutti', 'minuuttia'], sec: ['sekunti', 'sekuntia'] },
    'sv-SE': { year: ['år', 'år'], month: ['månad', 'månader'], week: ['vecka', 'veckor'], day: ['dag', 'dagar'], hour: ['timme', 'timmar'], min: ['minut', 'minuter'], sec: ['sekund', 'sekunder'] },
    'vi': { year: ['năm', 'năm'], month: ['tháng', 'tháng'], week: ['tuần', 'tuần'], day: ['ngày', 'ngày'], hour: ['giờ', 'giờ'], min: ['phút', 'phút'], sec: ['giây', 'giây'] },
    'tr': { year: ['yıl', 'yıl'], month: ['ay', 'ay'], week: ['hafta', 'hafta'], day: ['gün', 'gün'], hour: ['saat', 'saat'], min: ['dakika', 'dakika'], sec: ['saniye', 'saniye'] },
    'cs': { year: ['rok', 'roky'], month: ['měsíc', 'měsíce'], week: ['týden', 'týdny'], day: ['den', 'dny'], hour: ['hodina', 'hodin'], min: ['minuta', 'minut'], sec: ['sekunda', 'sekund'] },
    'el': { year: ['χρόνος', 'χρόνια'], month: ['μήνας', 'μήνες'], week: ['εβδομάδα', 'εβδομάδες'], day: ['ημέρα', 'ημέρες'], hour: ['ώρα', 'ώρες'], min: ['λεπτό', 'λεπτά'], sec: ['δευτερόλεπτο', 'δευτερόλεπτα'] },
    'bg': { year: ['година', 'години'], month: ['месец', 'месеца'], week: ['седмица', 'седмици'], day: ['ден', 'дни'], hour: ['час', 'часа'], min: ['минута', 'минути'], sec: ['секунда', 'секунди'] },
    'ru': { year: ['год', 'лет'], month: ['месяц', 'месяцев'], week: ['неделя', 'недели'], day: ['день', 'дней'], hour: ['час', 'часов'], min: ['минута', 'минут'], sec: ['секунда', 'секунд'] },
    'uk': { year: ['рік', 'років'], month: ['місяць', 'місяців'], week: ['тиждень', 'тижнів'], day: ['день', 'днів'], hour: ['година', 'годин'], min: ['хвилина', 'хвилин'], sec: ['секунда', 'секунд'] },
    'hi': { year: ['वर्ष', 'वर्ष'], month: ['महीना', 'महीने'], week: ['सप्ताह', 'सप्ताह'], day: ['दिन', 'दिन'], hour: ['घंटा', 'घंटे'], min: ['मिनट', 'मिनट'], sec: ['सेकंड', 'सेकंड'] },
    'zh-CN': { year: ['年', '年'], month: ['个月', '个月'], week: ['周', '周'], day: ['天', '天'], hour: ['小时', '小时'], min: ['分钟', '分钟'], sec: ['秒', '秒'] },
    'ja': { year: ['年', '年'], month: ['ヶ月', 'ヶ月'], week: ['週間', '週間'], day: ['日', '日'], hour: ['時間', '時間'], min: ['分', '分'], sec: ['秒', '秒'] },
    'zh-TW': { year: ['年', '年'], month: ['個月', '個月'], week: ['週', '週'], day: ['天', '天'], hour: ['小時', '小時'], min: ['分鐘', '分鐘'], sec: ['秒', '秒'] },
    'ko': { year: ['년', '년'], month: ['개월', '개월'], week: ['주', '주'], day: ['일', '일'], hour: ['시간', '시간'], min: ['분', '분'], sec: ['초', '초'] }
};premiumFeature: Record<Locale, (tier: string) => string> = {
  'id': (tier) => `Fitur ini memerlukan keanggotaan Premium ${tier} atau lebih tinggi. Daftar di [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'da': (tier) => `Denne funktion kræver et Premium-medlemskab af ${tier} eller højere. Tilmeld dig på [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'de': (tier) => `Diese Funktion erfordert eine Premium-Mitgliedschaft der Stufe ${tier} oder höher. Melden Sie sich an unter [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'en-GB': (tier) => `This feature requires a Premium membership of ${tier} or above. Sign up at [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'en-US': (tier) => `This feature requires a Premium membership of ${tier} or above. Sign up at [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'es-ES': (tier) => `Esta función requiere una membresía Premium de ${tier} o superior. Regístrate en [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'es-419': (tier) => `Esta función requiere una membresía Premium de ${tier} o superior. Regístrate en [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'fr': (tier) => `Cette fonctionnalité nécessite un abonnement Premium de ${tier} ou supérieur. Inscrivez-vous sur [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'hr': (tier) => `Ova značajka zahtijeva Premium članstvo ${tier} ili više. Prijavite se na [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'it': (tier) => `Questa funzione richiede un abbonamento Premium di ${tier} o superiore. Iscriviti su [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'lt': (tier) => `Šiai funkcijai reikalinga ${tier} ar aukštesnė „Premium“ narystė. Prisiregistruokite [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'hu': (tier) => `Ehhez a funkcióhoz ${tier} vagy magasabb szintű Premium-tagság szükséges. Regisztráljon a [camming.xyz](https://camming.xyz/dashboard?to=user/premium) oldalon`,
  'nl': (tier) => `Voor deze functie is een Premium-lidmaatschap van ${tier} of hoger vereist. Meld u aan op [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'no': (tier) => `Denne funksjonen krever et Premium-medlemskap på ${tier} eller høyere. Registrer deg på [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'pl': (tier) => `Ta funkcja wymaga członkostwa Premium ${tier} lub wyższego. Zarejestruj się na [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'pt-BR': (tier) => `Este recurso requer uma assinatura Premium de ${tier} ou superior. Inscreva-se em [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'ro': (tier) => `Această caracteristică necesită un abonament Premium de ${tier} sau mai mare. Înscrieți-vă la [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'fi': (tier) => `Tämä ominaisuus vaatii Premium-jäsenyyden ${tier} tai uudemman. Rekisteröidy osoitteessa [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'sv-SE': (tier) => `Denna funktion kräver ett Premium-medlemskap på ${tier} eller högre. Registrera dig på [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'vi': (tier) => `Tính năng này yêu cầu tư cách thành viên Premium từ ${tier} trở lên. Đăng ký tại [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'tr': (tier) => `Bu özellik, ${tier} veya üzeri bir Premium üyelik gerektirir. [camming.xyz](https://camming.xyz/dashboard?to=user/premium) adresinden kaydolun`,
  'cs': (tier) => `Tato funkce vyžaduje prémiové členství ${tier} nebo vyšší. Zaregistrujte se na [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'el': (tier) => `Αυτή η δυνατότητα απαιτεί συνδρομή Premium ${tier} ή νεότερη έκδοση. Εγγραφείτε στο [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'bg': (tier) => `Тази функция изисква Premium членство от ${tier} или по-високо ниво. Регистрирайте се на [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'ru': (tier) => `Для этой функции требуется членство Premium уровня ${tier} или выше. Зарегистрируйтесь на [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'uk': (tier) => `Ця функція потребує преміум-членства ${tier} або вище. Зареєструйтеся на [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'hi': (tier) => `इस सुविधा के लिए ${tier} या उससे ऊपर की प्रीमियम सदस्यता आवश्यक है। [camming.xyz](https://camming.xyz/dashboard?to=user/premium) पर साइन अप करें`,
  'th': (tier) => `ฟีเจอร์นี้ต้องการสมาชิกพรีเมียมระดับ ${tier} ขึ้นไป สมัครได้ที่ [camming.xyz](https://camming.xyz/dashboard?to=user/premium)`,
  'zh-CN': (tier) => `此功能需要 ${tier} 或更高级别的 Premium 会员资格。请在 [camming.xyz](https://camming.xyz/dashboard?to=user/premium) 注册`,
  'ja': (tier) => `この機能には、${tier}以上のプレミアムメンバーシップが必要です。[camming.xyz](https://camming.xyz/dashboard?to=user/premium) でサインアップしてください`,
  'zh-TW': (tier) => `此功能需要 ${tier} 或更高級別的 Premium 會員資格。請在 [camming.xyz](https://camming.xyz/dashboard?to=user/premium) 註冊`,
  'ko': (tier) => `이 기능은 ${tier} 이상의 프리미엄 멤버십이 필요합니다. [camming.xyz](https://camming.xyz/dashboard?to=user/premium)에서 가입하세요`
};

send_embed_author = (interaction: Interaction<CacheType>) => (new ModalBuilder()
    .setCustomId('send_embed_author')
    .setTitle(interaction.locale === 'th' ? 'เพิ่มองค์ประกอบฝัง' : 'Add embedded elements')
    .addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder()
        .setCustomId('send_embed_author_text')
        .setLabel(interaction.locale == 'th' ? 'ข้อความส่วนหัว' : 'Author Text')
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(256)
    ),
    new ActionRowBuilder().addComponents(new TextInputBuilder()
        .setCustomId('send_embed_author_url')
        .setLabel(interaction.locale == 'th' ? 'ลิงก์ส่วนหัว' : 'Author URL')
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('http://example.com/')
    ),
    new ActionRowBuilder().addComponents(new TextInputBuilder()
        .setCustomId('send_embed_author_icon')
        .setLabel(interaction.locale == 'th' ? 'ไอคอนส่วนหัว' : 'Author Icon')
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('http://example.com/example.png')
    )
    )
);send_embed_title = (interaction: Interaction<CacheType>) => (new ModalBuilder()
    .setCustomId('send_embed_title')
    .setTitle(interaction.locale === 'th' ? 'เพิ่มองค์ประกอบฝัง' : 'Add embedded elements')
    .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_title')
            .setLabel(interaction.locale == 'th' ? 'ข้อควาชื่อเรื่อง' : 'Title Text')
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(256)
        ),
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_url')
            .setLabel(interaction.locale == 'th' ? 'ลิงก์ชื่อเรื่อง' : 'Title URL')
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('http://example.com/')
        )
    )
);send_embed_description = (interaction: Interaction<CacheType>) => (new ModalBuilder()
    .setCustomId('send_embed_description')
    .setTitle(interaction.locale === 'th' ? 'เพิ่มองค์ประกอบฝัง' : 'Add embedded elements')
    .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_description')
            .setLabel(interaction.locale == 'th' ? 'คำอธิบาย' : 'Description')
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)
        )
    )
);send_embed_field1 = (interaction: Interaction<CacheType>) => (new ModalBuilder()
    .setCustomId('send_embed_field1')
    .setTitle(interaction.locale === 'th' ? 'เพิ่มองค์ประกอบฝัง' : 'Add embedded elements')
    .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_field_name')
            .setLabel(interaction.locale == 'th' ? 'ชื่อฟิลด์' : 'Field Name')
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(256)
        ),
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_field_value')
            .setLabel(interaction.locale == 'th' ? 'ค่าฟิลด์' : 'Field Value')
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1024)
        ),
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_field_inline')
            .setLabel(interaction.locale == 'th' ? 'ฟิลด์ในบรรทัด' : 'Field Inline')
            .setPlaceholder(interaction.locale == 'th' ? 'จริง / ไม่จริง' : 'true / false')
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(7)
        )
    )
);send_embed_field2 = (interaction: Interaction<CacheType>) => (new ModalBuilder()
    .setCustomId('send_embed_field2')
    .setTitle(interaction.locale === 'th' ? 'เพิ่มองค์ประกอบฝัง' : 'Add embedded elements')
    .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_field_name')
            .setLabel(interaction.locale == 'th' ? 'ชื่อฟิลด์' : 'Field Name')
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(256)
        ),
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_field_value')
            .setLabel(interaction.locale == 'th' ? 'ค่าฟิลด์' : 'Field Value')
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1024)
        ),
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_field_inline')
            .setLabel(interaction.locale == 'th' ? 'ฟิลด์ในบรรทัด' : 'Field Inline')
            .setPlaceholder(interaction.locale == 'th' ? 'จริง / ไม่จริง' : 'true / false')
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(7)
        )
    )
);send_embed_thumbnail = (interaction: Interaction<CacheType>) => (new ModalBuilder()
    .setCustomId('send_embed_thumbnail')
    .setTitle(interaction.locale === 'th' ? 'เพิ่มองค์ประกอบฝัง' : 'Add embedded elements')
    .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_thumbnail')
            .setLabel(interaction.locale == 'th' ? 'ภาพขนาดย่อ' : 'Thumbnail')
            .setPlaceholder('http://example.com/example.png')
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
        )
    )
);send_embed_image = (interaction: Interaction<CacheType>) => (new ModalBuilder()
    .setCustomId('send_embed_image')
    .setTitle(interaction.locale === 'th' ? 'เพิ่มองค์ประกอบฝัง' : 'Add embedded elements')
    .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_image')
            .setLabel(interaction.locale == 'th' ? 'ภาพ' : 'Image')
            .setPlaceholder('http://example.com/example.png')
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
        )
    )
);send_embed_footer = (interaction: Interaction<CacheType>) => (new ModalBuilder()
    .setCustomId('send_embed_footer')
    .setTitle(interaction.locale === 'th' ? 'เพิ่มองค์ประกอบฝัง' : 'Add embedded elements')
    .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_footer_text')
            .setLabel(interaction.locale == 'th' ? 'ข้อความส่วนท้าย' : 'Footer Text')
            .setRequired(false)
            .setMaxLength(2048)
            .setStyle(TextInputStyle.Paragraph)
        ),
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_footer_icon')
            .setLabel(interaction.locale == 'th' ? 'ไอคอนส่วนท้าย' : 'Footer Icon')
            .setPlaceholder('http://example.com/example.png')
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_timestamp')
            .setLabel(interaction.locale == 'th' ? 'เวลา' : 'timestamp')
            .setPlaceholder('2024-10-02 22:30')
            .setMaxLength(16)
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
        )
    )
);send_embed_color = (interaction: Interaction<CacheType>) => (new ModalBuilder()
    .setCustomId('send_embed_color')
    .setTitle(interaction.locale === 'th' ? 'เพิ่มองค์ประกอบฝัง' : 'Add embedded elements')
    .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId('send_embed_color')
            .setLabel(interaction.locale == 'th' ? 'สี' : 'Color')
            .setMaxLength(7)
            .setPlaceholder('#ff4c4c')
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
        )
    )
);send_embed_guide = (interaction: Interaction<CacheType>) => (new EmbedBuilder()
    .setDescription(interaction.locale == 'th' ? 'กดที่ปุ่มด้านล่างเพื่อสร้างและเพิ่มองค์ประกอบของข้อความฝัง' : 'Click the button below to create and add an embed element.')
    .setColor(0xFF6D6D)
);send_message_modal = ((interaction: Interaction<CacheType>) => new ModalBuilder()
    .setCustomId('send_message')
    .setTitle(interaction.locale === 'th' ? 'ส่งข้อความ' : 'Send a message')
    .addComponents(
    new ActionRowBuilder().addComponents(
        new TextInputBuilder()
        .setCustomId('send_message')
        .setLabel(interaction.locale === 'th' ? 'ข้อความ' : 'message')
        .setPlaceholder(interaction.locale === 'th' ? 'ป้อนข้อความที่ต้องการส่ง (คุณสามารถกลับมาแก้ไขข้อความได้อีกครั้ง)' : 'Enter the message you want to send. (You can come back and edit the text again.)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
    ),
    )
);send_embed_button = (message: any, interaction: Interaction<CacheType>) => [
    new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('send_embed_author')
            .setLabel(interaction.locale == 'th' ? 'กำหนดส่วนหัว' : 'Set Author')
            .setEmoji({ id: '1356522924500058122', name: 'user' })
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('send_embed_title')
            .setLabel(interaction.locale == 'th' ? 'กำหนดชื่อเรื่อง' : 'Set Title')
            .setEmoji({ id: '1356491259388104754', name: 'card_header' })
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('send_embed_description')
            .setLabel(interaction.locale == 'th' ? 'กำหนดคำอธิบาย' : 'Set Description')
            .setEmoji({ id: '1356491257081499689', name: 'text_description' })
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('send_embed_thumbnail')
            .setLabel(interaction.locale == 'th' ? 'กำหนดภาพขนาดย่อ' : 'Set Thumbnail')
            .setEmoji({ id: '1356491270196957235', name: 'image' })
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('send_embed_image')
            .setLabel(interaction.locale == 'th' ? 'กำหนดภาพ' : 'Set Image')
            .setEmoji({ id: '1356491247887323156', name: 'horizontal_image' })
            .setStyle(ButtonStyle.Primary)
    ),
    new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('send_embed_field1')
            .setLabel(interaction.locale == 'th' ? 'กำหนดฟิลด์1' : 'Set Field1')
            .setEmoji({ id: '1356491262349414400', name: 'list_ul' })
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('send_embed_field2')
            .setLabel(interaction.locale == 'th' ? 'กำหนดฟิลด์2' : 'Set Field2')
            .setEmoji({ id: '1356491262349414400', name: 'list_ul' })
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('send_embed_footer')
            .setLabel(interaction.locale == 'th' ? 'กำหนดส่วนท้าย' : 'Set Footer')
            .setEmoji({ id: '1356491276333088801', name: 'footer' })
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('send_embed_color')
            .setLabel(interaction.locale == 'th' ? 'กำหนดสี' : 'Set Color')
            .setEmoji({ id: '1356491264954208306', name: 'pencil~1' })
            .setStyle(ButtonStyle.Primary)
    ),
    new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('send_embed_example')
            .setLabel(interaction.locale == 'th' ? 'ตัวอย่าง' : 'Example')
            // .setEmoji({ id: '1227490709871919104', name: 'check_mark' })
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('send_embed_clear')
            .setLabel(interaction.locale == 'th' ? 'ล้างทั้งหมด' : 'Clear all')
            .setEmoji({ id: '1356491253642170400', name: 'trash' })
            .setDisabled(!message.embeds[1])
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('send_embed_submit')
            .setLabel(interaction.locale == 'th' ? 'ยืนยัน' : 'Submit')
            .setEmoji({ id: '1227490709871919104', name: 'check_mark' })
            .setDisabled(!message.embeds[1])
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('send_embed_cancel')
            .setLabel(interaction.locale == 'th' ? 'ยกเลิก' : 'Cancel')
            .setEmoji({ id: '1227494480446226493', name: 'wrong_mark' })
            .setStyle(ButtonStyle.Danger)
    )
];
audit_log_button = (interaction: Interaction<CacheType>) => [
    new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('audit_log_set_all')
            .setLabel(this.actions[interaction.guildLocale || 'en-US'].setAll)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('audit_log_disabled_all')
            .setLabel(this.actions[interaction.guildLocale || 'en-US'].disabledAll)
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('audit_log_cancel')
            .setLabel(this.actions[interaction.guildLocale || 'en-US'].cancel)
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('audit_log_confirm')
            .setLabel(this.actions[interaction.guildLocale || 'en-US'].save)
            .setStyle(ButtonStyle.Success)
    // ),
    // new ActionRowBuilder()
    //     .addComponents(
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_member_joined')
    //             .setLabel('Member joined')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_member_leaved')
    //             .setLabel('Member leaved')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_member_banned')
    //             .setLabel('Member banned')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_member_unbanned')
    //             .setLabel('Member unbanned')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_member_kicked')
    //             .setLabel('Member kicked')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true)
    //     ),
    // new ActionRowBuilder()
    //     .addComponents(
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_message_deleted')
    //             .setLabel('Message deleted')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_message_edited')
    //             .setLabel('Message edited')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_channel_created')
    //             .setLabel('Channel created')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_channel_updated')
    //             .setLabel('Channel updated')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_channel_deleted')
    //             .setLabel('Channel deleted')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true)
    //     ),
    // new ActionRowBuilder()
    //     .addComponents(
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_server_updated')
    //             .setLabel('Server updated')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_role_created')
    //             .setLabel('Role created')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_role_updated')
    //             .setLabel('Role updated')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_role_deleted')
    //             .setLabel('Role deleted')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_role_given')
    //             .setLabel('Role given')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true)
    //     ),
    // new ActionRowBuilder()
    //     .addComponents(
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_role_removed')
    //             .setLabel('Role removed')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true),
    //         new ButtonBuilder()
    //             .setCustomId('audit_log_moderation_command_used')
    //             .setLabel('Moderation command used')
    //             .setStyle(ButtonStyle.Primary)
    //             .setDisabled(true)
        )
];audit_log_embed = (interaction: Interaction<CacheType>) => (new EmbedBuilder()
    .setTitle(interaction.locale == 'th' ? 'การตั้งค่าบันทึกการตรวจสอบ' : 'Audit Log Settings')
    .setFooter({ text: interaction.locale == 'th'
        ? 'เลือกปุ่มด้านล่างเพื่อตั้งค่าช่องทางการส่งบันทึกการตรวจสอบ:'
        : 'Select the button below to set up a channel for sending audit logs:'})
    .setColor('#0099ff')
);audit_log_select = (customId: string, interaction: Interaction<CacheType>) => [
    new ActionRowBuilder().addComponents(
        new ChannelSelectMenuBuilder()
            .setChannelTypes([ ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PrivateThread, ChannelType.PublicThread ])
            .setCustomId(customId)
            .setPlaceholder(customId)
    ),
    new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('audit_log_cancel')
            .setLabel(this.actions[interaction.guildLocale || 'en-US'].cancel)
            .setStyle(ButtonStyle.Danger)
    )
];
user_embed = (user: User, member: GuildMember | null, guild: Guild) => (new EmbedBuilder()
  .setAuthor({ iconURL: user.displayAvatarURL(), name: user.displayName })
  .setDescription(
     (`<:user_tag:1356521846186578097> **${this.actions[guild.preferredLocale || 'en-US'].user}**: <@${user.id}> (\`${user.id}\`)\n`)
    +(`<:user_plus:1356521841061003355> **${this.actions[guild.preferredLocale || 'en-US'].created}**: <t:${Math.floor(user.createdTimestamp / 1000)}:D> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)\n`)
    +(member ? `<:signin:1356521843263012957> **${this.actions[guild.preferredLocale || 'en-US'].joined}**: <t:${member.joinedTimestamp && Math.floor(member.joinedTimestamp / 1000)}:D> (<t:${member.joinedTimestamp && Math.floor(member.joinedTimestamp / 1000)}:R>)\n` : '')
    +(member && member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now() ? '<:time:1356491274156511273> **'+this.actions[guild.preferredLocale || 'en-US'].timeoutUntil+'**: <t:'+Math.floor(member.communicationDisabledUntilTimestamp / 1000)+':D> (<t:'+Math.floor(member.communicationDisabledUntilTimestamp / 1000)+':R>)\n' : '')
  )
  .setFooter({ iconURL: guild.iconURL(), text: guild.name })
  .setColor(0xf91a1a)
  .setTimestamp()
);user_button = (user: User, member: GuildMember | null, guild: Guild) => [
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('user_a_timeout')
      .setLabel((member?.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) ? this.actions[guild.preferredLocale || 'en-US'].removeTimeout : this.actions[guild.preferredLocale || 'en-US'].timeout)
      .setEmoji({ id: '1356491274156511273', name: 'time' })
      .setStyle(member && member.communicationDisabledUntilTimestamp ? (member.communicationDisabledUntilTimestamp > Date.now() ? ButtonStyle.Success : ButtonStyle.Danger) : ButtonStyle.Danger)
      .setDisabled(guild.members.cache.has(user.id) ? false : true),
    new ButtonBuilder()
      .setCustomId('user_a_kick')
      .setLabel(this.actions[guild.preferredLocale || 'en-US'].kick)
      .setEmoji({ id: '1356521835822579742', name: 'user_remove' })
      .setStyle(ButtonStyle.Danger)
      .setDisabled(member?.kickable ? false : true),
    new ButtonBuilder()
      .setCustomId(guild.bans.cache.has(user.id) ? 'user_a_unban' : 'user_a_ban')
      .setLabel(guild.bans.cache.has(user.id) ? this.actions[guild.preferredLocale || 'en-US'].unban : this.actions[guild.preferredLocale || 'en-US'].ban)
      .setEmoji({ id: '1356521838406270986', name: 'hammer~1' })
      .setStyle(guild.bans.cache.has(user.id) ? ButtonStyle.Success : ButtonStyle.Danger)
      .setDisabled(guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers) ? false : true)
  ),
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('user_avatar')
      .setLabel(this.actions[guild.preferredLocale || 'en-US'].avatar)
      .setEmoji({ id: '1356522924500058122', name: 'user' })
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('user_banner')
      .setLabel(this.actions[guild.preferredLocale || 'en-US'].banner)
      .setEmoji({ id: '1356491247887323156', name: 'horizontal_image' })
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('user_a_reload')
      .setLabel(this.actions[guild.preferredLocale || 'en-US'].refresh)
      .setEmoji({ id: '1358990330535350373', name: 'reload' })
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('user_a_close')
      .setLabel(this.actions[guild.preferredLocale || 'en-US'].close)
      .setEmoji({ id: '1227494480446226493', name: 'wrong_mark' })
      .setStyle(ButtonStyle.Danger)
  )
];user_update_message = async(guild: Guild, message?: Message, interaction?: Interaction<CacheType>) => {
  try{
    const messagesCache = await interactionCache.commandUser.get(guild.id);
    messagesCache.forEach(async(m) => {
      const channel = guild.channels.cache.get(m.channelId);
      if(!channel || !channel.isTextBased())return;
      const message = channel.messages.cache.get(m.messageId);
      if(!message)return;
      const userId = message.embeds[0].description?.match(/`(\d{17,20})`/)?.[1];
      if(!userId)return;
      const user = (await guild.client.users.fetch(userId, { force: true }));
      const member = await guild.members.fetch(userId).catch(() => null) || null;
      return await message.edit({ content: `-# Updated on <t:${Math.floor(Date.now() / 1000)}:f>`, embeds: [this.user_embed(user, member, guild)], components: this.user_button(user, member, guild) });
    });
    if(message && interaction && interaction.guild && interaction.isButton()){
      const user = (await interaction.client.users.fetch(message.embeds[0].description?.match(/`(\d{17,20})`/)?.[1] || interaction.user.id, { force: true }));
      const member = await guild.members.fetch(user.id).catch(() => null) || null;
      return await interaction.update({ content: `-# Updated on <t:${Math.floor(Date.now() / 1000)}:f>`, embeds: [this.user_embed(user, member, interaction.guild)], components: this.user_button(user, member, interaction.guild) });
    };
  }catch(error){ console.warn(chalk.red('[Camming BT]'), chalk.yellow(error)) };
};
avatar_embed = (user: User) => (new EmbedBuilder()
  .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
  .setDescription(`### Avatar of <@${user.id}>:`)
  .setImage(user.displayAvatarURL({ size: 4096 }))
  .setColor(user.hexAccentColor ? (!isNaN(parseInt(user.hexAccentColor.slice(1), 16)) ? parseInt(user.hexAccentColor.slice(1), 16) : null) : null)
);banner_embed = (user: User) => (new EmbedBuilder()
  .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
  .setDescription(user.bannerURL() ? `### Banner of <@${user.id}>:` : `### User has no banner.`)
  .setImage(user.bannerURL({ size: 2048 }) || null)
  .setColor(user.hexAccentColor ? (!isNaN(parseInt(user.hexAccentColor.slice(1), 16)) ? parseInt(user.hexAccentColor.slice(1), 16) : null) : null)
);
ban_confirm_embed = (user: User, reason: string | null, interaction: Interaction<CacheType>) => (new EmbedBuilder()
  .setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
  .setTitle(this.confirm_ban_message[interaction.guildLocale || 'en-US'].title.replace('{user}', user.displayName))
  .setDescription(this.confirm_ban_message[interaction.guildLocale || 'en-US'].description)
  .setThumbnail(user.displayAvatarURL())
  .addFields(
      { name: this.confirm_ban_message[interaction.guildLocale || 'en-US'].userField, value: `<@${user.id}>` },
      { name: this.confirm_ban_message[interaction.guildLocale || 'en-US'].reasonField, value: reason ?? this.confirm_ban_message[interaction.guildLocale || 'en-US'].noReason },
      { name: '\u200B', value: '\u200B' },
  )
  .setColor(0xff4242)
  .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
  .setTimestamp()
);ban_button = (interaction: Interaction<CacheType>) => [
  new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ban_reason')
      .setLabel(this.actions[interaction.guildLocale || 'en-US'].reason)
      .setEmoji({ id: '1356491264954208306', name: 'pencil~1' })
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('ban_confirm')
      .setLabel(this.actions[interaction.guildLocale || 'en-US'].confirm)
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ban_cancel')
      .setLabel(this.actions[interaction.guildLocale || 'en-US'].cancel)
      .setStyle(ButtonStyle.Secondary)
  )
];ban_reason_modal = ((interaction: Interaction<CacheType>) => new ModalBuilder()
  .setCustomId('ban_reason')
  .setTitle(this.actions[interaction.locale || 'en-US'].ban)
  .setComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('reason')
        .setLabel(this.actions[interaction.locale || 'ne-US'].reason)
        .setPlaceholder(this.actions[interaction.locale || 'en-US'].optional)
        .setRequired(false)
        .setMaxLength(512)
        .setStyle(TextInputStyle.Short)
    )
  )
);unban_confirm_embed = (user: User, interaction: Interaction<CacheType>) => (new EmbedBuilder()
  .setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
  .setTitle(this.confirm_unban_message[interaction.guildLocale || 'en-US'].title.replace('{user}', user.displayName))
  .setDescription(this.confirm_unban_message[interaction.guildLocale || 'en-US'].description)
  .setThumbnail(user.displayAvatarURL())
  .addFields(
      { name: this.confirm_unban_message[interaction.guildLocale || 'en-US'].userField, value: `<@${user.id}>` },
      { name: '\u200B', value: '\u200B' },
  )
  .setColor(0xff4242)
  .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
  .setTimestamp()
);unban_button = (interaction: Interaction<CacheType>) => [
  new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('unban_confirm')
      .setLabel(this.actions[interaction.guildLocale || 'en-US'].confirm)
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('unban_cancel')
      .setLabel(this.actions[interaction.guildLocale || 'en-US'].cancel)
      .setStyle(ButtonStyle.Secondary)
  )
];kick_confirm_embed = (user: User, reason: string | null, interaction: Interaction<CacheType>) => (new EmbedBuilder()
  .setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
  .setTitle(this.confirm_kick_message[interaction.guildLocale || 'en-US'].title.replace('{user}', user.displayName))
  .setDescription(this.confirm_kick_message[interaction.guildLocale || 'en-US'].description)
  .setThumbnail(user.displayAvatarURL())
  .addFields(
      { name: this.confirm_kick_message[interaction.guildLocale || 'en-US'].userField, value: `<@${user.id}>` },
      { name: this.confirm_kick_message[interaction.guildLocale || 'en-US'].reasonField, value: reason ?? this.confirm_kick_message[interaction.guildLocale || 'en-US'].noReason },
      { name: '\u200B', value: '\u200B' },
  )
  .setColor(0xff4242)
  .setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
  .setTimestamp()
);kick_button = (interaction: Interaction<CacheType>) => [
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('kick_reason')
      .setLabel(this.actions[interaction.guildLocale || 'en-US'].reason)
      .setEmoji({ id: '1356491264954208306', name: 'pencil~1' })
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('kick_confirm')
      .setLabel(this.actions[interaction.guildLocale || 'en-US'].confirm)
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('kick_cancel')
      .setLabel(this.actions[interaction.guildLocale || 'en-US'].cancel)
      .setStyle(ButtonStyle.Secondary)
  )
];kick_reason_modal = ((interaction: Interaction<CacheType>) => new ModalBuilder()
.setCustomId('kick_reason')
.setTitle(this.actions[interaction.locale || 'en-US'].kick)
.setComponents(
  new ActionRowBuilder().addComponents(
    new TextInputBuilder()
      .setCustomId('reason')
      .setLabel(this.actions[interaction.locale || 'ne-US'].reason)
      .setPlaceholder(this.actions[interaction.locale || 'en-US'].optional)
      .setRequired(false)
      .setMaxLength(512)
      .setStyle(TextInputStyle.Short)
  )
)
);timeout_confirm_embed = (user: GuildMember, duration: number, reason: string | null, interaction: Interaction<CacheType>) => (new EmbedBuilder()
.setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
.setTitle(this.confirm_timeout_message[interaction.guildLocale || 'en-US'].title.replace('{user}', user.displayName))
.setDescription(this.confirm_timeout_message[interaction.guildLocale || 'en-US'].description)
.setThumbnail(user.displayAvatarURL())
.addFields(
    { name: this.confirm_timeout_message[interaction.guildLocale || 'en-US'].userField, value: `<@${user.id}>` },
    { name: this.confirm_timeout_message[interaction.guildLocale || 'en-US'].durationField, value: `${formatDuration(duration, interaction.guildLocale || 'en-US')}` },
    { name: this.confirm_timeout_message[interaction.guildLocale || 'en-US'].reasonField, value: reason ?? this.confirm_timeout_message[interaction.guildLocale || 'en-US'].noReason },
    { name: '\u200B', value: '\u200B' },
)
.setColor(0xff4242)
.setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
.setTimestamp()
);timeout_button = (interaction: Interaction<CacheType>) => [
new ActionRowBuilder().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId('timeout_duration')
    .setOptions(
      { label: `1 ${this.timeUnit[interaction.guildLocale || 'en-US'].min[0]}`, value: `${1 * 60 * 1000}` },
      { label: `2 ${this.timeUnit[interaction.guildLocale || 'en-US'].min[1]}`, value: `${2 * 60 * 1000}` },
      { label: `5 ${this.timeUnit[interaction.guildLocale || 'en-US'].min[1]}`, value: `${5 * 60 * 1000}` },
      { label: `10 ${this.timeUnit[interaction.guildLocale || 'en-US'].min[1]}`, value: `${10 * 60 * 1000}` },
      { label: `15 ${this.timeUnit[interaction.guildLocale || 'en-US'].min[1]}`, value: `${15 * 60 * 1000}` },
      { label: `30 ${this.timeUnit[interaction.guildLocale || 'en-US'].min[1]}`, value: `${30 * 60 * 1000}` },
      { label: `1 ${this.timeUnit[interaction.guildLocale || 'en-US'].hour[0]}`, value: `${1 * 60 * 60 * 1000}` },
      { label: `2 ${this.timeUnit[interaction.guildLocale || 'en-US'].hour[1]}`, value: `${2 * 60 * 60 * 1000}` },
      { label: `3 ${this.timeUnit[interaction.guildLocale || 'en-US'].hour[1]}`, value: `${3 * 60 * 60 * 1000}` },
      { label: `6 ${this.timeUnit[interaction.guildLocale || 'en-US'].hour[1]}`, value: `${6 * 60 * 60 * 1000}` },
      { label: `12 ${this.timeUnit[interaction.guildLocale || 'en-US'].hour[1]}`, value: `${12 * 60 * 60 * 1000}` },
      { label: `1 ${this.timeUnit[interaction.guildLocale || 'en-US'].day[0]}`, value: `${1 * 24 * 60 * 60 * 1000}` },
      { label: `2 ${this.timeUnit[interaction.guildLocale || 'en-US'].day[1]}`, value: `${2 * 24 * 60 * 60 * 1000}` },
      { label: `3 ${this.timeUnit[interaction.guildLocale || 'en-US'].day[1]}`, value: `${3 * 24 * 60 * 60 * 1000}` },
      { label: `5 ${this.timeUnit[interaction.guildLocale || 'en-US'].day[1]}`, value: `${5 * 24 * 60 * 60 * 1000}` },
      { label: `1 ${this.timeUnit[interaction.guildLocale || 'en-US'].week[0]}`, value: `${7 * 24 * 60 * 60 * 1000}` },
      { label: `2 ${this.timeUnit[interaction.guildLocale || 'en-US'].week[1]}`, value: `${14 * 24 * 60 * 60 * 1000}` },
      { label: `3 ${this.timeUnit[interaction.guildLocale || 'en-US'].week[1]}`, value: `${21 * 24 * 60 * 60 * 1000}` },
      { label: `4 ${this.timeUnit[interaction.guildLocale || 'en-US'].week[1]}`, value: `${28 * 24 * 60 * 60 * 1000}` },
    )
    .setMaxValues(10)
    .setPlaceholder(`${this.actions[interaction.guildLocale || 'en-US'].duration}`)
),
new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId('timeout_reason')
    .setLabel(this.actions[interaction.guildLocale || 'en-US'].reason)
    .setEmoji({ id: '1356491264954208306', name: 'pencil~1' })
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId('timeout_confirm')
    .setLabel(this.actions[interaction.guildLocale || 'en-US'].confirm)
    .setStyle(ButtonStyle.Danger),
  new ButtonBuilder()
    .setCustomId('timeout_cancel')
    .setLabel(this.actions[interaction.guildLocale || 'en-US'].cancel)
    .setStyle(ButtonStyle.Secondary)
)
];timeout_reason_modal = ((interaction: Interaction<CacheType>) => new ModalBuilder()
.setCustomId('timeout_reason')
.setTitle(this.actions[interaction.locale || 'en-US'].timeout)
.setComponents(
new ActionRowBuilder().addComponents(
  new TextInputBuilder()
    .setCustomId('reason')
    .setLabel(this.actions[interaction.locale || 'ne-US'].reason)
    .setPlaceholder(this.actions[interaction.locale || 'en-US'].optional)
    .setRequired(false)
    .setMaxLength(512)
    .setStyle(TextInputStyle.Short)
)
)
);untimeout_confirm_embed = (user: GuildMember, duration: number, interaction: Interaction<CacheType>) => (new EmbedBuilder()
.setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
.setTitle(this.confirm_untimeout_message[interaction.guildLocale || 'en-US'].title.replace('{user}', user.displayName))
.setDescription(this.confirm_untimeout_message[interaction.guildLocale || 'en-US'].description)
.setThumbnail(user.displayAvatarURL())
.addFields(
    { name: this.confirm_untimeout_message[interaction.guildLocale || 'en-US'].userField, value: `<@${user.id}>` },
    { name: this.actions[interaction.guildLocale || 'en-US'].timeoutUntil, value: `<t:${Math.floor(duration / 1000)}:D> (<t:${Math.floor(duration / 1000)}:R>)` },
    { name: '\u200B', value: '\u200B' },
)
.setColor(0xff4242)
.setFooter({ text: interaction.guild?.name, iconURL: interaction.guild?.iconURL() })
.setTimestamp()
);untimeout_button = (interaction: Interaction<CacheType>) => [
new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId('untimeout_confirm')
    .setLabel(this.actions[interaction.guildLocale || 'en-US'].confirm)
    .setStyle(ButtonStyle.Danger),
  new ButtonBuilder()
    .setCustomId('untimeout_cancel')
    .setLabel(this.actions[interaction.guildLocale || 'en-US'].cancel)
    .setStyle(ButtonStyle.Secondary)
)
];
welcome_component = (interaction: Interaction<CacheType>, config: GuildConfiguration) => (()=>{
  const locale = interaction.guildLocale || 'en-US';
  const welcome = config?.welcomeSetting?.welcome;
  const link = `https://camming.xyz/dashboard?to=server/${interaction.guild?.id}/welcome`;
  const sendToChannel = {
    'id': 'Kirim pesan ke saluran',
    'da': 'Send besked til kanal',
    'de': 'Nachricht an Kanal senden',
    'en-GB': 'Send message to channel',
    'en-US': 'Send message to channel',
    'es-ES': 'Enviar mensaje al canal',
    'es-419': 'Enviar mensaje al canal',
    'fr': 'Envoyer un message au canal',
    'hr': 'Pošalji poruku na kanal',
    'it': 'Invia messaggio al canale',
    'lt': 'Siųsti pranešimą į kanalą',
    'hu': 'Üzenet küldése a csatornára',
    'nl': 'Stuur bericht naar kanaal',
    'no': 'Send melding til kanal',
    'pl': 'Wyślij wiadomość na kanał',
    'pt-BR': 'Enviar mensagem para o canal',
    'ro': 'Trimite mesaj către canal',
    'fi': 'Lähetä viesti kanavalle',
    'sv-SE': 'Skicka meddelande till kanal',
    'vi': 'Gửi tin nhắn đến kênh',
    'tr': 'Kanala mesaj gönder',
    'cs': 'Odeslat zprávu do kanálu',
    'el': 'Αποστολή μηνύματος στο κανάλι',
    'bg': 'Изпращане на съобщение до канал',
    'ru': 'Отправить сообщение в канал',
    'uk': 'Надіслати повідомлення в канал',
    'hi': 'चैनल पर संदेश भेजें',
    'th': 'ส่งข้อความไปยังช่อง',
    'zh-CN': '发送消息到频道',
    'ja': 'チャンネルにメッセージを送信',
    'zh-TW': '傳送訊息到頻道',
    'ko': '채널에 메시지 보내기'
  };const sendToUser = {
    'id': 'Kirim pesan ke pengguna',
    'da': 'Send besked til bruger',
    'de': 'Nachricht an Benutzer senden',
    'en-GB': 'Send message to user',
    'en-US': 'Send message to user',
    'es-ES': 'Enviar mensaje al usuario',
    'es-419': 'Enviar mensaje al usuario',
    'fr': 'Envoyer un message à l\'utilisateur',
    'hr': 'Pošalji poruku korisniku',
    'it': 'Invia messaggio all\'utente',
    'lt': 'Siųsti pranešimą vartotojui',
    'hu': 'Üzenet küldése a felhasználónak',
    'nl': 'Stuur bericht naar gebruiker',
    'no': 'Send melding til bruker',
    'pl': 'Wyślij wiadomość do użytkownika',
    'pt-BR': 'Enviar mensagem para o usuário',
    'ro': 'Trimite mesaj către utilizator',
    'fi': 'Lähetä viesti käyttäjälle',
    'sv-SE': 'Skicka meddelande till användare',
    'vi': 'Gửi tin nhắn cho người dùng',
    'tr': 'Kullanıcıya mesaj gönder',
    'cs': 'Odeslat zprávu uživateli',
    'el': 'Αποστολή μηνύματος στον χρήστη',
    'bg': 'Изпращане на съобщение до потребител',
    'ru': 'Отправить сообщение пользователю',
    'uk': 'Надіслати повідомлення користувачеві',
    'hi': 'उपयोगकर्ता को संदेश भेजें',
    'th': 'ส่งข้อความไปยังผู้ใช้',
    'zh-CN': '发送消息给用户',
    'ja': 'ユーザーにメッセージを送信',
    'zh-TW': '傳送訊息給使用者',
    'ko': '사용자에게 메시지 보내기'
  };const setMessageAtWebsite = {
    'id': `Atur pesan di [camming.xyz](${link})`,
    'da': `Indstil beskeden på [camming.xyz](${link})`,
    'de': `Nachricht auf [camming.xyz](${link}) festlegen`,
    'en-GB': `Set the message at [camming.xyz](${link})`,
    'en-US': `Set the message at [camming.xyz](${link})`,
    'es-ES': `Establecer el mensaje en [camming.xyz](${link})`,
    'es-419': `Establecer el mensaje en [camming.xyz](${link})`,
    'fr': `Définir le message sur [camming.xyz](${link})`,
    'hr': `Postavi poruku na [camming.xyz](${link})`,
    'it': `Imposta il messaggio su [camming.xyz](${link})`,
    'lt': `Nustatyti pranešimą [camming.xyz](${link})`,
    'hu': `Üzenet beállítása itt: [camming.xyz](${link})`,
    'nl': `Stel het bericht in op [camming.xyz](${link})`,
    'no': `Angi meldingen på [camming.xyz](${link})`,
    'pl': `Ustaw wiadomość na [camming.xyz](${link})`,
    'pt-BR': `Definir a mensagem em [camming.xyz](${link})`,
    'ro': `Setați mesajul la [camming.xyz](${link})`,
    'fi': `Aseta viesti sivustolla [camming.xyz](${link})`,
    'sv-SE': `Ställ in meddelandet på [camming.xyz](${link})`,
    'vi': `Đặt tin nhắn tại [camming.xyz](${link})`,
    'tr': `Mesajı [camming.xyz](${link}) adresinde ayarla`,
    'cs': `Nastavit zprávu na [camming.xyz](${link})`,
    'el': `Ορισμός μηνύματος στο [camming.xyz](${link})`,
    'bg': `Задайте съобщението на [camming.xyz](${link})`,
    'ru': `Установить сообщение на [camming.xyz](${link})`,
    'uk': `Встановити повідомлення на [camming.xyz](${link})`,
    'hi': `[camming.xyz](${link}) पर संदेश सेट करें`,
    'th': `ตั้งค่าข้อความที่ [camming.xyz](${link})`,
    'zh-CN': `在 [camming.xyz](${link}) 设置消息`,
    'ja': `[camming.xyz](${link}) でメッセージを設定します`,
    'zh-TW': `在 [camming.xyz](${link}) 設定訊息`,
    'ko': `[camming.xyz](${link})에 메시지 설정`
  };

  const components = [
    (new ContainerBuilder()
      .setAccentColor(welcome?.isEnabled ? 0x058f18 : 0xff4c4c)
      .addSectionComponents(s=>s
        .addTextDisplayComponents(t=>t.setContent(`## ${this.actions[locale].status}`))
        .setButtonAccessory(b=>b
          .setCustomId('welcome_status')
          .setStyle(welcome?.isEnabled ? ButtonStyle.Success : ButtonStyle.Danger)
          .setLabel(welcome?.isEnabled ? this.actions[locale].enable : this.actions[locale].disable)
        )
      ).addTextDisplayComponents(t=>t.setContent(`${setMessageAtWebsite[locale]}`))
      .addSeparatorComponents(s=>s.setSpacing(SeparatorSpacingSize.Large))
      .addSectionComponents(s=>s
        .addTextDisplayComponents(t=>t.setContent(`**${sendToChannel[locale]}**`))
        .setButtonAccessory(b=>b
          .setCustomId('welcome_channel_status')
          .setStyle(welcome?.channel?.isEnabled ? ButtonStyle.Success : ButtonStyle.Danger)
          .setLabel(welcome?.channel?.isEnabled ? this.actions[locale].open : this.actions[locale].close)
        ),
      ).addActionRowComponents(r=>r
        .addComponents(
          (() => {
            const menu = new ChannelSelectMenuBuilder()
              .setCustomId('welcome_channel_channel')
              .setMinValues(1)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText);

            if(welcome?.channel?.id)menu.setDefaultChannels(welcome.channel.id);
            return menu;
          })(),
        )
      )
      .addSeparatorComponents(s=>s.setSpacing(SeparatorSpacingSize.Large).setDivider(false))
      .addSectionComponents(s=>s
        .addTextDisplayComponents(t=>t.setContent(`**${sendToUser[locale]}**\n-# ${this.premiumFeature[locale]('1')}`))
        .setButtonAccessory(b=>b
          .setCustomId('welcome_user_status')
          .setStyle(welcome?.user?.isEnabled ? ButtonStyle.Success : ButtonStyle.Danger)
          .setLabel(welcome?.user?.isEnabled ? this.actions[locale].open : this.actions[locale].close)
        ),
      )
    ),
    (new ActionRowBuilder().setComponents(
      // (new ButtonBuilder().setCustomId('welcome_reload')
      //   .setLabel(this.actions[locale].refresh)
      //   .setEmoji({ id: '1358990330535350373', name: 'reload' })
      //   .setStyle(ButtonStyle.Primary)
      // ),
      (new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(link)
        .setLabel(this.actions[locale].website)
      ),
    )),
  ];
  return components;
})();goodbye_component = (interaction: Interaction<CacheType>, config: GuildConfiguration) => (()=>{
  const locale = interaction.guildLocale || 'en-US';
  const goodbye = config?.welcomeSetting?.goodbye;
  const link = `https://camming.xyz/dashboard?to=server/${interaction.guild?.id}/welcome`;
  const sendToChannel = {
    'id': 'Kirim pesan ke saluran',
    'da': 'Send besked til kanal',
    'de': 'Nachricht an Kanal senden',
    'en-GB': 'Send message to channel',
    'en-US': 'Send message to channel',
    'es-ES': 'Enviar mensaje al canal',
    'es-419': 'Enviar mensaje al canal',
    'fr': 'Envoyer un message au canal',
    'hr': 'Pošalji poruku na kanal',
    'it': 'Invia messaggio al canale',
    'lt': 'Siųsti pranešimą į kanalą',
    'hu': 'Üzenet küldése a csatornára',
    'nl': 'Stuur bericht naar kanaal',
    'no': 'Send melding til kanal',
    'pl': 'Wyślij wiadomość na kanał',
    'pt-BR': 'Enviar mensagem para o canal',
    'ro': 'Trimite mesaj către canal',
    'fi': 'Lähetä viesti kanavalle',
    'sv-SE': 'Skicka meddelande till kanal',
    'vi': 'Gửi tin nhắn đến kênh',
    'tr': 'Kanala mesaj gönder',
    'cs': 'Odeslat zprávu do kanálu',
    'el': 'Αποστολή μηνύματος στο κανάλι',
    'bg': 'Изпращане на съобщение до канал',
    'ru': 'Отправить сообщение в канал',
    'uk': 'Надіслати повідомлення в канал',
    'hi': 'चैनल पर संदेश भेजें',
    'th': 'ส่งข้อความไปยังช่อง',
    'zh-CN': '发送消息到频道',
    'ja': 'チャンネルにメッセージを送信',
    'zh-TW': '傳送訊息到頻道',
    'ko': '채널에 메시지 보내기'
  };const sendToUser = {
    'id': 'Kirim pesan ke pengguna',
    'da': 'Send besked til bruger',
    'de': 'Nachricht an Benutzer senden',
    'en-GB': 'Send message to user',
    'en-US': 'Send message to user',
    'es-ES': 'Enviar mensaje al usuario',
    'es-419': 'Enviar mensaje al usuario',
    'fr': 'Envoyer un message à l\'utilisateur',
    'hr': 'Pošalji poruku korisniku',
    'it': 'Invia messaggio all\'utente',
    'lt': 'Siųsti pranešimą vartotojui',
    'hu': 'Üzenet küldése a felhasználónak',
    'nl': 'Stuur bericht naar gebruiker',
    'no': 'Send melding til bruker',
    'pl': 'Wyślij wiadomość do użytkownika',
    'pt-BR': 'Enviar mensagem para o usuário',
    'ro': 'Trimite mesaj către utilizator',
    'fi': 'Lähetä viesti käyttäjälle',
    'sv-SE': 'Skicka meddelande till användare',
    'vi': 'Gửi tin nhắn cho người dùng',
    'tr': 'Kullanıcıya mesaj gönder',
    'cs': 'Odeslat zprávu uživateli',
    'el': 'Αποστολή μηνύματος στον χρήστη',
    'bg': 'Изпращане на съобщение до потребител',
    'ru': 'Отправить сообщение пользователю',
    'uk': 'Надіслати повідомлення користувачеві',
    'hi': 'उपयोगकर्ता को संदेश भेजें',
    'th': 'ส่งข้อความไปยังผู้ใช้',
    'zh-CN': '发送消息给用户',
    'ja': 'ユーザーにメッセージを送信',
    'zh-TW': '傳送訊息給使用者',
    'ko': '사용자에게 메시지 보내기'
  };const setMessageAtWebsite = {
    'id': `Atur pesan di [camming.xyz](${link})`,
    'da': `Indstil beskeden på [camming.xyz](${link})`,
    'de': `Nachricht auf [camming.xyz](${link}) festlegen`,
    'en-GB': `Set the message at [camming.xyz](${link})`,
    'en-US': `Set the message at [camming.xyz](${link})`,
    'es-ES': `Establecer el mensaje en [camming.xyz](${link})`,
    'es-419': `Establecer el mensaje en [camming.xyz](${link})`,
    'fr': `Définir le message sur [camming.xyz](${link})`,
    'hr': `Postavi poruku na [camming.xyz](${link})`,
    'it': `Imposta il messaggio su [camming.xyz](${link})`,
    'lt': `Nustatyti pranešimą [camming.xyz](${link})`,
    'hu': `Üzenet beállítása itt: [camming.xyz](${link})`,
    'nl': `Stel het bericht in op [camming.xyz](${link})`,
    'no': `Angi meldingen på [camming.xyz](${link})`,
    'pl': `Ustaw wiadomość na [camming.xyz](${link})`,
    'pt-BR': `Definir a mensagem em [camming.xyz](${link})`,
    'ro': `Setați mesajul la [camming.xyz](${link})`,
    'fi': `Aseta viesti sivustolla [camming.xyz](${link})`,
    'sv-SE': `Ställ in meddelandet på [camming.xyz](${link})`,
    'vi': `Đặt tin nhắn tại [camming.xyz](${link})`,
    'tr': `Mesajı [camming.xyz](${link}) adresinde ayarla`,
    'cs': `Nastavit zprávu na [camming.xyz](${link})`,
    'el': `Ορισμός μηνύματος στο [camming.xyz](${link})`,
    'bg': `Задайте съобщението на [camming.xyz](${link})`,
    'ru': `Установить сообщение на [camming.xyz](${link})`,
    'uk': `Встановити повідомлення на [camming.xyz](${link})`,
    'hi': `[camming.xyz](${link}) पर संदेश सेट करें`,
    'th': `ตั้งค่าข้อความที่ [camming.xyz](${link})`,
    'zh-CN': `在 [camming.xyz](${link}) 设置消息`,
    'ja': `[camming.xyz](${link}) でメッセージを設定します`,
    'zh-TW': `在 [camming.xyz](${link}) 設定訊息`,
    'ko': `[camming.xyz](${link})에 메시지 설정`
  };

  const components = [
    (new ContainerBuilder()
      .setAccentColor(goodbye?.isEnabled ? 0x058f18 : 0xff4c4c)
      .addSectionComponents(s=>s
        .addTextDisplayComponents(t=>t.setContent(`## ${this.actions[locale].status}`))
        .setButtonAccessory(b=>b
          .setCustomId('goodbye_status')
          .setStyle(goodbye?.isEnabled ? ButtonStyle.Success : ButtonStyle.Danger)
          .setLabel(goodbye?.isEnabled ? this.actions[locale].enable : this.actions[locale].disable)
        )
      ).addTextDisplayComponents(t=>t.setContent(`${setMessageAtWebsite[locale]}`))
      .addSeparatorComponents(s=>s.setSpacing(SeparatorSpacingSize.Large))
      .addSectionComponents(s=>s
        .addTextDisplayComponents(t=>t.setContent(`**${sendToChannel[locale]}**`))
        .setButtonAccessory(b=>b
          .setCustomId('goodbye_channel_status')
          .setStyle(goodbye?.channel?.isEnabled ? ButtonStyle.Success : ButtonStyle.Danger)
          .setLabel(goodbye?.channel?.isEnabled ? this.actions[locale].open : this.actions[locale].close)
        ),
      ).addActionRowComponents(r=>r
        .addComponents(
          (() => {
            const menu = new ChannelSelectMenuBuilder()
              .setCustomId('goodbye_channel_channel')
              .setMinValues(1)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText);

            if(goodbye?.channel?.id)menu.setDefaultChannels(goodbye.channel.id);
            return menu;
          })(),
        )
      )
      .addSeparatorComponents(s=>s.setSpacing(SeparatorSpacingSize.Large).setDivider(false))
      .addSectionComponents(s=>s
        .addTextDisplayComponents(t=>t.setContent(`**${sendToUser[locale]}**\n-# ${this.premiumFeature[locale]('1')}`))
        .setButtonAccessory(b=>b
          .setCustomId('goodbye_user_status')
          .setStyle(goodbye?.user?.isEnabled ? ButtonStyle.Success : ButtonStyle.Danger)
          .setLabel(goodbye?.user?.isEnabled ? this.actions[locale].open : this.actions[locale].close)
        ),
      )
    ),
    (new ActionRowBuilder().setComponents(
      // (new ButtonBuilder().setCustomId('goodbye_reload')
      //   .setLabel(this.actions[locale].refresh)
      //   .setEmoji({ id: '1358990330535350373', name: 'reload' })
      //   .setStyle(ButtonStyle.Primary)
      // ),
      (new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(link)
        .setLabel(this.actions[locale].website)
      ),
    )),
  ];
  return components;
})();
};