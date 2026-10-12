import { APIGuild, Locale, RESTPostAPIChannelMessageJSONBody } from "discord.js";
import { User } from "./typeorm/entities/User";
import { GuildConfiguration } from "./typeorm/entities/GuildConfiguration";

export type UserDetails = {
    discordId: string;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
};

export type UserData = {
    // id: string;
    // username: string;
    // global_name: string;
    // avatar: string;
    // banner?: string;
    // locale?: string;

    id: string;
    username: string;
    global_name: string;
    avatar: string;
    banner?: string | null;
    banner_color?: string | null;
    locale?: string;
    discriminator: string;
    public_flags: number;
    flags: number;
    accent_color?: number;
    mfa_enabled: boolean;
    premium_type: number;
    email: string;
    verified: boolean;
    avatar_decoration_data?: any | null;
    clan?: string | null;
};

export type PartialGuild = {
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: string;
    features: string[];
    bot_here: boolean;
    data: APIGuild;
    database: GuildConfiguration | undefined;
};

export type Done = (err: Error, user: User) => void;

export type AuditLogSettings = {
    member_joined: string | null;
    member_leaved: string | null;
    member_banned: string | null;
    member_unbanned: string | null;
    member_kicked: string | null;
    member_role_updated: string | null;
    message_deleted: string | null;
    message_bulk_deleted: string | null;
    message_edited: string | null;
    channel_created: string | null;
    channel_updated: string | null;
    channel_deleted: string | null;
    thread_created: string | null;
    thread_updated: string | null;
    thread_deleted: string | null;
    guild_updated: string | null;
    role_created: string | null;
    role_updated: string | null;
    role_deleted: string | null;
    moderation_command_used: string | null;
    [key: string]: string | null;
};

export type GuildConfig = {
    guildId: string;
    guildSettings?: {
        language: Locale;
        prefix: string;
    };
    welcomeSetting?: {
        welcome?: {
            isEnabled: boolean,
            channel?: { isEnabled: boolean, id?: string, message?: RESTPostAPIChannelMessageJSONBody },
            user?: { isEnabled: boolean, message?: RESTPostAPIChannelMessageJSONBody }
        },
        goodbye?: {
            isEnabled: boolean,
            channel?: { isEnabled: boolean, id?: string, message?: RESTPostAPIChannelMessageJSONBody },
            user?: { isEnabled: boolean, message?: RESTPostAPIChannelMessageJSONBody }
        }
    };
};