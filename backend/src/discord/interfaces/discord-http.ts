import { AxiosResponse } from "axios";
import { APIGuild, APIGuildChannel, APIGuildMember } from "discord.js";
import { PartialGuild, UserData } from "src/utils/types";

export interface IDiscordHttpService {
    fetchBotGuilds(): Promise<AxiosResponse<PartialGuild[]>>;
    fetchUserGuilds(accessToken: string): Promise<AxiosResponse<PartialGuild[]>>;
    fetchUserData(accessToken: string): Promise<AxiosResponse<UserData>>;
    fetchGuildData(guildId: string): Promise<AxiosResponse<APIGuild>>;
    fetchGuildChannels(guildId: string): Promise<AxiosResponse<APIGuildChannel<any>[]>>;
    fetchGuildMembers(guildId: string): Promise<AxiosResponse<APIGuildMember[]>>;
}