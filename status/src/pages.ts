import type { StatusData } from 'global/types';
import { formatDataSize } from 'global/common-functions';
import { RANGE_LIST, type Banner, type Brief, type Range, type Report, type SeriesPoint } from './history.js';
import { COLORS, UI_BODY, UI_CSS, UI_SCRIPT, seriesLine, svgChart } from './chart.js';
import { SUB_CSS, SUB_JS, SUB_MODAL } from './subscribe-modal.js';
import { displayName, fmtDateTh, fmtDayTh, fmtDurTh, fmtPct, stateTh } from './format.js';

export type Item = { s: StatusData; r: Report; b: Brief };
/** ประกาศและโหมดปรับปรุงที่แอดมินตั้งไว้ */
export type PageCtx = { banner: Banner | null; maint: Record<string, string> };

const LOGO = 'https://assets.yumistack.net/photos/logo/yumi/001.webp';
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const RANGE_LABEL: Record<Range, string> = { '24h': '24 ชม.', '7d': '7 วัน', '30d': '1 เดือน', all: 'ทั้งหมด' };
const RANGE_LONG: Record<Range, string> = { '24h': '24 ชั่วโมงที่ผ่านมา', '7d': '7 วันที่ผ่านมา', '30d': '30 วันที่ผ่านมา', all: 'ตลอดช่วงที่บันทึกไว้' };

const ICON = {
	back: '<svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5"/></svg>',
	ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
	load: '<svg viewBox="0 0 24 24"><path d="M12 6v6l4 2"/></svg>',
	down: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',
};

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")`;

const CSS = `
:root{--bg:#060203;--ink:#fff3f1;--muted:#b99a97;--dim:#8a706d;--brand:#f13b3b;--ok:#3ddc97;--warn:#fbbf24;--load:#4cc9f0;--down:#ff5a5f;--c:var(--brand);color-scheme:dark}
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

/* ตัวเลือกช่วงเวลา */
.toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin:26px 4px 14px}
.toolbar .tt{margin:0;font-size:1.05rem;font-weight:600}
.seg{display:inline-flex;gap:2px;padding:4px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}
.seg a{padding:7px 16px;border-radius:10px;color:var(--muted);font-size:.92rem;transition:color .2s,background .2s}
.seg a:hover{color:var(--ink)}
.seg a.on{color:#fff;background:linear-gradient(180deg,#ff5a4d,var(--brand));box-shadow:0 6px 18px -6px rgba(241,59,59,.7)}

/* หน้าแรก */
.hero{position:relative;overflow:hidden;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;padding:30px 32px}
.hero::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(520px 220px at 0% 0%,color-mix(in srgb,var(--c) 26%,transparent),transparent 70%)}
.hero>*{position:relative;z-index:1}
.hl{display:flex;align-items:center;gap:20px}
.pulse{position:relative;width:18px;height:18px;border-radius:50%;background:var(--c);box-shadow:0 0 24px var(--c);flex:none}
[data-state=ok] .pulse::after,[data-state=load] .pulse::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid var(--c);animation:ping 2.4s ease-out infinite}
.hero h1{margin:0;font-size:clamp(1.6rem,5vw,2.5rem);font-weight:700;line-height:1.2}
.hero p{margin:6px 0 0;color:var(--muted);font-weight:300}
.bigpct{text-align:right}.bigpct b{display:block;font-size:2.5rem;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
.bigpct span{color:var(--muted);font-size:.88rem;font-weight:300}
.list{padding:8px}
.svc{display:grid;grid-template-columns:minmax(230px,1.15fr) minmax(0,1.6fr) 84px;gap:22px;align-items:center;padding:18px 20px;border-radius:16px;transition:background .2s}
.svc+.svc{border-top:1px solid rgba(255,255,255,.06)}
.svc:hover{background:rgba(255,255,255,.05)}
.who{display:flex;align-items:flex-start;gap:14px;min-width:0}
.who .dot{margin-top:9px}
.dot{width:10px;height:10px;border-radius:50%;background:var(--c);box-shadow:0 0 14px var(--c);flex:none}
.nm{font-weight:600;font-size:1.08rem}
.meta{display:flex;flex-wrap:wrap;align-items:center;gap:2px 10px;color:var(--muted);font-weight:300;font-size:.88rem}
.meta .st{color:var(--c);font-weight:400}
.meta b{font-weight:400;color:var(--ink);font-variant-numeric:tabular-nums}
.last{margin-top:2px;color:var(--dim);font-weight:300;font-size:.82rem}
.tag{padding:0 9px;border-radius:99px;background:rgba(251,191,36,.14);color:var(--warn);border:1px solid rgba(251,191,36,.35);font-size:.76rem}
.bars{display:flex;gap:3px;height:36px}
.bars i{flex:1;min-width:0;border-radius:4px;background:rgba(255,255,255,.1);transition:transform .15s,filter .15s}
.bars i.ok{background:var(--ok);opacity:.85}.bars i.warn{background:var(--warn)}.bars i.bad{background:var(--down)}
.bars i:hover{transform:scaleY(1.15);filter:brightness(1.25)}
.pct{text-align:right}.pct b{display:block;font-size:1.15rem;font-weight:600;font-variant-numeric:tabular-nums}.pct span{color:var(--dim);font-size:.78rem;font-weight:300}
.legend{display:flex;flex-wrap:wrap;gap:6px 18px;justify-content:center;margin-top:18px;color:var(--dim);font-size:.82rem;font-weight:300}
.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}

/* หน้ารายละเอียด */
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
.ttl h1{margin:0;font-size:clamp(2rem,6vw,3rem);font-weight:700;line-height:1.15}
.pill{display:inline-flex;align-items:center;gap:8px;margin:12px 8px 0 0;padding:5px 16px;border-radius:999px;color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent);border:1px solid color-mix(in srgb,var(--c) 45%,transparent)}
.clock{text-align:right;max-width:100%}.clock .k{color:var(--muted);font-weight:300;font-size:.9rem}
.clock .big{font-size:clamp(1.8rem,5vw,2.7rem);font-weight:700;color:var(--c);font-variant-numeric:tabular-nums;line-height:1.2}
.clock .last{margin-top:6px;font-size:.88rem;color:var(--muted)}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.tile{padding:20px 22px}.tile .k{color:var(--muted);font-weight:300;font-size:.9rem}
.tile .v{margin-top:6px;font-size:1.6rem;font-weight:600;font-variant-numeric:tabular-nums;word-break:break-word}.tile .v.na{color:rgba(255,255,255,.3)}
.meter{margin-top:12px;height:6px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden}
.meter i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--brand),#ff9a8a)}
.panel{padding:24px 26px;margin-bottom:16px}.panel h2{margin:0 0 18px;font-size:1.05rem;font-weight:600}
.avail{display:grid;grid-template-columns:repeat(4,1fr);gap:18px 0}
.avail>div{padding:0 20px}.avail>div:first-child{padding-left:0}.avail>div+div{border-left:1px solid rgba(255,255,255,.08)}
.avail .k{color:var(--muted);font-weight:300;font-size:.9rem}
.avail b{display:block;margin:4px 0 4px;font-size:1.7rem;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.25}
.avail small{display:block;color:var(--dim);font-weight:300;font-size:.82rem}
.strip{position:relative;height:40px;border-radius:10px;background:rgba(255,255,255,.06);overflow:hidden}
.strip i{position:absolute;top:0;bottom:0;background:var(--ok);opacity:.85}.strip i.down{background:var(--down);opacity:1;z-index:1}.strip i.load{background:var(--load)}
.axis{display:flex;justify-content:space-between;margin-top:8px;color:var(--dim);font-size:.8rem;font-weight:300}
.spark svg{display:block;width:100%;height:140px}
.stats{display:flex;flex-wrap:wrap;gap:6px 28px;margin-top:14px;color:var(--muted);font-weight:300;font-size:.9rem}.stats b{color:var(--ink);font-weight:600}
.inc{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;padding:14px 0}.inc+.inc{border-top:1px solid rgba(255,255,255,.07)}
.inc .w{color:var(--muted);font-weight:300;font-size:.92rem}.inc .d{font-weight:600;font-variant-numeric:tabular-nums}.inc .d.on{color:var(--down)}
.none{color:var(--muted);font-weight:300}
.links{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 22px;margin-top:16px;font-size:.92rem}
.links a{color:var(--muted);text-decoration:underline;text-underline-offset:4px}
.links a:hover{color:var(--ink)}
.banner{margin:0 0 18px;padding:14px 18px;border-radius:16px;font-weight:500;border:1px solid}
.banner.info{background:rgba(76,201,240,.12);border-color:rgba(76,201,240,.4);color:#8fdcf6}
.banner.warn{background:rgba(251,191,36,.12);border-color:rgba(251,191,36,.4);color:#fbbf24}
.banner.danger{background:rgba(255,90,95,.12);border-color:rgba(255,90,95,.45);color:#ff9ea1}
.tag.maint{background:rgba(76,201,240,.14);color:#8fdcf6;border-color:rgba(76,201,240,.35)}
.strip i.warn{background:var(--warn);opacity:1;z-index:1}
.strip i{cursor:pointer;transition:filter .15s}
.strip i:hover{filter:brightness(1.35)}
.strip i.load{background:var(--load)}
${UI_CSS}${SUB_CSS}
.foot{margin-top:28px;text-align:center;color:var(--dim);font-size:.82rem;font-weight:300}
@media (max-width:720px){
	.svc{grid-template-columns:1fr auto;gap:14px}.svc .bars{grid-column:1/-1;order:3}
	.hero,.dhero{padding:24px 22px}.bigpct,.clock{text-align:left}
	.avail{grid-template-columns:1fr 1fr}.avail>div,.avail>div:first-child{padding:0}.avail>div+div{border-left:0}
	.seg a{padding:7px 12px}
}
html.embed,body.embed{background:transparent!important;background-image:none!important}
body.embed::before{display:none}
body.embed{padding:0;min-height:0}
body.embed .wrap{max-width:none}
body.embed .top{margin-bottom:16px}
body.embed .foot{margin-top:16px}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
`;

// อัปเดตหน้าแบบเงียบ ๆ ทุก 5 วินาที (ไม่กะพริบ, คงช่วงเวลาที่เลือก) + ตัวนับเวลาเดินทุกวินาที
const SCRIPT = `(function(){
var app=document.getElementById('app'),upd=document.getElementById('updated'),last=Date.now();
var off=Number(app.getAttribute('data-now'))-Date.now();
function fmt(ms){var t=Math.max(0,Math.floor(ms/1000)),u=[[Math.floor(t/86400),'วัน'],[Math.floor(t%86400/3600),'ชม.'],[Math.floor(t%3600/60),'นาที'],[t%60,'วิ']],p=[];for(var i=0;i<u.length;i++){if(u[i][0]>0)p.push(u[i][0]+' '+u[i][1]);}return p.slice(0,2).join(' ')||'0 วิ';}
function tick(){var n=document.querySelectorAll('[data-since]');for(var i=0;i<n.length;i++){n[i].textContent=fmt(Date.now()+off-Number(n[i].getAttribute('data-since')));}
if(upd){var s=Math.floor((Date.now()-last)/1000);upd.textContent=s<2?'สด':'อัปเดตเมื่อ '+s+' วิ ที่แล้ว';}}
function refresh(){if(document.hidden)return;return fetch(location.pathname+location.search,{cache:'no-store'}).then(function(r){return r.text()}).then(function(t){
var d=new DOMParser().parseFromString(t,'text/html'),n=d.getElementById('app');if(!n)return;
app.innerHTML=n.innerHTML;app.setAttribute('data-state',n.getAttribute('data-state')||'');off=Number(n.getAttribute('data-now'))-Date.now();document.title=d.title;last=Date.now();tick();}).catch(function(){});}
setInterval(tick,1000);setInterval(refresh,5000);tick();
document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh();});
var b=document.getElementById('reload');if(b)b.addEventListener('click',refresh);
})();`;

const shell = (title: string, left: string, main: string, state: string, embed = false) => `<!doctype html>
<html lang="th"${embed ? ' class="embed"' : ''}>
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
<body${embed ? ' class="embed"' : ''}>
<div class="wrap">
<header class="top">
	<div class="l">${left}</div>
	<div class="r"><span class="upd" id="updated">สด</span><button class="btn" id="reload" aria-label="รีเฟรช">${ICON.refresh}</button></div>
</header>
<main id="app" data-state="${state}" data-now="${Date.now()}">
${main}
</main>
<p class="foot">เวลาทั้งหมดแสดงเป็นเวลาประเทศไทย (GMT+7)</p>
</div>
${SUB_MODAL}
${UI_BODY}
<script>${SCRIPT}</script>
<script>${SUB_JS}</script>
<script>${UI_SCRIPT}</script>
</body>
</html>`;

const brand = `<div class="brand"><img src="${LOGO}" alt="" />Yumi Status</div>`;
const backBtn = `<a class="btn" href="/" target="_top" aria-label="กลับหน้าแรก">${ICON.back}</a>`;

const rangeBar = (base: string, range: Range) =>
	`<nav class="seg" aria-label="ช่วงเวลา">${RANGE_LIST.map(k => `<a href="${base}?range=${k}" class="${k === range ? 'on' : ''}"${k === range ? ' aria-current="true"' : ''}>${RANGE_LABEL[k]}</a>`).join('')}</nav>`;

/** ข้อความ "ครั้งล่าสุดของสถานะตรงข้าม" */
function lastLine(b: Brief): string {
	if (b.state === 'loading') return '';
	if (b.state === 'up') {
		return b.last ? `Downtime ล่าสุด ${fmtDurTh(b.last.duration)} เมื่อ ${fmtDateTh(b.last.start)}` : 'ยังไม่เคยล่มตั้งแต่เริ่มบันทึก';
	}
	return b.last ? `Uptime ล่าสุด ${fmtDurTh(b.last.duration)} จนถึง ${fmtDateTh(b.last.end)}` : 'ยังไม่มีข้อมูล uptime ก่อนหน้า';
}

/* ------------------------------------------------------------------ */

export function renderIndex(items: Item[], limits: Record<string, number>, range: Range, embed = false, ctx: PageCtx = { banner: null, maint: {} }): string {
	const base = embed ? '/iframe' : '/';
	const bannerHtml = ctx.banner && !embed ? `<div class="banner ${ctx.banner.level}">${esc(ctx.banner.text)}</div>` : '';
	const linkTarget = embed ? ' target="_blank" rel="noopener noreferrer"' : '';
	const now = Date.now();
	const down = items.filter(i => i.s.status === 0).length;
	const loading = items.filter(i => i.s.status === -1).length;
	const n = items.length;

	const overall = n === 0
		? { key: 'load', title: 'กำลังตรวจสอบบริการ…', sub: 'ผลลัพธ์จะแสดงในอีกสักครู่' }
		: down > 0
			? { key: 'down', title: down === n ? 'ทุกบริการหยุดทำงาน' : `บริการหยุดทำงาน ${down} จาก ${n} รายการ`, sub: 'เรารับทราบและกำลังดำเนินการแก้ไข' }
			: loading > 0
				? { key: 'load', title: 'บางบริการกำลังเริ่มระบบ', sub: `${loading} จาก ${n} รายการกำลังโหลด` }
				: { key: 'ok', title: 'ทุกระบบทำงานปกติ', sub: `${n} จาก ${n} บริการตอบสนองตามปกติ` };

	let obs = 0, dn = 0;
	for (const { r } of items) { obs += r.stat.observed; dn += r.stat.down; }
	const total = obs ? ((obs - dn) / obs) * 100 : null;

	const rows = items.map(({ s, r, b }) => {
		const st = stateTh(s.status);
		const limited = (limits[s.name] ?? 0) > now;
		const cur = b.ms !== null && b.since !== null
			? `<span>${b.state === 'up' ? 'Uptime' : 'Downtime'} <b data-since="${b.since}">${fmtDurTh(b.ms)}</b></span>` : '';
		const ping = typeof s.ping === 'number' && s.status === 1 ? `<span>${s.ping} ms</span>` : '';
		const bars = r.buckets.map(k => {
			const cls = k.observed <= 0 ? 'na' : k.down <= 0 ? 'ok' : k.down < 5 * 60_000 ? 'warn' : 'bad';
			const tip = k.observed <= 0 ? 'ไม่มีข้อมูล' : k.down <= 0 ? 'ไม่มี downtime' : `ล่ม ${fmtDurTh(k.down)}`;
			const sp = k.end - k.start;
			const label = sp >= 36 * 3_600_000 ? `${fmtDayTh(k.start)} - ${fmtDayTh(k.end - 1)}` : sp >= 20 * 3_600_000 ? fmtDayTh(k.end - 1) : fmtDateTh(k.start);
			return `<i class="${cls}" title="${label}: ${tip}"></i>`;
		}).join('');
		return `<a class="svc" data-state="${st.key}" translate="no" href="/${encodeURIComponent(s.name)}?range=${range}"${linkTarget}>
	<div class="who"><span class="dot"></span><div><div class="nm">${esc(displayName(s.name))}</div>
		<div class="meta"><span class="st">${st.label}</span>${ctx.maint[s.name] !== undefined ? '<span class="tag maint">กำลังปรับปรุง</span>' : ''}${cur}${ping}${limited ? '<span class="tag" title="คำขอมากเกินไป (429) ระบบกำลังรอแล้วลองใหม่อัตโนมัติ">ติด Rate limit</span>' : ''}</div>
		<div class="last">${lastLine(b)}</div></div></div>
	<div class="bars">${bars}</div>
	<div class="pct"><b>${fmtPct(r.stat.pct)}</b><span>uptime</span></div>
</a>`;
	}).join('\n');

	const main = `
${bannerHtml}
<section class="hero glass">
	<div class="hl"><span class="pulse"></span><div><h1>${overall.title}</h1><p>${overall.sub}</p></div></div>
	<div class="bigpct"><b>${fmtPct(total)}</b><span>uptime ${RANGE_LONG[range]}</span></div>
</section>
<div class="toolbar"><h2 class="tt">บริการทั้งหมด</h2>${rangeBar(base, range)}</div>
${n ? `<section class="list glass">${rows}</section>` : ''}
<div class="legend">
	<span><i style="background:var(--ok)"></i>ไม่มี downtime</span>
	<span><i style="background:var(--warn)"></i>ล่มน้อยกว่า 5 นาที</span>
	<span><i style="background:var(--down)"></i>ล่มนานกว่านั้น</span>
	<span><i style="background:rgba(255,255,255,.12)"></i>ไม่มีข้อมูล</span>
</div>
${embed ? '' : `<nav class="links"><a href="/metrics?range=${range}">กราฟ CPU / RAM / Ping</a><button type="button" class="linkbtn" data-sub-open>รับการแจ้งเตือนทางอีเมล</button></nav>`}`;
	return shell('Yumi - สถานะระบบ', embed ? '' : brand, main, overall.key, embed);
}

/** กราฟ CPU และ RAM ของบริการ (แสดงเฉพาะบริการที่ส่งค่าเหล่านี้มา) */
const resourcePanels = (series: SeriesPoint[]) => {
	if (!series.some(p => p.cpu !== null || p.memMb !== null)) return '';
	return `<section class="panel glass"><h2>CPU (%)</h2>${svgChart([seriesLine(series, 'cpu', 'CPU', COLORS[0])], '%')}</section>
<section class="panel glass"><h2>หน่วยความจำ RAM (MB)</h2>${svgChart([seriesLine(series, 'memMb', 'RAM', COLORS[2])], ' MB')}</section>`;
};

/** รายละเอียดของแต่ละช่วงในไทม์ไลน์: สี เวลา ระยะเวลา สาเหตุ และหมายเหตุ */
const segTip = (g: Report['strip'][number], label: string, k: string) => {
	const col = k === 'down' ? '#ff5a5f' : k === 'warn' ? '#fbbf24' : k === 'load' ? '#4cc9f0' : '#3ddc97';
	const lines = [
		`<div style="color:${col};font-weight:600">● ${esc(label)}${k === 'warn' ? ' (ล่มสั้น)' : ''}</div>`,
		`<div>ตั้งแต่ ${fmtDateTh(g.start)}</div>`,
		`<div>ถึง ${g.open ? 'ตอนนี้' : fmtDateTh(g.end)}</div>`,
		`<div>ระยะเวลา ${fmtDurTh(g.end - g.start)}</div>`,
	];
	if (g.status === 0) lines.push(`<div style="color:#ff9ea1">สาเหตุ: ${g.cause ? esc(g.cause) : 'ไม่ทราบสาเหตุ'}</div>`);
	if (g.note) lines.push(`<div style="color:#b99a97">หมายเหตุ: ${esc(g.note)}</div>`);
	return lines.join('');
};

export function renderDetail(s: StatusData, r: Report, b: Brief, limitedUntil: number, range: Range, series: SeriesPoint[] = [], ctx: PageCtx = { banner: null, maint: {} }): string {
	const now = Date.now();
	const st = stateTh(s.status);
	const limited = limitedUntil > now;
	const base = `/${encodeURIComponent(s.name)}`;

	const clock = b.since !== null && b.ms !== null
		? `<div class="k">${b.state === 'up' ? 'Uptime' : 'Downtime'}</div><div class="big" data-since="${b.since}">${fmtDurTh(b.ms)}</div><div class="last">${lastLine(b)}</div>`
		: `<div class="last">${lastLine(b)}</div>`;

	const na = (v: string | undefined | null) => (v ? `<div class="v">${esc(v)}</div>` : '<div class="v na">N/A</div>');
	const cpu = s.resources?.cpu?.percent;
	const mem = s.resources?.memory;
	const tiles = `
	<div class="tile glass"><div class="k">Ping</div>${na(typeof s.ping === 'number' ? `${s.ping} ms` : null)}</div>
	<div class="tile glass"><div class="k">เวอร์ชัน</div>${na(s.version ? `v${s.version}` : null)}</div>
	${cpu !== undefined ? `<div class="tile glass"><div class="k">การใช้ CPU</div><div class="v">${cpu}%</div><div class="meter"><i style="width:${Math.min(100, Number(cpu))}%"></i></div></div>` : ''}
	${mem ? `<div class="tile glass"><div class="k">การใช้หน่วยความจำ</div><div class="v">${esc(formatDataSize('byte', mem.used, 'short'))} / ${esc(formatDataSize('byte', mem.total, 'short'))}</div><div class="meter"><i style="width:${Math.min(100, Number(mem.percent))}%"></i></div></div>` : ''}`;

	const stt = r.stat;
	const avail = `
	<div><div class="k">Uptime</div><b>${fmtPct(stt.pct)}</b><small>${stt.observed ? `จากข้อมูล ${fmtDurTh(stt.observed)}` : 'ยังไม่มีข้อมูล'}</small></div>
	<div><div class="k">Downtime รวม</div><b>${stt.down ? fmtDurTh(stt.down) : 'ไม่มี'}</b><small>${stt.down ? 'เวลาที่ล่มสะสม' : 'ไม่เคยล่มในช่วงนี้'}</small></div>
	<div><div class="k">จำนวนครั้งที่ล่ม</div><b>${stt.incidents} ครั้ง</b><small>นับทุกช่วงที่หยุดทำงาน</small></div>
	<div><div class="k">ล่มนานที่สุด</div><b>${stt.longest ? fmtDurTh(stt.longest) : 'ไม่มี'}</b><small>ต่อเนื่องครั้งเดียว</small></div>`;

	const span = now - r.from;
	const strip = r.strip.map(g => {
		const k = g.status === 1 ? 'ok' : g.status === 0 ? (g.end - g.start < 5 * 60_000 ? 'warn' : 'down') : 'load';
		const label = g.status === 1 ? 'กำลังทำงาน' : g.status === 0 ? 'หยุดทำงาน' : 'กำลังเริ่มระบบ';
		return `<i class="${k}" style="left:${g.left.toFixed(3)}%;width:${g.width.toFixed(3)}%" data-tip="${esc(segTip(g, label, k))}"></i>`;
	}).join('');

	let spark = '<div class="none">ยังมีข้อมูลไม่พอ ระบบเก็บเวลาตอบสนองทุก 60 วินาที</div>';
	if (r.pings.length >= 2 && r.pingStats) {
		const vals = r.pings.map(p => p.ping);
		const min = Math.min(...vals), max = Math.max(...vals), sp = max - min || 1, pspan = now - r.pingFrom || 1;
		const pts = r.pings.map(p => [((p.ts - r.pingFrom) / pspan) * 600, 125 - ((p.ping - min) / sp) * 105] as const);
		const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
		const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} 140 L${pts[0][0].toFixed(1)} 140 Z`;
		spark = `<svg viewBox="0 0 600 140" preserveAspectRatio="none" role="img" aria-label="เวลาตอบสนอง ${RANGE_LONG[range]}">
	<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f13b3b" stop-opacity=".45"/><stop offset="1" stop-color="#f13b3b" stop-opacity="0"/></linearGradient></defs>
	<path d="${area}" fill="url(#sg)"/><path d="${line}" fill="none" stroke="#ff7a6e" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>
	<div class="stats"><span>ต่ำสุด <b>${r.pingStats.min} ms</b></span><span>เฉลี่ย <b>${r.pingStats.avg} ms</b></span><span>สูงสุด <b>${r.pingStats.max} ms</b></span></div>`;
	}

	const incidents = r.incidents.length
		? r.incidents.map(i => `<div class="inc"><div class="w">${fmtDateTh(i.start)}${i.end ? ` ถึง ${fmtDateTh(i.end)}` : ''}</div>
		${i.end ? `<div class="d">${fmtDurTh(i.duration)}</div>` : `<div class="d on">กำลังล่มอยู่ <span data-since="${i.start}">${fmtDurTh(now - i.start)}</span></div>`}</div>`).join('')
		: '<div class="none">ไม่มี downtime ในช่วงที่เลือก</div>';

	const main = `
${ctx.banner ? `<div class="banner ${ctx.banner.level}">${esc(ctx.banner.text)}</div>` : ''}
<section class="dhero glass">
	<div class="beacon"><div class="core">${ICON[st.key as 'ok' | 'load' | 'down']}</div></div>
	<div class="ttl"><h1 translate="no">${esc(displayName(s.name))}</h1>
		<span class="pill">${st.label}</span>${ctx.maint[s.name] !== undefined ? `<span class="pill" style="--c:var(--load)">กำลังปรับปรุง: ${esc(ctx.maint[s.name])}</span>` : ''}${limited ? '<span class="pill" style="--c:var(--warn)">ติด Rate limit กำลังรอลองใหม่</span>' : ''}</div>
	<div class="clock">${clock}</div>
</section>
<section class="tiles">${tiles}</section>
<div class="toolbar"><h2 class="tt">ข้อมูลย้อนหลัง</h2>${rangeBar(base, range)}</div>
<section class="panel glass"><h2>ความพร้อมใช้งาน (${RANGE_LONG[range]})</h2><div class="avail">${avail}</div></section>
<section class="panel glass"><h2>ไทม์ไลน์สถานะ</h2>
	<div class="strip">${strip}</div>
	<div class="axis"><span>${fmtDateTh(r.from)}</span><span>${fmtDateTh(r.from + span / 2)}</span><span>ตอนนี้</span></div></section>
<section class="panel glass"><h2>เวลาตอบสนอง (Ping)</h2>${svgChart([seriesLine(series, 'ping', 'Ping', COLORS[2])], ' ms')}</section>
${resourcePanels(series)}
<section class="panel glass"><h2>ประวัติ downtime</h2>${incidents}</section>`;

	return shell(`Yumi - สถานะระบบ (${esc(displayName(s.name))})`, backBtn + brand, main, st.key);
}

export function renderNotFound(name: string): string {
	const main = `<section class="dhero glass" data-state="down">
	<div class="beacon"><div class="core">${ICON.down}</div></div>
	<div class="ttl"><h1>ไม่พบหน้านี้</h1><span class="pill">ไม่มีบริการชื่อ “${esc(name)}”</span></div></section>`;
	return shell('Yumi - สถานะระบบ', backBtn + brand, main, 'down');
}