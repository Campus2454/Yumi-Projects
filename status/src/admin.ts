import crypto from 'node:crypto';
import express, { type Express } from 'express';
import type { StatusData } from 'global/types';
import { getActiveError } from './check.js';
import { getBanner, getMaintenance, recentDowns, setSegmentNote, setSetting, type Banner } from './history.js';
import { adminCounts, adminDeleteSubscriber, adminListSubscribers, adminRevoke } from './subscribers.js';
import { displayName, fmtDateTh, fmtDurTh } from './format.js';

/* ------------------------------------------------------------------ */
/*  ตั้งค่า                                                             */
/*  STATUS_DB_PASSWORD  รหัสผ่านเข้าหน้า /admin (ถ้าไม่ตั้ง หน้านี้จะปิดใช้งาน)  */
/* ------------------------------------------------------------------ */
const PASSWORD = process.env.STATUS_DB_PASSWORD ?? '';
const COOKIE = 'ys_admin';
const SESSION_MS = 8 * 3_600_000;
const LOCK_MS = 15 * 60_000;
const MAX_FAILS = 5;
const SERVICE_RE = /^[a-z_]{1,40}$/;
const LEVELS = ['info', 'warn', 'danger'] as const;

type Session = { csrf: string; exp: number };
const sessions = new Map<string, Session>();
const fails = new Map<string, { n: number; until: number; at: number }>();

setInterval(() => {
	const now = Date.now();
	for (const [k, s] of sessions) if (s.exp < now) sessions.delete(k);
	for (const [k, f] of fails) if (f.until < now && now - f.at > LOCK_MS) fails.delete(k);
}, 10 * 60_000).unref();

const sha = (s: string) => crypto.createHash('sha256').update(s).digest();
/** เทียบรหัสแบบ constant-time (hash ก่อนเทียบ เพื่อให้ความยาวไม่เป็นตัวบอกใบ้) */
const same = (a: string, b: string) => crypto.timingSafeEqual(sha(a), sha(b));
const rnd = () => crypto.randomBytes(32).toString('base64url');

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const form = express.urlencoded({ extended: false, limit: '16kb' });

const ipOf = (req: any) => String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim();

function sessionOf(req: any): { token: string; s: Session } | null {
	const raw = String(req.headers.cookie ?? '');
	const part = raw.split(';').map(p => p.trim()).find(p => p.startsWith(`${COOKIE}=`));
	if (!part) return null;
	const token = part.slice(COOKIE.length + 1);
	const s = sessions.get(token);
	if (!s) return null;
	if (s.exp < Date.now()) { sessions.delete(token); return null; }
	return { token, s };
}

/** คำขอต้องมาจากหน้าเดียวกัน (กัน CSRF เพิ่มจาก SameSite=Strict และ token) */
/** โฮสต์สาธารณะของหน้าสถานะ (อยู่หลัง reverse proxy host ที่เซิร์ฟเวอร์เห็นอาจไม่ตรงกับโดเมนจริง) */
const PUBLIC_HOST = (() => { try { return new URL(process.env.STATUS_PAGE_URL || '').host; } catch { return ''; } })();

function sameOrigin(req: any): boolean {
	// เบราว์เซอร์สมัยใหม่บอกมาตรง ๆ ว่าคำขอมาจากหน้าเดียวกัน
	if (req.headers['sec-fetch-site'] === 'same-origin') return true;
	const o = req.headers.origin;
	if (!o) return true; // ถ้าไม่มี Origin ให้พึ่ง CSRF token (กรณี POST ที่ต้องล็อกอินแล้ว)
	let oh = '';
	try { oh = new URL(String(o)).host; } catch { return false; }
	const hosts = [req.headers.host, req.headers['x-forwarded-host'], PUBLIC_HOST]
		.filter(Boolean)
		.map(h => String(h).split(',')[0].trim());
	return hosts.includes(oh);
}

/** ตรวจ session + CSRF สำหรับ POST ถ้าไม่ผ่านให้ส่งกลับหน้าแอดมิน */
function authedPost(req: any, res: any): Session | null {
	const x = sessionOf(req);
	if (!x || !sameOrigin(req) || !same(String(req.body?._csrf ?? ''), x.s.csrf)) {
		res.redirect(303, '/admin');
		return null;
	}
	return x.s;
}

function sendPage(res: any, status: number, html: string) {
	res.status(status).set({
		'Content-Type': 'text/html; charset=utf-8',
		'Cache-Control': 'no-store',
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'no-referrer',
		'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
	}).send(html);
}

const FLASH: Record<string, string> = {
	banner: 'บันทึกประกาศแล้ว',
	maint: 'อัปเดตโหมดปรับปรุงแล้ว',
	incident: 'บันทึกสาเหตุแล้ว',
	sub: 'อัปเดตผู้รับการแจ้งเตือนแล้ว',
};
const STATUS_TH: Record<string, string> = { active: 'รับการแจ้งเตือน', pending: 'รอยืนยัน', revoked: 'ยกเลิกแล้ว' };
const LEVEL_TH: Record<string, string> = { info: 'ข้อมูล', warn: 'ระวัง', danger: 'สำคัญ' };

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;color:#fff3f1;font:15px/1.6 'Kanit',system-ui,sans-serif;background:#060203;background-image:radial-gradient(900px 520px at 8% -12%,rgba(241,59,59,.24),transparent 62%),radial-gradient(700px 500px at 110% 110%,rgba(120,0,0,.3),transparent 60%)}
.wrap{max-width:1040px;margin:0 auto;padding:28px 18px 64px}
header{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:22px}
.brand{display:flex;align-items:center;gap:12px;font-weight:600;font-size:1.1rem}
.brand i{width:12px;height:12px;border-radius:50%;background:#3ddc97;box-shadow:0 0 16px #3ddc97}
h2{margin:0 0 14px;font-size:1.05rem;font-weight:600}
.card{background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.025));border:1px solid rgba(255,255,255,.09);border-radius:20px;padding:22px 24px;margin-bottom:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 24px 50px -28px rgba(0,0,0,.9)}
.muted{color:#8a706d;font-size:.85rem;font-weight:300}
.err{color:#ff9ea1}
input,textarea,select{width:100%;padding:10px 13px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.35);color:#fff3f1;font:inherit;outline:none}
input:focus,textarea:focus,select:focus{border-color:#f13b3b;box-shadow:0 0 0 3px rgba(241,59,59,.18)}
textarea{resize:vertical}
label{display:block;color:#b99a97;font-size:.88rem;margin:10px 0 0}
button{font:inherit;font-weight:600;padding:10px 18px;border-radius:12px;border:0;color:#fff;background:linear-gradient(180deg,#ff5a4d,#f13b3b);box-shadow:0 8px 20px -10px rgba(241,59,59,.8);cursor:pointer;white-space:nowrap}
button:hover{filter:brightness(1.08)}
button.ghost{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:#d8b9b5;box-shadow:none}
button.danger{background:#6e1a1d;box-shadow:none}
button:disabled{opacity:.4;cursor:not-allowed;filter:none}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.row>input,.row>select{flex:1;min-width:180px;width:auto}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
table{width:100%;border-collapse:collapse}
th,td{text-align:left;padding:11px 10px;border-bottom:1px solid rgba(255,255,255,.07);vertical-align:middle;font-size:.92rem}
th{color:#b99a97;font-weight:400;font-size:.82rem}
tr:last-child td{border-bottom:0}
.pill{display:inline-block;padding:2px 11px;border-radius:99px;font-size:.8rem;border:1px solid;white-space:nowrap}
.pill.ok{color:#6ff0b8;border-color:#2f8a64;background:#0f3a2a}
.pill.down{color:#ff9ea1;border-color:#8a2c30;background:#431316}
.pill.load,.pill.maint{color:#8fdcf6;border-color:#2b6f8a;background:#0e3340}
.pill.warn{color:#fbbf24;border-color:#8a6b1d;background:#3a2d0e}
.flash{padding:12px 16px;border-radius:14px;background:rgba(61,220,151,.12);border:1px solid rgba(61,220,151,.35);color:#6ff0b8;margin-bottom:18px}
.inc{padding:16px 0;border-bottom:1px solid rgba(255,255,255,.07)}
.inc:last-child{border-bottom:0}
.inc-h{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px 14px;margin-bottom:2px}
.inline{display:inline}
.login{max-width:380px;margin:12vh auto 0}
.badge{color:#ff9ea1;font-size:.82rem;letter-spacing:.04em}
@media (max-width:760px){.grid2{grid-template-columns:1fr}th:nth-child(3),td:nth-child(3){display:none}}
`;

const shell = (title: string, body: string) => `<!doctype html>
<html lang="th"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title>
<style>${CSS}</style></head>
<body><main class="wrap">${body}</main></body></html>`;

const loginPage = (err?: string) => shell('เข้าสู่ระบบผู้ดูแล - Yumi Status', `
<section class="card login">
	<div class="badge">YUMI STATUS · ADMIN</div>
	<h2 style="font-size:1.4rem;margin-top:6px">เข้าสู่ระบบผู้ดูแล</h2>
	${err ? `<p class="err">${esc(err)}</p>` : '<p class="muted">กรุณาใส่รหัสผ่านผู้ดูแลระบบ</p>'}
	<form method="post" action="/admin/login" autocomplete="off">
		<label for="pw">รหัสผ่าน</label>
		<input id="pw" type="password" name="password" required maxlength="200" autofocus>
		<div style="margin-top:16px"><button type="submit">เข้าสู่ระบบ</button></div>
	</form>
</section>`);

async function dashboard(csrf: string, ok: string, statuses: StatusData[]): Promise<string> {
	const [banner, maint, downs, counts, subs] = await Promise.all([
		getBanner(), getMaintenance(), recentDowns(40), adminCounts(), adminListSubscribers(100),
	]);
	const hidden = `<input type="hidden" name="_csrf" value="${esc(csrf)}">`;
	const flash = FLASH[ok] ? `<div class="flash">${esc(FLASH[ok])}</div>` : '';
	const b = banner as Banner;

	const services = statuses.length
		? statuses.map(st => {
			const m = maint[st.name];
			const cls = st.status === 1 ? 'ok' : st.status === -1 ? 'load' : 'down';
			const label = st.status === 1 ? 'กำลังทำงาน' : st.status === -1 ? 'กำลังเริ่มระบบ' : 'หยุดทำงาน';
			const err = st.status === 0 ? getActiveError(st.name) : null;
			const action = m !== undefined
				? `<form method="post" action="/admin/maintenance" class="row">${hidden}
					<input type="hidden" name="service" value="${esc(st.name)}"><input type="hidden" name="enable" value="off">
					<span class="muted">${esc(m)}</span><button class="ghost" type="submit">เลิกโหมดปรับปรุง</button></form>`
				: `<form method="post" action="/admin/maintenance" class="row">${hidden}
					<input type="hidden" name="service" value="${esc(st.name)}"><input type="hidden" name="enable" value="on">
					<input name="message" maxlength="200" placeholder="ข้อความ เช่น อัปเดตเซิร์ฟเวอร์ ~30 นาที"><button class="ghost" type="submit">เปิดโหมดปรับปรุง</button></form>`;
			return `<tr>
				<td><b>${esc(displayName(st.name))}</b><div class="muted">${esc(st.name)}</div></td>
				<td><span class="pill ${cls}">${label}</span>${m !== undefined ? ' <span class="pill maint">ปรับปรุง</span>' : ''}</td>
				<td class="muted">${err ? esc(err.message) : '—'}</td>
				<td>${action}</td></tr>`;
		}).join('')
		: `<tr><td colspan="4" class="muted">ยังไม่มีข้อมูลบริการ (ระบบกำลังตรวจสอบ)</td></tr>`;

	const incidents = downs.length
		? downs.map(d => `<form class="inc" method="post" action="/admin/incident/${d.id}">${hidden}
			<div class="inc-h"><b>${esc(displayName(d.service))}</b>
				<span class="muted">${fmtDateTh(d.start)} ${d.end ? `ถึง ${fmtDateTh(d.end)} · ${fmtDurTh(d.end - d.start)}` : '· กำลังล่มอยู่'}</span></div>
			<label>สาเหตุ</label>
			<input name="cause" maxlength="300" value="${esc(d.cause ?? '')}" placeholder="เช่น หมดเวลาระหว่างโหลดหน้าเว็บ">
			<label>หมายเหตุ (แสดงในไทม์ไลน์)</label>
			<textarea name="note" rows="2" maxlength="1000">${esc(d.note ?? '')}</textarea>
			<div style="margin-top:10px"><button type="submit" class="ghost">บันทึก</button></div></form>`).join('')
		: '<p class="muted">ยังไม่มีเหตุการณ์หยุดทำงาน</p>';

	const subRows = subs.length
		? subs.map(u => `<tr>
			<td>${esc(u.email)}</td>
			<td><span class="pill ${u.status === 'active' ? 'ok' : u.status === 'pending' ? 'load' : 'down'}">${esc(STATUS_TH[u.status] ?? u.status)}</span></td>
			<td class="muted">${fmtDateTh(Number(u.created_at))}</td>
			<td class="row">
				<form method="post" action="/admin/subscriber/${u.id}/revoke" class="inline">${hidden}
					<button class="ghost" type="submit" ${u.status === 'revoked' ? 'disabled' : ''}>ยกเลิก</button></form>
				<form method="post" action="/admin/subscriber/${u.id}/delete" class="inline">${hidden}
					<button class="danger" type="submit">ลบ</button></form>
			</td></tr>`).join('')
		: `<tr><td colspan="4" class="muted">ยังไม่มีผู้รับการแจ้งเตือน</td></tr>`;

	return shell('ผู้ดูแลระบบ - Yumi Status', `
<header>
	<div class="brand"><i></i>Yumi Status · ผู้ดูแลระบบ</div>
	<div class="row">
		<a class="muted" href="/" style="text-decoration:underline">ดูหน้าสถานะ</a>
		<form method="post" action="/admin/logout" class="inline">${hidden}<button class="ghost" type="submit">ออกจากระบบ</button></form>
	</div>
</header>
${flash}

<section class="card">
	<h2>ประกาศบนหน้าสถานะ</h2>
	<p class="muted">แสดงเป็นแถบด้านบนของหน้าแรกและหน้ารายละเอียด ปล่อยข้อความว่างเพื่อซ่อนประกาศ</p>
	<form method="post" action="/admin/banner" class="row" style="margin-top:12px">${hidden}
		<select name="level" style="max-width:150px">${LEVELS.map(l => `<option value="${l}" ${b?.level === l ? 'selected' : ''}>${LEVEL_TH[l]}</option>`).join('')}</select>
		<input name="text" maxlength="300" value="${esc(b?.text ?? '')}" placeholder="เช่น ระบบอัปเดตตอน 02:00 น.">
		<button type="submit">บันทึกประกาศ</button>
	</form>
</section>

<section class="card">
	<h2>บริการ และโหมดปรับปรุง</h2>
	<p class="muted">เปิดโหมดปรับปรุงแล้วหน้าเว็บจะแสดงป้าย "กำลังปรับปรุง" และไม่ส่งการแจ้งเตือนของบริการนั้น</p>
	<div style="overflow-x:auto;margin-top:10px"><table>
		<tr><th>บริการ</th><th>สถานะ</th><th>สาเหตุล่าสุด</th><th>โหมดปรับปรุง</th></tr>
		${services}
	</table></div>
</section>

<section class="card">
	<h2>เหตุการณ์หยุดทำงาน และสาเหตุ</h2>
	<p class="muted">สาเหตุจะบันทึกอัตโนมัติตอนเริ่มหยุดทำงาน แก้ไขได้ที่นี่ หมายเหตุจะแสดงในไทม์ไลน์ของหน้ารายละเอียด</p>
	<div style="margin-top:6px">${incidents}</div>
</section>

<section class="card">
	<h2>ผู้รับการแจ้งเตือน</h2>
	<p class="muted">รับอยู่ ${counts.active} · รอยืนยัน ${counts.pending} · ยกเลิกแล้ว ${counts.revoked}</p>
	<div style="overflow-x:auto;margin-top:10px"><table>
		<tr><th>อีเมล</th><th>สถานะ</th><th>สมัครเมื่อ</th><th>จัดการ</th></tr>
		${subRows}
	</table></div>
</section>`);
}

/** ลงทะเบียนเส้นทาง /admin ทั้งหมด (ต้องเรียกก่อนเส้นทาง /:name) */
export function registerAdmin(app: Express, getStatuses: () => StatusData[]) {
	if (!PASSWORD) console.warn('[admin] ไม่ได้ตั้งค่า STATUS_DB_PASSWORD จึงปิดหน้า /admin');

	app.get('/admin', async (req: any, res: any) => {
		if (!PASSWORD) return sendPage(res, 503, shell('ปิดใช้งาน', `<section class="card login"><p class="err">ยังไม่ได้ตั้งค่า STATUS_DB_PASSWORD</p></section>`));
		const x = sessionOf(req);
		if (!x) return sendPage(res, 200, loginPage());
		try {
			sendPage(res, 200, await dashboard(x.s.csrf, String(req.query.ok ?? ''), getStatuses()));
		} catch (e) {
			console.error('[admin] แสดงหน้าไม่สำเร็จ:', e);
			sendPage(res, 500, shell('ผิดพลาด', `<section class="card login"><p class="err">โหลดหน้าผู้ดูแลไม่สำเร็จ</p></section>`));
		}
	});

	app.post('/admin/login', form, async (req: any, res: any) => {
		if (!PASSWORD) return sendPage(res, 503, loginPage('ยังไม่ได้ตั้งค่ารหัสผ่าน'));
		const key = ipOf(req);
		const f = fails.get(key);
		if (f && f.until > Date.now()) return sendPage(res, 429, loginPage('ลองผิดหลายครั้ง กรุณารอ 15 นาทีแล้วลองใหม่'));
		if (!sameOrigin(req)) return sendPage(res, 403, loginPage('คำขอไม่ถูกต้อง'));

		await new Promise(r => setTimeout(r, 600)); // หน่วงเล็กน้อยกันการเดารหัสรัว ๆ
		const pw = String(req.body?.password ?? '');
		if (same(pw, PASSWORD)) {
			fails.delete(key);
			const token = rnd();
			sessions.set(token, { csrf: rnd(), exp: Date.now() + SESSION_MS });
			res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MS / 1000}`);
			console.log(`[admin] เข้าสู่ระบบสำเร็จ จาก ${key}`);
			return res.redirect(303, '/admin');
		}

		const cur = fails.get(key) ?? { n: 0, until: 0, at: 0 };
		cur.n += 1;
		cur.at = Date.now();
		if (cur.n >= MAX_FAILS) { cur.until = Date.now() + LOCK_MS; cur.n = 0; }
		fails.set(key, cur);
		console.warn(`[admin] เข้าสู่ระบบไม่สำเร็จ จาก ${key}`);
		return sendPage(res, 401, loginPage('รหัสผ่านไม่ถูกต้อง'));
	});

	app.post('/admin/logout', form, (req: any, res: any) => {
		const x = sessionOf(req);
		if (x && sameOrigin(req) && same(String(req.body?._csrf ?? ''), x.s.csrf)) sessions.delete(x.token);
		res.setHeader('Set-Cookie', `${COOKIE}=; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
		res.redirect(303, '/admin');
	});

	app.post('/admin/banner', form, async (req: any, res: any) => {
		if (!authedPost(req, res)) return;
		const level = (LEVELS as readonly string[]).includes(req.body?.level) ? req.body.level : 'info';
		const text = String(req.body?.text ?? '').trim().slice(0, 300);
		await setSetting('banner', text ? { level, text } : null);
		console.log(`[admin] แก้ไขประกาศ (${text ? level : 'ซ่อน'}) จาก ${ipOf(req)}`);
		res.redirect(303, '/admin?ok=banner');
	});

	app.post('/admin/maintenance', form, async (req: any, res: any) => {
		if (!authedPost(req, res)) return;
		const service = String(req.body?.service ?? '');
		if (!SERVICE_RE.test(service)) return res.redirect(303, '/admin');
		const maint = await getMaintenance();
		if (req.body?.enable === 'on') {
			maint[service] = String(req.body?.message ?? '').trim().slice(0, 200) || 'กำลังปรับปรุงระบบ';
		} else {
			delete maint[service];
		}
		await setSetting('maintenance', maint);
		console.log(`[admin] ${req.body?.enable === 'on' ? 'เปิด' : 'ปิด'}โหมดปรับปรุง ${service} จาก ${ipOf(req)}`);
		res.redirect(303, '/admin?ok=maint');
	});

	app.post('/admin/incident/:id', form, async (req: any, res: any) => {
		if (!authedPost(req, res)) return;
		const id = Number(req.params.id);
		if (!Number.isSafeInteger(id) || id <= 0) return res.redirect(303, '/admin');
		const cause = String(req.body?.cause ?? '').trim().slice(0, 300) || null;
		const note = String(req.body?.note ?? '').trim().slice(0, 1000) || null;
		await setSegmentNote(id, cause, note);
		console.log(`[admin] แก้ไขสาเหตุเหตุการณ์ #${id} จาก ${ipOf(req)}`);
		res.redirect(303, '/admin?ok=incident');
	});

	app.post('/admin/subscriber/:id/revoke', form, async (req: any, res: any) => {
		if (!authedPost(req, res)) return;
		const id = Number(req.params.id);
		if (Number.isSafeInteger(id)) await adminRevoke(id);
		console.log(`[admin] ยกเลิกผู้รับ #${id} จาก ${ipOf(req)}`);
		res.redirect(303, '/admin?ok=sub');
	});

	app.post('/admin/subscriber/:id/delete', form, async (req: any, res: any) => {
		if (!authedPost(req, res)) return;
		const id = Number(req.params.id);
		if (Number.isSafeInteger(id)) await adminDeleteSubscriber(id);
		console.log(`[admin] ลบผู้รับ #${id} จาก ${ipOf(req)}`);
		res.redirect(303, '/admin?ok=sub');
	});
}
