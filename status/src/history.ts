import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type { StatusData } from 'global/types';

/**
 * ฐานข้อมูล timeline แบบ local (SQLite) ใช้เฉพาะระบบ status นี้เท่านั้น
 * - segments: ช่วงเวลาที่ service อยู่ในสถานะหนึ่ง ๆ (1 = running, 0 = down, -1 = loading) เก็บถาวร
 * - pings:    ตัวอย่าง ping ทุก 60 วินาที (เก็บ 90 วัน)
 */
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const TOUCH_MS = 10_000;
const PING_EVERY_MS = 60_000;
const PRUNE_EVERY_MS = HOUR;
const SEG_KEEP_MS = 3650 * DAY;
const PING_KEEP_MS = 90 * DAY;

export type Range = '24h' | '7d' | '30d' | 'all';
export const RANGE_LIST: Range[] = ['24h', '7d', '30d', 'all'];
export const parseRange = (v: unknown): Range => (RANGE_LIST as string[]).includes(String(v)) ? (String(v) as Range) : '30d';
const RANGE_MS = { '24h': DAY, '7d': 7 * DAY, '30d': 30 * DAY };
const BUCKETS: Record<Range, number> = { '24h': 24, '7d': 28, '30d': 30, all: 30 };

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
// (ช่วงที่ตัวเฝ้าดูดับไปจะเป็น "ไม่มีข้อมูล" ไม่ถูกนับเป็น downtime)
db.prepare(`UPDATE segments SET ended_at = last_seen WHERE ended_at IS NULL`).run();

type SegRow = { status: number; started_at: number; ended_at: number | null; last_seen: number };
const q = {
	insertSeg: db.prepare(`INSERT INTO segments(service, status, started_at, last_seen) VALUES (?, ?, ?, ?)`),
	closeSeg: db.prepare(`UPDATE segments SET ended_at = ?, last_seen = ? WHERE id = ?`),
	touchSeg: db.prepare(`UPDATE segments SET last_seen = ? WHERE id = ?`),
	insertPing: db.prepare(`INSERT INTO pings(service, ts, ping) VALUES (?, ?, ?)`),
	firstSeen: db.prepare(`SELECT MIN(started_at) AS t FROM segments WHERE service = ?`),
	segsFrom: db.prepare(`SELECT status, started_at, ended_at, last_seen FROM segments WHERE service = ? AND (ended_at IS NULL OR ended_at > ?) ORDER BY started_at`),
	latest: db.prepare(`SELECT status, started_at, ended_at, last_seen FROM segments WHERE service = ? ORDER BY started_at DESC LIMIT 1`),
	lastOf: db.prepare(`SELECT status, started_at, ended_at, last_seen FROM segments WHERE service = ? AND status = ? ORDER BY started_at DESC LIMIT 1`),
	pingAgg: db.prepare(`SELECT CAST((ts - ?) * 1.0 / ? AS INTEGER) AS k, AVG(ping) AS p FROM pings WHERE service = ? AND ts >= ? GROUP BY k ORDER BY k`),
	pingStat: db.prepare(`SELECT MIN(ping) AS mn, MAX(ping) AS mx, AVG(ping) AS av, COUNT(*) AS n FROM pings WHERE service = ? AND ts >= ?`),
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

/* ------------------------------------------------------------------ */
/*  Brief: สรุปสถานะปัจจุบัน + ครั้งล่าสุดของสถานะตรงข้าม               */
/*  up   -> uptime ปัจจุบัน + downtime ล่าสุด                           */
/*  down -> downtime ปัจจุบัน + uptime ล่าสุด                           */
/* ------------------------------------------------------------------ */
export interface Brief {
	state: 'up' | 'down' | 'loading';
	since: number | null;
	ms: number | null;
	last: { kind: 'down' | 'up'; start: number; end: number; duration: number } | null;
}

export function getBrief(s: StatusData, now = Date.now()): Brief {
	const state = s.status === 1 ? 'up' : s.status === 0 ? 'down' : 'loading';
	const cur = q.latest.get(s.name) as SegRow | undefined;
	const isOpen = cur && cur.ended_at === null ? cur : null;

	let since: number | null = null;
	if (state === 'up') since = s.uptime ? now - s.uptime * 1000 : isOpen && isOpen.status === 1 ? isOpen.started_at : null;
	else if (state === 'down') since = isOpen && isOpen.status === 0 ? isOpen.started_at : null;

	let last: Brief['last'] = null;
	if (state !== 'loading') {
		const r = q.lastOf.get(s.name, state === 'up' ? 0 : 1) as SegRow | undefined;
		if (r) {
			const end = r.ended_at ?? r.last_seen;
			last = { kind: state === 'up' ? 'down' : 'up', start: r.started_at, end, duration: Math.max(0, end - r.started_at) };
		}
	}
	return { state, since, ms: since !== null ? Math.max(0, now - since) : null, last };
}

/* ------------------------------------------------------------------ */
/*  Report: ข้อมูลสำหรับหน้าเว็บตามช่วงเวลาที่เลือก                     */
/* ------------------------------------------------------------------ */
export interface Stat { observed: number; down: number; incidents: number; longest: number; pct: number | null }
export interface Report {
	now: number;
	range: Range;
	from: number;
	stat: Stat;
	buckets: { start: number; end: number; observed: number; down: number }[];
	strip: { left: number; width: number; status: number; start: number; end: number }[];
	incidents: { start: number; end: number | null; duration: number }[];
	pingFrom: number;
	pings: { ts: number; ping: number }[];
	pingStats: { min: number; avg: number; max: number } | null;
}

const overlap = (a0: number, a1: number, b0: number, b1: number) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
const cache = new Map<string, { at: number; rep: Report }>();

export function getReport(service: string, range: Range = '30d', now = Date.now()): Report {
	const key = `${service}|${range}`;
	const hit = cache.get(key);
	if (hit && now - hit.at < 1500) return hit.rep;

	const first = (q.firstSeen.get(service) as { t: number | null }).t;
	const span = range === 'all' ? Math.max(now - (first ?? now), HOUR) : RANGE_MS[range];
	const from = now - span;

	const rows = q.segsFrom.all(service, from) as SegRow[];
	const segs = rows.map(r => ({ status: r.status, start: r.started_at, end: r.ended_at ?? now, open: r.ended_at === null }));

	let observed = 0, down = 0, incidents = 0, longest = 0;
	for (const g of segs) {
		const o = overlap(g.start, g.end, from, now);
		if (!o) continue;
		observed += o;
		if (g.status === 0) { down += o; incidents++; longest = Math.max(longest, o); }
	}
	const stat: Stat = { observed, down, incidents, longest, pct: observed ? ((observed - down) / observed) * 100 : null };

	const n = BUCKETS[range], size = span / n;
	const buckets = Array.from({ length: n }, (_, i) => {
		const start = from + i * size, end = start + size;
		let ob = 0, dn = 0;
		for (const g of segs) {
			const o = overlap(g.start, g.end, start, end);
			ob += o;
			if (g.status === 0) dn += o;
		}
		return { start, end, observed: ob, down: dn };
	});

	const strip = segs
		.filter(g => overlap(g.start, g.end, from, now) > 0)
		.slice(-500)
		.map(g => {
			const s = Math.max(g.start, from), e = Math.min(g.end, now);
			const width = Math.max(((e - s) / span) * 100, g.status === 0 ? 0.6 : 0.3); // ช่วงที่ล่มต้องมองเห็นได้เสมอ
			return { left: Math.min(((s - from) / span) * 100, 100 - width), width, status: g.status, start: s, end: e };
		});

	const inc = segs
		.filter(g => g.status === 0)
		.reverse()
		.slice(0, 10)
		.map(g => ({ start: g.start, end: g.open ? null : g.end, duration: g.end - g.start }));

	const pingFrom = Math.max(from, now - PING_KEEP_MS);
	const N = 120, psize = Math.max((now - pingFrom) / N, 1);
	const pings = (q.pingAgg.all(pingFrom, psize, service, pingFrom) as { k: number; p: number }[])
		.map(r => ({ ts: pingFrom + Math.min(r.k, N - 1) * psize + psize / 2, ping: Math.round(r.p) }));
	const ps = q.pingStat.get(service, pingFrom) as { mn: number | null; mx: number | null; av: number | null; n: number };
	const pingStats = ps.n > 0 ? { min: ps.mn!, avg: Math.round(ps.av!), max: ps.mx! } : null;

	const rep: Report = { now, range, from, stat, buckets, strip, incidents: inc, pingFrom, pings, pingStats };
	cache.set(key, { at: now, rep });
	return rep;
}