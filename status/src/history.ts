import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type { StatusData } from 'global/types';

/**
 * ฐานข้อมูล timeline แบบ local (SQLite) ใช้เฉพาะระบบ status นี้เท่านั้น
 * - segments: ช่วงเวลาที่ service อยู่ในสถานะหนึ่ง ๆ (1 = running, 0 = down, -1 = loading)
 * - pings:    ตัวอย่าง ping ทุก 30 วินาที (เก็บ 7 วัน)
 */
const DAY = 86_400_000;
const TOUCH_MS = 10_000;
const PING_EVERY_MS = 30_000;
const PRUNE_EVERY_MS = 3_600_000;
const SEG_KEEP_MS = 90 * DAY;
const PING_KEEP_MS = 7 * DAY;

const DB_PATH = process.env.STATUS_DB_PATH || path.join(process.cwd(), 'data', 'status-history.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.exec(`
CREATE TABLE IF NOT EXISTS segments(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	service TEXT NOT NULL,
	status INTEGER NOT NULL,
	started_at INTEGER NOT NULL,
	ended_at INTEGER,
	last_seen INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_seg_service_start ON segments(service, started_at);
CREATE TABLE IF NOT EXISTS pings(
	service TEXT NOT NULL,
	ts INTEGER NOT NULL,
	ping INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pings_service_ts ON pings(service, ts);
`);

// ถ้าโปรแกรมเคยดับกลางทาง ปิด segment ที่ค้างไว้ ณ เวลาที่เห็นล่าสุด
// (ช่วงที่ตัวเฝ้าดูดับไปจะเป็น "no data" ไม่ถูกนับเป็น downtime)
db.prepare(`UPDATE segments SET ended_at = last_seen WHERE ended_at IS NULL`).run();

const q = {
	insertSeg: db.prepare(`INSERT INTO segments(service, status, started_at, last_seen) VALUES (?, ?, ?, ?)`),
	closeSeg: db.prepare(`UPDATE segments SET ended_at = ?, last_seen = ? WHERE id = ?`),
	touchSeg: db.prepare(`UPDATE segments SET last_seen = ? WHERE id = ?`),
	insertPing: db.prepare(`INSERT INTO pings(service, ts, ping) VALUES (?, ?, ?)`),
	segs: db.prepare(`SELECT status, started_at, ended_at FROM segments WHERE service = ? AND (ended_at IS NULL OR ended_at > ?) ORDER BY started_at`),
	pings: db.prepare(`SELECT ts, ping FROM pings WHERE service = ? AND ts >= ? ORDER BY ts`),
	pruneSeg: db.prepare(`DELETE FROM segments WHERE ended_at IS NOT NULL AND ended_at < ?`),
	prunePing: db.prepare(`DELETE FROM pings WHERE ts < ?`),
};

const open = new Map<string, { id: number; status: number; touched: number }>();
const lastPing = new Map<string, number>();
let lastPrune = 0;

/** เรียกทุกครั้งที่เช็คสถานะเสร็จ */
export function recordStatus(list: StatusData[], now = Date.now()) {
	db.transaction(() => {
		for (const s of list) {
			const cur = open.get(s.name);
			if (!cur || cur.status !== s.status) {
				if (cur) q.closeSeg.run(now, now, cur.id);
				const r = q.insertSeg.run(s.name, s.status, now, now);
				open.set(s.name, { id: Number(r.lastInsertRowid), status: s.status, touched: now });
			} else if (now - cur.touched >= TOUCH_MS) {
				q.touchSeg.run(now, cur.id);
				cur.touched = now;
			}
			if (s.status === 1 && typeof s.ping === 'number' && now - (lastPing.get(s.name) ?? 0) >= PING_EVERY_MS) {
				q.insertPing.run(s.name, now, Math.round(s.ping));
				lastPing.set(s.name, now);
			}
		}
		if (now - lastPrune > PRUNE_EVERY_MS) {
			q.pruneSeg.run(now - SEG_KEEP_MS);
			q.prunePing.run(now - PING_KEEP_MS);
			lastPrune = now;
		}
	})();
}

export interface WindowStat { observed: number; down: number; incidents: number; pct: number | null }
export interface Report {
	now: number;
	current: { status: number; since: number } | null;
	windows: { '24h': WindowStat; '7d': WindowStat; '30d': WindowStat };
	buckets: { start: number; end: number; observed: number; down: number }[];
	strip: { left: number; width: number; status: number; start: number; end: number }[];
	incidents: { start: number; end: number | null; duration: number }[];
	pings: { ts: number; ping: number }[];
}

const overlap = (a0: number, a1: number, b0: number, b1: number) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
const cache = new Map<string, { at: number; rep: Report }>();

export function getReport(service: string, now = Date.now()): Report {
	const hit = cache.get(service);
	if (hit && now - hit.at < 1500) return hit.rep;

	const rows = q.segs.all(service, now - 30 * DAY) as { status: number; started_at: number; ended_at: number | null }[];
	const segs = rows.map(r => ({ status: r.status, start: r.started_at, end: r.ended_at ?? now, open: r.ended_at === null }));
	const last = segs[segs.length - 1];
	const current = last?.open ? { status: last.status, since: last.start } : null;

	const win = (ms: number): WindowStat => {
		const from = now - ms;
		let observed = 0, down = 0, incidents = 0;
		for (const g of segs) {
			const o = overlap(g.start, g.end, from, now);
			if (!o) continue;
			observed += o;
			if (g.status === 0) { down += o; incidents++; }
		}
		return { observed, down, incidents, pct: observed ? ((observed - down) / observed) * 100 : null };
	};

	const buckets = Array.from({ length: 30 }, (_, i) => {
		const start = now - (30 - i) * DAY, end = start + DAY;
		let observed = 0, down = 0;
		for (const g of segs) {
			const o = overlap(g.start, g.end, start, end);
			observed += o;
			if (g.status === 0) down += o;
		}
		return { start, end, observed, down };
	});

	const from24 = now - DAY;
	const strip = segs
		.filter(g => overlap(g.start, g.end, from24, now) > 0)
		.map(g => {
			const s = Math.max(g.start, from24), e = Math.min(g.end, now);
			return { left: ((s - from24) / DAY) * 100, width: Math.max(((e - s) / DAY) * 100, 0.3), status: g.status, start: s, end: e };
		});

	const incidents = segs
		.filter(g => g.status === 0)
		.reverse()
		.slice(0, 8)
		.map(g => ({ start: g.start, end: g.open ? null : g.end, duration: g.end - g.start }));

	const N = 96, size = DAY / N;
	const acc = new Map<number, { sum: number; n: number }>();
	for (const p of q.pings.all(service, from24) as { ts: number; ping: number }[]) {
		const k = Math.min(N - 1, Math.floor((p.ts - from24) / size));
		const a = acc.get(k) ?? { sum: 0, n: 0 };
		a.sum += p.ping; a.n++;
		acc.set(k, a);
	}
	const pings = [...acc.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => ({ ts: from24 + k * size + size / 2, ping: Math.round(v.sum / v.n) }));

	const rep: Report = { now, current, windows: { '24h': win(DAY), '7d': win(7 * DAY), '30d': win(30 * DAY) }, buckets, strip, incidents, pings };
	cache.set(service, { at: now, rep });
	return rep;
}