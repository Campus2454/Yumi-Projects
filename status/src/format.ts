import { capitalize } from 'global/common-functions';

/** ชื่อแสดงผลภาษาไทยของแต่ละ service (ถ้าไม่อยู่ในรายการจะใช้ชื่อเดิมจัดรูปแบบให้) */
const NAMES_TH: Record<string, string> = {
	bot: 'บอทหลัก',
	backend: 'แบ็กเอนด์',
	frontend_main: 'เว็บไซต์หลัก',
	database: 'ฐานข้อมูล',
};
export const displayName = (n: string) => NAMES_TH[n] ?? capitalize(n.split('_').join(' '));

/** ระยะเวลาแบบไทย แสดง 2 หน่วยบนสุด เช่น "3 วัน 4 ชม." */
export function fmtDurTh(ms: number): string {
	const t = Math.max(0, Math.floor(ms / 1000));
	const u: [number, string][] = [[Math.floor(t / 86400), 'วัน'], [Math.floor((t % 86400) / 3600), 'ชม.'], [Math.floor((t % 3600) / 60), 'นาที'], [t % 60, 'วิ']];
	const p = u.filter(([v]) => v > 0).slice(0, 2).map(([v, l]) => `${v} ${l}`);
	return p.length ? p.join(' ') : '0 วิ';
}

/** วันที่และเวลาแบบไทย (เวลาประเทศไทย) เช่น "20 ต.ค. 14:03" */
export const fmtDateTh = (t: number) =>
	new Date(t).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
export const fmtDayTh = (t: number) =>
	new Date(t).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short' });

export const stateTh = (s: number) =>
	s === 1 ? { key: 'ok', label: 'กำลังทำงาน' } : s === -1 ? { key: 'load', label: 'กำลังเริ่มระบบ' } : { key: 'down', label: 'หยุดทำงาน' };

/** 99.9876 -> "99.98%" (ปัดลง เพื่อไม่ให้โชว์ 100% ทั้งที่เคยล่ม) */
export const fmtPct = (p: number | null) => (p === null ? '—' : p >= 100 ? '100%' : `${(Math.floor(p * 100) / 100).toFixed(2)}%`);