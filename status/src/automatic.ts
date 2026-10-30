import cron from 'node-cron';
import { send } from './send.js';
import { checkAll as _checkAll, getRateLimits } from './check.js';
import { recordStatus, getReport, getBrief, getSeries, firstSampleTs, getBanner, getMaintenance, parseRange, initHistory } from './history.js';
import { renderIndex, renderDetail, renderNotFound } from './pages.js';
import { requestSubscribe, confirmSubscribe, unsubscribe, normalizeEmail, initSubscribers } from './subscribers.js';
import { renderSubscribePage, renderConfirmResult, renderUnsubResult } from './subscribe-page.js';
import { renderMetricsPage } from './chart.js';
import { registerAdmin } from './admin.js';
import { getMusic, musicError, nodeStatusData, renderMusicIndex, renderMusicNode } from './music.js';
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

/** ประกาศและโหมดปรับปรุงที่แอดมินตั้งไว้ ส่งให้หน้าเว็บแสดงผล */
const pageCtx = async () => ({ banner: await getBanner(), maint: await getMaintenance() });

async function checkAll() {
	console.log(`${chalk.gray(`[${(new Date()).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit', })}]`)} Checking status...`);
	try{
		allS = await _checkAll(false);

		// บันทึก timeline และตัวอย่างค่า (ต้องทำก่อน send เพื่อให้ข้อความแจ้งเตือนมีข้อมูล downtime/uptime ล่าสุดครบ)
		recordStatus(allS);
		// ประวัติของแต่ละ node เพลงเก็บแยก (service "nodes:<NODE>") ไม่ขึ้นในรายการหน้าแรก
		const m = getMusic();
		if (m) recordStatus(m.nodes.map(nodeStatusData));

		const maint = await getMaintenance();
		changedStatus = allS.filter(current => {
			const prevStatus = prevS.find(s => s.name === current.name)?.status;
			// service ที่กำลังปรับปรุงไม่ส่งการแจ้งเตือน (แต่ประวัติยังถูกบันทึกตามจริง)
			return prevStatus !== current.status && !(current.name in maint);
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
	// ทั้งหมด: ทุกกราฟเริ่มที่ตัวอย่างแรกสุดของทุก service (ไม่เว้นว่างทางซ้าย)
	const firsts = (await Promise.all(METRIC_SERVICES.map(firstSampleTs))).filter((x): x is number => x !== null);
	const start = firsts.length ? Math.min(...firsts) : undefined;
	const entries = await Promise.all(METRIC_SERVICES.map(async n => [n, await getSeries(n, range, Date.now(), start)] as const));
	res.send(renderMetricsPage(Object.fromEntries(entries), range));
}));

// หน้าสำหรับฝังใน iframe: เหมือนหน้าแรกแต่ไม่มีพื้นหลัง และลิงก์รายละเอียดเปิดแท็บใหม่
app.get('/iframe', wrap(async (req, res) => {
	const range = parseRange(req.query.range);
	const items = await Promise.all(allS.map(async s => ({ s, r: await getReport(s.name, range), b: await getBrief(s) })));
	res.set('Content-Security-Policy', "frame-ancestors *");
	res.send(renderIndex(items, getRateLimits(), range, true, await pageCtx()));
}));

app.get('/', wrap(async (req, res) => {
	const range = parseRange(req.query.range);
	const items = await Promise.all(allS.map(async s => ({ s, r: await getReport(s.name, range), b: await getBrief(s) })));
	res.send(renderIndex(items, getRateLimits(), range, false, await pageCtx()));
}));

// หน้ารับการแจ้งเตือนเป็น popup ในหน้าแรกแล้ว ลิงก์เดิมจะพาไปเปิด popup
app.get('/subscribe', (req: any, res: any) => {
	res.redirect(302, '/?subscribe=1');
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

// หน้าผู้ดูแล /admin (ต้องลงทะเบียนก่อน /:name)
registerAdmin(app, () => allS);

// node เพลง: /nodes (การ์ดแต่ละ node) และ /nodes/:node (รายละเอียด) (/music เก็บไว้ให้บอทเพลงในอนาคต) ส่ง 503 เมื่อไม่ทำงาน แต่ยังส่งหน้าเว็บ
app.get('/api/nodes', wrap(async (req, res) => {
	const m = getMusic();
	if (!m) { res.status(503).json({ error: 'ไม่ได้รับข้อมูลจากระบบเฝ้าดูเพลง', cause: musicError() }); return; }
	res.status(m.nodes.some(n => n.up) ? 200 : 503).json(m);
}));

app.get('/nodes', wrap(async (req, res) => {
	const range = parseRange(req.query.range);
	const m = getMusic();
	const items = await Promise.all((m?.nodes ?? []).map(async n => {
		const s = nodeStatusData(n);
		const [r, b] = await Promise.all([getReport(s.name, range), getBrief(s)]);
		return { n, r, b };
	}));
	const agg = allS.find(s => s.name === 'nodes');
	res.status(agg?.status === 0 ? 503 : 200).send(renderMusicIndex(agg, items, range, await pageCtx()));
}));

app.get('/nodes/:node', wrap(async (req, res) => {
	const range = parseRange(req.query.range);
	const n = getMusic()?.nodes.find(x => x.name.toLowerCase() === String(req.params.node).toLowerCase());
	if (!n) { res.status(getMusic() ? 404 : 503).send(renderNotFound(String(req.params.node))); return; }
	const s = nodeStatusData(n);
	const [r, b, series, ctx] = await Promise.all([getReport(s.name, range), getBrief(s), getSeries(s.name, range), pageCtx()]);
	res.status(n.up ? 200 : 503).send(renderMusicNode(n, r, b, range, series, ctx));
}));

// ต้องอยู่หลัง /metrics และ /api/* เพื่อไม่ให้ถูกจับเป็นชื่อ service
app.get(`/:name`, wrap(async (req, res) => {
	const range = parseRange(req.query.range);
	const status = allS.find(s => s.name === req.params.name);
	if (!status) { res.status(404).send(renderNotFound(req.params.name)); return; }
	const [r, b, series, ctx] = await Promise.all([getReport(status.name, range), getBrief(status), getSeries(status.name, range), pageCtx()]);
	res.status(status.status === 1 ? 200 : 503).send(renderDetail(status, r, b, getRateLimits()[status.name] ?? 0, range, series, ctx));
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