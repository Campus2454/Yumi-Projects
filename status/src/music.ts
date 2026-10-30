import axios from 'axios';
import type { StatusData } from 'global/types';
import { formatDataSize } from 'global/common-functions';
import type { Brief, Range, Report, SeriesPoint } from './history.js';
import { COLORS, seriesLine, svgChart } from './chart.js';
import { fmtDateTh, fmtDayTh, fmtDurTh, fmtPct } from './format.js';
import { ICON, RANGE_LONG, brand, esc, lastLine, rangeBar, resourcePanels, segTip, shell, type PageCtx } from './pages.js';

/* ------------------------------------------------------------------ */
/*  ข้อมูล node เพลง (Lavalink / NodeLink)                               */
/*  มาจาก sidecar ของบอทเพลง (musicV1/sidecar/sidecar.mjs) ที่ฟังอยู่บน   */
/*  docker0 เท่านั้น: http://host.docker.internal:30065/status            */
/* ------------------------------------------------------------------ */

export type MusicSource = { ok: boolean; level: string | null; error: string | null; errorTh: string | null };
export type MusicNode = {
	name: string; kind: 'nodelink' | 'lavalink'; up: boolean;
	error: string | null; errorTh: string | null;
	pingMs: number | null; version: string | null;
	startedAt: number | null; restarts: number | null; image: string | null;
	players: number | null; playingPlayers: number | null; nodeUptimeMs: number | null;
	cpu: number | null; mem: { used: number | null; total: number | null; percent: number } | null;
	sources: Record<string, MusicSource>;
	burner: boolean | null;
	history24: { uptime: string | null; youtube: string | null };
	lastDown: { start: number; end: number } | null;
};
export type MusicSnapshot = { at: number; up: number; total: number; nodes: MusicNode[] };

const MUSIC_URL = process.env.MUSIC_STATUS_URL || `http://${process.env.LOCALHOST}:30065/status`;
/** ข้อมูลเก่ากว่านี้ถือว่าไม่รู้สถานะ (sidecar หยุดทำงาน) */
const STALE_MS = 90_000;

let snap: MusicSnapshot | null = null;
let snapAt = 0;
let lastError: string | null = null;

/** ดึงข้อมูลล่าสุดจาก sidecar (ไม่ถี่เกิน 10 วินาที) */
export async function refreshMusic(): Promise<MusicSnapshot | null> {
	if (snap && Date.now() - snapAt < 10_000) return snap;
	try {
		const r = await axios.get<MusicSnapshot>(MUSIC_URL, { timeout: 20_000 });
		if (!r.data || !Array.isArray(r.data.nodes)) throw new Error('ข้อมูลที่ได้รับไม่ถูกต้อง');
		snap = toPublic(r.data); snapAt = Date.now(); lastError = null;
	} catch (e) {
		lastError = axios.isAxiosError(e) ? (e.code ?? e.message) : String(e);
	}
	return getMusic();
}

/* ------------------------------------------------------------------ */
/*  หน้าเว็บนี้เป็นสาธารณะ: ตัดข้อมูลภายในทิ้งตั้งแต่รับเข้ามา            */
/*  (บัญชีที่ใช้, image, ข้อความ error ดิบ, วิธีตรวจ) เหลือแค่ข้อความกลาง ๆ */
/* ------------------------------------------------------------------ */
const SAFE_REASONS = [
	{ re: /เชื่อมต่อ node ไม่ได้/, text: 'เชื่อมต่อ node ไม่ได้' },
	{ re: /ไม่ตอบ/, text: 'node ไม่ตอบสนอง' },
	{ re: /เพลงค้าง/, text: 'เล่นเพลงไม่ต่อเนื่อง' },
];
function publicReason(th: string | null, up: boolean): string | null {
	if (up && !th) return null;
	for (const r of SAFE_REASONS) if (th && r.re.test(th)) return r.text;
	return 'ขัดข้องชั่วคราว';
}
function toPublic(m: MusicSnapshot): MusicSnapshot {
	return {
		...m,
		nodes: m.nodes.map(({ burner: _b, image: _i, ...n }) => ({
			...n,
			burner: null,
			image: null,
			error: null,
			errorTh: n.up ? null : publicReason(n.errorTh, false),
			sources: Object.fromEntries(Object.entries(n.sources).map(([k, v]) => [k, { ok: v.ok, level: null, error: null, errorTh: v.ok ? null : publicReason(v.errorTh, false) }])),
		})),
	};
}

/** ข้อมูลที่ยังไม่เก่าเกินไป หรือ null */
export const getMusic = (): MusicSnapshot | null => (snap && Date.now() - snapAt < STALE_MS ? snap : null);
export const musicError = () => lastError;

/** ชื่อที่ใช้เก็บประวัติของแต่ละ node (แยกจากรายการบริการหลัก) */
export const nodeKey = (name: string) => `nodes:${name}`;
export const KIND_LABEL: Record<MusicNode['kind'], string> = { nodelink: 'NodeLink', lavalink: 'Lavalink' };

export function nodeStatusData(n: MusicNode): StatusData {
	return {
		name: nodeKey(n.name),
		status: n.up ? 1 : 0,
		ping: n.pingMs ?? undefined,
		uptime: n.up && n.startedAt ? Math.floor((Date.now() - n.startedAt) / 1000) : undefined,
		startTime: n.startedAt ? new Date(n.startedAt).toISOString() : undefined,
		version: n.version ?? undefined,
		resources: n.cpu !== null && n.mem && n.mem.used !== null && n.mem.total !== null
			? { cpu: { percent: n.cpu }, memory: { percent: n.mem.percent, used: n.mem.used, total: n.mem.total } }
			: undefined,
	};
}

/* ------------------------------------------------------------------ */
/*  หน้าเว็บ                                                            */
/* ------------------------------------------------------------------ */

export type NodeItem = { n: MusicNode; r: Report; b: Brief };

const MUSIC_CSS = `<style>
.kind{display:inline-flex;align-items:center;padding:2px 10px;border-radius:99px;font-size:.78rem;font-weight:400;letter-spacing:.02em;
	color:#ffd9d4;background:rgba(241,59,59,.14);border:1px solid rgba(241,59,59,.35)}
.kind.lavalink{color:#cfe9ff;background:rgba(76,201,240,.12);border-color:rgba(76,201,240,.35)}
.ngrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
.ncard{position:relative;overflow:hidden;display:flex;flex-direction:column;gap:16px;padding:22px 24px;transition:transform .2s,border-color .2s}
.ncard::before{content:"";position:absolute;inset:0 auto 0 0;width:4px;background:var(--c);box-shadow:0 0 18px var(--c)}
.ncard:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--c) 50%,transparent)}
.nhead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.nhead .nm{font-size:1.25rem;font-weight:700;letter-spacing:.02em}
.nhead .st{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-top:4px;color:var(--c);font-size:.9rem;white-space:nowrap}
.players{text-align:right}.players b{display:block;font-size:2.1rem;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
.players span{color:var(--muted);font-size:.78rem;font-weight:300}
.nstats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.nstats>div{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
.nstats .k{color:var(--dim);font-size:.76rem;font-weight:300}.nstats .v{font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{display:inline-flex;align-items:center;gap:6px;padding:3px 11px;border-radius:99px;font-size:.8rem;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--muted)}
.chip i{width:7px;height:7px;border-radius:50%;background:var(--dim)}
.chip.ok{color:#bdf5dd;border-color:rgba(61,220,151,.35)}.chip.ok i{background:var(--ok)}
.chip.bad{color:#ffc2c4;border-color:rgba(255,90,95,.4)}.chip.bad i{background:var(--down)}
.nfoot{display:flex;justify-content:space-between;align-items:center;gap:10px;color:var(--dim);font-size:.82rem;font-weight:300}
.nfoot b{color:var(--ink);font-weight:600}
.ncard .bars{height:24px}
.srow{display:grid;grid-template-columns:150px 1fr auto;gap:14px;align-items:center;padding:14px 0}
.srow+.srow{border-top:1px solid rgba(255,255,255,.07)}
.srow .sn{font-weight:600}.srow .sd{color:var(--muted);font-weight:300;font-size:.9rem}
.srow .sd small{display:block;color:var(--dim);font-size:.8rem;word-break:break-word}
.kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px 24px}
.kv div{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.kv span{color:var(--muted);font-weight:300}.kv b{font-weight:600;text-align:right;word-break:break-all}
.warnbox{margin-bottom:16px;padding:16px 20px;border-radius:16px;background:rgba(255,90,95,.1);border:1px solid rgba(255,90,95,.4);color:#ffc2c4}
@media (max-width:720px){.srow{grid-template-columns:1fr auto}.srow .sd{grid-column:1/-1;order:3}}
</style>`;

const SOURCE_TH: Record<string, string> = { youtube: 'YouTube', soundcloud: 'SoundCloud', http: 'ไฟล์เสียงทั่วไป (http)' };
const memText = (m: MusicNode['mem']) => (m && m.used !== null && m.total !== null
	? `${formatDataSize('byte', m.used, 'short')} / ${formatDataSize('byte', m.total, 'short')}` : null);

const bars = (r: Report) => r.buckets.map(k => {
	const cls = k.observed <= 0 ? 'na' : k.down <= 0 ? 'ok' : k.down < 5 * 60_000 ? 'warn' : 'bad';
	const tip = k.observed <= 0 ? 'ไม่มีข้อมูล' : k.down <= 0 ? 'ไม่มี downtime' : `ล่ม ${fmtDurTh(k.down)}`;
	const sp = k.end - k.start;
	const label = sp >= 36 * 3_600_000 ? `${fmtDayTh(k.start)} - ${fmtDayTh(k.end - 1)}` : sp >= 20 * 3_600_000 ? fmtDayTh(k.end - 1) : fmtDateTh(k.start);
	return `<i class="${cls}" title="${label}: ${tip}"></i>`;
}).join('');

const nodeState = (n: MusicNode) => (!n.up ? 'down' : n.sources.youtube && !n.sources.youtube.ok ? 'warn' : 'ok');
const stateLabel: Record<string, string> = { ok: 'กำลังทำงาน', warn: 'ทำงาน แต่บางแหล่งเพลงใช้ไม่ได้', down: 'หยุดทำงาน', load: 'ไม่ทราบสถานะ' };

/** หน้ารวม /nodes: การ์ดของแต่ละ node */
export function renderMusicIndex(s: StatusData | undefined, items: NodeItem[], range: Range, ctx: PageCtx): string {
	const m = getMusic();
	const up = items.filter(i => i.n.up).length;
	const total = items.length;
	const key = !m ? 'load' : up === 0 ? 'down' : 'ok';
	const title = !m ? 'ยังไม่ได้รับข้อมูล node เพลง' : up === total ? 'node เพลงทำงานครบทุกตัว' : up === 0 ? 'node เพลงหยุดทำงานทั้งหมด' : `node เพลงทำงาน ${up} จาก ${total} ตัว`;
	const sub = !m
		? `ติดต่อระบบเฝ้าดูของบอทเพลงไม่ได้${musicError() ? ` (${esc(musicError()!)})` : ''}`
		: 'บอทเพลงใช้งานได้ถ้ามี node ทำงานอย่างน้อย 1 ตัว ระบบย้ายเพลงไป node ที่เหลือให้อัตโนมัติ';

	const players = items.reduce((a, i) => a + (i.n.playingPlayers ?? 0), 0);
	const cards = items.map(({ n, r }) => {
		const k = nodeState(n);
				const chips = Object.entries(n.sources).map(([src, v]) =>
			`<span class="chip ${v.ok ? 'ok' : 'bad'}"><i></i>${esc(SOURCE_TH[src] ?? src)}</span>`).join('');
		return `<a class="ncard glass" data-state="${k === 'warn' ? 'load' : k}" style="${k === 'warn' ? '--c:var(--warn)' : ''}" href="/nodes/${encodeURIComponent(n.name)}?range=${range}" translate="no">
	<div class="nhead"><div><div class="nm">${esc(n.name)}</div><div class="st"><span class="dot"></span>${stateLabel[k]} <span class="kind ${n.kind}">${KIND_LABEL[n.kind]}</span></div></div>
		<div class="players"><b>${n.up ? (n.playingPlayers ?? 0) : '–'}</b><span>กำลังเล่น${n.up && n.players !== null ? ` / ${n.players} player` : ''}</span></div></div>
	${n.up ? `<div class="nstats">
		<div><div class="k">Ping</div><div class="v">${n.pingMs ?? '–'} ms</div></div>
		<div><div class="k">CPU</div><div class="v">${n.cpu !== null ? `${n.cpu.toFixed(1)}%` : '–'}</div></div>
		<div><div class="k">RAM</div><div class="v">${n.mem ? `${n.mem.percent.toFixed(0)}%` : '–'}</div></div></div>`
		: `<div class="nstats" style="grid-template-columns:1fr"><div><div class="k">สาเหตุ</div><div class="v">${esc(n.errorTh || n.error || 'ไม่ทราบสาเหตุ')}</div></div></div>`}
	<div class="chips">${chips}</div>
	<div class="bars">${bars(r)}</div>
	<div class="nfoot"><span>uptime ${RANGE_LONG[range]}</span><b>${fmtPct(r.stat.pct)}</b></div>
</a>`;
	}).join('\n');

	const main = `${MUSIC_CSS}
${ctx.banner ? `<div class="banner ${ctx.banner.level}">${esc(ctx.banner.text)}</div>` : ''}
<section class="hero glass">
	<div class="hl"><span class="pulse"></span><div><h1>${title}</h1><p>${sub}</p></div></div>
	<div class="bigpct"><b>${players}</b><span>เพลงที่กำลังเล่นอยู่ตอนนี้</span></div>
</section>
<div class="toolbar"><h2 class="tt">Node ทั้งหมด</h2>${rangeBar('/nodes', range)}</div>
${total ? `<section class="ngrid">${cards}</section>` : '<section class="panel glass"><div class="none">ยังไม่มีข้อมูล node</div></section>'}
${s ? '' : ''}`;
	return shell('Yumi - สถานะ node เพลง', `<a class="btn" href="/" aria-label="กลับหน้าแรก">${ICON.back}</a>${brand}`, main, key);
}

/** หน้ารายละเอียด /nodes/:node */
export function renderMusicNode(n: MusicNode, r: Report, b: Brief, range: Range, series: SeriesPoint[], ctx: PageCtx): string {
	const now = Date.now();
	const k = nodeState(n);
	const stKey = k === 'ok' ? 'ok' : k === 'down' ? 'down' : 'load';
	const base = `/nodes/${encodeURIComponent(n.name)}`;

	const clock = b.since !== null && b.ms !== null
		? `<div class="k">${b.state === 'up' ? 'Uptime' : 'Downtime'}</div><div class="big" data-since="${b.since}">${fmtDurTh(b.ms)}</div><div class="last">${lastLine(b)}</div>`
		: `<div class="last">${lastLine(b)}</div>`;

	const meter = (label: string, value: string, pct: number | null) =>
		`<div class="tile glass"><div class="k">${label}</div><div class="v">${value}</div>${pct !== null ? `<div class="meter"><i style="width:${Math.min(100, pct)}%"></i></div>` : ''}</div>`;
	const tile = (label: string, value: string | null) => `<div class="tile glass"><div class="k">${label}</div>${value ? `<div class="v">${value}</div>` : '<div class="v na">N/A</div>'}</div>`;
	const tiles = n.up ? `
	${tile('เพลงที่กำลังเล่น', n.playingPlayers !== null ? `${n.playingPlayers} <small style="font-size:.9rem;color:var(--muted);font-weight:300">/ ${n.players} player</small>` : null)}
	${tile('Ping', n.pingMs !== null ? `${n.pingMs} ms` : null)}
	${n.cpu !== null ? meter('การใช้ CPU', `${n.cpu.toFixed(2)}%`, n.cpu) : tile('การใช้ CPU', null)}
	${n.mem ? meter('การใช้หน่วยความจำ', esc(memText(n.mem) ?? `${n.mem.percent}%`), n.mem.percent) : tile('การใช้หน่วยความจำ', null)}`
		: tile('สาเหตุที่หยุดทำงาน', esc(n.errorTh || n.error || 'ไม่ทราบสาเหตุ'));

	const srcRows = Object.entries(n.sources).map(([src, v]) => `<div class="srow">
	<div class="sn">${esc(SOURCE_TH[src] ?? src)}</div>
	<div class="sd">${v.ok ? 'ใช้งานได้' : esc(v.errorTh || 'ใช้งานไม่ได้')}</div>
	<span class="chip ${v.ok ? 'ok' : 'bad'}"><i></i>${v.ok ? 'ปกติ' : 'ขัดข้อง'}</span></div>`).join('')
		|| '<div class="none">ยังไม่มีผลตรวจแหล่งเพลง</div>';

	const kv = (label: string, value: string | null) => `<div><span>${label}</span><b>${value ? esc(value) : '–'}</b></div>`;
	const info = [
		kv('ชนิด', KIND_LABEL[n.kind]),
		kv('เวอร์ชัน', n.version),
		kv('เริ่ม container', n.startedAt ? fmtDateTh(n.startedAt) : null),
		kv('Node uptime', n.nodeUptimeMs !== null ? fmtDurTh(n.nodeUptimeMs) : null),
		kv('Container restart', n.restarts !== null ? `${n.restarts} ครั้ง` : null),
		kv('YouTube ใช้ได้ 24 ชม.', n.history24.youtube),
		kv('Node ทำงาน 24 ชม.', n.history24.uptime),
		kv('ล่มล่าสุด', n.lastDown ? `${fmtDurTh(n.lastDown.end - n.lastDown.start)} (${fmtDateTh(n.lastDown.end)})` : 'ยังไม่เคยล่ม'),
	].join('');

	const stt = r.stat;
	const avail = `
	<div><div class="k">Uptime</div><b>${fmtPct(stt.pct)}</b><small>${stt.observed ? `จากข้อมูล ${fmtDurTh(stt.observed)}` : 'ยังไม่มีข้อมูล'}</small></div>
	<div><div class="k">Downtime รวม</div><b>${stt.down ? fmtDurTh(stt.down) : 'ไม่มี'}</b><small>${stt.down ? 'เวลาที่ล่มสะสม' : 'ไม่เคยล่มในช่วงนี้'}</small></div>
	<div><div class="k">จำนวนครั้งที่ล่ม</div><b>${stt.incidents} ครั้ง</b><small>นับทุกช่วงที่หยุดทำงาน</small></div>
	<div><div class="k">ล่มนานที่สุด</div><b>${stt.longest ? fmtDurTh(stt.longest) : 'ไม่มี'}</b><small>ต่อเนื่องครั้งเดียว</small></div>`;

	const span = now - r.from;
	const strip = r.strip.map(g => {
		const kk = g.status === 1 ? 'ok' : g.status === 0 ? (g.end - g.start < 5 * 60_000 ? 'warn' : 'down') : 'load';
		const label = g.status === 1 ? 'กำลังทำงาน' : g.status === 0 ? 'หยุดทำงาน' : 'ไม่ทราบสถานะ';
		return `<i class="${kk}" style="left:${g.left.toFixed(3)}%;width:${g.width.toFixed(3)}%" data-tip="${esc(segTip(g, label, kk))}"></i>`;
	}).join('');

	const incidents = r.incidents.length
		? r.incidents.map(i => `<div class="inc"><div class="w">${fmtDateTh(i.start)}${i.end ? ` ถึง ${fmtDateTh(i.end)}` : ''}</div>
		${i.end ? `<div class="d">${fmtDurTh(i.duration)}</div>` : `<div class="d on">กำลังล่มอยู่ <span data-since="${i.start}">${fmtDurTh(now - i.start)}</span></div>`}</div>`).join('')
		: '<div class="none">ไม่มี downtime ในช่วงที่เลือก</div>';

	const main = `${MUSIC_CSS}
${ctx.banner ? `<div class="banner ${ctx.banner.level}">${esc(ctx.banner.text)}</div>` : ''}
<section class="dhero glass" style="${k === 'warn' ? '--c:var(--warn)' : ''}">
	<div class="beacon"><div class="core">${ICON[stKey as 'ok' | 'load' | 'down']}</div></div>
	<div class="ttl"><h1 translate="no">${esc(n.name)}</h1>
		<span class="pill">${stateLabel[k]}</span><span class="kind ${n.kind}">${KIND_LABEL[n.kind]}</span></div>
	<div class="clock">${clock}</div>
</section>
${!n.up ? `<div class="warnbox">node นี้หยุดทำงาน เพลงที่เคยเล่นบน node นี้ถูกย้ายไป node อื่นแล้ว</div>` : ''}
<section class="tiles">${tiles}</section>
<section class="panel glass" style="margin-top:16px"><h2>แหล่งเพลง</h2>${srcRows}</section>
<section class="panel glass"><h2>ข้อมูล node</h2><div class="kv">${info}</div></section>
<div class="toolbar"><h2 class="tt">ข้อมูลย้อนหลัง</h2>${rangeBar(base, range)}</div>
<section class="panel glass"><h2>ความพร้อมใช้งาน (${RANGE_LONG[range]})</h2><div class="avail">${avail}</div></section>
<section class="panel glass"><h2>ไทม์ไลน์สถานะ</h2>
	<div class="strip">${strip}</div>
	<div class="axis"><span>${fmtDateTh(r.from)}</span><span>${fmtDateTh(r.from + span / 2)}</span><span>ตอนนี้</span></div></section>
<section class="panel glass"><h2>เวลาตอบสนอง (Ping)</h2>${svgChart([seriesLine(series, 'ping', 'Ping', COLORS[2])], ' ms')}</section>
${resourcePanels(series)}
<section class="panel glass"><h2>ประวัติ downtime</h2>${incidents}</section>`;

	return shell(`Yumi - ${esc(n.name)}`, `<a class="btn" href="/nodes?range=${range}" aria-label="กลับหน้ารวม node">${ICON.back}</a>${brand}`, main, stKey);
}
