import cron from 'node-cron';
import { send } from './send.js';
import { backend, bot_main, database, frontend_main, checkAll as _checkAll } from './check.js';
import chalk from 'chalk';
import { StatusData } from 'global/types';
import express from 'express';
import { capitalize, formatDuration } from 'global/common-functions';
import sqlite3 from 'sqlite3';

// การตั้งค่า Local DB สำหรับเก็บ Timeline การดาวน์
const localDb = new sqlite3.Database('./timeline.db');
localDb.run(`CREATE TABLE IF NOT EXISTS timeline (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	service_name TEXT,
	status INTEGER,
	timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
localDb.run(`CREATE TABLE IF NOT EXISTS downtime_records (
	service_name TEXT PRIMARY KEY,
	total_downtime_sec INTEGER DEFAULT 0,
	last_down_timestamp DATETIME
)`);

let allS: StatusData[] = [];
let prevS: StatusData[] = [];
let changedStatus: StatusData[] = [];
const isDev = process.env.IS_DEV === 'true';
const port = isDev ? 30006 : 3006;
const app = express();

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const pretty = (name: string) => esc(capitalize(name.split('_').join(' ')));
const stateOf = (s: number) => s === 1 ? { key: 'ok', label: 'Running' } : s === -1 ? { key: 'load', label: 'Loading' } : { key: 'down', label: 'Stopped' };

// UI พรีเมียม ปรับสี กราเดียนต์ และเพิ่ม Glassmorphism
const CSS = `
:root {
	--bg: #09090b; --surface: rgba(255,255,255,0.03); --line: rgba(255,255,255,0.08);
	--text: #fafafa; --muted: #a1a1aa; --brand: #e11d48;
	--ok: #10b981; --load: #3b82f6; --down: #ef4444; --c: var(--brand);
	color-scheme: dark; box-sizing: border-box;
}
*,*::before,*::after { box-sizing: inherit }
[data-state=ok]{--c:var(--ok)} [data-state=load]{--c:var(--load)} [data-state=down]{--c:var(--down)}
html { min-height: 100%; background: var(--bg); }
body {
	margin: 0; min-height: 100vh; color: var(--text); font-family: 'Inter', 'Kanit', system-ui, sans-serif;
	background: radial-gradient(circle at 15% 0%, rgba(225, 29, 72, 0.15), transparent 40%),
				radial-gradient(circle at 85% 100%, rgba(16, 185, 129, 0.1), transparent 40%), var(--bg);
	background-attachment: fixed;
	padding: max(32px, env(safe-area-inset-top)) 24px max(32px, env(safe-area-inset-bottom));
}
a { color: inherit; text-decoration: none; }
:focus-visible { outline: 2px solid #fff; outline-offset: 3px; border-radius: 12px; }
.wrap { max-width: 960px; margin: 0 auto; }
.top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 48px; }
.brand { display: flex; align-items: center; gap: 14px; font-weight: 600; font-size: 1.15rem; letter-spacing: -0.02em; }
.brand img { width: 40px; height: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
.btns { display: flex; gap: 12px; }
.btn {
	width: 44px; height: 44px; display: grid; place-items: center; border-radius: 12px; cursor: pointer;
	background: var(--surface); border: 1px solid var(--line); color: var(--text); 
	backdrop-filter: blur(10px); transition: all 0.3s ease;
}
.btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }
.btn svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

/* ---------- index ---------- */
.banner {
	display: flex; align-items: center; gap: 24px; padding: 32px 36px; border-radius: 24px; margin-bottom: 36px;
	background: linear-gradient(135deg, color-mix(in srgb, var(--c) 15%, transparent), rgba(255,255,255,0.02));
	border: 1px solid color-mix(in srgb, var(--c) 30%, transparent);
	backdrop-filter: blur(20px); box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.banner h1 { margin: 0; font-size: clamp(1.6rem, 5vw, 2.4rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; }
.banner p { margin: 8px 0 0; color: var(--muted); font-weight: 400; font-size: 1.05rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.card {
	display: flex; flex-direction: column; gap: 20px; padding: 24px; border-radius: 20px;
	background: rgba(255,255,255,0.02); border: 1px solid var(--line); backdrop-filter: blur(10px);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card:hover { border-color: color-mix(in srgb, var(--c) 50%, transparent); background: rgba(255,255,255,0.04); transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
.card .name { font-weight: 600; font-size: 1.25rem; letter-spacing: -0.01em; }
.card .row { display: flex; align-items: center; justify-content: space-between; color: var(--muted); font-size: 0.95rem; font-weight: 400; }
.card .state { display: flex; align-items: center; gap: 10px; color: var(--c); font-weight: 500; }
.dot { width: 12px; height: 12px; border-radius: 50%; background: var(--c); box-shadow: 0 0 16px var(--c); flex: none; }
.downtime-badge { margin-top: 12px; font-size: 0.85rem; color: var(--down); background: rgba(239, 68, 68, 0.1); padding: 6px 12px; border-radius: 8px; display: inline-block; }

/* ---------- detail ---------- */
.hero { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 20px 0 48px; }
.beacon { position: relative; width: 140px; height: 140px; display: grid; place-items: center; margin-bottom: 36px; }
.core { width: 90px; height: 90px; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--c) 60%, #fff), var(--c)); box-shadow: 0 0 80px color-mix(in srgb, var(--c) 50%, transparent); }
.core svg { width: 42px; height: 42px; fill: none; stroke: var(--bg); stroke-width: 3; }
.hero h1 { margin: 0; font-size: clamp(2.4rem, 8vw, 4rem); font-weight: 800; letter-spacing: -0.04em; }
.pill { margin-top: 20px; padding: 8px 24px; border-radius: 999px; font-weight: 500; color: var(--c); background: color-mix(in srgb, var(--c) 10%, transparent); border: 1px solid color-mix(in srgb, var(--c) 30%, transparent); font-size: 1.1rem; }
.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.metric { padding: 24px; border-radius: 20px; background: rgba(255,255,255,0.02); border: 1px solid var(--line); backdrop-filter: blur(10px); }
.metric .k { color: var(--muted); font-weight: 400; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; }
.metric .v { margin-top: 10px; font-size: 1.8rem; font-weight: 700; letter-spacing: -0.02em; }
.foot { margin-top: 48px; text-align: center; color: var(--muted); font-size: 0.9rem; font-weight: 400; opacity: 0.7; }
`;

const ICON = {
	back: '<svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5"/></svg>',
	ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
	load: '<svg viewBox="0 0 24 24"><path d="M12 6v6l4 2"/></svg>',
	down: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',
};

const shell = (title: string, body: string, state = '') => `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Kanit:wght@300;400;500;600&display=swap" rel="stylesheet" />
<style>${CSS}</style>
</head>
<body>
<div class="wrap"${state ? ` data-state="${state}"` : ''}>
${body}
</div>
<script>setTimeout(function(){location.reload()},10000)</script>
</body>
</html>`;

export function renderIndex(list: StatusData[], downtimeData: Record<string, number>): string {
	const down = list.filter(s => s.status === 0).length;
	const loading = list.filter(s => s.status === -1).length;

	const overall = list.length === 0
		? { key: 'load', title: 'Checking services…', sub: 'กำลังตรวจสอบระบบ' }
		: down > 0
			? { key: 'down', title: down === list.length ? 'ระบบขัดข้องทั้งหมด' : `พบปัญหา ${down} จาก ${list.length} ระบบ`, sub: 'ทีมงานกำลังดำเนินการแก้ไข' }
			: loading > 0
				? { key: 'load', title: 'กำลังเริ่มต้นระบบ', sub: `กำลังโหลด ${loading} ระบบ` }
				: { key: 'ok', title: 'ระบบทำงานปกติ', sub: `ตอบสนองปกติทั้ง ${list.length} ระบบ` };

	const cards = list.map(s => {
		const st = stateOf(s.status);
		const downTime = downtimeData[s.name] || 0;
		return `<a class="card" data-state="${st.key}" translate="no" href="/${encodeURIComponent(s.name)}">
	<div class="name">${pretty(s.name)}</div>
	<div class="row">
		<span class="state"><span class="dot"></span>${st.label}</span>
		<span>${s.ping ? `${s.ping} ms` : 'N/A'}</span>
	</div>
	${downTime > 0 ? `<div class="downtime-badge">Downtime รวม: ${formatDuration(downTime * 1000, 'th', 'short')}</div>` : ''}
</a>`;
	}).join('\n');

	return shell('Yumi - System Status', `
<header class="top">
	<div class="brand"><img src="https://assets.yumistack.net/photos/logo/yumi/001.webp" alt="" />Yumi System Status</div>
</header>
<section class="banner" data-state="${overall.key}">
	<span class="dot" style="width:16px;height:16px"></span>
	<div><h1>${overall.title}</h1><p>${overall.sub}</p></div>
</section>
${list.length ? `<section class="grid">${cards}</section>` : '<div class="empty">ยังไม่มีข้อมูล</div>'}
<p class="foot">อัปเดตอัตโนมัติทุก 10 วินาที</p>`, overall.key);
}

export function renderDetail(s: StatusData, downtimeSec: number): string {
	const st = stateOf(s.status);
	const na = (v: unknown, f: (x: any) => string) => (v ? `<div class="v">${esc(f(v))}</div>` : '<div class="v" style="opacity:0.3">N/A</div>');

	return shell(`Yumi - ${esc(s.name)}`, `
<header class="top">
	<div class="btns">
		<a class="btn" href="/" target="_top">${ICON.back}</a>
		<button class="btn" onclick="location.reload()">${ICON.refresh}</button>
	</div>
	<div class="brand">Yumi</div>
</header>
<section class="hero">
	<div class="beacon"><div class="core">${ICON[st.key as 'ok' | 'load' | 'down']}</div></div>
	<h1 translate="no">${pretty(s.name)}</h1>
	<div class="pill">${st.label}</div>
</section>
<section class="metrics">
	<div class="metric"><div class="k">Ping</div>${na(s.ping, v => `${v} ms`)}</div>
	<div class="metric"><div class="k">Uptime</div>${na(s.uptime, v => formatDuration(v * 1000, 'en-US', 'short'))}</div>
	<div class="metric"><div class="k">Total Downtime</div><div class="v">${downtimeSec > 0 ? formatDuration(downtimeSec * 1000, 'th', 'short') : '0 วิ'}</div></div>
</section>`, st.key);
}

// การจัดการลง Timeline และคำนวณ Downtime
function updateTimelineAndDowntime(currentStatus: StatusData[]) {
	const now = new Date().toISOString();
	currentStatus.forEach(s => {
		localDb.run(`INSERT INTO timeline (service_name, status, timestamp) VALUES (?, ?, ?)`, [s.name, s.status, now]);

		localDb.get(`SELECT * FROM downtime_records WHERE service_name = ?`, [s.name], (err, row: any) => {
			if (s.status === 0) {
				if (!row) {
					localDb.run(`INSERT INTO downtime_records (service_name, last_down_timestamp) VALUES (?, ?)`, [s.name, Date.now()]);
				} else if (!row.last_down_timestamp) {
					localDb.run(`UPDATE downtime_records SET last_down_timestamp = ? WHERE service_name = ?`, [Date.now(), s.name]);
				} else {
					const diff = Math.floor((Date.now() - row.last_down_timestamp) / 1000);
					localDb.run(`UPDATE downtime_records SET total_downtime_sec = total_downtime_sec + ?, last_down_timestamp = ? WHERE service_name = ?`, [diff, Date.now(), s.name]);
				}
			} else {
				if (row && row.last_down_timestamp) {
					localDb.run(`UPDATE downtime_records SET last_down_timestamp = NULL WHERE service_name = ?`, [s.name]);
				}
			}
		});
	});
}

async function checkAll() {
	console.log(`${chalk.gray(`[${(new Date()).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok' })}]`)} Checking status...`);
	try {
		allS = await _checkAll(false);
		updateTimelineAndDowntime(allS);

		changedStatus = allS.filter(current => {
			const prevStatus = prevS.find(s => s.name === current.name)?.status;
			return prevStatus !== current.status;
		});

		if (changedStatus.length > 0) {
			await send(true, undefined, false, changedStatus);
		};

		if (allS.some(s => s.status === 0)) throw new Error('Some service down');
	} catch (err: any) {
		console.error(`Error during status check: ${err}`);
	} finally {
		prevS = [...allS];
	}
};

(async () => {
	while (true) {
		try { await checkAll(); } catch (e) { console.error(e); }
		await new Promise(res => setTimeout(res, 10000)); // ปรับเวลาเป็น 10 วิเพื่อป้องกันการ Query ถี่เกิน
	}
})();

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
		return;
	};
	next();
});

app.get('/', (req, res) => {
	localDb.all(`SELECT service_name, total_downtime_sec FROM downtime_records`, (err, rows: any[]) => {
		const downtimeData: Record<string, number> = {};
		if (rows) rows.forEach(r => downtimeData[r.service_name] = r.total_downtime_sec);
		res.send(renderIndex(allS, downtimeData));
	});
});

app.get(`/:name`, (req, res) => {
	const status = allS.find(s => s.name === req.params.name);
	if (!status) {
		res.status(404).send(shell('Not Found', '<h1>Not found</h1>'));
		return;
	};
	
	localDb.get(`SELECT total_downtime_sec FROM downtime_records WHERE service_name = ?`, [status.name], (err, row: any) => {
		res.status(status.status === 1 ? 200 : 503).send(renderDetail(status, row?.total_downtime_sec || 0));
	});
});

try {
	app.listen(port, () => console.log(`Status server running on PORT: ${port}`));
} catch (err) {
	console.log(err);
}

cron.schedule('0 12 * * *', () => send());