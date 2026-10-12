import express from 'express';
import os from "os";
import process from 'process';
import { cpuUsage } from 'node:process';
import pkg from '../package.json';
import { setTimeout as wait } from 'node:timers/promises';
import DiscordClient from "./client/client";
import { StatusData } from "global/src/types";
import { Routes } from 'discord.js';
import { performance } from 'perf_hooks';
import chalk from 'chalk';

const app = express();
const port = 30061;
const startTime = new Date();
const getUptimeSeconds = () => Math.floor((Date.now() - startTime.getTime()) / 1000);

let currentStatus: StatusData = {
	name: '',
	status: -1
};

export class status {
  async status(client: DiscordClient) {
    try {
			app.get('/', (req, res) => {  
				res.json(currentStatus);
			});
			app.listen(port, "0.0.0.0", () => {
				console.log(chalk.green(' - ✔'),`Status server running at http://localhost:${port}`);
			});
    	while (true) {try{
        const testBot = {
          async status() {
            return client.ws.status === 0;
          },
          async ping() {
            const sT = Date.now();
            try {
              await client.rest.get(Routes.user('@me'));
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
          status: await testBot.status() ? 1 : 0,
          ping: await testBot.ping(),
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

				await wait(2000);
    	}catch(err){ console.error(err) }};
		} catch (err) {
			console.error(err);
		};
  }
}