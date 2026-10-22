import 'dotenv/config';
import { formatDataSize, formatDuration } from 'global/common-functions';
import { Client, GatewayIntentBits, GuildTextBasedChannel, MessageFlags, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import nodemailer from 'nodemailer';
import { LocalStatusData } from './automatic.js';
import { backend, bot_main, database, frontend_main } from './check.js';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function send(to_discord: boolean = true, to_mail: boolean = true, full: boolean = true, data?: LocalStatusData[]) {
	const getName = (n: string) => n.split('_').map(n=>n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join(' ');

    const statusData = data || (await Promise.all([bot_main(), database(), frontend_main(), backend()])) as LocalStatusData[];

    if (to_mail && process.env.SMTP_USER && statusData.length > 0) {
        try {
            const emailRows = statusData.map(v => {
                const isUp = v.status === 1;
                const color = isUp ? '#10b981' : '#ef4444';
                const statusTxt = isUp ? 'Operational' : 'Outage';
                
                let durationHtml = '';
                if (isUp) {
                    durationHtml = `<br/><b>Current Uptime:</b> ${v.computedUptime ? formatDuration(v.computedUptime * 1000, 'en-US', 'short') : 'N/A'}`;
                    if (v.lastDowntimeDuration) durationHtml += ` | <b>Last Downtime:</b> ${formatDuration(v.lastDowntimeDuration * 1000, 'en-US', 'short')}`;
                } else {
                    durationHtml = `<br/><b>Current Downtime:</b> ${v.computedDowntime ? formatDuration(v.computedDowntime * 1000, 'en-US', 'short') : 'N/A'}`;
                    if (v.lastUptimeDuration) durationHtml += ` | <b>Last Uptime:</b> ${formatDuration(v.lastUptimeDuration * 1000, 'en-US', 'short')}`;
                }

                return `
                <div style="background: #ffffff; padding: 20px; border-radius: 12px; border-left: 6px solid ${color}; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${getName(v.name)}</h3>
                    <p style="margin: 0; color: #4b5563; font-size: 14px;">
                        Status: <strong style="color: ${color}">${statusTxt}</strong> 
                        ${v.statusCode ? `(Code: ${v.statusCode})` : ''}
                        ${durationHtml}
                    </p>
                </div>`;
            }).join('');

            const mailHtml = `
            <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #111827; margin: 0;">Yumi Status Alert</h1>
                        <p style="color: #6b7280; margin-top: 5px;">Automated infrastructure monitoring</p>
                    </div>
                    ${emailRows}
                    <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
                        <p>You received this email because you are subscribed to Yumi Status alerts.</p>
                    </div>
                </div>
            </div>`;

            await transporter.sendMail({
                from: '"Yumi Monitor" <no-reply@yumistack.net>',
                to: 'thirphathrphlphun@gmail.com',
                subject: `[Yumi] Alert: Service Status Update`,
                html: mailHtml
            });
            console.log('✅ Email alert sent successfully.');
        } catch (error) {
            console.error('❌ Failed to send email alert:', error);
        }
    }

	if (to_discord) {
        try {
            const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
            client.once('ready', async () => {
                const channel = client.channels.cache.get('1399765608106688745') as GuildTextBasedChannel;
                if(!channel) return;

                const isAnyDown = statusData.some(i => i.status === 0);
                const titleCom = [
                    (new TextDisplayBuilder().setContent(`${isAnyDown ? '<@&1227999302278713407>\n# ⚠️ Yumi Status Alert' : '# 🟢 Yumi Status Update'}`)),
                    (new TextDisplayBuilder().setContent(`<t:${Math.floor(Date.now() / 1000)}:f>`)),
                ];

                const buildContainer = (v: LocalStatusData) => {
                    const isUp = v.status == 1;
                    
                    let timeStats = '';
                    if (isUp) {
                        timeStats = `${!v.computedUptime ? '-#' : ''} - **Uptime**: ${v.computedUptime ? `${formatDuration(v.computedUptime * 1000, 'th', 'short')}` : 'N/A'}\n`;
                        if (v.lastDowntimeDuration) timeStats += ` - **Last Downtime**: ${formatDuration(v.lastDowntimeDuration * 1000, 'th', 'short')}\n`;
                    } else {
                        timeStats = `${!v.computedDowntime ? '-#' : ''} - **Downtime**: ${v.computedDowntime ? `${formatDuration(v.computedDowntime * 1000, 'th', 'short')}` : 'N/A'}\n`;
                        if (v.lastUptimeDuration) timeStats += ` - **Last Uptime**: ${formatDuration(v.lastUptimeDuration * 1000, 'th', 'short')}\n`;
                    }

                    return (new ContainerBuilder()
                        .setAccentColor(isUp ? 0x10b981 : 0xef4444)
                        .addTextDisplayComponents(t=>t.setContent(`## ${getName(v.name)} Status`))
                        .addTextDisplayComponents(t=>t.setContent(` - **${isUp ? ':green_circle: Online' : ':red_circle: Offline'}** ${v.statusCode ? `(Code: ${v.statusCode})` : ''}
${!v.ping ? '-#' : ''} - **Ping**: ${typeof v.ping === 'number' ? `${v.ping} ms` : 'N/A'}
${timeStats}${full && v.resources?.cpu ? `- **CPU usage**: ${v.resources.cpu.percent}%\n- **Memory**: ${formatDataSize('byte', v.resources.memory.used, 'short')} / ${formatDataSize('byte', v.resources.memory.total, 'short')}` : ''}
                        `))
                    );
                };

                const components = [...titleCom, ...statusData.map(v => buildContainer(v))];
                
                await channel.send({ components, flags: MessageFlags.IsComponentsV2 });
                client.destroy();
            });
            await client.login(process.env.BOT_TOKEN);
        } catch(error) {
            console.error('ไม่สามารถส่งข้อความไปที่ Discord ได้:', error);
        }
    }
};