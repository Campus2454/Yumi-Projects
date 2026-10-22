import cron from 'node-cron';
import { send } from './send.js';
import { backend, bot_main, database, frontend_main, checkAll as _checkAll } from './check.js';
import chalk from 'chalk';
import { StatusData } from 'global/types';
import express from 'express';
import { capitalize, formatDuration } from 'global/common-functions';

let allS: StatusData[] = [];
let prevS: StatusData[] = [];
let changedStatus: StatusData[] = [];
// let StatusAllRunning = false;
const isDev = process.env.IS_DEV === 'true';
const port = isDev ? 30006 : 3006;
const app = express();

const esc = (s: string) =>
	s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const pretty = (name: string) => esc(capitalize(name.split('_').join(' ')));
const stateOf = (s: number) =>
	s === 1 ? { key: 'ok', label: 'Running' } : s === -1 ? { key: 'load', label: 'Loading' } : { key: 'down', label: 'Stopped' };

const CSS = `
:root{
	--bg:#0c0506; --surface:rgba(255,255,255,.045); --line:rgba(255,255,255,.1);
	--text:#fff4f2; --muted:#c9a5a1; --brand:#f13b3b;
	--ok:#3ddc97; --load:#4cc9f0; --down:#ff5a5f; --c:var(--brand);
	color-scheme:dark; box-sizing:border-box;
}
*,*::before,*::after{box-sizing:inherit}
[data-state=ok]{--c:var(--ok)} [data-state=load]{--c:var(--load)} [data-state=down]{--c:var(--down)}
html{min-height:100%;background:var(--bg)}
body{
	margin:0;min-height:100vh;color:var(--text);font-family:'Kanit',system-ui,sans-serif;
	background:
		radial-gradient(900px 500px at 15% -10%, rgba(241,59,59,.38), transparent 60%),
		radial-gradient(700px 500px at 100% 110%, rgba(158,0,0,.35), transparent 60%),
		var(--bg);
	background-attachment:fixed;
	padding:max(24px,env(safe-area-inset-top)) 20px max(24px,env(safe-area-inset-bottom));
}
a{color:inherit;text-decoration:none}
:focus-visible{outline:2px solid #fff;outline-offset:3px;border-radius:12px}
.wrap{max-width:900px;margin:0 auto}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:40px}
.brand{display:flex;align-items:center;gap:12px;font-weight:600;font-size:1.05rem}
.brand img{width:36px;height:36px;border-radius:10px}
.btns{display:flex;gap:10px}
.btn{
	width:42px;height:42px;display:grid;place-items:center;border-radius:12px;cursor:pointer;
	background:var(--surface);border:1px solid var(--line);color:var(--text);transition:background .2s,border-color .2s;
}
.btn:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.28)}
.btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

/* ---------- index ---------- */
.banner{
	display:flex;align-items:center;gap:18px;padding:26px 28px;border-radius:22px;margin-bottom:28px;
	background:linear-gradient(120deg, color-mix(in srgb,var(--c) 22%,transparent), var(--surface) 70%);
	border:1px solid color-mix(in srgb,var(--c) 45%,transparent);
}
.banner h1{margin:0;font-size:clamp(1.4rem,4.5vw,2.1rem);font-weight:700;line-height:1.2}
.banner p{margin:4px 0 0;color:var(--muted);font-weight:300}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.card{
	display:flex;flex-direction:column;gap:18px;padding:20px 22px;border-radius:18px;
	background:var(--surface);border:1px solid var(--line);transition:border-color .2s,background .2s;
}
.card:hover{border-color:color-mix(in srgb,var(--c) 70%,transparent);background:rgba(255,255,255,.07)}
.card .name{font-weight:600;font-size:1.15rem}
.card .row{display:flex;align-items:center;justify-content:space-between;color:var(--muted);font-size:.92rem;font-weight:300}
.card .state{display:flex;align-items:center;gap:8px;color:var(--c);font-weight:400}
.dot{width:10px;height:10px;border-radius:50%;background:var(--c);box-shadow:0 0 12px var(--c);flex:none}
.empty{padding:40px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:18px}

/* ---------- detail ---------- */
.hero{display:flex;flex-direction:column;align-items:center;text-align:center;padding:16px 0 40px}
.beacon{position:relative;width:132px;height:132px;display:grid;place-items:center;margin-bottom:30px}
.beacon::before,.beacon::after{
	content:"";position:absolute;inset:0;border-radius:50%;border:2px solid var(--c);opacity:0;
}
[data-state=ok] .beacon::before,[data-state=load] .beacon::before{animation:ring 2.8s ease-out infinite}
[data-state=ok] .beacon::after,[data-state=load] .beacon::after{animation:ring 2.8s ease-out 1.4s infinite}
[data-state=down] .beacon::before{opacity:.5}
.core{
	width:84px;height:84px;border-radius:50%;display:grid;place-items:center;
	background:radial-gradient(circle at 35% 30%, color-mix(in srgb,var(--c) 70%,#fff), var(--c));
	box-shadow:0 0 60px color-mix(in srgb,var(--c) 60%,transparent);
}
.core svg{width:38px;height:38px;fill:none;stroke:#0c0506;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
@keyframes ring{0%{transform:scale(.65);opacity:.9}100%{transform:scale(1.35);opacity:0}}
.hero h1{margin:0;font-size:clamp(2.2rem,8vw,3.6rem);font-weight:700;line-height:1.1;color:#ffe3df}
.pill{
	margin-top:16px;padding:6px 18px;border-radius:999px;font-weight:400;color:var(--c);
	background:color-mix(in srgb,var(--c) 14%,transparent);border:1px solid color-mix(in srgb,var(--c) 45%,transparent);
}
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.metric{padding:22px 24px;border-radius:18px;background:var(--surface);border:1px solid var(--line)}
.metric .k{color:var(--muted);font-weight:300;font-size:.95rem}
.metric .v{margin-top:6px;font-size:1.7rem;font-weight:600;word-break:break-word}
.metric .v.na{color:rgba(255,255,255,.35)}
.foot{margin-top:36px;text-align:center;color:var(--muted);font-size:.85rem;font-weight:300}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
`;

const ICON = {
	back: '<svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5"/></svg>',
	ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
	load: '<svg viewBox="0 0 24 24"><path d="M12 6v6l4 2"/></svg>',
	down: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',
};

const shell = (title: string, body: string, state = '') => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#0c0506" />
<title>${title}</title>
<link rel="icon" href="https://assets.yumistack.net/photos/logo/yumi/001.webp" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap" rel="stylesheet" />
<style>${CSS}</style>
</head>
<body>
<div class="wrap"${state ? ` data-state="${state}"` : ''}>
${body}
</div>
<script>setTimeout(function(){location.reload()},10000)</script>
</body>
</html>`;

/** หน้าแรก: รายการทุก service */
export function renderIndex(list: StatusData[]): string {
	const down = list.filter(s => s.status === 0).length;
	const loading = list.filter(s => s.status === -1).length;

	const overall = list.length === 0
		? { key: 'load', title: 'Checking services…', sub: 'Results will appear in a moment.' }
		: down > 0
			? { key: 'down', title: down === list.length ? 'All services are down' : `${down} of ${list.length} services are down`, sub: 'We are aware and working on it.' }
			: loading > 0
				? { key: 'load', title: 'Some services are starting', sub: `${loading} of ${list.length} still loading.` }
				: { key: 'ok', title: 'All services are running', sub: `${list.length} of ${list.length} responding normally.` };

	const cards = list.map(s => {
		const st = stateOf(s.status);
		return `<a class="card" data-state="${st.key}" translate="no" href="/${encodeURIComponent(s.name)}">
	<div class="name">${pretty(s.name)}</div>
	<div class="row">
		<span class="state"><span class="dot"></span>${st.label}</span>
		<span>${s.ping ? `${s.ping} ms` : 'N/A'}</span>
	</div>
</a>`;
	}).join('\n');

	return shell('Yumi - Status', `
<header class="top">
	<div class="brand"><img src="https://assets.yumistack.net/photos/logo/yumi/001.webp" alt="" />Yumi Status</div>
</header>
<section class="banner" data-state="${overall.key}">
	<span class="dot" style="width:14px;height:14px"></span>
	<div><h1>${overall.title}</h1><p>${overall.sub}</p></div>
</section>
${list.length ? `<section class="grid">${cards}</section>` : '<div class="empty">No services reported yet.</div>'}
<p class="foot">Updates automatically every 10 seconds</p>`, overall.key);
}

/** หน้ารายละเอียดของแต่ละ service */
export function renderDetail(s: StatusData): string {
	const st = stateOf(s.status);
	const na = (v: unknown, f: (x: any) => string) => (v ? `<div class="v">${esc(f(v))}</div>` : '<div class="v na">N/A</div>');

	return shell(`Yumi - Status (${esc(s.name)})`, `
<header class="top">
	<div class="btns">
		<a class="btn" href="/" target="_top" aria-label="Back to all services">${ICON.back}</a>
		<button class="btn" onclick="location.reload()" aria-label="Refresh">${ICON.refresh}</button>
	</div>
	<div class="brand"><img src="https://assets.yumistack.net/photos/logo/yumi/001.webp" alt="" />Yumi</div>
</header>
<section class="hero">
	<div class="beacon"><div class="core">${ICON[st.key as 'ok' | 'load' | 'down']}</div></div>
	<h1 translate="no">${pretty(s.name)}</h1>
	<div class="pill">${st.label}</div>
</section>
<section class="metrics">
	<div class="metric"><div class="k">Ping</div>${na(s.ping, v => `${v} ms`)}</div>
	<div class="metric"><div class="k">Uptime</div>${na(s.uptime, v => formatDuration(v * 1000, 'en-US', 'short'))}</div>
	<div class="metric"><div class="k">Version</div>${na(s.version, v => `v${v}`)}</div>
</section>
<p class="foot">Updates automatically every 10 seconds</p>`, st.key);
}

/** 404 */
export function renderNotFound(name: string): string {
	return shell('Yumi - Status', `
<header class="top">
	<div class="btns"><a class="btn" href="/" target="_top" aria-label="Back to all services">${ICON.back}</a></div>
</header>
<section class="hero" data-state="down">
	<div class="beacon"><div class="core">${ICON.down}</div></div>
	<h1>Not found</h1>
	<div class="pill">No service named “${esc(name)}”</div>
</section>`, 'down');
}

async function checkAll() {
	console.log(`${chalk.gray(`[${(new Date()).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit', })}]`)} Checking status...`);
	try{
		allS = await _checkAll(false);

		changedStatus = allS.filter(current => {
			const prevStatus = prevS.find(s => s.name === current.name)?.status;
			return prevStatus !== current.status;
		});
		console.log(changedStatus);

		if(changedStatus.length > 0){
			await send(true, undefined, false, changedStatus);

			// if(allS.some(s => s.status === 1) && !StatusAllRunning){
			// 	StatusAllRunning = true;
			// 	await send(true, undefined, false, changedStatus);
			// }
		};

		if(allS.some(s => s.status === 0))throw new Error('Some service down');

		// if(allS.some(s => s.status === 1) && !StatusAllRunning){
		// 	StatusAllRunning = true;
		// 	await send(undefined, undefined, allS);
		// }
	}catch(err: any){
		console.error(`Error during status check: ${err}`);
		// if(StatusAllRunning){
			// StatusAllRunning = false;
			// await send();
			// await send(true, undefined, false, changedStatus);
		// };
	}finally{
		prevS = [...allS];
	}
};
(async () => {
  while(true){
    try{
      await checkAll();
    }catch(e){
      console.error(e);
    }
    await new Promise(res => setTimeout(res, 1000));
  }
})();

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
		return;
	};
	next();
});

app.get('/', (req, res) => {
	res.send(renderIndex(allS));
});

app.get(`/:name`, (req, res) => {
	const status = allS.find(s => s.name === req.params.name);
	if (!status) res.status(404).send(renderNotFound(req.params.name));
	else res.status(status.status === 1 ? 200 : 503).send(renderDetail(status));
});

try {
	app.listen(port);
	console.log(`Status server running on PORT: ${port}`);
} catch (err) {
	console.log(err);
}

cron.schedule('0 12 * * *', () => send());
