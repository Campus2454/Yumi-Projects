import cron from 'node-cron';
import { send } from './send.js';
import { checkAll as _checkAll, getRateLimits } from './check.js';
import { recordStatus, getReport, getBrief, parseRange } from './history.js';
import { renderIndex, renderDetail, renderNotFound } from './pages.js';
import chalk from 'chalk';
import { StatusData } from 'global/types';
import express from 'express';

let allS: StatusData[] = [];
let prevS: StatusData[] = [];
let changedStatus: StatusData[] = [];
const isDev = process.env.IS_DEV === 'true';
const port = isDev ? 30006 : 3006;
const app = express();

async function checkAll() {
	console.log(`${chalk.gray(`[${(new Date()).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit', })}]`)} Checking status...`);
	try{
		allS = await _checkAll(false);

		// บันทึก timeline (ต้องทำก่อน send เพื่อให้ข้อความแจ้งเตือนมีข้อมูล downtime/uptime ล่าสุดครบ)
		try{ recordStatus(allS); }catch(e){ console.error('บันทึกประวัติสถานะไม่สำเร็จ:', e); }

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

app.use((req, res, next) => {
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
app.get('/api/status', (req, res) => {
	const range = parseRange(req.query.range);
	const limits = getRateLimits();
	res.json(allS.map(s => {
		const r = getReport(s.name, range);
		return { ...s, rateLimitedUntil: limits[s.name] ?? null, brief: getBrief(s), range, stat: r.stat, incidents: r.incidents };
	}));
});

app.get('/', (req, res) => {
	const range = parseRange(req.query.range);
	res.send(renderIndex(allS.map(s => ({ s, r: getReport(s.name, range), b: getBrief(s) })), getRateLimits(), range));
});

app.get(`/:name`, (req, res) => {
	const range = parseRange(req.query.range);
	const status = allS.find(s => s.name === req.params.name);
	if (!status) { res.status(404).send(renderNotFound(req.params.name)); return; }
	res.status(status.status === 1 ? 200 : 503).send(
		renderDetail(status, getReport(status.name, range), getBrief(status), getRateLimits()[status.name] ?? 0, range)
	);
});

try {
	app.listen(port);
	console.log(`Status server running on PORT: ${port}`);
} catch (err) {
	console.log(err);
}

cron.schedule('0 12 * * *', () => send());