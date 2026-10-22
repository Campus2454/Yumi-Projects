import { StatusData } from "global/types";
import axios from "axios";
import mysql from "mysql2/promise";
import https from "https";

const httpsAgent = new https.Agent({ family: 4 });
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
	for (let i = 0; i < maxRetries; i++) {
		try {
			const res = await axios.get(url, { httpsAgent, timeout: 5000 });
			return res;
		} catch (error: any) {
			if (error.response && error.response.status === 429) {
				console.warn(`[429 Too Many Requests] Waiting 5s before retrying (${i + 1}/${maxRetries})...`);
				await sleep(5000);
				continue;
			}
			throw error;
		}
	}
	throw new Error('Max retries reached after 429');
}

export async function checkAll(send2mail: boolean = true) {
	const botStatus = await bot_main(send2mail);
	const backendStatus = await backend(send2mail);
	const webMainStatus = await frontend_main(send2mail);
	const dbStatus = await database(send2mail);
	return [botStatus, backendStatus, webMainStatus, dbStatus];
}

export async function bot_main(send2mail: boolean = true): Promise<StatusData & { statusCode?: number }> {
	try {
		const res = await fetchWithRetry(`http://${process.env.LOCALHOST}:30061/`);
		const loadData = res.data;
		if (!loadData || !loadData.name || !loadData.status) throw `no data`;
		return { ...loadData, statusCode: 200 };
	} catch (err: any) {
		const statusCode = err.response?.status || 500;
		console.error(`[bot_main] Unreachable: ${err.message || err}`);
		return { name: `bot`, status: 0, statusCode, ping: undefined, uptime: undefined, startTime: undefined, host: undefined, version: undefined, resources: undefined };
	}
}

export async function getDatabasePing(send2mail: boolean = true): Promise<number | undefined> {
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
	} catch (error: any) {
		console.error(`[database_ping] Unreachable: ${error.message || error}`);
		return undefined;
	}
}

export async function backend(send2mail: boolean = true): Promise<StatusData & { statusCode?: number }> {
	try {
		const res = await fetchWithRetry(`http://${process.env.LOCALHOST}:30063/`);
		const loadData = res.data;
		if (!loadData || !loadData.name || !loadData.status) throw `no data`;
		return { ...loadData, statusCode: 200 };
	} catch (err: any) {
		const statusCode = err.response?.status || 500;
		console.error(`[backend] Unreachable: ${err.message || err}`);
		return { name: `backend`, status: 0, statusCode, ping: undefined, uptime: undefined, startTime: undefined, host: undefined, version: undefined, resources: undefined };
	}
}

export async function frontend_main(send2mail: boolean = true): Promise<StatusData & { statusCode?: number }> {
	const startTime = Date.now();
	try {
		const res = await fetchWithRetry(`https://yumistack.net/`);
		return {
			name: `frontend_main`,
			status: res.status === 200 ? 1 : 0,
			statusCode: res.status,
			ping: (Date.now() - startTime),
			uptime: undefined,
			startTime: undefined,
			host: `https://yumistack.net/`,
			version: undefined,
			resources: undefined
		};
	} catch (err: any) {
		const statusCode = err.response?.status || 500;
		console.error(`[frontend_main] Unreachable: ${err.message || err}`);
		return { name: `frontend_main`, status: 0, statusCode, ping: undefined, uptime: undefined, startTime: undefined, host: undefined, version: undefined, resources: undefined };
	}
}

export async function database(send2mail: boolean = true): Promise<StatusData & { statusCode?: number }> {
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
		const uptimeData = await connection.query(`SHOW STATUS LIKE "Uptime"`) as mysql.RowDataPacket[];
		const uptimeSeconds = parseInt(uptimeData[0][0]?.Value);
		await connection.end();

		if (isNaN(uptimeSeconds)) throw `Invalid Uptime value`;
		return { name, status: uptimeSeconds ? 1 : 0, statusCode: 200, ping: (Date.now() - startTime), uptime: uptimeSeconds, startTime: new Date(Date.now() - uptimeSeconds * 1000).toISOString(), host: `https://yumistack.net/`, version };
	} catch (err: any) {
		console.error(`[database] Unreachable: ${err.message || err}`);
		return { name, status: 0, statusCode: 500, ping: undefined, uptime: undefined, startTime: undefined, host: undefined, version };
	}
}