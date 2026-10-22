import cron from 'node-cron';
import { send } from './send.js';
import { backend, bot_main, database, frontend_main, checkAll as _checkAll } from './check.js';
import chalk from 'chalk';
import { StatusData } from 'global/types';
import express from 'express';
import { capitalize, formatDuration } from 'global/common-functions';

let allS: StatusData[] = [];
let prevS: StatusData[] = [];
let changedStatus: StatusData[] = [];
// let StatusAllRunning = false;
const isDev = process.env.IS_DEV === 'true';
const port = isDev ? 30006 : 3006;
const app = express();

async function checkAll() {
	console.log(`${chalk.gray(`[${(new Date()).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit', })}]`)} Checking status...`);
	try{
		allS = await _checkAll(false);

		changedStatus = allS.filter(current => {
			const prevStatus = prevS.find(s => s.name === current.name)?.status;
			return prevStatus !== current.status;
		});
		console.log(changedStatus);

		if(changedStatus.length > 0){
			await send(true, undefined, false, changedStatus);

			// if(allS.some(s => s.status === 1) && !StatusAllRunning){
			// 	StatusAllRunning = true;
			// 	await send(true, undefined, false, changedStatus);
			// }
		};

		if(allS.some(s => s.status === 0))throw new Error('Some service down');

		// if(allS.some(s => s.status === 1) && !StatusAllRunning){
		// 	StatusAllRunning = true;
		// 	await send(undefined, undefined, allS);
		// }
	}catch(err: any){
		console.error(`Error during status check: ${err}`);
		// if(StatusAllRunning){
			// StatusAllRunning = false;
			// await send();
			// await send(true, undefined, false, changedStatus);
		// };
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

app.get('/', (req, res) => {
	res.send(`<html>
<head>
	<meta charset="utf-8" />
		<link rel="icon" href="https://assets.camming.xyz/photos/logo/CammingLogo.webp" />
		<link href='https://fonts.googleapis.com/css?family=Kanit' rel='stylesheet'>
	<meta name="theme-color" content="#f13b3b" />
<title>Camming - Status</title>
</head>
<body style="position: fixed; top: 0; left: 0; z-index: -100; background: linear-gradient(160deg, rgb(158, 0, 0) 0%, rgb(61, 0, 0) 40%, rgb(0, 0, 0) 100%); height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffff; font-family: Kanit; ">
	<h1>Welcome To Status Page</h1>
	<div>
		${allS.map((status) => {
			return(`<a translate="no" href="/${status.name}" target="_top" style="padding: 10px; margin: 10px; border-radius: 10px; background-color: #ce2d2d; box-shadow: 3px 3px 5px 0px black; border: none; color: #fff; font-weight: bold; cursor: pointer; text-decoration: none;">${capitalize((status.name.split('_')).join(' '))}</a>`);
		}).join('')}
	</div>
</body>
</html>`);
});
app.get(`/:name`, (req, res) => {
	const name = req.params.name;
	const status = allS.find(s => s.name === name);
	if(status){res.status(status.status == 1 ? 200 : 503).send(`<html>
<head>
	<meta charset="utf-8" />
	<link rel="icon" href="https://assets.camming.xyz/photos/logo/CammingLogo.webp" />
	<link href='https://fonts.googleapis.com/css?family=Kanit' rel='stylesheet'>
	<meta name="theme-color" content="#f13b3b" />
	<title>Camming - Status (${status.name})</title>
</head>
<body style=" position: fixed; top: 0; left: 0; z-index: -100; background: linear-gradient(160deg, rgb(158, 0, 0) 0%, rgb(61, 0, 0) 40%, rgb(0, 0, 0) 100%); height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffff; font-family: Kanit; ">
	<div style="display: flex; flex-direction: row; position: fixed; top: 10px; left: 10px;">
		<a href="/" target="_top" style="height: 30px; width: 30px; padding: 5px; margin: 5px; border: solid 3px #ffc3c3; border-radius: 15px; cursor: pointer;"><svg viewBox="0 0 1024.00 1024.00" class="icon" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff" stroke-width="76.8"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#ffffff" d="M224 480h640a32 32 0 110 64H224a32 32 0 010-64z"></path><path fill="#ffffff" d="M237.248 512l265.408 265.344a32 32 0 01-45.312 45.312l-288-288a32 32 0 010-45.312l288-288a32 32 0 1145.312 45.312L237.248 512z"></path></g></svg></a>
		<div onclick="location.reload()" style="height: 30px; width: 30px; padding: 5px; margin: 5px; border: solid 3px #ffc3c3; border-radius: 15px; cursor: pointer;"><svg fill="#ffffff" viewBox="-2.4 -2.4 28.80 28.80" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="1.2"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M1,12A11,11,0,0,1,17.882,2.7l1.411-1.41A1,1,0,0,1,21,2V6a1,1,0,0,1-1,1H16a1,1,0,0,1-.707-1.707l1.128-1.128A8.994,8.994,0,0,0,3,12a1,1,0,0,1-2,0Zm21-1a1,1,0,0,0-1,1,9.01,9.01,0,0,1-9,9,8.9,8.9,0,0,1-4.42-1.166l1.127-1.127A1,1,0,0,0,8,17H4a1,1,0,0,0-1,1v4a1,1,0,0,0,.617.924A.987.987,0,0,0,4,23a1,1,0,0,0,.707-.293L6.118,21.3A10.891,10.891,0,0,0,12,23,11.013,11.013,0,0,0,23,12,1,1,0,0,0,22,11Z"></path></g></svg></div>
	</div>

	<div style="margin: 0; padding-bottom: 10px; color: #ffd1d1; font-weight: 900; font-size: xxx-large;">${capitalize((status.name.split('_')).join(' '))}</div>
	<div style="font-weight: bold; color: #fff; display: flex; flex-direction: row; font-size: medium;">Status: <div style="font-weight: normal; padding-left: 5px; color: ${status.status == 1 ? 'springgreen' : status.status == -1 ? 'deepskyblue' : 'lightcoral'};">${status.status == 1 ? 'Running' : status.status == -1 ? 'Loading' : 'Stopped'}</div></div>
	<div style="font-weight: bold; color: #fff; display: flex; flex-direction: row; font-size: medium;">Ping: <div style="font-weight: normal; padding-left: 5px;">${status.ping ? `${status.ping} ms` : `N/A`}</div></div>
	<div style="font-weight: bold; color: #fff; display: flex; flex-direction: row; font-size: medium;">Uptime: <div style="font-weight: normal; padding-left: 5px;">${status.uptime ? `${formatDuration((status.uptime * 1000), 'en-US', 'short')}` : `N/A`}</div></div>
	<div style="font-weight: bold; color: lightgray; display: flex; flex-direction: row; font-size: smaller;">v. <div style="font-weight: normal; padding-left: 5px;">${status.version ? `${status.version}` : `N/A`}</div></div>
</body>
</html>`)}else{res.status(404).send('Status Not Found')};
});

try {
	app.listen(port);
	console.log(`Status server running on PORT: ${port}`);
} catch (err) {
	console.log(err);
}

cron.schedule('0 12 * * *', () => send());
