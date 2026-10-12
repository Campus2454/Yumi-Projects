import { Module } from '@nestjs/common';
import { DiscordController } from './controllers/discord.controller';
import { SERVICES } from 'src/utils/constants';
import { DiscordService } from './services/discord.service';
import { DiscordHttpService } from './services/discord-http.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildConfiguration } from 'src/utils/typeorm/entities/GuildConfiguration';
import { GuildConfigService } from './services/guildConfig.service';
import { Membership } from 'src/utils/typeorm/entities/Membership';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [
        TypeOrmModule.forFeature([GuildConfiguration, Membership]),
        CacheModule.register({ ttl: 60000 })
    ],
    controllers: [DiscordController],
    providers: [
        GuildConfigService,
        {
            provide: SERVICES.DISCORD,
            useClass: DiscordService,
        },
        {
            provide: SERVICES.DISCORD_HTTP,
            useClass: DiscordHttpService,
        },
    ],
})
export class DiscordModule {}
