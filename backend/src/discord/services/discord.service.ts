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
import { MutualGuildDTO } from "global/src/types";
import * as pLimit from "p-limit";
import { fetchWithCacheAndRetry } from "src/utils/discord-request.helper";

@Injectable()
export class DiscordService implements IDiscordService {
    private client: Client;
    private apiLimit = pLimit(3); // จำกัดทุกการยิงเข้า Discord API พร้อมกันไม่เกิน 3 Concurrent Requests

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

    // getMutualGuilds ใช้ Concurrent Limit + Cache ทั้งระบบ
    async getMutualGuilds(accessToken: string): Promise<MutualGuildDTO[]> {
        const userGuilds = (await this.getUserGuilds(accessToken)) || [];
        const botGuilds = (await this.getBotGuilds()) || [];

        const adminUserGuilds = userGuilds.filter(({ permissions }) => (parseInt(permissions) & 0x8) === 8);

        const guilds = await Promise.all(
            adminUserGuilds.map((g) =>
                this.apiLimit(async () => {
                    const botHere = botGuilds.some((botGuild) => botGuild.id === g.id);
                    const gC = await this.guildConfigRepository.findOne({ where: { guildId: g.id } });

                    const config = {
                        config: botHere ? gC?.toJSON() : undefined,
                        Membership: undefined,
                    };

                    let guildData = undefined;
                    if (botHere) {
                        // ดึงข้อมูล Guild Data + Channels แบบขนานคู่กัน
                        const [data, channels] = await Promise.all([
                            this.getGuildData(g.id),
                            this.getGuildChannels(g.id),
                        ]);

                        guildData = {
                            ...data,
                            channels: channels || [],
                            members: undefined,
                        };
                    }

                    return {
                        ...g,
                        bot_here: botHere,
                        data: guildData,
                        database: config || undefined,
                    };
                })
            )
        );

        return guilds;
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
