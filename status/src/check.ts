import { StatusData } from "global/types";
import axios from "axios";
import mysql from "mysql2/promise";
import { sendEmailAlert } from "global/backend-functions";
import https from "https";

const mailText = {
	default: `สถานะการทำงานของ Yumi`,
	online: `แจ้งเตือนสถานะการทำงาน: เซิร์ฟเวอร์ทำงานปกติ`,
	error: `แจ้งเตือนสถานะการทำงาน: เซิร์ฟเวอร์ทำงานผิดปกติ`
};

const httpsAgent = new https.Agent({ family: 4 });

/* ------------------------------------------------------------------ */
/*  429 protection                                                     */
/*  ถ้าโดน 429 จะไม่ถือว่า offline: พักการเช็ค service นั้นตาม           */
/*  Retry-After (หรือ backoff) แล้วใช้ผลล่าสุดที่รู้ไปก่อน จากนั้นลองใหม่ */
/* ------------------------------------------------------------------ */
const DEFAULT_BACKOFF_MS = 15_000;
const MAX_BACKOFF_MS = 5 * 60_000;

class RateLimitError extends Error {
	constructor(public retryAfterMs: number) { super('rate limited (429)'); }
}

function parseRetryAfter(h: unknown): number {
	if (h == null) return 0;
	const n = Number(h);
	if (Number.isFinite(n)) return Math.max(0, n) * 1000;
	const d = Date.parse(String(h));
	return Number.isNaN(d) ? 0 : Math.max(0, d - Date.now());
}

function asRateLimit(err: unknown): RateLimitError | null {
	if (err instanceof RateLimitError) return err;
	if (axios.isAxiosError(err) && err.response?.status === 429) {
		return new RateLimitError(parseRetryAfter(err.response.headers?.['retry-after']));
	}
	return null;
}

type Guard = { blockedUntil: number; strikes: number; checkedAt: number; last?: StatusData };
const guards = new Map<string, Guard>();

/** service ไหนกำลังพักเพราะ 429 อยู่ (ค่า = เวลาที่จะลองใหม่ เป็น epoch ms) */
export function getRateLimits(): Record<string, number> {
	const out: Record<string, number> = {};
	const now = Date.now();
	for (const [k, g] of guards) if (g.blockedUntil > now) out[k] = g.blockedUntil;
	return out;
}

async function guarded(key: string, fn: () => Promise<StatusData>, minIntervalMs = 0): Promise<StatusData> {
	let g = guards.get(key);
	if (!g) { g = { blockedUntil: 0, strikes: 0, checkedAt: 0 }; guards.set(key, g); }

	const unknown: StatusData = { name: key, status: -1, ping: undefined, uptime: undefined, startTime: undefined, host: undefined, version: undefined, resources: undefined };
	const now = Date.now();
	if (now < g.blockedUntil) return g.last ?? unknown;
	if (minIntervalMs && g.last && now - g.checkedAt < minIntervalMs) return g.last;

	try {
		g.checkedAt = now;
		const r = await fn();
		g.strikes = 0;
		g.last = r;
		return r;
	} catch (err) {
		const rl = asRateLimit(err);
		if (!rl) throw err;
		g.strikes++;
		const wait = rl.retryAfterMs > 0
			? Math.min(Math.max(rl.retryAfterMs, 1000), MAX_BACKOFF_MS)
			: Math.min(DEFAULT_BACKOFF_MS * 2 ** (g.strikes - 1), MAX_BACKOFF_MS);
		g.blockedUntil = Date.now() + wait;
		console.warn(`[${key}] ติด rate limit (429) รอ ${Math.round(wait / 1000)} วินาทีแล้วลองใหม่ (ครั้งที่ ${g.strikes})`);
		return g.last ?? unknown; // ใช้สถานะล่าสุดที่รู้ ไม่ทำเครื่องหมายว่า offline
	}
}

/* ------------------------------------------------------------------ */

export async function checkAll(send2mail: boolean = true) {
	return Promise.all([bot_main(send2mail), backend(send2mail), frontend_main(send2mail), database(send2mail)]);
};

export function bot_main(send2mail: boolean = true): Promise<StatusData> {
	return guarded('bot', () => _bot_main(send2mail));
}
export function backend(send2mail: boolean = true): Promise<StatusData> {
	return guarded('backend', () => _backend(send2mail));
}
export function frontend_main(send2mail: boolean = true): Promise<StatusData> {
	return guarded('frontend_main', () => _frontend_main(send2mail), 5000); // เว็บภายนอก เช็คไม่ถี่เกิน 5 วินาที
}
export function database(send2mail: boolean = true): Promise<StatusData> {
	return guarded('database', () => _database(send2mail));
}

async function _bot_main(send2mail: boolean): Promise<StatusData> {
	try{
		const res = await axios.get<StatusData>(`http://${process.env.LOCALHOST}:30061/`);
		const loadData = res.data;
		if(!loadData || !loadData.name || !loadData.status)throw `no data`;

		return {
			name: loadData.name,
			status: loadData.status,
			ping: loadData.ping,
			uptime: loadData.uptime,
			startTime: loadData.startTime,
			host: loadData.host,
			version: loadData.version,
			resources: loadData.resources
		};
	}catch(err){
		const rl = asRateLimit(err); if(rl) throw rl;
		const m = `ไม่สามารถเชื่อมต่อบอทหลักได้: ${err}`;
		console.error(m);
		if(send2mail){sendEmailAlert(`thirphathrphlphun@gmail.com`, mailText.error, m)};
		return {
			name: `bot`,
			status: 0,
			ping: undefined,
			uptime: undefined,
			startTime: undefined,
			host: undefined,
			version: undefined,
			resources: undefined
		};
	}
};

export async function getDatabasePing(send2mail: boolean = true) {
	try{
		const connection = await mysql.createConnection({
			host: process.env.MYSQL_DB_HOST,
			user: process.env.MYSQL_DB_USER,
			password: process.env.MYSQL_DB_PASSWORD,
			database: process.env.MYSQL_DB_DATABASE,
		});

		const start = Date.now();
		await connection.query(`SELECT 1`);
		const ping = Date.now() - start;

		await connection.end();
		return ping;
	}catch(error){
		const m = `ไม่สามารถเชื่อมต่อฐานข้อมูลได้: ${error}`;
		console.error(m);
		if(send2mail){sendEmailAlert(`thirphathrphlphun@gmail.com`, mailText.error, m)};
		return undefined;
	}
};

async function _backend(send2mail: boolean): Promise<StatusData> {
	try{
		const res = await axios.get<StatusData>(`http://${process.env.LOCALHOST}:30063/`);
		const loadData = res.data;
		if(!loadData || !loadData.name || !loadData.status)throw `no data`;

		return {
			name: loadData.name,
			status: loadData.status,
			ping: loadData.ping,
			uptime: loadData.uptime,
			startTime: loadData.startTime,
			host: loadData.host,
			version: loadData.version,
			resources: loadData.resources
		};
	}catch(err){
		const rl = asRateLimit(err); if(rl) throw rl;
		const m = `ไม่สามารถเชื่อมต่อbackendได้: ${err}`;
		console.error(m);
		if(send2mail){sendEmailAlert(`thirphathrphlphun@gmail.com`, mailText.error, m)};
		return {
			name: `backend`,
			status: 0,
			ping: undefined,
			uptime: undefined,
			startTime: undefined,
			host: undefined,
			version: undefined,
			resources: undefined
		};
	}
};

async function _frontend_main(send2mail: boolean): Promise<StatusData> {
	const startTime = Date.now();
	try{
		const res = await axios.get(`https://yumistack.net/`, { httpsAgent });

		return {
			name: `frontend_main`,
			status: res.status == 200 ? 1 : 0,
			ping: (Date.now() - startTime),
			uptime: undefined,
			startTime: undefined,
			host: `https://yumistack.net/`,
			version: undefined,
			resources: undefined
		};
	}catch(err){
		const rl = asRateLimit(err); if(rl) throw rl;
		const m = `ไม่สามารถเชื่อมต่อเว็บไซต์หลักได้: ${err}`;
		console.error(m);
		if(send2mail){sendEmailAlert(`thirphathrphlphun@gmail.com`, mailText.error, m)};
		return {
			name: `frontend_main`,
			status: 0,
			ping: undefined,
			uptime: undefined,
			startTime: undefined,
			host: undefined,
			version: undefined,
			resources: undefined
		};
	}
};

async function _database(send2mail: boolean): Promise<StatusData> {
	const startTime = Date.now();
	const version = `0.2`;
	const name = `database`;
	try{
		const connection = await mysql.createConnection({
			host: process.env.MYSQL_DB_HOST,
			user: process.env.MYSQL_DB_USER,
			password: process.env.MYSQL_DB_PASSWORD,
			database: process.env.MYSQL_DB_DATABASE,
		});

		const uptime = await connection.query(`SHOW STATUS LIKE "Uptime"`) as mysql.RowDataPacket[];
		const uptimeSeconds = parseInt(uptime[0][0]?.Value);

		await connection.end();

		if(isNaN(uptimeSeconds))throw `Invalid Uptime value`;

		return {
			name,
			status: uptimeSeconds ? 1 : 0,
			ping: (Date.now() - startTime),
			uptime: uptimeSeconds,
			startTime: new Date(Date.now() - uptimeSeconds * 1000).toISOString(),
			host: `https://yumistack.net/`,
			version
		};
	}catch(err){
		const m = `ไม่สามารถเชื่อมต่อฐานข้อมูลได้: ${err}`;
		console.error(m);
		if(send2mail){sendEmailAlert(`thirphathrphlphun@gmail.com`, mailText.error, m)};
		return {
			name,
			status: 0,
			ping: undefined,
			uptime: undefined,
			startTime: undefined,
			host: undefined,
			version
		};
	}
};