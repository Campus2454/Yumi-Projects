import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Client, GatewayIntentBits, Locale } from "discord.js";
import { Response } from "express";
import { GuildConfiguration } from "src/utils/typeorm/entities/GuildConfiguration";
import { GuildConfig } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class GuildConfigService {
    private client: Client;
    constructor(
        @InjectRepository(GuildConfiguration) private readonly guildConfigRepository: Repository<GuildConfiguration>
    ){
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                // GatewayIntentBits.GuildMembers,
            ],
        });
        this.client.login(process.env.DISCORD_BOT_TOKEN);
        this.client.once('clientReady', () => {
            console.log('GuildConfigService: Discord bot is online!');
        });
    }

    async setConfig(config: GuildConfig, res: Response) {
        if(!config.guildId)return;
        if(config.guildSettings){
            if(!config.guildSettings.language)return;
            if(!config.guildSettings.prefix)return;
            try{
                const guildConfig = await this.guildConfigRepository.findOne({ where: { guildId: config.guildId } });
                guildConfig.prefix = config.guildSettings.prefix;
                const saveConfig = await this.guildConfigRepository.save(guildConfig);
                let newLocale = null;
                let newGuildConfig = { config: null, statusText: null, error: null };
                const guild = await (await this.client.guilds.fetch()).get(config.guildId).fetch();
                if(guild && Object.values(Locale).includes(config.guildSettings.language as Locale)){
                    const locale = config.guildSettings.language as Locale;
                    try{
                        guild.setPreferredLocale(locale);
                    }catch(error){
                        newGuildConfig.error = 'Bot cannot save locale values to guild.';
                    }finally{
                        const guild = await (await this.client.guilds.fetch()).get(config.guildId).fetch();
                        newLocale = guild.preferredLocale ? guild.preferredLocale : null;
                    }
                };
                newGuildConfig.config = { ...saveConfig.toJSON(), language: newLocale };
                newGuildConfig.statusText = 'Saved Config Successfully';
                return res.status(200).json(newGuildConfig);
            }catch(error){
                if(error.response?.status === 429){
                    return res.status(429).send('Rate limit exceeded. Please try again later.');
                };
                return res.status(500).json({ error: 'An unexpected error occurred.' });
            };
        }else if(config.welcomeSetting){
            try{
                const guildConfig = await this.guildConfigRepository.findOne({ where: { guildId: config.guildId } });
                guildConfig.welcomeSetting = config.welcomeSetting;
                const saveConfig = await this.guildConfigRepository.save(guildConfig);
                let newGuildConfig = { config: saveConfig.toJSON(), statusText: 'Saved Config Successfully', error: null };
                return res.status(200).json(newGuildConfig);
            }catch(error){
                if(error.response?.status === 429){
                    return res.status(429).send('Rate limit exceeded. Please try again later.');
                };
                return res.status(500).send(`${error.message || error.sqlMessage || error}`);
            }
        };

        return res.status(404).send('Error: 404 Not Found');
    }

    async getConfig(guildId: string, res: Response) {
        return res.status(404).send('Error: This function is not supported at this time.');
    }

    async delConfig(config: GuildConfig, res: Response) {
        return res.status(404).send('Error: This function is not supported at this time.');
    }
}