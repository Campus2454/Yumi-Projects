import { APIGuild, APIEmbed, Locale, Snowflake, APIApplicationCommand, APIGuildChannel, ChannelType, RESTPostAPIChannelMessageJSONBody, APIGuildMember, APIRole, APIUser } from "discord-api-types/v10";
import { GuildDTO, MutualGuildDTO } from "global";

export type User = {
    id: string;
    username: string;
    global_name: string;
    avatar: string;
    banner?: string;
    locale?: string;
    discriminator: string;
    public_flags: string;
    flags: string;
    accent_color: string;
    avatar_decoration_data: string;
    banner_color: string;
    clan: string;
}

type Activities = [{
    name: string,
    type: number,
    details: string | null,
    state: string | null,
    emoji: {
        animated: boolean | null;
        id: Snowflake | null;
        name: string | null;
        imageURL: string | null;
    } | null,
    timestamps: {
        start: string | null;
        end: string | null;
    } | null;
}]

export type UserStatus = {
    status: string;
    activities: Activities;
}

export type UserData = {
    status: string;
    activities: Activities;
    id: string;
    username: string;
    global_name: string;
    avatar: string;
    banner?: string;
    locale?: string;
    discriminator: string;
    public_flags: string;
    flags: string;
    accent_color: string;
    avatar_decoration_data: string;
    banner_color: string;
    clan: string;
}

export type PartialGuild = {
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: string;
    features: string[];
    bot_here: boolean;
    data: GuildDTO;
    database: {
        config: {
            id: string,
            guildId: string,
            prefix: string,
            auditLogSettings?: string,
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
            },
        },
        membership?: {
            id: number,
            discordId: string,
            type: 'premium' | 'membership',
            duration: 'monthly' | 'yearly',
            tier: number,
            serverId: string,
            serverIds: string[],
            isActive: boolean,
            startDate: Date,
            endDate: Date;
        }
    };
};
// export type PartialGuild = MutualGuildDTO;

export type AuthStatus = {
    id: string;
    discordId: string;
    accessToken: string;
    refreshToken: string;
}

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

export const localeLabels: Record<Locale, string> = {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'bg': 'Български', // Bulgarian
    'zh-CN': '简体中文', // Chinese (Simplified)
    'zh-TW': '繁體中文', // Chinese (Traditional)
    'hr': 'Hrvatski', // Croatian
    'cs': 'Čeština', // Czech
    'da': 'Dansk', // Danish
    'nl': 'Nederlands', // Dutch
    'fi': 'Suomi', // Finnish
    'fr': 'Français', // French
    'de': 'Deutsch', // German
    'el': 'Ελληνικά', // Greek
    'hi': 'हिन्दी', // Hindi
    'hu': 'Magyar', // Hungarian
    'it': 'Italiano', // Italian
    'ja': '日本語', // Japanese
    'ko': '한국어', // Korean
    'lt': 'Lietuvių', // Lithuanian
    'no': 'Norsk', // Norwegian
    'pl': 'Polski', // Polish
    'pt-BR': 'Português (Brasil)', // Portuguese (Brazil)
    'ro': 'Română', // Romanian
    'ru': 'Русский', // Russian
    'es-ES': 'Español (España)', // Spanish (Spain)
    'es-419': 'Español (Latinoamérica)', // Spanish (Latin America)
    'sv-SE': 'Svenska', // Swedish
    'th': 'ไทย', // Thai
    'tr': 'Türkçe', // Turkish
    'uk': 'Українська', // Ukrainian
    'vi': 'Tiếng Việt', // Vietnamese
    'id': 'Bahasa Indonesia', // Indonesian
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

export type Commands = Map<string, APIApplicationCommand>;

export const textChannelTypes = [
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
    ChannelType.AnnouncementThread
];
export const channelEmojiLink = (type: ChannelType): string => {
    switch (type) {
        case ChannelType.GuildText:
            return 'https://cdn.discordapp.com/emojis/1299608265121861673.webp?size=20';
        case ChannelType.GuildVoice:
            return 'https://cdn.discordapp.com/emojis/1299608261858955264.webp?size=20';
        case ChannelType.GuildAnnouncement:
            return 'https://cdn.discordapp.com/emojis/1299651564235128852.webp?size=20';
        case ChannelType.AnnouncementThread:
            return 'https://cdn.discordapp.com/emojis/1299651564235128852.webp?size=20';
        case ChannelType.PublicThread:
            return 'https://cdn.discordapp.com/emojis/1299608267609346139.webp?size=20';
        case ChannelType.PrivateThread:
            return 'https://cdn.discordapp.com/emojis/1299608248298635304.webp?size=20';
        case ChannelType.GuildStageVoice:
            return 'https://cdn.discordapp.com/emojis/1299608255542329396.webp?size=20';
        case ChannelType.GuildForum:
            return 'https://cdn.discordapp.com/emojis/1299608251385516103.webp?size=20';
        default:
            return '';
    }
};

export const discord_limits = {
    content: 2000,
    embeds: {
        total: 10,
        title: 256,
        description: 4096,
        fields: 25,
        field_name: 256,
        field_value: 1024,
        footer_text: 2048,
        author_name: 256,
        total_chars: 6000,
    },
    attachments: 10,
    components: {
        rows: 5,
        buttons_per_row: 5,
        select_options: 25,
        total_components: 25,
    },
    components_v2: {
        total_components: 40,
    },
};
export const welcome_limits = {
    c: {
        free: {
            ...discord_limits,
            content: 200,
            embeds: {
                total: 1,
                title: 64,
                description: 1024,
                fields: 5,
                field_name: 64,
                field_value: 256,
                footer_text: 256,
                author_name: 64,
                total_chars: 6000,
            },
        },
        tier1: {
            ...discord_limits,
            content: 1000,
            embeds: {
                total: 3,
                title: 128,
                description: 2048,
                fields: 15,
                field_name: 128,
                field_value: 512,
                footer_text: 1024,
                author_name: 128,
                total_chars: 6000,
            },
        },
        tier2: discord_limits,
        tier3: discord_limits,
        tier999: discord_limits,
    },
    u: {
        free: {
            content: 0,
            embeds: {
                total: 0,
                title: 0,
                description: 0,
                fields: 0,
                field_name: 0,
                field_value: 0,
                footer_text: 0,
                author_name: 0,
                total_chars: 0,
            },
        },
        tier1: {
            ...discord_limits,
            content: 1000,
            embeds: {
                total: 3,
                title: 128,
                description: 2048,
                fields: 15,
                field_name: 128,
                field_value: 512,
                footer_text: 1024,
                author_name: 256,
                total_chars: 6000,
            },
        },
        tier2: discord_limits,
        tier3: discord_limits,
        tier999: discord_limits,
    }
};

