import axios, { AxiosRequestConfig } from 'axios';
import { PartialGuild, AuthStatus, Commands } from './types';
import { APIGuildChannel, ChannelType } from 'discord-api-types/v10';

const CONFIG: AxiosRequestConfig = {
  withCredentials: true,
};

export const getAuthStatus = () => axios.get<AuthStatus>(`${process.env.NEXT_PUBLIC_API_DOMAIN}/auth/status`, CONFIG);
export const getAuthStatusLocalhost = () => axios.get<AuthStatus>(`${process.env.NEXT_PUBLIC_API_IP_URL}/auth/status`, CONFIG);

export const postAuthLogout = () => axios.post(`${process.env.NEXT_PUBLIC_API_DOMAIN}/auth/logout`, {}, CONFIG);
export const postAuthLogoutLocalhost = () => axios.post(`${process.env.NEXT_PUBLIC_API_IP_URL}/auth/v2/logout`, {}, CONFIG);

export const getMutualGuilds = () => axios.get<PartialGuild[]>(`${process.env.NEXT_PUBLIC_API_DOMAIN}/discord/user/guilds`, CONFIG);
export const getMutualGuildsLocalhost = () => axios.get<PartialGuild[]>(`${process.env.NEXT_PUBLIC_API_IP_URL}/discord/user/guilds`, CONFIG);

export const checkToken = ( id: string, discordId: string, accessToken: string, refreshToken: string ) =>
axios.post<{ statusCode: string, message: string, error: string | undefined }>(
  `${process.env.NEXT_PUBLIC_API_DOMAIN}/auth/checkToken`,
  { id, discordId, accessToken, refreshToken },
  CONFIG
);
export const checkTokenLocalhost = ( id: string, discordId: string, accessToken: string, refreshToken: string ) =>
axios.post<{ statusCode: string, message: string, error: string | undefined }>(
  `${process.env.NEXT_PUBLIC_API_IP_URL}/auth/checkToken`,
  { id, discordId, accessToken, refreshToken },
  CONFIG
);

export const getBotCommands = () => axios.post<Commands>(`${process.env.NEXT_PUBLIC_API_DOMAIN}/bot/commands`, CONFIG);
export const getBotCommandsLocalhost = () => axios.post<Commands>(`${process.env.NEXT_PUBLIC_API_IP_URL}/bot/commands`, CONFIG);

export const getGuildChannel = (guildId: string) => axios.post< | APIGuildChannel<ChannelType.GuildText> | APIGuildChannel<ChannelType.GuildVoice> | APIGuildChannel<ChannelType.GuildCategory> | APIGuildChannel<ChannelType.GuildAnnouncement> | APIGuildChannel<ChannelType.GuildForum> | APIGuildChannel<ChannelType.GuildStageVoice>[]>(`${process.env.NEXT_PUBLIC_API_DOMAIN}/guilds/${guildId}/channels`, CONFIG);
export const getGuildChannelLocalhost = (guildId: string) => axios.post< | APIGuildChannel<ChannelType.GuildText> | APIGuildChannel<ChannelType.GuildVoice> | APIGuildChannel<ChannelType.GuildCategory> | APIGuildChannel<ChannelType.GuildAnnouncement> | APIGuildChannel<ChannelType.GuildForum> | APIGuildChannel<ChannelType.GuildStageVoice>[]>(`${process.env.NEXT_PUBLIC_API_IP_URL}/guilds/${guildId}/channels`, CONFIG);
