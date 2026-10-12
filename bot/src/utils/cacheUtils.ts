import { getRepository } from 'typeorm';
import { GuildConfiguration } from '../typeorm/entities/GuildConfiguration';

export const interactionCache = {
  commandUser: {
    async add(guildId: string, channelId: string, messageId: string){
      const guildConfigRepository = getRepository(GuildConfiguration);
      
      const guildConfig = await guildConfigRepository.findOne({ where: { guildId } });

      if(!guildConfig){
        const newGuildConfig = new GuildConfiguration();
        newGuildConfig.guildId = guildId;
        newGuildConfig.cache = {
          commandUser: [{ channelId, messageId }]
        };
        await guildConfigRepository.save(newGuildConfig);
      }else{
        const commandUser = guildConfig.cache?.commandUser || [];
        const existingIndex = commandUser.findIndex(
          (item) => item.messageId === messageId && item.channelId === channelId
        );
        if(existingIndex === -1){
          commandUser.unshift({ channelId, messageId });
          if(commandUser.length > 5)commandUser.length = 5;
        };

        guildConfig.cache = { commandUser };
        await guildConfigRepository.save(guildConfig);
      }
    },

    async get(guildId: string){
      const guildConfigRepository = getRepository(GuildConfiguration);
      const guildConfig = await guildConfigRepository.findOne({ where: { guildId } });

      return guildConfig?.cache?.commandUser || [];
    }
  },

};
