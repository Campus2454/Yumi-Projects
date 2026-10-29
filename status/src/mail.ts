import 'dotenv/config';
import nodemailer from 'nodemailer';
import type { StatusData } from 'global/types';
import { formatDataSize } from 'global/common-functions';
import type { Brief } from './history.js';
import { displayName, fmtDateTh, fmtDurTh } from './format.js';
import { getActiveError, getLastError } from './check.js';

/**
 * ตั้งค่าอีเมลผ่าน env (ถ้าไม่ตั้ง SMTP_USER / SMTP_PASS จะข้ามการส่งอีเมล)
 *   SMTP_HOST   (ค่าเริ่มต้น smtp.gmail.com)
 *   SMTP_PORT   (ค่าเริ่มต้น 465)
 *   SMTP_USER, SMTP_PASS   (Gmail ให้ใช้ App Password)
 *   MAIL_FROM   (ค่าเริ่มต้น "Yumi Status <SMTP_USER>")
 *   MAIL_TO     (ค่าเริ่มต้น thirphathrphlphun@gmail.com, คั่นหลายคนด้วย ,)
 *   STATUS_PAGE_URL  (ลิงก์ปุ่ม "ดูหน้าสถานะ" ถ้าไม่ตั้งจะไม่แสดงปุ่ม)
 */
export interface MailItem { s: StatusData; b: Brief }
export type MailMode = 'daily' | 'change';

const LOGO = 'https://assets.yumistack.net/photos/logo/yumi/001.webp';
const FONT = `'Kanit','Noto Sans Thai',Tahoma,'Segoe UI',Arial,sans-serif`;
const COLOR = {
	ok: { main: '#3ddc97', badgeBg: '#0f3a2a', badgeText: '#6ff0b8' },
	down: { main: '#ff5a5f', badgeBg: '#431316', badgeText: '#ff9ea1' },
	load: { main: '#4cc9f0', badgeBg: '#0e3340', badgeText: '#8fdcf6' },
};
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const kindOf = (s: StatusData) => (s.status === 1 ? 'ok' : s.status === -1 ? 'load' : 'down') as 'ok' | 'down' | 'load';
const labelOf = (s: StatusData) => (s.status === 1 ? 'กำลังทำงาน' : s.status === -1 ? 'กำลังเริ่มระบบ' : 'หยุดทำงาน');

/** ข้อความสองช่อง: ปัจจุบัน และ ครั้งล่าสุดของสถานะตรงข้าม */
function metrics(it: MailItem) {
	const { s, b } = it;
	const cur = b.ms !== null && b.since !== null
		? { label: s.status === 1 ? 'Uptime' : 'Downtime', value: fmtDurTh(b.ms), note: `ตั้งแต่ ${fmtDateTh(b.since)}` }
		: { label: s.status === 1 ? 'Uptime' : 'Downtime', value: '—', note: 'ยังไม่มีข้อมูล' };
	let last: { label: string; value: string; note: string };
	if (s.status === 1) {
		last = b.last
			? { label: 'Downtime ล่าสุด', value: fmtDurTh(b.last.duration), note: `เมื่อ ${fmtDateTh(b.last.start)}` }
			: { label: 'Downtime ล่าสุด', value: 'ไม่เคยล่ม', note: 'ตั้งแต่เริ่มบันทึก' };
	} else {
		last = b.last
			? { label: 'Uptime ล่าสุด', value: fmtDurTh(b.last.duration), note: `จนถึง ${fmtDateTh(b.last.end)}` }
			: { label: 'Uptime ล่าสุด', value: '—', note: 'ยังไม่มีข้อมูลก่อนหน้า' };
	}
	return { cur, last };
}

function chips(s: StatusData): string {
	const c: string[] = [];
	if (typeof s.ping === 'number') c.push(`Ping ${s.ping} ms`);
	if (s.resources?.cpu) c.push(`CPU ${s.resources.cpu.percent}%`);
	if (s.resources?.memory) c.push(`หน่วยความจำ ${formatDataSize('byte', s.resources.memory.used, 'short')} / ${formatDataSize('byte', s.resources.memory.total, 'short')}`);
	if (s.version) c.push(`v${s.version}`);
	return c.map(t => `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 10px;border-radius:999px;background:#2a1417;border:1px solid #432226;color:#d8b9b5;font-size:12px;">${esc(t)}</span>`).join('');
}

/** ข้อความสาเหตุ: ถ้าหยุดทำงานจะบอกสาเหตุปัจจุบัน ถ้ากลับมาแล้วจะบอกข้อผิดพลาดล่าสุดก่อนหน้า */
function errorText(s: StatusData): string | null {
	if (s.status === 0) {
		const e = getActiveError(s.name);
		return `สาเหตุ: ${e ? e.message : 'ไม่ทราบสาเหตุ'}`;
	}
	if (s.status === 1) {
		const e = getLastError(s.name);
		if (e) return `ข้อผิดพลาดล่าสุดก่อนหน้า: ${e.message} (${fmtDateTh(e.at)})`;
	}
	return null;
}

function errorRow(s: StatusData): string {
	const t = errorText(s);
	if (!t) return '';
	return `<tr><td style="padding:12px 22px 0 22px;font-family:${FONT};font-size:13px;line-height:1.6;color:#ff9ea1;">${esc(t)}</td></tr>`;
}

function card(it: MailItem): string {
	const { s } = it;
	const k = kindOf(s), col = COLOR[k];
	const { cur, last } = metrics(it);
	return `
<tr><td style="padding:0 0 14px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a0b0d;border:1px solid #331a1d;border-left:4px solid ${col.main};border-radius:16px;">
<tr><td style="padding:20px 22px 6px 22px;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
		<td style="font-family:${FONT};font-size:19px;font-weight:600;color:#fff3f1;">${esc(displayName(s.name))}</td>
		<td align="right"><span style="display:inline-block;padding:5px 14px;border-radius:999px;background:${col.badgeBg};color:${col.badgeText};font-family:${FONT};font-size:13px;font-weight:600;">${labelOf(s)}</span></td>
	</tr></table>
</td></tr>
<tr><td style="padding:10px 22px 6px 22px;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
		<td width="50%" valign="top" style="font-family:${FONT};padding-right:10px;">
			<div style="font-size:12px;color:#b99a97;">${cur.label}</div>
			<div style="font-size:24px;font-weight:700;color:${col.main};line-height:1.3;">${esc(cur.value)}</div>
			<div style="font-size:12px;color:#8a706d;">${esc(cur.note)}</div>
		</td>
		<td width="50%" valign="top" style="font-family:${FONT};padding-left:10px;border-left:1px solid #331a1d;">
			<div style="font-size:12px;color:#b99a97;">${last.label}</div>
			<div style="font-size:24px;font-weight:700;color:#fff3f1;line-height:1.3;">${esc(last.value)}</div>
			<div style="font-size:12px;color:#8a706d;">${esc(last.note)}</div>
		</td>
	</tr></table>
</td></tr>
${errorRow(s)}
<tr><td style="padding:12px 22px 14px 22px;font-family:${FONT};">${chips(s)}</td></tr>
</table></td></tr>`;
}

export function buildMail(items: MailItem[], mode: MailMode) {
	const downs = items.filter(i => i.s.status === 0);
	const ups = items.filter(i => i.s.status === 1);
	const names = (l: MailItem[]) => l.map(i => displayName(i.s.name)).join(', ');
	const url = process.env.STATUS_PAGE_URL;

	let kind: 'ok' | 'down' | 'load' = 'ok';
	let title = 'ทุกระบบทำงานปกติ';
	let sub = `${ups.length} จาก ${items.length} บริการตอบสนองตามปกติ`;
	let subject = '[Yumi Status] รายงานประจำวัน: ทุกระบบทำงานปกติ';

	if (downs.length) {
		kind = 'down';
		title = `พบบริการหยุดทำงาน ${downs.length} รายการ`;
		sub = names(downs);
		subject = mode === 'daily'
			? `[Yumi Status] รายงานประจำวัน: พบ ${downs.length} ระบบผิดปกติ`
			: `[Yumi Status] ${names(downs)} หยุดทำงาน`;
	} else if (mode === 'change' && ups.length) {
		title = 'บริการกลับมาทำงานแล้ว';
		sub = names(ups);
		subject = `[Yumi Status] ${names(ups)} กลับมาทำงานแล้ว`;
	} else if (items.some(i => i.s.status === -1)) {
		kind = 'load';
		title = 'บางบริการกำลังเริ่มระบบ';
		sub = names(items.filter(i => i.s.status === -1));
		subject = '[Yumi Status] บางบริการกำลังเริ่มระบบ';
	}

	const col = COLOR[kind];
	const when = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'long', timeStyle: 'short', hour12: false });
	const intro = mode === 'daily' ? 'รายงานสถานะประจำวัน' : 'แจ้งเตือนการเปลี่ยนแปลงสถานะ';

	const html = `<!doctype html>
<html lang="th"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<title>${esc(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0b0405;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(title)} ${esc(sub)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0b0405" style="background:#0b0405;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">

<tr><td style="padding:0 6px 22px 6px;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
		<td width="48" valign="middle"><img src="${LOGO}" width="40" height="40" alt="Yumi" style="display:block;border-radius:12px;border:0;"></td>
		<td valign="middle" style="font-family:${FONT};font-size:18px;font-weight:600;color:#fff3f1;">Yumi Status</td>
		<td align="right" valign="middle" style="font-family:${FONT};font-size:12px;color:#8a706d;">${esc(when)}</td>
	</tr></table>
</td></tr>

<tr><td style="padding:0 0 18px 0;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#1a0b0d" style="background:#1a0b0d;background-image:linear-gradient(135deg,${col.badgeBg} 0%,#1a0b0d 70%);border:1px solid ${col.main};border-radius:20px;">
	<tr><td style="padding:30px 28px;font-family:${FONT};">
		<div style="font-size:13px;color:${col.badgeText};">${intro}</div>
		<div style="margin-top:6px;font-size:28px;font-weight:700;line-height:1.3;color:#ffffff;">${esc(title)}</div>
		<div style="margin-top:8px;font-size:15px;font-weight:300;color:#d8b9b5;">${esc(sub)}</div>
	</td></tr></table>
</td></tr>

${items.map(card).join('\n')}

${url ? `<tr><td align="center" style="padding:10px 0 6px 0;">
	<a href="${esc(url)}" style="display:inline-block;padding:14px 34px;border-radius:14px;background:#f13b3b;color:#ffffff;font-family:${FONT};font-size:15px;font-weight:600;text-decoration:none;">ดูหน้าสถานะแบบเต็ม</a>
</td></tr>` : ''}

<tr><td align="center" style="padding:22px 10px 0 10px;font-family:${FONT};font-size:12px;line-height:1.7;color:#6f5856;">
	อีเมลนี้ส่งโดยอัตโนมัติจากระบบเฝ้าดู Yumi Status<br>เวลาทั้งหมดเป็นเวลาประเทศไทย (GMT+7)
</td></tr>

</table></td></tr></table>
</body></html>`;

	const text = [
		`Yumi Status - ${title}`, sub, '',
		...items.map(it => {
			const { cur, last } = metrics(it);
			const et = errorText(it.s);
			return `${displayName(it.s.name)}: ${labelOf(it.s)}\n  ${cur.label}: ${cur.value} (${cur.note})\n  ${last.label}: ${last.value} (${last.note})${et ? `\n  ${et}` : ''}`;
		}),
		url ? `\nดูหน้าสถานะ: ${url}` : '',
	].join('\n');

	return { subject, html, text };
}

let transporter: nodemailer.Transporter | null | undefined;
function getTransporter() {
	if (transporter !== undefined) return transporter;
	const user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
	if (!user || !pass) {
		console.warn('ยังไม่ได้ตั้งค่า SMTP_USER / SMTP_PASS จึงข้ามการส่งอีเมล');
		return (transporter = null);
	}
	const port = Number(process.env.SMTP_PORT || 465);
	return (transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST || 'smtp.gmail.com',
		port,
		secure: port === 465,
		auth: { user, pass },
		connectionTimeout: 10_000,
		socketTimeout: 20_000,
	}));
}

/** ส่งอีเมลดิบ 1 ฉบับ (ใช้ได้ทั้งยืนยันการสมัครและแจ้งเตือนทั่วไป) */
export async function sendRaw(to: string, subject: string, html: string, text: string, headers: Record<string, string> = {}) {
	const t = getTransporter();
	if (!t) return;
	await t.sendMail({
		from: process.env.MAIL_FROM || `Yumi Status <${process.env.SMTP_USER}>`,
		to, subject, html, text, headers,
	});
}

/** ส่งรายงาน/แจ้งเตือนหาทุกคนที่ยืนยันแล้ว (ถ้ายังไม่มีผู้สมัครเลย จะส่งไปหา MAIL_TO แทน) */
export async function sendStatusMail(items: MailItem[], mode: MailMode) {
	if (!items.length) return;
	const t = getTransporter();
	if (!t) return;
	const { subject, html, text } = buildMail(items, mode);

	const { activeRecipients } = await import('./subscribers.js');
	const subs = await activeRecipients();
	const recipients = subs.length
		? subs
		: [{ email: process.env.MAIL_TO || 'thirphathrphlphun@gmail.com', unsubUrl: '' }];

	const from = process.env.MAIL_FROM || `Yumi Status <${process.env.SMTP_USER}>`;
	// ส่งทีละคนเพื่อให้ลิงก์ยกเลิกเป็นของแต่ละคน และไม่เห็นอีเมลของคนอื่น
	for (const r of recipients) {
		const headers: Record<string, string> = r.unsubUrl
			? { 'List-Unsubscribe': `<${r.unsubUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
			: {};
		const footer = r.unsubUrl
			? `<p style="text-align:center;font-family:'Kanit',Tahoma,Arial,sans-serif;font-size:12px;color:#6f5856;margin:14px 0 0;">คุณได้รับอีเมลนี้เพราะสมัครรับการแจ้งเตือนสถานะ Yumi · <a href="${r.unsubUrl}" style="color:#b99a97;">ยกเลิกการรับ</a></p>`
			: '';
		const htmlFor = html.replace('</body>', `${footer}</body>`);
		const textFor = r.unsubUrl ? `${text}\n\nยกเลิกการรับ: ${r.unsubUrl}` : text;
		try {
			await t.sendMail({ from, to: r.email, subject, html: htmlFor, text: textFor, headers });
		} catch (e) {
			console.error(`ส่งอีเมลถึง ${r.email} ไม่สำเร็จ:`, e);
		}
	}
}