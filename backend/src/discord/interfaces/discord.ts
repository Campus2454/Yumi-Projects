export interface IDiscordService {
    getBotGuilds();
    getUserGuilds(accessToken: string);
    getMutualGuilds(accessToken: string);
    getUserData(accessToken: string);
    getGuildChannels(guildId: string);
    getGuildMembers(guildId: string);
    getStatistics();
    getUserPresence(userId: string);
}