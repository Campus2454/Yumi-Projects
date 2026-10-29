import cron from 'node-cron';
import { send } from './send.js';
import { checkAll as _checkAll, getRateLimits } from './check.js';
import { recordStatus, getReport, getBrief, getSeries, parseRange, initHistory } from './history.js';
import { renderIndex, renderDetail, renderNotFound } from './pages.js';
import { requestSubscribe, confirmSubscribe, unsubscribe, normalizeEmail, initSubscribers } from './subscribers.js';
import { renderSubscribePage, renderConfirmResult, renderUnsubResult } from './subscribe-page.js';
import { renderMetricsPage } from './chart.js';
import chalk from 'chalk';
import { StatusData } from 'global/types';
import express from 'express';

let allS: StatusData[] = [];
let prevS: StatusData[] = [];
let changedStatus: StatusData[] = [];
const isDev = process.env.IS_DEV === 'true';
const port = isDev ? 30006 : 3006;
const app = express();

/** service ที่มีกราฟ */
const METRIC_SERVICES = ['bot', 'backend', 'frontend_main', 'database'];

async function checkAll() {
	console.log(`${chalk.gray(`[${(new Date()).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit', })}]`)} Checking status...`);
	try{
		allS = await _checkAll(false);

		// บันทึก timeline และตัวอย่างค่า (ต้องทำก่อน send เพื่อให้ข้อความแจ้งเตือนมีข้อมูล downtime/uptime ล่าสุดครบ)
		recordStatus(allS);

		changedStatus = allS.filter(current => {
			const prevStatus = prevS.find(s => s.name === current.name)?.status;
			return prevStatus !== current.status;
		});
		console.log(changedStatus);

		if(changedStatus.length > 0){
			await send(true, true, false, changedStatus);
		};

		if(allS.some(s => s.status === 0))throw new Error('Some service down');
	}catch(err: any){
		console.error(`Error during status check: ${err}`);
	}finally{
		prevS = [...allS];
	}
};
function startWatcher() {
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
}

app.use(express.json({ limit: '2kb' }));

// rate limit ต่อ IP สำหรับการขอสมัคร (กัน spam และการยิงอีเมลรัว ๆ)
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000, MAX_HITS = 5;
function rateOk(ip: string): boolean {
	const now = Date.now();
	const arr = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
	if (arr.length >= MAX_HITS) { hits.set(ip, arr); return false; }
	arr.push(now); hits.set(ip, arr);
	if (hits.size > 5000) for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
	return true;
}

app.use((req: any, res: any, next: () => void) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
		return;
	};
	next();
});

// JSON สำหรับเอาไปใช้ต่อ: /api/status?range=24h|7d|30d|all
const wrap = (fn: (req: any, res: any) => Promise<void>) =>
	(req: any, res: any) => { fn(req, res).catch((e: unknown) => { console.error(e); if (!res.headersSent) res.status(500).send('Internal error'); }); };

app.get('/api/status', wrap(async (req, res) => {
	const range = parseRange(req.query.range);
	const limits = getRateLimits();
	const out = await Promise.all(allS.map(async s => {
		const [r, b] = await Promise.all([getReport(s.name, range), getBrief(s)]);
		return { ...s, rateLimitedUntil: limits[s.name] ?? null, brief: b, range, stat: r.stat, incidents: r.incidents };
	}));
	res.json(out);
}));

// JSON ข้อมูลกราฟ: /api/metrics?service=bot&range=24h
app.get('/api/metrics', wrap(async (req, res) => {
	const service = String(req.query.service ?? '');
	if (!METRIC_SERVICES.includes(service)) { res.status(400).json({ error: 'unknown service' }); return; }
	res.json(await getSeries(service, parseRange(req.query.range)));
}));

// หน้ากราฟ CPU / RAM / Ping: /metrics?range=24h|7d|30d|all
app.get('/metrics', wrap(async (req, res) => {
	const range = parseRange(req.query.range);
	const entries = await Promise.all(METRIC_SERVICES.map(async n => [n, await getSeries(n, range)] as const));
	res.send(renderMetricsPage(Object.fromEntries(entries), range));
}));

// หน้าสำหรับฝังใน iframe: เหมือนหน้าแรกแต่ไม่มีพื้นหลัง และลิงก์รายละเอียดเปิดแท็บใหม่
app.get('/iframe', wrap(async (req, res) => {
	const range = parseRange(req.query.range);
	const items = await Promise.all(allS.map(async s => ({ s, r: await getReport(s.name, range), b: await getBrief(s) })));
	res.set('Content-Security-Policy', "frame-ancestors *");
	res.send(renderIndex(items, getRateLimits(), range, true));
}));

app.get('/', wrap(async (req, res) => {
	const range = parseRange(req.query.range);
	const items = await Promise.all(allS.map(async s => ({ s, r: await getReport(s.name, range), b: await getBrief(s) })));
	res.send(renderIndex(items, getRateLimits(), range));
}));

app.get('/subscribe', (req: any, res: any) => {
	res.send(renderSubscribePage());
});

app.post('/api/subscribe', wrap(async (req, res) => {
	const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim();
	if (!rateOk(ip)) { res.status(429).json({ ok: false, error: 'ขอบ่อยเกินไป กรุณารอ 10 นาทีแล้วลองใหม่' }); return; }
	const email = normalizeEmail(req.body?.email);
	const r = await requestSubscribe(email);
	if (r === 'invalid') { res.status(400).json({ ok: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' }); return; }
	// 'sent' และ 'already' ตอบเหมือนกัน เพื่อไม่ให้รู้ว่าอีเมลนี้มีในระบบหรือไม่
	res.json({ ok: true });
}));

app.get('/subscribe/confirm', wrap(async (req, res) => {
	const r = await confirmSubscribe(req.query.token);
	res.send(renderConfirmResult(r));
}));

app.all('/subscribe/unsubscribe', wrap(async (req, res) => {
	const t = (req.method === 'POST' ? req.body?.token ?? req.query.token : req.query.token);
	const ok = await unsubscribe(t);
	res.send(renderUnsubResult(ok));
}));

// ต้องอยู่หลัง /metrics และ /api/* เพื่อไม่ให้ถูกจับเป็นชื่อ service
app.get(`/:name`, wrap(async (req, res) => {
	const range = parseRange(req.query.range);
	const status = allS.find(s => s.name === req.params.name);
	if (!status) { res.status(404).send(renderNotFound(req.params.name)); return; }
	const [r, b, series] = await Promise.all([getReport(status.name, range), getBrief(status), getSeries(status.name, range)]);
	res.status(status.status === 1 ? 200 : 503).send(renderDetail(status, r, b, getRateLimits()[status.name] ?? 0, range, series));
}));

// เริ่มเฝ้าดูหลังเชื่อมต่อ DB สำเร็จ เพื่อไม่ให้บันทึกประวัติหาย
initHistory()
	.then(() => initSubscribers())
	.then(() => {
		try {
			app.listen(port);
			console.log(`Status server running on PORT: ${port}`);
		} catch (err) {
			console.log(err);
		}
		startWatcher();
	})
	.catch(e => {
		console.error('เชื่อมต่อฐานข้อมูลไม่สำเร็จ:', e);
		process.exit(1);
	});

cron.schedule('0 12 * * *', () => send());