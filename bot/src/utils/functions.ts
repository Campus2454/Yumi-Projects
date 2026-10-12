import { Locale } from "../slashCommands/interactionElements";
const timeUnit: Record<Locale, Record<string, [string, string]>> = {
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
};

export function formatDuration(ms: number, locale: Locale): string {
    function pluralize(locale: Locale, unit: string, count: number): string {
        const units = timeUnit[locale || 'en-US'];
        const [singular, plural] = units[unit];
        return `${count} ${count === 1 ? singular : plural}`;
    };

    const unitDurations = {
        year: 365 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        hour: 60 * 60 * 1000,
        min: 60 * 1000,
        sec: 1000,
    };

    const result: string[] = [];
    for (const unit in unitDurations) {
        const value = unitDurations[unit as keyof typeof unitDurations];
        const count = Math.floor(ms / value);
        if (count > 0) {
        result.push(pluralize(locale, unit, count));
        ms -= count * value;
        }
    }

    return result.length ? result.join(' ') : pluralize(locale, 'sec', 0);
};
export function parseDuration(input: string, locale: Locale): number {
    const units = timeUnit[locale || 'en-US'];
    const aliases: Record<string, number> = {};
    const msValues: Record<string, number> = {
      year: 365 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      hour: 60 * 60 * 1000,
      min: 60 * 1000,
      sec: 1000,
    };
  
    for (const [unit, [singular, plural]] of Object.entries(units)) {
      aliases[singular] = msValues[unit];
      aliases[plural] = msValues[unit];
    }
  
    let total = 0;
    const regex = /(\d+)\s*([^\d\s]+)/g;
    let match: RegExpExecArray | null;
  
    while ((match = regex.exec(input))) {
      const [, numStr, word] = match;
      const num = parseInt(numStr);
      const unitMs = aliases[word.trim()];
      if (unitMs) total += num * unitMs;
    }
  
    return total;
};