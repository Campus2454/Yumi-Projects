import { Activity, ActivityType, ApplicationCommand, Client, Collection, GatewayIntentBits, GuildResolvable, PresenceStatusData } from 'discord.js';
import { Response } from 'express';

export class BotService {
    private client: Client;
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
            ],
        });
        this.client.login(process.env.DISCORD_BOT_TOKEN);
        this.client.once('clientReady', (client) => {
            console.log('BotService: Discord bot is online!');
        });
    }

    async setBotStatus(res: Response, status?: PresenceStatusData | undefined, activity?: Activity | undefined) {
        try{
            console.log('ready', new Date().toUTCString());
            this.client.user.setPresence({
                status: status || 'online',
            });

            return res.status(200).json({ message: `Status updated successfully!`, status: this.client.user.presence.toJSON() });
        }catch(error){
            throw new Error(`Error setting bot status and activity, Error: ${error}`);
        }
    }

    async getBotCommands() {
        try{
            let commands: Collection<string, ApplicationCommand<{ guild: GuildResolvable; }>> | undefined;

            return await this.client.application.commands.fetch().then(cmd => { return cmd; }).catch(err => { console.error(err); });

            return commands;
        }catch(error){
            throw new Error(`Error: ${error}`);
        }
    }
}