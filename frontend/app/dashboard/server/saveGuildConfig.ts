import axios from "axios";
import { GuildConfig } from "@/src/utils/types";

const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
const apiIp = process.env.NEXT_PUBLIC_API_IP_URL;

export const saveGuildConfig = async (config: GuildConfig) => {
    try {
        const url = typeof window !== 'undefined' && window.location.hostname === hostname
            ? `${apiDomain}/discord/guilds/settings`
            : `${apiIp}/discord/guilds/settings`;
        const res = await axios.post<{ config: any; statusText: string | null; error: string | null }>(
            url,
            config,
            { withCredentials: true }
        );
        if (res.status === 200) {
            return res.data;
        } else {
            throw res.data;
        }
    } catch (error) {
        throw axios.isAxiosError(error) && error.response ? error.response.data : `SaveGuildConfigError: ${error}`;
    }
};
