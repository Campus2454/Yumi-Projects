import type { SeriesPoint, Range } from './history.js';
import { RANGE_LIST } from './history.js';
import { displayName, fmtDateTh } from './format.js';

const W = 720, H = 200, PL = 46, PR = 12, PT = 12, PB = 26;
const COLORS = ['#ff5a5f', '#3ddc97', '#4cc9f0', '#fbbf24'];
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

type Line = { name: string; color: string; points: { ts: number; v: number | null }[] };

/** วาดกราฟเส้นเป็น SVG; ช่วงที่ v เป็น null จะขาดเส้น */
function svgChart(lines: Line[], yMax: number, unit: string): string {
	const pts = lines.flatMap(l => l.points);
	if (!pts.some(p => p.v !== null)) return `<p class="empty">ยังไม่มีข้อมูลในช่วงนี้</p>`;

	const t0 = Math.min(...pts.map(p => p.ts)), t1 = Math.max(...pts.map(p => p.ts));
	const X = (t: number) => PL + ((t - t0) / Math.max(1, t1 - t0)) * (W - PL - PR);
	const Y = (v: number) => PT + (1 - Math.min(v, yMax) / yMax) * (H - PT - PB);

	const grid = [0, 0.25, 0.5, 0.75, 1].map(f => {
		const v = yMax * f, y = Y(v);
		return `<line x1="${PL}" x2="${W - PR}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#331a1d"/>` +
			`<text x="${PL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#8a706d">${Math.round(v)}${unit}</text>`;
	}).join('');

	const paths = lines.map(l => {
		let d = '', pen = false;
		for (const p of l.points) {
			if (p.v === null) { pen = false; continue; }
			d += `${pen ? 'L' : 'M'}${X(p.ts).toFixed(1)},${Y(p.v).toFixed(1)}`;
			pen = true;
		}
		return `<path d="${d}" fill="none" stroke="${l.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
	}).join('');

	const xLabels =
		`<text x="${PL}" y="${H - 6}" font-size="11" fill="#8a706d">${esc(fmtDateTh(t0))}</text>` +
		`<text x="${W - PR}" y="${H - 6}" text-anchor="end" font-size="11" fill="#8a706d">${esc(fmtDateTh(t1))}</text>`;

	const legend = lines.map(l => `<span style="color:${l.color}">● ${esc(l.name)}</span>`).join(' &nbsp; ');

	return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">${grid}${paths}${xLabels}</svg><div class="legend">${legend}</div>`;
}

const niceMax = (v: number) => Math.max(100, Math.ceil((v * 1.2) / 50) * 50);

const panel = (title: string, body: string) => `<section class="panel"><h2>${esc(title)}</h2>${body}</section>`;

/** หน้ากราฟ: /metrics?range=24h|7d|30d|all */
export function renderMetricsPage(data: Record<string, SeriesPoint[]>, range: Range): string {
	const pick = (name: string, key: 'cpu' | 'mem' | 'ping'): Line['points'] =>
		(data[name] ?? []).map(p => ({ ts: p.ts, v: p[key] }));

	const resourcePanel = (name: string) => panel(
		`${displayName(name)}: CPU และหน่วยความจำ (%)`,
		svgChart([
			{ name: 'CPU', color: COLORS[0], points: pick(name, 'cpu') },
			{ name: 'RAM', color: COLORS[2], points: pick(name, 'mem') },
		], 100, '%'),
	);

	const pingMax = Math.max(0, ...Object.keys(data).flatMap(n => (data[n] ?? []).map(p => p.ping ?? 0)));
	const pingPanel = panel(
		'Ping (ms) ทุกบริการ',
		svgChart(
			Object.keys(data).map((n, i) => ({ name: displayName(n), color: COLORS[i % COLORS.length], points: pick(n, 'ping') })),
			niceMax(pingMax), ' ms',
		),
	);

	const tabs = RANGE_LIST.map(r => `<a href="?range=${r}" class="${r === range ? 'on' : ''}">${r}</a>`).join('');

	return `<!doctype html>
<html lang="th"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>กราฟสถานะ - Yumi Status</title>
<style>
:root{color-scheme:dark}
body{margin:0;padding:24px 16px;background:#060203;color:#fff3f1;font-family:'Kanit',system-ui,sans-serif}
h1{margin:0 0 12px;font-size:1.6rem}
.tabs{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap}
.tabs a{padding:6px 14px;border-radius:999px;border:1px solid #432226;color:#d8b9b5;text-decoration:none;font-size:.9rem}
.tabs a.on{background:#f13b3b;border-color:#f13b3b;color:#fff}
.grid{display:grid;gap:16px;max-width:760px;margin:0 auto}
.panel{background:#1a0b0d;border:1px solid #331a1d;border-radius:16px;padding:16px 18px}
.panel h2{margin:0 0 8px;font-size:1rem;font-weight:600;color:#fff3f1}
.legend{margin-top:6px;font-size:.85rem;color:#b99a97}
.empty{color:#8a706d;font-size:.9rem}
</style></head>
<body>
<div class="grid">
<h1>กราฟสถานะระบบ</h1>
<nav class="tabs">${tabs}</nav>
${resourcePanel('bot')}
${resourcePanel('backend')}
${pingPanel}
</div>
</body></html>`;
}