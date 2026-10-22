import axios, { AxiosRequestConfig } from 'axios';
import { PartialGuild, AuthStatus, Commands } from './types';
import { GuildInfoDTO, GuildOverviewDTO, GuildSettingsDTO, GuildWelcomeDTO } from 'global';
import { APIGuildChannel, ChannelType } from 'discord-api-types/v10';
import Cookies from 'js-cookie';
import { Router } from 'next/router';

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

const apiBase = () => window.location.hostname == process.env.NEXT_PUBLIC_HOSTNAME ? process.env.NEXT_PUBLIC_API_DOMAIN : process.env.NEXT_PUBLIC_API_IP_URL;
const getGuildPage = <T>(guildId: string, page: 'info' | 'overview' | 'settings' | 'welcome') =>
  axios.get<T>(`${apiBase()}/discord/guilds/${guildId}/${page}`, CONFIG).then(({ data }) => data);

export const getGuildInfo = (guildId: string) => getGuildPage<GuildInfoDTO>(guildId, 'info');
export const getGuildOverview = (guildId: string) => getGuildPage<GuildOverviewDTO>(guildId, 'overview');
export const getGuildSettings = (guildId: string) => getGuildPage<GuildSettingsDTO>(guildId, 'settings');
export const getGuildWelcome = (guildId: string) => getGuildPage<GuildWelcomeDTO>(guildId, 'welcome');

export const apiStatusPaths = [ "bot", "backend", "frontend_main", "database", ] as const;
export type apiStatusPath = (typeof apiStatusPaths)[number];
export const getStatus = (path: apiStatusPath) => axios.get(`${process.env.NEXT_PUBLIC_STATUS_DOMAIN}/${path}`);
