import 'dotenv/config';
import { formatDataSize, formatDuration } from 'global/common-functions';
import axios from 'axios';
import nodemailer from 'nodemailer';
import chalk from 'chalk';
import { Client, GatewayIntentBits, GuildTextBasedChannel, EmbedBuilder, Channel, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorSpacingSize, ButtonBuilder, ButtonStyle } from 'discord.js';
import mysql from 'mysql2/promise';
import { backend, bot_main, database, frontend_main, getDatabasePing } from './check.js';
import { StatusData } from 'global';

let isBotRunning = false;

export async function send(to_discord: boolean = true, to_mail: boolean = true, full: boolean = true, data?: StatusData[]) {
	async function send() {
		try{
			const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
			client.once('ready', async () => {
				const channel = client.channels.cache.get('1399765608106688745') as GuildTextBasedChannel;
				if(!channel){ console.error('ไม่พบช่องใน Discord เพื่อส่งแจ้งเตือน'); return; };
				// const botPing = await getBotPing();
				const botStatus = data?.find(v=>v.name == 'bot') || await bot_main();
				const dbStatus = data?.find(v=>v.name == 'database') || await database();
				const backendStatus = data?.find(v=>v.name == 'backend') || await backend();
				const webMainStatus = data?.find(v=>v.name == 'frontend_main') || await frontend_main();
				const getName = (n: string) => {
					const newN = n.split('_').map(n=>n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join(' ');
					return newN;
				};
				const allS = [botStatus.ping, dbStatus.ping, backendStatus.ping];
				// const embed = (new EmbedBuilder()
				// 	.setTitle('เวลาแฝงบอท และ ฐานข้อมูล')
				// 	.addFields(
				// 		{ name: 'Bot Ping', value: `${botPing ? `${botPing} ms` : 'ไม่สามารถเช็ค ping ของบอทได้'}`, inline: true },
				// 		{ name: 'Database Ping', value: `${dbPing ? `${dbPing} ms` : 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้'}`, inline: true }
				// 	)
				// 	.setColor(botPing ? 'Green' : '#ff4c4c')
				// 	.setTimestamp()
				// );
				// await channel.send({ content: `${botPing ? '' : '<@&1227999302278713407>'}`, embeds: [embed] });
				const titleCom = [
					(new TextDisplayBuilder().setContent(`${allS.some(i=>i == undefined) ? '<@&1227999302278713407>\n# Yumi Status' : '# Yumi Status'}`)),
					(new TextDisplayBuilder().setContent(`<t:${Math.floor(Date.now() / 1000)}:d><t:${Math.floor(Date.now() / 1000)}:t>`)),
				];
				const componentsFull = [
					...titleCom,
					(new ContainerBuilder() //bot
						.setAccentColor(botStatus.status == 1 ? 0x32cd32 : 0xff4c4c)
						.addTextDisplayComponents(t=>t.setContent('## Bot Status'))
						.addTextDisplayComponents(t=>t.setContent(` - **${botStatus.status == 1 ? ':green_circle:  กำลังทำงาน' : ':red_circle:  ไม่ทำงาน'}**
${!botStatus.ping ? '-#' : ''} - **Ping**: ${typeof botStatus.ping === 'number' ? `${botStatus.ping} ms` : 'N/A'}
${!botStatus.uptime ? '-#' : ''} - **Uptime**: ${botStatus.uptime ? `${formatDuration(botStatus.uptime * 1000, 'th', 'short')}` : 'N/A'}
${!botStatus.resources?.cpu ? '-#' : ''} - **CPU usage**: ${botStatus.resources?.cpu ? `${botStatus.resources?.cpu.percent}%` : 'N/A'}
${!botStatus.resources?.memory ? '-#' : ''} - **Memory usage**: ${botStatus.resources?.memory ? `${formatDataSize('byte', botStatus.resources?.memory.used, 'short')} / ${formatDataSize('byte', botStatus.resources?.memory.total, 'short')} \`(${botStatus.resources.memory.percent}%)\`` : 'N/A'}
						`))
					),
					(new ContainerBuilder() //database
						.setAccentColor(dbStatus.status == 1 ? 0x32cd32 : 0xff4c4c)
						.addTextDisplayComponents(t=>t.setContent('## Database Status'))
						.addTextDisplayComponents(t=>t.setContent(` - **${dbStatus.status == 1 ? ':green_circle:  กำลังทำงาน' : ':red_circle:  ไม่ทำงาน'}**
${!dbStatus.ping ? '-#' : ''} - **Ping**: ${typeof dbStatus.ping === 'number' ? `${dbStatus.ping} ms` : 'N/A'}
${!dbStatus.uptime ? '-#' : ''} - **Uptime**: ${dbStatus.uptime ? `${formatDuration(dbStatus.uptime * 1000, 'th', 'short')}` : 'N/A'}
						`))
					),
					(new ContainerBuilder() //frontend_main
						.setAccentColor(webMainStatus.status == 1 ? 0x32cd32 : 0xff4c4c)
						.addTextDisplayComponents(t=>t.setContent('## WebsiteMain Status'))
						.addTextDisplayComponents(t=>t.setContent(` - **${webMainStatus.status == 1 ? ':green_circle:  กำลังทำงาน' : ':red_circle:  ไม่ทำงาน'}**
${!webMainStatus.ping ? '-#' : ''} - **Ping**: ${typeof webMainStatus.ping === 'number' ? `${webMainStatus.ping} ms` : 'N/A'}
${!webMainStatus.uptime ? '-#' : ''} - **Uptime**: ${webMainStatus.uptime ? `${formatDuration(webMainStatus.uptime * 1000, 'th', 'short')}` : 'N/A'}
${!webMainStatus.resources?.cpu ? '-#' : ''} - **CPU usage**: ${webMainStatus.resources?.cpu ? `${webMainStatus.resources?.cpu.percent}%` : 'N/A'}
${!webMainStatus.resources?.memory ? '-#' : ''} - **Memory usage**: ${webMainStatus.resources?.memory ? `${formatDataSize('byte', webMainStatus.resources?.memory.used, 'short')} / ${formatDataSize('byte', webMainStatus.resources?.memory.total, 'short')} \`(${webMainStatus.resources.memory.percent}%)\`` : 'N/A'}
						`))
					),
					(new ContainerBuilder() //backend
						.setAccentColor(backendStatus.status == 1 ? 0x32cd32 : 0xff4c4c)
						.addTextDisplayComponents(t=>t.setContent('## Backend Status'))
						.addTextDisplayComponents(t=>t.setContent(` - **${backendStatus.status == 1 ? ':green_circle:  กำลังทำงาน' : ':red_circle:  ไม่ทำงาน'}**
${!backendStatus.ping ? '-#' : ''} - **Ping**: ${typeof backendStatus.ping === 'number' ? `${backendStatus.ping} ms` : 'N/A'}
${!backendStatus.uptime ? '-#' : ''} - **Uptime**: ${backendStatus.uptime ? `${formatDuration(backendStatus.uptime * 1000, 'th', 'short')}` : 'N/A'}
${!backendStatus.resources?.cpu ? '-#' : ''} - **CPU usage**: ${backendStatus.resources?.cpu ? `${backendStatus.resources?.cpu.percent}%` : 'N/A'}
${!backendStatus.resources?.memory ? '-#' : ''} - **Memory usage**: ${backendStatus.resources?.memory ? `${formatDataSize('byte', backendStatus.resources?.memory.used, 'short')} / ${formatDataSize('byte', backendStatus.resources?.memory.total, 'short')} \`(${backendStatus.resources.memory.percent}%)\`` : 'N/A'}
						`))
					)
				];
				const componentsShort = [
					...titleCom,
					...(data?.map(v=>(new ContainerBuilder()
						.setAccentColor(v.status == 1 ? 0x32cd32 : 0xff4c4c)
						.addTextDisplayComponents(t=>t.setContent(`## ${getName(v.name)} Status`))
						.addTextDisplayComponents(t=>t.setContent(` - **${v.status == 1 ? ':green_circle:  กำลังทำงาน' : ':red_circle:  ไม่ทำงาน'}**
${!v.ping ? '-#' : ''} - **Ping**: ${typeof v.ping === 'number' ? `${v.ping} ms` : 'N/A'}
${!v.uptime ? '-#' : ''} - **Uptime**: ${v.uptime ? `${formatDuration(v.uptime * 1000, 'th', 'short')}` : 'N/A'}
${!v.resources?.cpu ? '-#' : ''} - **CPU usage**: ${v.resources?.cpu ? `${v.resources?.cpu.percent}%` : 'N/A'}
${!v.resources?.memory ? '-#' : ''} - **Memory usage**: ${v.resources?.memory ? `${formatDataSize('byte', v.resources?.memory.used, 'short')} / ${formatDataSize('byte', v.resources?.memory.total, 'short')} \`(${v.resources.memory.percent}%)\`` : 'N/A'}
						`))
					)) || [])
				];
				if(to_discord)await channel.send({ components: full ? componentsFull : componentsShort, flags: MessageFlags.IsComponentsV2 });
				client.destroy();
			});
			await client.login(process.env.BOT_TOKEN);
		}catch(error){
			console.error('ไม่สามารถส่งข้อความไปที่ Discord ได้:', error);
		}
	};

	await send();
};