import * as express from 'express';
import * as os from 'os';
import process from 'process';
import { cpuUsage } from 'node:process';
import * as pkg from '../package.json';
import { setTimeout as wait } from 'node:timers/promises';
import { StatusData } from "global/src/types";
import { performance } from 'perf_hooks';
import * as chalk from 'chalk';
import axios from 'axios';

const app = express();
const startTime = new Date();
const getUptimeSeconds = () => Math.floor((Date.now() - startTime.getTime()) / 1000);

let currentStatus: StatusData = {
	name: '',
	status: -1
};

export class status {
  async status(process: NodeJS.Process) {
    const port = process.env.IS_DEV === 'true' ? 30163 : 30063;
    try {
			app.get('/', (req, res) => {  
				res.json(currentStatus);
			});
			app.listen(port, () => {
				console.log(chalk.green(' - ✔'),`Status server running at http://localhost:${port}`);
			});
    	while (true) {try{
        const test = {
          async connect() {
            return (await axios.get('https://api.camming.xyz/')).status == 200;
          },
          async status() {
            return (await this.connect()) ? 1 : 0;
          },
          async ping() {
            const sT = Date.now();
            try {
              await this.connect();
              return Math.floor((Date.now() - sT) / 2);
            } catch (err) {
              return undefined;
            }
          }
        };

        // CPU usage วัดแบบระยะเวลา 100ms
        const start = cpuUsage();
        const startPerf = performance.now();
        await wait(100); // รอเพื่อจับ CPU ช่วงเวลาสั้น ๆ
        const end = cpuUsage(start);
        const endPerf = performance.now();
        const elapsedMicros = (endPerf - startPerf) * 1000; // ms → µs
        const cpuTime = end.user + end.system;
        const cpuPercent = +((cpuTime / elapsedMicros) * 100).toFixed(2);

        const memory = process.memoryUsage();
        const totalMem = os.totalmem();
        const usedMem = memory.rss;

        currentStatus = {
          name: pkg.name,
          version: pkg.version,
          status: await test.status(),
          ping: await test.ping(),
          uptime: getUptimeSeconds(),
          startTime: startTime.toISOString(),
          host: os.hostname(),
          resources: {
            cpu: {
              percent: cpuPercent
            },
            memory: {
              percent: +(usedMem / totalMem * 100).toFixed(2),
              used: usedMem,
              total: totalMem
            }
          }
        };

        // console.clear();
        // console.log(currentStatus);

				await wait(5000);
      }catch(err){ console.error(err) }};
		} catch (err) {
			console.error(err);
		};
  }
}
