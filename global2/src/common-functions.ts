import { Locale, timeUnit, unitOrder, unitValues } from "./types.js";

// 👉 แปลงเวลา มิล → ข้อความ
export function formatDuration(ms: number, locale: Locale, style: 'full' | 'short' = 'full'): string {
  function pluralize(unit: string, count: number): string {
    const units = timeUnit[locale || 'en-US'];
    const [singular, plural] = units[unit];
    return `${count} ${count === 1 ? singular : plural}`;
  }

  const unitDurations = {
    year: 365 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    min: 60 * 1000,
    sec: 1000,
  };

  if (style === 'short') {
    for (const unit in unitDurations) {
      const value = unitDurations[unit as keyof typeof unitDurations];
      if (ms >= value) {
        const num = Math.floor(ms / value);
        return `${num} ${timeUnit[locale][unit][1]}`;  // no decimals
      }
    }
    return `0 ${timeUnit[locale]['sec'][1]}`;
  }

  // full style
  const result: string[] = [];
  for (const unit in unitDurations) {
    const value = unitDurations[unit as keyof typeof unitDurations];
    const count = Math.floor(ms / value);
    if (count > 0) {
      result.push(pluralize(unit, count));
      ms -= count * value;
    }
  }

  return result.length ? result.join(' ') : pluralize('sec', 0);
};// 👉 แปลงเวลา ข้อความ → มิล
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

// 👉 แปลงข้อมูลดาต้า เลข → ข้อความ
export function formatDataSize(type: 'bit' | 'byte', size: number, style: 'full' | 'short' = 'full'): string {
  const units = unitOrder[type];

  if (style === 'short') {
    for (const unit of units) {
      const value = unitValues[unit];
      if (size >= value) {
        const num = size / value;
        return `${num.toFixed(2)} ${unit}`;
      }
    }
    return `0 ${units[units.length - 1]}`;
  }

  // style === 'full'
  const result: string[] = [];
  for (const unit of units) {
    const value = unitValues[unit];
    const count = Math.floor(size / value);
    if (count > 0) {
      result.push(`${count} ${unit}`);
      size -= count * value;
    }
  }

  return result.length ? result.join(' ') : `0 ${units[units.length - 1]}`;
};// 👉 แปลงข้อมูลดาต้า ข้อความ → เลข
export function parseDataSize(type: 'bit' | 'byte', input: string): number {
  const units = unitOrder[type];
  const aliases: Record<string, number> = {};

  for (const unit of units) {
    aliases[unit.toLowerCase()] = unitValues[unit];
  }

  const regex = /(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/g;
  let total = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input))) {
    const [, numStr, unitRaw] = match;
    const num = parseFloat(numStr);
    const unit = unitRaw.toLowerCase();
    const value = aliases[unit];
    if (value) {
      total += num * value;
    }
  }

  return total;
};

// 👉 พิมพ์ใหญ่ตัวแรก
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
