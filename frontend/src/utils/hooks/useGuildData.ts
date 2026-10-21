import { useContext } from "react";
import useSWR from "swr";
import { UserContext } from "../contexts/Contexts";
import { getGuildInfo, getGuildOverview, getGuildSettings, getGuildWelcome, getMutualGuilds, getMutualGuildsLocalhost } from "../api";
import { PartialGuild } from "../types";

const fetchGuildList = async (): Promise<PartialGuild[]> => {
    const { data } = window.location.hostname == process.env.NEXT_PUBLIC_HOSTNAME
        ? await getMutualGuilds()
        : await getMutualGuildsLocalhost();
    return data;
};

// ดึงเฉพาะรายการ Guild ของ User เมื่อ login แล้วเท่านั้น
export function useGuildList() {
    const { user } = useContext(UserContext);
    const { data, error, isLoading, isValidating, mutate } = useSWR(user ? 'guilds' : null, fetchGuildList, { errorRetryCount: 1, errorRetryInterval: 5000 });
    return { guilds: data, loadingGuilds: isLoading || isValidating, errorGuilds: error ? `${error}` : undefined, refreshGuilds: () => mutate() };
}

const useGuildPage = <T,>(page: string, fetcher: (guildId: string) => Promise<T>, guildId?: string) =>
    useSWR(guildId ? [page, guildId] : null, ([, id]) => fetcher(id as string));

export const useGuildInfo = (guildId?: string) => useGuildPage('guild-info', getGuildInfo, guildId);
export const useGuildOverview = (guildId?: string) => useGuildPage('guild-overview', getGuildOverview, guildId);
export const useGuildSettings = (guildId?: string) => useGuildPage('guild-settings', getGuildSettings, guildId);
export const useGuildWelcome = (guildId?: string) => useGuildPage('guild-welcome', getGuildWelcome, guildId);
