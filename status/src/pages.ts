import type { StatusData } from 'global/types';
import { capitalize, formatDataSize, formatDuration } from 'global/common-functions';
import type { Report } from './history.js';

export type Item = { s: StatusData; r: Report };

const LOGO = 'https://assets.yumistack.net/photos/logo/yumi/001.webp';
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const pretty = (name: string) => esc(capitalize(name.split('_').join(' ')));
const stateOf = (s: number) =>
	s === 1 ? { key: 'ok', label: 'Running' } : s === -1 ? { key: 'load', label: 'Loading' } : { key: 'down', label: 'Stopped' };

const fmtDur = (ms: number) => {
	const t = Math.max(0, Math.floor(ms / 1000));
	const u: [number, string][] = [[Math.floor(t / 86400), 'd'], [Math.floor((t % 86400) / 3600), 'h'], [Math.floor((t % 3600) / 60), 'm'], [t % 60, 's']];
	const p = u.filter(([v]) => v > 0).slice(0, 2).map(([v, l]) => `${v}${l}`);
	return p.length ? p.join(' ') : '0s';
};
const fmtPct = (p: number | null) => (p === null ? '—' : p >= 100 ? '100%' : `${(Math.floor(p * 100) / 100).toFixed(2)}%`);
const fmtDate = (t: number) =>
	new Date(t).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
const fmtDay = (t: number) => new Date(t).toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short' });

const ICON = {
	back: '<svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5"/></svg>',
	ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
	load: '<svg viewBox="0 0 24 24"><path d="M12 6v6l4 2"/></svg>',
	down: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',
};

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")`;

const CSS = `
:root{--bg:#060203;--ink:#fff3f1;--muted:#b99a97;--dim:#7c6462;--brand:#f13b3b;--ok:#3ddc97;--warn:#fbbf24;--load:#4cc9f0;--down:#ff5a5f;--c:var(--brand);color-scheme:dark}
*,*::before,*::after{box-sizing:border-box}
[data-state=ok]{--c:var(--ok)}[data-state=load]{--c:var(--load)}[data-state=down]{--c:var(--down)}
html{background:var(--bg)}
body{margin:0;min-height:100vh;color:var(--ink);font-family:'Kanit',system-ui,sans-serif;
	background:radial-gradient(1000px 600px at 12% -15%,rgba(241,59,59,.34),transparent 65%),radial-gradient(800px 600px at 105% 105%,rgba(130,0,0,.35),transparent 60%),var(--bg);
	background-attachment:fixed;padding:max(24px,env(safe-area-inset-top)) 20px max(32px,env(safe-area-inset-bottom))}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background-image:${NOISE};opacity:.07;mix-blend-mode:overlay}
a{color:inherit;text-decoration:none}button{font:inherit}
:focus-visible{outline:2px solid #fff;outline-offset:3px;border-radius:12px}
.wrap{position:relative;max-width:960px;margin:0 auto}
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:32px}
.l,.r{display:flex;align-items:center;gap:12px}
.brand{display:flex;align-items:center;gap:12px;font-weight:600;font-size:1.05rem}
.brand img{width:38px;height:38px;border-radius:11px;box-shadow:0 0 0 1px rgba(255,255,255,.12),0 8px 24px -8px rgba(241,59,59,.6)}
.upd{color:var(--dim);font-size:.85rem;font-weight:300}
.btn{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;cursor:pointer;color:var(--ink);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);transition:background .2s,border-color .2s}
.btn:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.28)}
.btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.glass{background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.025));border:1px solid rgba(255,255,255,.09);border-radius:22px;
	box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 24px 50px -24px rgba(0,0,0,.8);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
@keyframes ping{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.6);opacity:0}}
@keyframes ring{0%{transform:scale(.65);opacity:.9}100%{transform:scale(1.35);opacity:0}}

/* index */
.hero{position:relative;overflow:hidden;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;padding:30px 32px;margin-bottom:16px}
.hero::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(520px 220px at 0% 0%,color-mix(in srgb,var(--c) 26%,transparent),transparent 70%)}
.hero>*{position:relative;z-index:1}
.hl{display:flex;align-items:center;gap:20px}
.pulse{position:relative;width:18px;height:18px;border-radius:50%;background:var(--c);box-shadow:0 0 24px var(--c);flex:none}
[data-state=ok] .pulse::after,[data-state=load] .pulse::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid var(--c);animation:ping 2.4s ease-out infinite}
.hero h1{margin:0;font-size:clamp(1.6rem,5vw,2.5rem);font-weight:700;line-height:1.15}
.hero p{margin:6px 0 0;color:var(--muted);font-weight:300}
.bigpct{text-align:right}.bigpct b{display:block;font-size:2.5rem;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
.bigpct span{color:var(--muted);font-size:.88rem;font-weight:300}
.list{padding:8px}
.svc{display:grid;grid-template-columns:minmax(190px,1fr) minmax(0,1.7fr) 84px;gap:22px;align-items:center;padding:18px 20px;border-radius:16px;transition:background .2s}
.svc+.svc{border-top:1px solid rgba(255,255,255,.06)}
.svc:hover{background:rgba(255,255,255,.05)}
.who{display:flex;align-items:center;gap:14px;min-width:0}
.dot{width:10px;height:10px;border-radius:50%;background:var(--c);box-shadow:0 0 14px var(--c);flex:none}
.nm{font-weight:600;font-size:1.08rem}
.meta{display:flex;flex-wrap:wrap;align-items:center;gap:2px 10px;color:var(--muted);font-weight:300;font-size:.88rem}
.meta .st{color:var(--c);font-weight:400}
.tag{padding:0 9px;border-radius:99px;background:rgba(251,191,36,.14);color:var(--warn);border:1px solid rgba(251,191,36,.35);font-size:.76rem}
.bars{display:flex;gap:3px;height:36px}
.bars i{flex:1;min-width:0;border-radius:4px;background:rgba(255,255,255,.1);transition:transform .15s,filter .15s}
.bars i.ok{background:var(--ok);opacity:.85}.bars i.warn{background:var(--warn)}.bars i.bad{background:var(--down)}
.bars i:hover{transform:scaleY(1.15);filter:brightness(1.25)}
.pct{text-align:right}.pct b{display:block;font-size:1.15rem;font-weight:600;font-variant-numeric:tabular-nums}.pct span{color:var(--dim);font-size:.78rem;font-weight:300}
.legend{display:flex;flex-wrap:wrap;gap:6px 18px;justify-content:center;margin-top:18px;color:var(--dim);font-size:.82rem;font-weight:300}
.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}

/* detail */
.dhero{position:relative;overflow:hidden;display:flex;flex-wrap:wrap;align-items:center;gap:26px;padding:30px 32px;margin-bottom:16px}
.dhero::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(520px 240px at 0% 0%,color-mix(in srgb,var(--c) 24%,transparent),transparent 70%)}
.dhero>*{position:relative;z-index:1}
.beacon{position:relative;width:104px;height:104px;display:grid;place-items:center;flex:none}
.beacon::before,.beacon::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid var(--c);opacity:0}
[data-state=ok] .beacon::before,[data-state=load] .beacon::before{animation:ring 2.8s ease-out infinite}
[data-state=ok] .beacon::after,[data-state=load] .beacon::after{animation:ring 2.8s ease-out 1.4s infinite}
[data-state=down] .beacon::before{opacity:.45}
.core{width:66px;height:66px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--c) 70%,#fff),var(--c));box-shadow:0 0 50px color-mix(in srgb,var(--c) 55%,transparent)}
.core svg{width:30px;height:30px;fill:none;stroke:#0c0506;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
.ttl{flex:1;min-width:200px}
.ttl h1{margin:0;font-size:clamp(2rem,6vw,3rem);font-weight:700;line-height:1.1}
.pill{display:inline-flex;align-items:center;gap:8px;margin:12px 8px 0 0;padding:5px 16px;border-radius:999px;color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent);border:1px solid color-mix(in srgb,var(--c) 45%,transparent)}
.clock{text-align:right}.clock .k{color:var(--muted);font-weight:300;font-size:.9rem}
.clock .big{font-size:clamp(1.8rem,5vw,2.7rem);font-weight:700;color:var(--c);font-variant-numeric:tabular-nums;line-height:1.15}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:16px}
.tile{padding:20px 22px}.tile .k{color:var(--muted);font-weight:300;font-size:.9rem}
.tile .v{margin-top:6px;font-size:1.6rem;font-weight:600;font-variant-numeric:tabular-nums;word-break:break-word}.tile .v.na{color:rgba(255,255,255,.3)}
.meter{margin-top:12px;height:6px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden}
.meter i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--brand),#ff9a8a)}
.panel{padding:24px 26px;margin-bottom:16px}.panel h2{margin:0 0 18px;font-size:1.05rem;font-weight:600}
.avail{display:grid;grid-template-columns:repeat(3,1fr)}
.avail>div{padding:0 20px}.avail>div:first-child{padding-left:0}.avail>div+div{border-left:1px solid rgba(255,255,255,.08)}
.avail .k{color:var(--muted);font-weight:300;font-size:.9rem}
.avail b{display:block;margin:4px 0 6px;font-size:1.9rem;font-weight:700;font-variant-numeric:tabular-nums}
.avail small{display:block;color:var(--dim);font-weight:300;font-size:.82rem;line-height:1.5}
.strip{position:relative;height:40px;border-radius:10px;background:rgba(255,255,255,.06);overflow:hidden}
.strip i{position:absolute;top:0;bottom:0;background:var(--ok);opacity:.85}.strip i.down{background:var(--down);opacity:1}.strip i.load{background:var(--load)}
.axis{display:flex;justify-content:space-between;margin-top:8px;color:var(--dim);font-size:.8rem;font-weight:300}
.spark svg{display:block;width:100%;height:140px}
.stats{display:flex;flex-wrap:wrap;gap:6px 28px;margin-top:14px;color:var(--muted);font-weight:300;font-size:.9rem}.stats b{color:var(--ink);font-weight:600}
.inc{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;padding:14px 0}.inc+.inc{border-top:1px solid rgba(255,255,255,.07)}
.inc .w{color:var(--muted);font-weight:300;font-size:.92rem}.inc .d{font-weight:600;font-variant-numeric:tabular-nums}.inc .d.on{color:var(--down)}
.none{color:var(--muted);font-weight:300}
.foot{margin-top:28px;text-align:center;color:var(--dim);font-size:.82rem;font-weight:300}
@media (max-width:720px){
	.svc{grid-template-columns:1fr auto;gap:14px}.svc .bars{grid-column:1/-1;order:3}
	.hero,.dhero{padding:24px 22px}.bigpct,.clock{text-align:left}
	.avail{grid-template-columns:1fr}.avail>div,.avail>div:first-child{padding:14px 0}.avail>div+div{border-left:0;border-top:1px solid rgba(255,255,255,.08)}
}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
`;

// อัปเดตหน้าแบบเงียบ ๆ ทุก 5 วินาที (ไม่กระพริบ) + ตัวนับ downtime เดินทุกวินาที
const SCRIPT = `(function(){
var app=document.getElementById('app'),upd=document.getElementById('updated'),last=Date.now();
var off=Number(app.getAttribute('data-now'))-Date.now();
function fmt(ms){var t=Math.max(0,Math.floor(ms/1000)),u=[[Math.floor(t/86400),'d'],[Math.floor(t%86400/3600),'h'],[Math.floor(t%3600/60),'m'],[t%60,'s']],p=[];for(var i=0;i<u.length;i++){if(u[i][0]>0)p.push(u[i][0]+u[i][1]);}return p.slice(0,2).join(' ')||'0s';}
function tick(){var n=document.querySelectorAll('[data-since]');for(var i=0;i<n.length;i++){n[i].textContent=fmt(Date.now()+off-Number(n[i].getAttribute('data-since')));}
if(upd){var s=Math.floor((Date.now()-last)/1000);upd.textContent=s<2?'Live':'Updated '+s+'s ago';}}
function refresh(){if(document.hidden)return;return fetch(location.pathname,{cache:'no-store'}).then(function(r){return r.text()}).then(function(t){
var d=new DOMParser().parseFromString(t,'text/html'),n=d.getElementById('app');if(!n)return;
app.innerHTML=n.innerHTML;app.setAttribute('data-state',n.getAttribute('data-state')||'');off=Number(n.getAttribute('data-now'))-Date.now();document.title=d.title;last=Date.now();tick();}).catch(function(){});}
setInterval(tick,1000);setInterval(refresh,5000);tick();
document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh();});
var b=document.getElementById('reload');if(b)b.addEventListener('click',refresh);
})();`;

const shell = (title: string, left: string, main: string, state: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#060203" />
<title>${title}</title>
<link rel="icon" href="${LOGO}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap" rel="stylesheet" />
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
<header class="top">
	<div class="l">${left}</div>
	<div class="r"><span class="upd" id="updated">Live</span><button class="btn" id="reload" aria-label="Refresh">${ICON.refresh}</button></div>
</header>
<main id="app" data-state="${state}" data-now="${Date.now()}">
${main}
</main>
<p class="foot">All times are shown in Bangkok time (GMT+7)</p>
</div>
<script>${SCRIPT}</script>
</body>
</html>`;

const brand = `<div class="brand"><img src="${LOGO}" alt="" />Yumi Status</div>`;
const backBtn = `<a class="btn" href="/" target="_top" aria-label="Back to all services">${ICON.back}</a>`;

/* ------------------------------------------------------------------ */

export function renderIndex(items: Item[], limits: Record<string, number>): string {
	const now = Date.now();
	const down = items.filter(i => i.s.status === 0).length;
	const loading = items.filter(i => i.s.status === -1).length;
	const n = items.length;

	const overall = n === 0
		? { key: 'load', title: 'Checking services…', sub: 'Results will appear in a moment.' }
		: down > 0
			? { key: 'down', title: down === n ? 'All services are down' : `${down} of ${n} services are down`, sub: 'We are aware and working on it.' }
			: loading > 0
				? { key: 'load', title: 'Some services are starting', sub: `${loading} of ${n} still loading.` }
				: { key: 'ok', title: 'All services are running', sub: `${n} of ${n} responding normally.` };

	let obs = 0, dn = 0;
	for (const { r } of items) { obs += r.windows['30d'].observed; dn += r.windows['30d'].down; }
	const total = obs ? ((obs - dn) / obs) * 100 : null;

	const rows = items.map(({ s, r }) => {
		const st = stateOf(s.status);
		const since = s.status === 0 && r.current?.status === 0 ? r.current.since : null;
		const limited = (limits[s.name] ?? 0) > now;
		const info = since !== null
			? `<span>Down for <span data-since="${since}">${fmtDur(now - since)}</span></span>`
			: typeof s.ping === 'number' && s.status === 1 ? `<span>${s.ping} ms</span>` : '';
		const bars = r.buckets.map(b => {
			const cls = b.observed <= 0 ? 'na' : b.down <= 0 ? 'ok' : b.down < 5 * 60_000 ? 'warn' : 'bad';
			const tip = b.observed <= 0 ? 'No data' : b.down <= 0 ? 'No downtime' : `${fmtDur(b.down)} downtime`;
			return `<i class="${cls}" title="${fmtDay(b.end - 1)}: ${tip}"></i>`;
		}).join('');
		return `<a class="svc" data-state="${st.key}" translate="no" href="/${encodeURIComponent(s.name)}">
	<div class="who"><span class="dot"></span><div><div class="nm">${pretty(s.name)}</div>
		<div class="meta"><span class="st">${st.label}</span>${info}${limited ? '<span class="tag" title="Too many requests (429). Waiting, then retrying automatically.">Rate limited</span>' : ''}</div></div></div>
	<div class="bars">${bars}</div>
	<div class="pct"><b>${fmtPct(r.windows['30d'].pct)}</b><span>30 days</span></div>
</a>`;
	}).join('\n');

	const main = `
<section class="hero glass">
	<div class="hl"><span class="pulse"></span><div><h1>${overall.title}</h1><p>${overall.sub}</p></div></div>
	<div class="bigpct"><b>${fmtPct(total)}</b><span>uptime over the last 30 days</span></div>
</section>
${n ? `<section class="list glass">${rows}</section>` : ''}
<div class="legend">
	<span><i style="background:var(--ok)"></i>No downtime</span>
	<span><i style="background:var(--warn)"></i>Under 5 minutes down</span>
	<span><i style="background:var(--down)"></i>Longer outage</span>
	<span><i style="background:rgba(255,255,255,.12)"></i>No data</span>
</div>`;
	return shell('Yumi - Status', brand, main, overall.key);
}

export function renderDetail(s: StatusData, r: Report, limitedUntil = 0): string {
	const now = Date.now();
	const st = stateOf(s.status);
	const limited = limitedUntil > now;
	const since = s.status === 0 && r.current?.status === 0 ? r.current.since : null;

	let clock = '';
	if (since !== null) {
		clock = `<div class="k">Down for</div><div class="big" data-since="${since}">${fmtDur(now - since)}</div>`;
	} else if (s.status === 1) {
		const up = s.uptime ? now - s.uptime * 1000 : r.current?.status === 1 ? r.current.since : null;
		if (up !== null) clock = `<div class="k">Up for</div><div class="big" data-since="${up}">${fmtDur(now - up)}</div>`;
	}

	const na = (v: string | undefined | null) => (v ? `<div class="v">${esc(v)}</div>` : '<div class="v na">N/A</div>');
	const cpu = s.resources?.cpu?.percent;
	const mem = s.resources?.memory;
	const tiles = `
	<div class="tile glass"><div class="k">Ping</div>${na(typeof s.ping === 'number' ? `${s.ping} ms` : null)}</div>
	<div class="tile glass"><div class="k">Version</div>${na(s.version ? `v${s.version}` : null)}</div>
	${cpu !== undefined ? `<div class="tile glass"><div class="k">CPU usage</div><div class="v">${cpu}%</div><div class="meter"><i style="width:${Math.min(100, Number(cpu))}%"></i></div></div>` : ''}
	${mem ? `<div class="tile glass"><div class="k">Memory usage</div><div class="v">${esc(formatDataSize('byte', mem.used, 'short'))} / ${esc(formatDataSize('byte', mem.total, 'short'))}</div><div class="meter"><i style="width:${Math.min(100, Number(mem.percent))}%"></i></div></div>` : ''}`;

	const avail = (['24h', '7d', '30d'] as const).map(k => {
		const w = r.windows[k];
		return `<div><div class="k">Last ${k === '24h' ? '24 hours' : k === '7d' ? '7 days' : '30 days'}</div><b>${fmtPct(w.pct)}</b>
		<small>${w.observed ? `Downtime ${w.down ? fmtDur(w.down) : 'none'}<br>${w.incidents} incident${w.incidents === 1 ? '' : 's'}` : 'No data yet'}</small></div>`;
	}).join('');

	const strip = r.strip.map(g => {
		const k = g.status === 1 ? 'ok' : g.status === 0 ? 'down' : 'load';
		const label = g.status === 1 ? 'Running' : g.status === 0 ? 'Stopped' : 'Loading';
		return `<i class="${k}" style="left:${g.left.toFixed(3)}%;width:${g.width.toFixed(3)}%" title="${label}: ${fmtDate(g.start)} to ${fmtDate(g.end)}"></i>`;
	}).join('');

	let spark = '<div class="none">Not enough data yet. Response times are sampled every 30 seconds.</div>';
	if (r.pings.length >= 2) {
		const vals = r.pings.map(p => p.ping);
		const min = Math.min(...vals), max = Math.max(...vals), avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
		const from = now - 86_400_000, span = max - min || 1;
		const pts = r.pings.map(p => [((p.ts - from) / 86_400_000) * 600, 125 - ((p.ping - min) / span) * 105] as const);
		const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
		const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} 140 L${pts[0][0].toFixed(1)} 140 Z`;
		spark = `<svg viewBox="0 0 600 140" preserveAspectRatio="none" role="img" aria-label="Response time over the last 24 hours">
	<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f13b3b" stop-opacity=".45"/><stop offset="1" stop-color="#f13b3b" stop-opacity="0"/></linearGradient></defs>
	<path d="${area}" fill="url(#sg)"/><path d="${line}" fill="none" stroke="#ff7a6e" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>
	<div class="stats"><span>Lowest <b>${min} ms</b></span><span>Average <b>${avg} ms</b></span><span>Highest <b>${max} ms</b></span></div>`;
	}

	const incidents = r.incidents.length
		? r.incidents.map(i => `<div class="inc"><div class="w">${fmtDate(i.start)}${i.end ? ` to ${fmtDate(i.end)}` : ''}</div>
		${i.end ? `<div class="d">${fmtDur(i.duration)}</div>` : `<div class="d on">Ongoing, <span data-since="${i.start}">${fmtDur(now - i.start)}</span></div>`}</div>`).join('')
		: '<div class="none">No downtime in the last 30 days.</div>';

	const main = `
<section class="dhero glass">
	<div class="beacon"><div class="core">${ICON[st.key as 'ok' | 'load' | 'down']}</div></div>
	<div class="ttl"><h1 translate="no">${pretty(s.name)}</h1>
		<span class="pill">${st.label}</span>${limited ? '<span class="pill" style="--c:var(--warn)">Rate limited, retrying soon</span>' : ''}</div>
	<div class="clock">${clock}</div>
</section>
<section class="tiles">${tiles}</section>
<section class="panel glass"><h2>Availability</h2><div class="avail">${avail}</div></section>
<section class="panel glass"><h2>Last 24 hours</h2>
	<div class="strip">${strip}</div>
	<div class="axis"><span>24h ago</span><span>12h ago</span><span>Now</span></div></section>
<section class="panel glass spark"><h2>Response time</h2>${spark}</section>
<section class="panel glass"><h2>Downtime history</h2>${incidents}</section>`;

	return shell(`Yumi - Status (${esc(s.name)})`, backBtn + brand, main, st.key);
}

export function renderNotFound(name: string): string {
	const main = `<section class="dhero glass" data-state="down">
	<div class="beacon"><div class="core">${ICON.down}</div></div>
	<div class="ttl"><h1>Not found</h1><span class="pill">No service named “${esc(name)}”</span></div></section>`;
	return shell('Yumi - Status', backBtn + brand, main, 'down');
}