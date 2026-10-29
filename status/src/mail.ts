import 'dotenv/config';
import nodemailer from 'nodemailer';
import type { StatusData } from 'global/types';
import { formatDataSize } from 'global/common-functions';
import type { Brief } from './history.js';
import { displayName, fmtDateTh, fmtDurTh } from './format.js';
import { getActiveError, getLastError } from './check.js';
import { FONT, esc, mailButton, mailDoc, mailFooter, mailHeader, nowTh } from './mail-theme.js';

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
type Kind = 'ok' | 'down' | 'load';

/** สีเส้นข้างการ์ด และสีของค่าหลัก (ค่าสว่าง; ธีมมืดเปลี่ยนผ่าน class) */
const ACC: Record<Kind, string> = { ok: '#2fbf7f', down: '#e5484d', load: '#2ba6d6' };

const kindOf = (s: StatusData): Kind => (s.status === 1 ? 'ok' : s.status === -1 ? 'load' : 'down');
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

/** ข้อความสาเหตุ: ถ้าหยุดทำงานบอกสาเหตุปัจจุบัน ถ้ากลับมาแล้วบอกข้อผิดพลาดล่าสุดก่อนหน้า */
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
	return `<tr><td class="t-down" style="padding:0 20px 12px 20px;font-family:${FONT};font-size:13px;line-height:1.6;color:#b42323">${esc(t)}</td></tr>`;
}

function chips(s: StatusData): string {
	const c: string[] = [];
	if (typeof s.ping === 'number') c.push(`Ping ${s.ping} ms`);
	if (s.resources?.cpu) c.push(`CPU ${s.resources.cpu.percent}%`);
	if (s.resources?.memory) c.push(`หน่วยความจำ ${formatDataSize('byte', s.resources.memory.used, 'short')} / ${formatDataSize('byte', s.resources.memory.total, 'short')}`);
	if (s.version) c.push(`v${s.version}`);
	return c.map(t => `<span class="chip" style="display:inline-block;margin:0 6px 6px 0;padding:4px 11px;border-radius:99px;border:1px solid #eadfe1;background:#f6eff0;color:#5c4d4f;font-family:${FONT};font-size:12px">${esc(t)}</span>`).join('');
}

function card(it: MailItem): string {
	const { s } = it;
	const k = kindOf(s);
	const { cur, last } = metrics(it);
	return `
<tr><td style="padding:0 0 14px 0">
<table role="presentation" class="card" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e7e0e1;border-left:4px solid ${ACC[k]};border-radius:16px">
<tr><td style="padding:18px 20px 6px 20px">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
		<td class="ink" style="font-family:${FONT};font-size:18px;font-weight:600;color:#1d1719">${esc(displayName(s.name))}</td>
		<td align="right"><span class="b-${k}" style="display:inline-block;padding:4px 13px;border-radius:99px;background:#dff5ea;color:#0d7a4b;font-family:${FONT};font-size:12px;font-weight:600">${labelOf(s)}</span></td>
	</tr></table>
</td></tr>
<tr><td style="padding:10px 20px 6px 20px">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
		<td width="50%" valign="top" style="font-family:${FONT};padding-right:12px">
			<div class="mut" style="font-size:12px;color:#5f5355">${cur.label}</div>
			<div class="t-${k}" style="font-size:22px;font-weight:700;line-height:1.3;color:#1d1719">${esc(cur.value)}</div>
			<div class="dim" style="font-size:12px;color:#7d7072">${esc(cur.note)}</div>
		</td>
		<td width="50%" valign="top" class="rule" style="font-family:${FONT};padding-left:12px;border-left:1px solid #eee6e7">
			<div class="mut" style="font-size:12px;color:#5f5355">${last.label}</div>
			<div class="ink" style="font-size:22px;font-weight:700;line-height:1.3;color:#1d1719">${esc(last.value)}</div>
			<div class="dim" style="font-size:12px;color:#7d7072">${esc(last.note)}</div>
		</td>
	</tr></table>
</td></tr>
${errorRow(s)}
<tr><td style="padding:12px 20px 16px 20px;font-family:${FONT}">${chips(s)}</td></tr>
</table>
</td></tr>`;
}

export function buildMail(items: MailItem[], mode: MailMode, unsubUrl = '') {
	const downs = items.filter(i => i.s.status === 0);
	const ups = items.filter(i => i.s.status === 1);
	const names = (l: MailItem[]) => l.map(i => displayName(i.s.name)).join(', ');
	const url = process.env.STATUS_PAGE_URL;

	let kind: Kind = 'ok';
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

	const intro = mode === 'daily' ? 'รายงานสถานะประจำวัน' : 'แจ้งเตือนการเปลี่ยนแปลงสถานะ';
	const hero = `
<tr><td style="padding:0 0 18px 0">
<table role="presentation" class="hero-${kind}" width="100%" cellpadding="0" cellspacing="0" style="background:${kind === 'ok' ? '#e9f8f1' : kind === 'down' ? '#fdeeee' : '#e7f5fb'};border:1px solid ${kind === 'ok' ? '#7fd9a9' : kind === 'down' ? '#f29a9d' : '#7fc9e6'};border-radius:20px">
<tr><td style="padding:26px 26px;font-family:${FONT}">
	<div class="t-${kind}" style="font-size:13px;color:${kind === 'ok' ? '#0d7a4b' : kind === 'down' ? '#b42323' : '#0b6e99'}">${intro}</div>
	<div class="ink" style="margin-top:6px;font-size:26px;font-weight:700;line-height:1.3;color:#1d1719">${esc(title)}</div>
	<div class="mut" style="margin-top:8px;font-size:15px;font-weight:300;color:#5f5355">${esc(sub)}</div>
</td></tr></table>
</td></tr>`;

	const button = url ? `<tr><td align="center" style="padding:10px 0 6px 0">${mailButton(url, 'ดูหน้าสถานะแบบเต็ม')}</td></tr>` : '';
	const unsub = unsubUrl
		? `คุณได้รับอีเมลนี้เพราะสมัครรับการแจ้งเตือนสถานะ Yumi<br><a href="${esc(unsubUrl)}" style="color:#7d7072;text-decoration:underline">ยกเลิกการรับอีเมล</a><br>`
		: '';
	const footer = mailFooter(`${unsub}อีเมลนี้ส่งโดยอัตโนมัติจากระบบเฝ้าดู Yumi Status<br>เวลาทั้งหมดเป็นเวลาประเทศไทย (GMT+7)`);

	const html = mailDoc(subject, `
${mailHeader(nowTh())}
${hero}
${items.map(card).join('\n')}
${button}
${footer}`, sub);

	const text = [
		`Yumi Status - ${title}`, sub, '',
		...items.map(it => {
			const { cur, last } = metrics(it);
			const et = errorText(it.s);
			return `${displayName(it.s.name)}: ${labelOf(it.s)}\n  ${cur.label}: ${cur.value} (${cur.note})\n  ${last.label}: ${last.value} (${last.note})${et ? `\n  ${et}` : ''}`;
		}),
		url ? `\nดูหน้าสถานะ: ${url}` : '',
		unsubUrl ? `\nยกเลิกการรับอีเมล: ${unsubUrl}` : '',
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

	const { activeRecipients } = await import('./subscribers.js');
	const subs = await activeRecipients();
	const recipients = subs.length
		? subs
		: [{ email: process.env.MAIL_TO || 'thirphathrphlphun@gmail.com', unsubUrl: '' }];

	const from = process.env.MAIL_FROM || `Yumi Status <${process.env.SMTP_USER}>`;
	// ส่งทีละคนเพื่อให้ลิงก์ยกเลิกเป็นของแต่ละคน และไม่เห็นอีเมลของคนอื่น
	for (const r of recipients) {
		const { subject, html, text } = buildMail(items, mode, r.unsubUrl);
		const headers: Record<string, string> = r.unsubUrl
			? { 'List-Unsubscribe': `<${r.unsubUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
			: {};
		try {
			await t.sendMail({ from, to: r.email, subject, html, text, headers });
		} catch (e) {
			console.error(`ส่งอีเมลถึง ${r.email} ไม่สำเร็จ:`, e);
		}
	}
}