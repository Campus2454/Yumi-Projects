import axios, { AxiosRequestConfig } from 'axios';
import { PartialGuild, AuthStatus, Commands } from './types';
import { APIGuildChannel, ChannelType } from 'discord-api-types/v10';

const CONFIG: AxiosRequestConfig = {
  withCredentials: true,
};

export const getAuthStatus = () => axios.get<AuthStatus>('https://api.yumistack.net/auth/status', CONFIG);
// export const getAuthStatusLocalhost = () => axios.get<AuthStatus>('http://148.113.174.253:3001/auth/status', CONFIG);
export const getAuthStatusLocalhost = () => axios.get<AuthStatus>('http://localhost:3001/auth/status', CONFIG);

export const postAuthLogout = () => axios.post('https://api.yumistack.net/auth/logout', {}, CONFIG);
// export const postAuthLogoutLocalhost = () => axios.post('http://148.113.174.253:3001/auth/v2/logout', {}, CONFIG);
export const postAuthLogoutLocalhost = () => axios.post('http://localhost:3001/auth/v2/logout', {}, CONFIG);

export const getMutualGuilds = () => axios.get<PartialGuild[]>('https://api.yumistack.net/discord/user/guilds', CONFIG);
// export const getMutualGuildsLocalhost = () => axios.get<PartialGuild[]>('http://148.113.174.253:3001/discord/user/guilds', CONFIG);
export const getMutualGuildsLocalhost = () => axios.get<PartialGuild[]>('http://localhost:3001/discord/user/guilds', CONFIG);

export const checkToken = ( id: string, discordId: string, accessToken: string, refreshToken: string ) =>
axios.post<{ statusCode: string, message: string, error: string | undefined }>(
  'https://api.yumistack.net/auth/checkToken',
  { id, discordId, accessToken, refreshToken },
  CONFIG
);
export const checkTokenLocalhost = ( id: string, discordId: string, accessToken: string, refreshToken: string ) =>
axios.post<{ statusCode: string, message: string, error: string | undefined }>(
  // 'http://148.113.174.253:3001/auth/checkToken',
  'http://localhost:3001/auth/checkToken',
  { id, discordId, accessToken, refreshToken },
  CONFIG
);

export const getBotCommands = () => axios.post<Commands>('https://api.yumistack.net/bot/commands', CONFIG);
export const getGuildChannel = (guildId: string) => axios.post< | APIGuildChannel<ChannelType.GuildText> | APIGuildChannel<ChannelType.GuildVoice> | APIGuildChannel<ChannelType.GuildCategory> | APIGuildChannel<ChannelType.GuildAnnouncement> | APIGuildChannel<ChannelType.GuildForum> | APIGuildChannel<ChannelType.GuildStageVoice>[]>(`https://api.yumistack.net/guilds/${guildId}/channels`, CONFIG);
