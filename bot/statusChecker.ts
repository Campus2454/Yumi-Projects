require('dotenv').config();
import axios from 'axios';
import nodemailer from 'nodemailer';
import chalk from 'chalk';
import { Client, GatewayIntentBits, GuildTextBasedChannel, EmbedBuilder, Channel } from 'discord.js';
import cron from 'node-cron';
import mysql from 'mysql2/promise';
import express, { Request, Response } from 'express';
const app = express();
const port = 30051;

let isBotRunning = false;
let status = 'offline';
let startTimeBot: number | null = null;
const startTime = Date.now();

async function checkServerStatus() {
    try{
        const response = await axios.get('http://localhost:3005');
        if(response.status === 200){
            if(!isBotRunning){
                console.log(`\n${chalk.green('- ✔ ')}เช็คเรียบร้อย  ${chalk.yellow(`เวลา: ${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}`)}          `);
                console.log(chalk.green('    - เซิร์ฟเวอร์บอททำงาน'));
                isBotRunning = true;
            }else if(isBotRunning){
                process.stdout.write(`\r${chalk.green('- ✔ ')}ตรวจสอบใหม่เรียบร้อย  ${chalk.yellow(`เวลา: ${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}`)}`);
            };
        };
    }catch(error){
        if(isBotRunning){
            console.error(`\n${chalk.red('- ✖ ')}เช็คเรียบร้อย  ${chalk.yellow(`เวลา: ${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}`)}          `);
            console.error(chalk.red('    - ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้:', error));

            try{
                const res = await fetch('http://localhost:3005');
                if(res.ok){
                    return process.stdout.write(`\r${chalk.green('- ✔ ')}ตรวจสอบใหม่เรียบร้อย  ${chalk.yellow(`เวลา: ${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}`)}`);
                }else{
                    sendEmailAlert();
                    notifyDiscord();
                    isBotRunning = false;
                }
            }catch(error){
                console.error(chalk.red('    - ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้:', error));
                sendEmailAlert();
                notifyDiscord();
                isBotRunning = false;
            }
        }else if(!isBotRunning){
            process.stdout.write(`\r${chalk.red('- ✖ ')}ตรวจสอบใหม่เรียบร้อย  ${chalk.yellow(`เวลา: ${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}`)}`);
        };
    };
};function sendEmailAlert() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: 'thirphathrphlphun@gmail.com',
        subject: 'แจ้งเตือน: เซิร์ฟเวอร์บอทไม่ทำงาน',
        text: 'ไม่สามารถเข้าถึงเซิร์ฟเวอร์ที่รันบอทได้ กรุณาตรวจสอบสถานะของบอท'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('    - ไม่สามารถส่งอีเมลแจ้งเตือนได้:', error);
        } else {
            console.log('    - ส่งอีเมลแจ้งเตือนสำเร็จ:', info.response);
        }
    });

};async function notifyDiscord() {
    try {
        const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
        client.once('ready', async () => {
            const channel = client.channels.cache.get('1134030324985253908') as GuildTextBasedChannel;
            if (!channel) {
                console.error('    - ไม่พบช่องใน Discord');
                return;
            };
            await channel.send({
                content: '<@&1227999302278713407><@879724821662015499> บอท<@1210178730836893719> กำลัง Offline! โปรดตรวจสอบสถานะของบอท'
            });
            console.log('    - ส่งแจ้งเตือนไปที่ Discord สำเร็จ');
            client.destroy();
        });
        await client.login(process.env.BOT_TOKEN3);
    } catch (error) {
        console.error('    - ไม่สามารถส่งข้อความผิดพลาดไปที่ Discord ได้:', error);
    }
};async function getBotPing() {
    try{
        const botResponse = await axios.get('http://localhost:3005/ping');
        return botResponse.data;
    }catch(error){
        console.error('    - ไม่สามารถเช็ค ping ของบอทได้:');
        return null;
    }
};async function getDatabasePing() {
    try{
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_DB_HOST,
            user: process.env.MYSQL_DB_USER,
            password: process.env.MYSQL_DB_PASSWORD,
            database: process.env.MYSQL_DB_DATABASE,
        });

        const start = Date.now();
        await connection.query('SELECT 1');
        const ping = Date.now() - start;

        await connection.end();
        return ping;
    }catch(error){
        console.error('    - ไม่สามารถเชื่อมต่อฐานข้อมูลได้:', error);
        return null;
    }
};async function notifyDailyPing() {
    try{
        const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
        client.once('ready', async () => {
            const channel = client.channels.cache.get('1291698538912284683') as GuildTextBasedChannel;
            if(!channel){ console.error('    - ไม่พบช่องใน Discord เพื่อส่งแจ้งเตือนประจำวัน'); return; };
            const botPing = await getBotPing();
            const dbPing = await getDatabasePing();
            const embed = new EmbedBuilder()
                .setTitle('เวลาแฝงบอท และ ฐานข้อมูล')
                .addFields(
                    { name: 'Bot Ping', value: `${botPing ? `${botPing} ms` : 'ไม่สามารถเช็ค ping ของบอทได้'}`, inline: true },
                    { name: 'Database Ping', value: `${dbPing ? `${dbPing} ms` : 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้'}`, inline: true }
                )
                .setColor(botPing ? 'Green' : '#ff4c4c')
                .setTimestamp()
            ;
            await channel.send({ content: `${botPing ? '' : '<@&1227999302278713407>'}`, embeds: [embed] });
            client.destroy();
        });
        await client.login(process.env.BOT_TOKEN3);
    }catch(error){
        console.error('    - ไม่สามารถส่งข้อความสถานะประจำวันไปที่ Discord ได้:', error);
    }
};async function uptimeBot() {
    try{
        const response = await axios.get('http://localhost:3005');
        if(response.status === 200){
            if(status === 'offline'){
                status = 'online';
                startTimeBot = Date.now();
            };
        }else{
            if(status === 'online'){
                status = 'offline';
                startTimeBot = Date.now();
            };
        };
    }catch(err: any){
        console.error(`\n${chalk.red(`    - ${err.message}`)}`);
    };
};

app.get('/uptimeBot', (req: Request, res: Response) => {
    res.send(startTimeBot ? `${(Date.now() - startTimeBot)}` : 'N/A');
});
app.get('/start', (req: Request, res: Response) => {
    res.send(`${startTime}`);
});
app.listen(port, () => {
    console.log(`${chalk.green('- ✔ ')}Server is running on port ${port}`);
});

notifyDailyPing();
cron.schedule('0 12 * * *', notifyDailyPing);
setInterval(checkServerStatus, 10_000);
uptimeBot();setInterval(uptimeBot, 60_000);