import cron from 'node-cron';
import { send } from './send.js';
import { checkAll as _checkAll } from './check.js';
import chalk from 'chalk';
import { StatusData } from 'global/types';
import express from 'express';
import { capitalize, formatDuration } from 'global/common-functions';
import Database from 'better-sqlite3';

const db = new Database('local_status.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    status INTEGER,
    statusCode INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export type LocalStatusData = StatusData & {
	statusCode?: number;
	computedUptime?: number;       
	computedDowntime?: number;     
	lastUptimeDuration?: number;   
	lastDowntimeDuration?: number; 
};

let allS: LocalStatusData[] = [];
let prevS: LocalStatusData[] = [];
let isFirstRun = true; // ตัวแปรสำหรับเช็คการรันครั้งแรก
const serviceState: Record<string, { status: number; statusSince: number; lastUpDuration: number; lastDownDuration: number }> = {};

const isDev = true || process.env.IS_DEV === 'true';
const port = isDev ? 30006 : 3006;
const app = express();

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const pretty = (name: string) => esc(capitalize(name.split('_').join(' ')));

const CSS = `
:root{
	--bg:#0b0d14; --surface:#151822; --line:#252936;
	--text:#f8f9fa; --muted:#8f95a3; --ok:#10b981; --down:#ef4444; --load:#6366f1;
	color-scheme:dark; box-sizing:border-box;
}
*,*::before,*::after{box-sizing:inherit}
html{min-height:100%;background:var(--bg)}
body{
	margin:0;min-height:100vh;color:var(--text);font-family:'Kanit',system-ui,sans-serif;
	background:var(--bg); padding:max(24px,env(safe-area-inset-top)) 20px;
}
a{color:inherit;text-decoration:none}
.wrap{max-width:960px;margin:0 auto}
.top{display:flex;align-items:center;justify-content:space-between;margin-bottom:30px}
.brand{display:flex;align-items:center;gap:12px;font-weight:600;font-size:1.2rem;}
.brand img{width:36px;height:36px;border-radius:10px;}
.btns{display:flex;gap:10px}
.btn{
	width:40px;height:40px;display:grid;place-items:center;border-radius:8px;cursor:pointer;
	background:var(--surface);border:1px solid var(--line);color:var(--text); transition:all .2s;
}
.btn:hover{background:#1f2331;}
.btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;}

.grid{display:flex; flex-direction:column; gap:16px}
.card{
	display:flex;flex-direction:column;gap:16px;padding:20px;border-radius:12px;
	background:var(--surface);border:1px solid var(--line); transition: border-color .2s;
}
.card:hover{border-color:#3b4156;}
.card-head{display:flex;justify-content:space-between;align-items:center;}
.card-head .name{font-weight:600;font-size:1.15rem;display:flex;align-items:center;gap:8px;}
.card-head .ping{color:var(--muted);font-size:.9rem;background:#1e2230;padding:4px 10px;border-radius:20px;}
.dot{width:10px;height:10px;border-radius:50%;}
.dot.ok{background:var(--ok);box-shadow:0 0 10px rgba(16,185,129,0.4);}
.dot.down{background:var(--down);box-shadow:0 0 10px rgba(239,68,68,0.4);}

.bars{display:flex; gap:3px; height:34px; align-items:flex-end;}
.bar{flex:1; background:#2c3142; border-radius:2px; height:100%; transition:height .3s; min-width:4px;}
.bar.ok{background:var(--ok);}
.bar.down{background:var(--down); height:60%;}

.card-foot{display:flex;justify-content:space-between;color:var(--muted);font-size:.9rem; margin-top:4px;}
.pill-status{font-weight:600;} .pill-status.ok{color:var(--ok);} .pill-status.down{color:var(--down);}

.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin:30px 0;}
.metric{padding:20px;border-radius:12px;background:var(--surface);border:1px solid var(--line);}
.metric .k{color:var(--muted);font-size:.9rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}
.metric .v{font-size:1.6rem;font-weight:600;}

.timeline{background:var(--surface);border-radius:12px;border:1px solid var(--line);padding:20px;}
.t-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line);font-size:.95rem;}
.t-row:last-child{border-bottom:none;}
`;

const ICON = {
	back: '<svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5"/></svg>'
};

const shell = (title: string, body: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${title}</title><link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet" /><style>${CSS}</style></head>
<body><div class="wrap">${body}</div><script>setTimeout(function(){location.reload()},30000)</script></body></html>`;

export function renderIndex(list: LocalStatusData[]): string {
	const cards = list.map(s => {
		const isUp = s.status === 1;
		const statusText = isUp ? 'Operational' : 'Major Outage';
		const durationText = isUp 
            ? `Uptime: ${formatDuration((s.computedUptime || 0) * 1000, 'en-US', 'short')}`
            : `Downtime: ${formatDuration((s.computedDowntime || 0) * 1000, 'en-US', 'short')}`;

        const history = db.prepare(`SELECT status FROM timeline WHERE name = ? ORDER BY timestamp DESC LIMIT 40`).all(s.name) as any[];
        const bars = Array.from({ length: 40 }).map((_, i) => {
            const h = history[39 - i]; 
            if (!h) return `<div class="bar"></div>`;
            return `<div class="bar ${h.status === 1 ? 'ok' : 'down'}" title="${h.status === 1 ? 'Online' : 'Offline'}"></div>`;
        }).join('');

		return `<a class="card" href="/${encodeURIComponent(s.name)}">
            <div class="card-head">
                <div class="name"><span class="dot ${isUp ? 'ok' : 'down'}"></span>${pretty(s.name)}</div>
                <div class="ping">${s.ping ? `${s.ping} ms` : 'N/A'}</div>
            </div>
            <div class="bars">${bars}</div>
            <div class="card-foot">
                <span class="pill-status ${isUp ? 'ok' : 'down'}">${statusText}</span>
                <span>${durationText}</span>
            </div>
        </a>`;
	}).join('\n');

	return shell('Yumi - Status', `
<header class="top">
	<div class="brand"><img src="https://assets.yumistack.net/photos/logo/yumi/001.webp" alt="" />YUMI CLOUD</div>
</header>
${list.length ? `<section class="grid">${cards}</section>` : '<div style="text-align:center;padding:50px;color:var(--muted)">No services tracked yet.</div>'}
<p style="text-align:center;color:var(--muted);font-size:.85rem;margin-top:40px;">Updated automatically every 30s</p>`);
}

export function renderDetail(s: LocalStatusData): string {
	const isUp = s.status === 1;
	const na = (v: unknown, f: (x: any) => string) => (v ? `<div class="v">${esc(f(v))}</div>` : '<div class="v" style="color:var(--muted)">N/A</div>');

	const history = db.prepare(`SELECT * FROM timeline WHERE name = ? ORDER BY timestamp DESC LIMIT 8`).all(s.name) as any[];
	const historyHtml = history.map(h => `
        <div class="t-row">
            <span>${new Date(h.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}</span>
            <span style="color:var(--${h.status === 1 ? 'ok' : 'down'})">${h.status === 1 ? 'UP' : 'DOWN'} (Code: ${h.statusCode || 'N/A'})</span>
        </div>
    `).join('') || '<div style="color:var(--muted)">No history available.</div>';

	return shell(`Yumi - Status (${esc(s.name)})`, `
<header class="top">
	<div class="btns"><a class="btn" href="/">${ICON.back}</a><button class="btn" onclick="location.reload()">${ICON.refresh}</button></div>
	<div class="brand">${pretty(s.name)}</div>
</header>
<div style="text-align:center; padding:30px 0;">
    <h1 style="margin:0; font-size:3rem; color:var(--${isUp ? 'ok' : 'down'})">${isUp ? 'Operational' : 'Outage'}</h1>
    <p style="color:var(--muted); margin-top:8px;">${isUp ? 'All systems are responding normally.' : 'Service is currently unreachable.'}</p>
</div>
<section class="metrics">
	<div class="metric"><div class="k">Ping</div>${na(s.ping, v => `${v} ms`)}</div>
    ${isUp ? `
        <div class="metric"><div class="k">Current Uptime</div>${na(s.computedUptime, v => formatDuration(v * 1000, 'en-US', 'short'))}</div>
        <div class="metric"><div class="k">Last Downtime</div>${na(s.lastDowntimeDuration, v => formatDuration(v * 1000, 'en-US', 'short'))}</div>
    ` : `
        <div class="metric"><div class="k">Current Downtime</div>${na(s.computedDowntime, v => formatDuration(v * 1000, 'en-US', 'short'))}</div>
        <div class="metric"><div class="k">Last Uptime</div>${na(s.lastUptimeDuration, v => formatDuration(v * 1000, 'en-US', 'short'))}</div>
    `}
</section>
<section class="timeline">
    <h2 style="margin-top:0; font-size:1.2rem">Latest Events</h2>
    ${historyHtml}
</section>`);
}

async function checkAll() {
	try {
		const rawStatus = await _checkAll(false);
		const now = Date.now();

		allS = rawStatus.map((current: any) => {
			if (!serviceState[current.name]) {
				serviceState[current.name] = { status: current.status, statusSince: now, lastUpDuration: 0, lastDownDuration: 0 };
			}
			const state = serviceState[current.name];

			const prev = prevS.find(p => p.name === current.name);
			if (prev && prev.status !== current.status) {
                const durationSeconds = Math.floor((now - state.statusSince) / 1000);
				if (prev.status === 1) state.lastUpDuration = durationSeconds;
				if (prev.status === 0) state.lastDownDuration = durationSeconds;

                state.status = current.status;
                state.statusSince = now;

				db.prepare(`INSERT INTO timeline (name, status, statusCode) VALUES (?, ?, ?)`).run(current.name, current.status, current.statusCode || null);
			} else if (!prev) { 
                db.prepare(`INSERT INTO timeline (name, status, statusCode) VALUES (?, ?, ?)`).run(current.name, current.status, current.statusCode || null);
            }

            const currentDuration = Math.floor((now - state.statusSince) / 1000);
            
			return { 
                ...current, 
                computedUptime: current.status === 1 ? currentDuration : undefined, 
                computedDowntime: current.status === 0 ? currentDuration : undefined,
                lastUptimeDuration: state.lastUpDuration,
                lastDowntimeDuration: state.lastDownDuration
            };
		});

		// ส่งแจ้งเตือนครั้งแรกที่เริ่มต้น หรือส่งเฉพาะอันที่เปลี่ยนสถานะ
		if (isFirstRun) {
			isFirstRun = false;
			await send(true, true, true, allS); // ครั้งแรกส่งรายงานฉบับเต็มทั้ง Discord & Mail
		} else {
			const changedStatus = allS.filter(current => {
				const prevStatus = prevS.find(s => s.name === current.name)?.status;
				return prevStatus !== undefined && prevStatus !== current.status;
			});

			if (changedStatus.length > 0) {
				await send(true, true, false, changedStatus); 
			}
		}

	} catch (err: any) {
		console.error(`Error during status check: ${err}`);
	} finally {
		prevS = [...allS];
	}
}

(async () => {
	while (true) {
		try { await checkAll(); } catch (e) {}
		await new Promise(res => setTimeout(res, 20000));
	}
})();

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
		return;
	}
	next();
});

app.get('/', (req, res) => {
	res.send(renderIndex(allS));
});

app.get(`/:name`, (req, res) => {
	const status = allS.find(s => s.name === req.params.name);
	if (!status) {
		res.status(404).send(shell('Not Found', '<div style="text-align:center; padding:100px"><h1>404 Not Found</h1></div>'));
	} else {
		res.status(status.status === 1 ? 200 : 503).send(renderDetail(status));
	}
});

try {
	app.listen(port, () => console.log(`[+] Status server running on PORT: ${port}`));
} catch (err) {}

// ตั้งเวลาส่ง 19:00 น. ประเทศไทย (12:00 UTC)
cron.schedule('0 12 * * *', () => send(true, true, true, allS));