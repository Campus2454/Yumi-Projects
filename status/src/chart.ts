import type { SeriesPoint, Range } from './history.js';
import { RANGE_LIST } from './history.js';
import { displayName, fmtDateTh } from './format.js';

const W = 720, H = 200, PL = 56, PR = 12, PT = 12, PB = 26;
export const COLORS = ['#ff5a5f', '#3ddc97', '#4cc9f0', '#fbbf24'];
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export type Line = { name: string; color: string; points: { ts: number; v: number | null }[] };
export type SeriesKey = 'cpu' | 'memMb' | 'ping';

/** แปลงข้อมูลช่วงเวลาเป็นเส้นหนึ่งเส้น */
export function seriesLine(points: SeriesPoint[], key: SeriesKey, name: string, color: string): Line {
	return { name, color, points: points.map(p => ({ ts: p.ts, v: p[key] })) };
}

/**
 * ขอบบนของแกน Y จากค่าสูงสุดที่มองเห็นจริงในกราฟ (เพิ่มขึ้น 5% แล้วปัดขึ้นเป็นตัวเลขที่อ่านง่าย)
 * เช่น ค่าสูงสุด 500 -> 530, ค่าสูงสุด 37 -> 39
 */
export function yLimit(max: number): number {
	if (!(max > 0)) return 1;
	const unit = Math.pow(10, Math.floor(Math.log10(max)) - 1);
	return Number((Math.ceil((max * 1.05) / unit) * unit).toFixed(6));
}

/** วาดกราฟเส้นเป็น SVG; ช่วงที่ v เป็น null จะขาดเส้น; แกน Y อิงจากค่าสูงสุดในกราฟนี้เท่านั้น */
export function svgChart(lines: Line[], unit: string): string {
	const all = lines.flatMap(l => l.points);
	const vals = all.filter(p => p.v !== null).map(p => p.v as number);
	if (!vals.length) return `<p class="empty">ยังไม่มีข้อมูลในช่วงนี้</p>`;

	const yMax = yLimit(Math.max(...vals));
	const t0 = Math.min(...all.map(p => p.ts)), t1 = Math.max(...all.map(p => p.ts));
	const X = (t: number) => PL + ((t - t0) / Math.max(1, t1 - t0)) * (W - PL - PR);
	const Y = (v: number) => PT + (1 - v / yMax) * (H - PT - PB);
	const fmt = (v: number) => (yMax < 10 ? v.toFixed(1) : String(Math.round(v)));

	const grid = [0, 0.25, 0.5, 0.75, 1].map(f => {
		const v = yMax * f, y = Y(v);
		return `<line x1="${PL}" x2="${W - PR}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#331a1d"/>` +
			`<text x="${PL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#8a706d">${fmt(v)}${esc(unit)}</text>`;
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

const panel = (title: string, body: string) => `<section class="panel"><h2>${esc(title)}</h2>${body}</section>`;

/** หน้ากราฟ: /metrics?range=24h|7d|30d|all */
export function renderMetricsPage(data: Record<string, SeriesPoint[]>, range: Range): string {
	const resourcePanels = ['bot', 'backend'].flatMap(name => [
		panel(`${displayName(name)} · CPU (%)`, svgChart([seriesLine(data[name] ?? [], 'cpu', 'CPU', COLORS[0])], '%')),
		panel(`${displayName(name)} · RAM (MB)`, svgChart([seriesLine(data[name] ?? [], 'memMb', 'RAM', COLORS[2])], ' MB')),
	]);

	const pingPanel = panel(
		'Ping (ms) ทุกบริการ',
		svgChart(
			Object.keys(data).map((n, i) => seriesLine(data[n] ?? [], 'ping', displayName(n), COLORS[i % COLORS.length])),
			' ms',
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
${resourcePanels.join('\n')}
${pingPanel}
</div>
</body></html>`;
}