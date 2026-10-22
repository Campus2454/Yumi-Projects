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

// ฟังก์ชันสำหรับป้องกัน Error 429
async function fetchWithRetry(url: string, config?: any, retries: number = 3): Promise<any> {
	for (let i = 0; i < retries; i++) {
		try {
			return await axios.get(url, config);
		} catch (err: any) {
			if (err.response?.status === 429 && i < retries - 1) {
				const retryAfter = err.response.headers['retry-after'] 
					? parseInt(err.response.headers['retry-after']) * 1000 
					: 5000; // รอ 5 วินาทีถ้าไม่มี header
				console.warn(`[429 Too Many Requests] รอ ${retryAfter / 1000} วินาทีก่อนลองใหม่ (${url})`);
				await new Promise(res => setTimeout(res, retryAfter));
				continue;
			}
			throw err;
		}
	}
}

export async function checkAll(send2mail: boolean = true) {
	const botStatus = await bot_main(send2mail);
	const backendStatus = await backend(send2mail);
	const webMainStatus = await frontend_main(send2mail);
	const dbStatus = await database(send2mail);
	return [botStatus, backendStatus, webMainStatus, dbStatus];
}

export async function bot_main(send2mail: boolean = true): Promise<StatusData> {
	try {
		const res = await fetchWithRetry(`http://${process.env.LOCALHOST}:30061/`);
		const loadData = res.data;
		if (!loadData || !loadData.name || !loadData.status) throw `no data`;

		return { ...loadData };
	} catch (err) {
		const m = `ไม่สามารถเชื่อมต่อบอทหลักได้: ${err}`;
		console.error(m);
		if (send2mail) { sendEmailAlert(`thirphathrphlphun@gmail.com`, mailText.error, m) };
		return { name: `bot`, status: 0, ping: undefined, uptime: undefined, startTime: undefined, host: undefined, version: undefined, resources: undefined };
	}
}

export async function getDatabasePing(send2mail: boolean = true) {
	try {
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
	} catch (error) {
		const m = `ไม่สามารถเชื่อมต่อฐานข้อมูลได้: ${error}`;
		console.error(m);
		if (send2mail) { sendEmailAlert(`thirphathrphlphun@gmail.com`, mailText.error, m) };
		return undefined;
	}
}

export async function backend(send2mail: boolean = true): Promise<StatusData> {
	try {
		const res = await fetchWithRetry(`http://${process.env.LOCALHOST}:30063/`);
		const loadData = res.data;
		if (!loadData || !loadData.name || !loadData.status) throw `no data`;

		return { ...loadData };
	} catch (err) {
		const m = `ไม่สามารถเชื่อมต่อbackendได้: ${err}`;
		console.error(m);
		if (send2mail) { sendEmailAlert(`thirphathrphlphun@gmail.com`, mailText.error, m) };
		return { name: `backend`, status: 0, ping: undefined, uptime: undefined, startTime: undefined, host: undefined, version: undefined, resources: undefined };
	}
}

export async function frontend_main(send2mail: boolean = true): Promise<StatusData> {
	const startTime = Date.now();
	try {
		const res = await fetchWithRetry(`https://yumistack.net/`, { httpsAgent });

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
	} catch (err) {
		const m = `ไม่สามารถเชื่อมต่อเว็บไซต์หลักได้: ${err}`;
		console.error(m);
		if (send2mail) { sendEmailAlert(`thirphathrphlphun@gmail.com`, mailText.error, m) };
		return { name: `frontend_main`, status: 0, ping: undefined, uptime: undefined, startTime: undefined, host: undefined, version: undefined, resources: undefined };
	}
}

export async function database(send2mail: boolean = true): Promise<StatusData> {
	const startTime = Date.now();
	const version = `0.2`;
	const name = `database`;
	try {
		const connection = await mysql.createConnection({
			host: process.env.MYSQL_DB_HOST,
			user: process.env.MYSQL_DB_USER,
			password: process.env.MYSQL_DB_PASSWORD,
			database: process.env.MYSQL_DB_DATABASE,
		});

		const uptime = await connection.query(`SHOW STATUS LIKE "Uptime"`) as mysql.RowDataPacket[];
		const uptimeSeconds = parseInt(uptime[0][0]?.Value);

		await connection.end();

		if (isNaN(uptimeSeconds)) throw `Invalid Uptime value`;

		return {
			name,
			status: uptimeSeconds ? 1 : 0,
			ping: (Date.now() - startTime),
			uptime: uptimeSeconds,
			startTime: new Date(Date.now() - uptimeSeconds * 1000).toISOString(),
			host: `https://yumistack.net/`,
			version
		};
	} catch (err) {
		const m = `ไม่สามารถเชื่อมต่อฐานข้อมูลได้: ${err}`;
		console.error(m);
		if (send2mail) { sendEmailAlert(`thirphathrphlphun@gmail.com`, mailText.error, m) };
		return { name, status: 0, ping: undefined, uptime: undefined, startTime: undefined, host: undefined, version };
	}
}