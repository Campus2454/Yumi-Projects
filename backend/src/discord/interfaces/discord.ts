export interface IDiscordService {
    getBotGuilds();
    getUserGuilds(accessToken: string);
    getMutualGuilds(accessToken: string);
    getGuildInfo(guildId: string);
    getGuildOverview(guildId: string);
    getGuildSettings(guildId: string);
    getGuildWelcome(guildId: string);
    getUserData(accessToken: string);
    getGuildChannels(guildId: string);
    getGuildMembers(guildId: string);
    getStatistics();
    getUserPresence(userId: string);
}