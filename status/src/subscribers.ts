import pg from 'pg';
import crypto from 'node:crypto';
import { sendRaw } from './mail.js';
import { initHistory } from './history.js';

/**
 * ระบบผู้รับอีเมลแบบ double opt-in
 *   pending  -> ใส่อีเมลแล้ว รอกดลิงก์ยืนยัน
 *   active   -> ยืนยันแล้ว ได้รับอีเมลทั้งหมด
 *   revoked  -> กดยกเลิกแล้ว ไม่ได้รับอีกจนกว่าจะสมัครใหม่
 */
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 5_000 });

const PUBLIC_URL = (process.env.STATUS_PAGE_URL || '').replace(/\/$/, '');
const TOKEN_TTL_MS = 48 * 3_600_000;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export const normalizeEmail = (e: unknown) => (typeof e === 'string' ? e.trim().toLowerCase() : '');
export const isValidEmail = (e: string) => e.length <= 254 && EMAIL_RE.test(e);

let ready: Promise<void> | null = null;
export function initSubscribers(): Promise<void> {
	if (!ready) {
		ready = (async () => {
			await initHistory();
			await pool.query(`
				CREATE TABLE IF NOT EXISTS subscribers(
					id BIGSERIAL PRIMARY KEY,
					email TEXT NOT NULL UNIQUE,
					status TEXT NOT NULL CHECK (status IN ('pending','active','revoked')),
					confirm_token TEXT,
					confirm_expires BIGINT,
					unsub_token TEXT NOT NULL UNIQUE,
					created_at BIGINT NOT NULL,
					confirmed_at BIGINT,
					revoked_at BIGINT
				);
				CREATE INDEX IF NOT EXISTS idx_sub_status ON subscribers(status);
				CREATE INDEX IF NOT EXISTS idx_sub_confirm ON subscribers(confirm_token);
			`);
		})();
		ready.catch(() => { ready = null; });
	}
	return ready;
}

const token = () => crypto.randomBytes(32).toString('base64url');

/** ผลลัพธ์ให้หน้าเว็บแสดงผล โดยไม่บอกว่าอีเมลนี้มีในระบบหรือไม่ (กันการไล่หาอีเมล) */
export type SubscribeResult = 'sent' | 'invalid' | 'already';

export async function requestSubscribe(raw: unknown): Promise<SubscribeResult> {
	await initSubscribers();
	const email = normalizeEmail(raw);
	if (!isValidEmail(email)) return 'invalid';

	const existing = (await pool.query<{ status: string }>(`SELECT status FROM subscribers WHERE email = $1`, [email])).rows[0];
	if (existing?.status === 'active') {
		// ไม่บอกว่ามีอยู่แล้ว ส่งอีเมลเตือนแทน เพื่อไม่ให้รู้ว่าใครสมัครอยู่
		await sendRaw(email, 'Yumi Status: คุณได้รับการแจ้งเตือนอยู่แล้ว', `<p>อีเมลนี้ได้รับการแจ้งเตือนสถานะ Yumi อยู่แล้ว หากไม่ได้สมัครเอง ไม่ต้องทำอะไร</p>`, `อีเมลนี้ได้รับการแจ้งเตือนสถานะ Yumi อยู่แล้ว หากไม่ได้สมัครเอง ไม่ต้องทำอะไร`);
		return 'already';
	}

	const confirm = token();
	const now = Date.now();
	const row = (await pool.query<{ unsub_token: string }>(
		`INSERT INTO subscribers(email, status, confirm_token, confirm_expires, unsub_token, created_at)
		 VALUES ($1, 'pending', $2, $3, $4, $5)
		 ON CONFLICT (email) DO UPDATE SET status = 'pending', confirm_token = EXCLUDED.confirm_token,
		   confirm_expires = EXCLUDED.confirm_expires, revoked_at = NULL
		 RETURNING unsub_token`,
		[email, confirm, now + TOKEN_TTL_MS, token(), now],
	)).rows[0];

	const link = `${PUBLIC_URL}/subscribe/confirm?token=${confirm}`;
	await sendRaw(email, 'ยืนยันการรับแจ้งเตือน Yumi Status', confirmHtml(link), confirmText(link), { 'List-Unsubscribe': `<${PUBLIC_URL}/subscribe/unsubscribe?token=${row.unsub_token}>` });
	return 'sent';
}

/** กดลิงก์ยืนยันในอีเมล */
export async function confirmSubscribe(t: unknown): Promise<'ok' | 'invalid' | 'expired'> {
	await initSubscribers();
	if (typeof t !== 'string' || t.length < 20) return 'invalid';
	const r = (await pool.query<{ confirm_expires: string }>(
		`UPDATE subscribers SET status = 'active', confirmed_at = $2, confirm_token = NULL
		 WHERE confirm_token = $1 AND status = 'pending' AND confirm_expires > $2
		 RETURNING confirm_expires`,
		[t, Date.now()],
	)).rows[0];
	if (r) return 'ok';
	const expired = (await pool.query(`SELECT 1 FROM subscribers WHERE confirm_token = $1 AND status = 'pending'`, [t])).rowCount;
	return expired ? 'expired' : 'invalid';
}

/** กดลิงก์ยกเลิกในอีเมลหรือจาก List-Unsubscribe */
export async function unsubscribe(t: unknown): Promise<boolean> {
	await initSubscribers();
	if (typeof t !== 'string' || t.length < 20) return false;
	const r = await pool.query(
		`UPDATE subscribers SET status = 'revoked', revoked_at = $2 WHERE unsub_token = $1 AND status <> 'revoked'`,
		[t, Date.now()],
	);
	return (r.rowCount ?? 0) > 0;
}

/** อีเมลทุกคนที่ยืนยันแล้ว พร้อมลิงก์ยกเลิกของแต่ละคน */
export async function activeRecipients(): Promise<{ email: string; unsubUrl: string }[]> {
	await initSubscribers();
	const rows = (await pool.query<{ email: string; unsub_token: string }>(
		`SELECT email, unsub_token FROM subscribers WHERE status = 'active' ORDER BY id`,
	)).rows;
	return rows.map(r => ({ email: r.email, unsubUrl: `${PUBLIC_URL}/subscribe/unsubscribe?token=${r.unsub_token}` }));
}

export async function countActive(): Promise<number> {
	await initSubscribers();
	return Number((await pool.query<{ n: string }>(`SELECT COUNT(*) AS n FROM subscribers WHERE status = 'active'`)).rows[0].n);
}

const confirmHtml = (link: string) => `<!doctype html><html lang="th"><body style="margin:0;background:#0b0405;font-family:'Kanit',Tahoma,Arial,sans-serif;color:#fff3f1;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="560" style="max-width:560px;width:100%;background:#1a0b0d;border:1px solid #f13b3b;border-radius:20px;">
<tr><td style="padding:30px 28px;">
<div style="font-size:13px;color:#ff9ea1;">Yumi Status</div>
<div style="margin-top:6px;font-size:24px;font-weight:700;">ยืนยันการรับแจ้งเตือน</div>
<p style="font-size:15px;font-weight:300;color:#d8b9b5;line-height:1.7;">มีผู้ใส่อีเมลนี้เพื่อรับการแจ้งเตือนสถานะระบบ Yumi กดปุ่มด้านล่างเพื่อยืนยัน ลิงก์ใช้ได้ 48 ชั่วโมง</p>
<p style="margin:24px 0;text-align:center;"><a href="${link}" style="display:inline-block;padding:14px 34px;border-radius:14px;background:#f13b3b;color:#fff;text-decoration:none;font-weight:600;">ยืนยันอีเมลนี้</a></p>
<p style="font-size:12px;color:#8a706d;line-height:1.7;">หากไม่ได้สมัคร ไม่ต้องทำอะไร อีเมลจะไม่ถูกเพิ่มเข้ารายการ</p>
</td></tr></table></td></tr></table></body></html>`;

const confirmText = (link: string) =>
	`ยืนยันการรับแจ้งเตือน Yumi Status\n\nกดลิงก์นี้เพื่อยืนยัน (ใช้ได้ 48 ชั่วโมง):\n${link}\n\nหากไม่ได้สมัคร ไม่ต้องทำอะไร`;