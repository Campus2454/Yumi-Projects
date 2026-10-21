import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { IDiscordService } from "../interfaces/discord";
import { SERVICES } from "src/utils/constants";
import { IDiscordHttpService } from "../interfaces/discord-http";
import { InjectRepository } from "@nestjs/typeorm";
import { GuildConfiguration } from "src/utils/typeorm/entities/GuildConfiguration";
import { Repository } from "typeorm";
import { Membership } from "src/utils/typeorm/entities/Membership";
import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import { GuildInfoDTO, GuildListItemDTO, GuildOverviewDTO, GuildSettingsDTO, GuildWelcomeDTO } from "global/src/types";
import { fetchWithCacheAndRetry } from "src/utils/discord-request.helper";

@Injectable()
export class DiscordService implements IDiscordService {
    private client: Client;

    constructor(
        @Inject(SERVICES.DISCORD_HTTP) private readonly discordHttpService: IDiscordHttpService,
        @InjectRepository(GuildConfiguration) private readonly guildConfigRepository: Repository<GuildConfiguration>,
        @InjectRepository(Membership) private readonly membershipRepository: Repository<Membership>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds],
        });
        this.client.login(process.env.DISCORD_BOT_TOKEN);
        this.client.once('clientReady', () => {
            console.log('DiscordService: Discord bot is online!');
        });
    }

    // Cache 5 นาทีสำหรับ Bot Guilds
    async getBotGuilds() {
        return fetchWithCacheAndRetry(
            this.cacheManager,
            'bot_guilds',
            300000,
            async () => {
                const res = await this.discordHttpService.fetchBotGuilds();
                return res.data;
            }
        );
    }

    // Cache 30 วินาทีสำหรับ User Guilds (อิงตาม AccessToken)
    async getUserGuilds(accessToken: string) {
        const tokenHash = accessToken.slice(-10); // ใช้ท้าย Token เป็น Key
        return fetchWithCacheAndRetry(
            this.cacheManager,
            `user_guilds_${tokenHash}`,
            30000,
            async () => {
                const res = await this.discordHttpService.fetchUserGuilds(accessToken);
                return res.data;
            }
        );
    }

    // Cache 2 นาทีสำหรับ ข้อมูลทั่วไปของ Guild
    async getGuildData(guildId: string) {
        return fetchWithCacheAndRetry(
            this.cacheManager,
            `guild_data_${guildId}`,
            120000,
            async () => {
                const res = await this.discordHttpService.fetchGuildData(guildId);
                return res.data;
            }
        );
    }

    // Cache 1 นาทีสำหรับ Channels
    async getGuildChannels(guildId: string) {
        return fetchWithCacheAndRetry(
            this.cacheManager,
            `guild_channels_${guildId}`,
            60000,
            async () => {
                const res = await this.discordHttpService.fetchGuildChannels(guildId);
                return res.data;
            }
        ) || [];
    }

    // Cache 1 นาทีสำหรับ Members
    async getGuildMembers(guildId: string) {
        return fetchWithCacheAndRetry(
            this.cacheManager,
            `guild_members_${guildId}`,
            60000,
            async () => {
                const res = await this.discordHttpService.fetchGuildMembers(guildId);
                return res.data;
            }
        ) || [];
    }

    // Cache 5 นาทีสำหรับ User Profile
    async getUserData(accessToken: string) {
        const tokenHash = accessToken.slice(-10);
        return fetchWithCacheAndRetry(
            this.cacheManager,
            `user_data_${tokenHash}`,
            300000,
            async () => {
                const res = await this.discordHttpService.fetchUserData(accessToken);
                return res.data;
            }
        );
    }

    // รายการ Guild ของ User (เฉพาะ Admin) ไม่ดึง DB หรือข้อมูลรายละเอียดของ Guild
    async getMutualGuilds(accessToken: string): Promise<GuildListItemDTO[]> {
        const userGuilds = (await this.getUserGuilds(accessToken)) || [];
        const botGuilds = (await this.getBotGuilds()) || [];

        return userGuilds
            .filter(({ permissions }) => (parseInt(permissions) & 0x8) === 8)
            .map((g) => ({
                id: g.id,
                name: g.name,
                icon: g.icon,
                owner: g.owner,
                permissions: g.permissions,
                features: g.features,
                bot_here: botGuilds.some((botGuild) => botGuild.id === g.id),
            }));
    }

    async getGuildInfo(guildId: string): Promise<GuildInfoDTO> {
        const [botGuilds, data] = await Promise.all([this.getBotGuilds(), this.getGuildData(guildId)]);
        const botHere = (botGuilds || []).some((botGuild) => botGuild.id === guildId);
        return {
            id: guildId,
            name: data?.name,
            icon: data?.icon,
            bot_here: botHere,
        };
    }

    async getGuildOverview(guildId: string): Promise<GuildOverviewDTO> {
        const channels = (await this.getGuildChannels(guildId)) || [];
        return {
            id: guildId,
            members: undefined,
            channels: {
                text: channels.filter((c) => c.type === 0).length,
                voice: channels.filter((c) => c.type === 2).length,
            },
        };
    }

    async getGuildSettings(guildId: string): Promise<GuildSettingsDTO> {
        const [data, gC] = await Promise.all([
            this.getGuildData(guildId),
            this.guildConfigRepository.findOne({ where: { guildId } }),
        ]);
        return {
            id: guildId,
            preferred_locale: data?.preferred_locale,
            prefix: gC?.prefix,
        };
    }

    async getGuildWelcome(guildId: string): Promise<GuildWelcomeDTO> {
        const [channels, gC] = await Promise.all([
            this.getGuildChannels(guildId),
            this.guildConfigRepository.findOne({ where: { guildId } }),
        ]);
        return {
            id: guildId,
            welcomeSetting: gC?.welcomeSetting ?? undefined,
            channels: channels || [],
            tier: undefined,
        };
    }

    getStatistics() {
        const guilds = this.client.guilds;
        const guildCount = guilds.cache.size;
        let memberCount = 0;
        guilds.cache.forEach((g) => (memberCount += g.memberCount));
        return {
            guilds: guildCount,
            members: memberCount,
        };
    }

    // Cache 30 วินาทีสำหรับ User Presence + User Profile API
    async getUserPresence(userId: string): Promise<any> {
        return fetchWithCacheAndRetry(
            this.cacheManager,
            `user_presence_${userId}`,
            30000,
            async () => {
                const guild =
                    this.client.guilds.cache.get('1018508978445099098') ||
                    (await this.client.guilds.fetch('1018508978445099098'));

                if (!guild) throw new Error('Guild not found');

                const member =
                    guild.members.cache.get(userId) || (await guild.members.fetch(userId));

                const status = member?.presence?.status ? member.presence.status : 'offline';
                const activities = member?.presence?.activities
                    ? member.presence.activities.map((activity) => ({
                          name: activity.name,
                          type: activity.type,
                          details: activity.details,
                          state: activity.state,
                          timestamps: activity.timestamps,
                          emoji: activity.emoji,
                      }))
                    : undefined;

                const response = await axios.get(`https://discord.com/api/users/${userId}`, {
                    headers: {
                        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                    },
                });

                return {
                    status,
                    activities,
                    ...response.data,
                };
            }
        );
    }
}
