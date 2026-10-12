import { Injectable } from "@nestjs/common";
import { IDiscordHttpService } from "../interfaces/discord-http";
import axios from 'axios';
import { PartialGuild, UserData } from "src/utils/types";
import { APIGuild, APIGuildChannel, APIGuildMember } from "discord.js";

@Injectable()
export class DiscordHttpService implements IDiscordHttpService {
    fetchBotGuilds(){
        const TOKEN = process.env.DISCORD_BOT_TOKEN;
        return axios.get<PartialGuild[]>('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bot ${TOKEN}`,
            }
        });
    }
    fetchUserGuilds(accessToken: string){
        return axios.get<PartialGuild[]>('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
    }
    fetchUserData(accessToken: string){
        return axios.get<UserData>('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
    }
    fetchGuildData(id: string){
        const TOKEN = process.env.DISCORD_BOT_TOKEN;
        return axios.get<APIGuild>(`https://discord.com/api/guilds/${id}`, {
            headers: {
                Authorization: `Bot ${TOKEN}`,
            }
        });
    }
    fetchGuildChannels(guildId: string){
        const TOKEN = process.env.DISCORD_BOT_TOKEN;
        return axios.get<APIGuildChannel<any>[]>(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
            headers: {
                Authorization: `Bot ${TOKEN}`,
            },
        });
    }
    fetchGuildMembers(guildId: string){
        const TOKEN = process.env.DISCORD_BOT_TOKEN;
        return axios.get<APIGuildMember[]>(`https://discord.com/api/v10/guilds/${guildId}/members`, {
            headers: {
                Authorization: `Bot ${TOKEN}`,
            },
        });
    }
}