/**
 * Helper to compute creation date and account age from Discord Snowflake IDs.
 */

export function getDiscordCreationDate(snowflakeId?: string | null): Date | null {
  if (!snowflakeId) return null;
  try {
    const epoch = BigInt("1420070400000");
    const shift = BigInt(22);
    const idBigInt = BigInt(snowflakeId);
    const timestamp = Number((idBigInt >> shift) + epoch);
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
}

export function formatAccountAge(createdAt?: Date | null): string {
  if (!createdAt) return 'ไม่ระบุ';
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  if (diffMs < 0) return 'เพิ่งสร้าง';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);

  if (years > 0) {
    return months > 0 ? `${years} ปี ${months} เดือน` : `${years} ปี`;
  }
  if (months > 0) {
    return `${months} เดือน`;
  }
  return `${Math.max(1, diffDays)} วัน`;
}

export function formatFullDate(date?: Date | null): string {
  if (!date) return '-';
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
