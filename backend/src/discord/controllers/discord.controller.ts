import { Body, Controller, Delete, Get, Inject, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ROUTES, SERVICES } from "src/utils/constants";
import { IDiscordService } from "../interfaces/discord";
import { AuthUser } from "src/utils/decorators";
import { User } from "src/utils/typeorm/entities/User";
import { AuthenticatedGuard } from "src/auth/utils/Guards";
import { Response } from 'express';
import { InjectRepository } from "@nestjs/typeorm";
import { GuildConfiguration } from "src/utils/typeorm/entities/GuildConfiguration";
import { Repository } from "typeorm";
import { GuildConfig } from "src/utils/types";
import { GuildConfigService } from "../services/guildConfig.service";
import { Throttle } from "@nestjs/throttler";

@Controller(ROUTES.DISCORD)
export class DiscordController {
    constructor(
        private readonly guildConfigService: GuildConfigService,
        @Inject(SERVICES.DISCORD) private readonly discordService: IDiscordService,
        @InjectRepository(GuildConfiguration) private readonly guildConfigRepository: Repository<GuildConfiguration>
    ) {}

    @Get('user')
    @UseGuards(AuthenticatedGuard)
    getUserData(@AuthUser() user: User){
        return this.discordService.getUserData(user.accessToken);
    }

    @Get('user/guilds')
    @UseGuards(AuthenticatedGuard)
    async getMutualGuilds(@AuthUser() user: User){
        const guilds = await this.discordService.getMutualGuilds(user.accessToken);
        return guilds;
    }

    @Throttle({ default: { limit: 5, ttl: 5_000 } })
    @Get('user/:userId')
    async getStatus(@Param('userId') userId: string, @Res() res: Response) {
        try{
            const userStatus = await this.discordService.getUserPresence(userId);
            res.status(200).json(userStatus);
        }catch(error){
            res.status(500).json({ error: error.message });
        };
    }

    @Get('statistics')
    async getStatistics(@Res() res: Response) {
        try{
            const statistics = this.discordService.getStatistics();
            res.status(200).json(statistics);
        }catch(error){
            res.status(500).json({ error: error.message });
        };
    }

    @Post('createGuild/:guildId')
    async createGuildData(@Param('guildId') guildId: string, @Res() res: Response){
        try{
            const newConfig = this.guildConfigRepository.create({ guildId });
            const savedConfig = await this.guildConfigRepository.save(newConfig);
            res.status(200).json(savedConfig);
        }catch(error){
            res.status(404).json(error);
        };
    }

    @Post('guilds/settings')
    @UseGuards(AuthenticatedGuard)
    setGuildConfig(@Body() body: GuildConfig, @Res() res: Response){
        return this.guildConfigService.setConfig(body, res);
    }

    @Get('guilds/:guildId/info')
    @UseGuards(AuthenticatedGuard)
    getGuildInfo(@Param('guildId') guildId: string){
        return this.discordService.getGuildInfo(guildId);
    }

    @Get('guilds/:guildId/overview')
    @UseGuards(AuthenticatedGuard)
    getGuildOverview(@Param('guildId') guildId: string){
        return this.discordService.getGuildOverview(guildId);
    }

    @Get('guilds/:guildId/settings')
    @UseGuards(AuthenticatedGuard)
    getGuildSettings(@Param('guildId') guildId: string){
        return this.discordService.getGuildSettings(guildId);
    }

    @Get('guilds/:guildId/welcome')
    @UseGuards(AuthenticatedGuard)
    getGuildWelcome(@Param('guildId') guildId: string){
        return this.discordService.getGuildWelcome(guildId);
    }

    @Delete('guilds/settings')
    @UseGuards(AuthenticatedGuard)
    delGuildConfig(@Body() body: GuildConfig, @Res() res: Response){
        return this.guildConfigService.delConfig(body, res);
    }

    @Get('guilds/:guildId/channels')
    @UseGuards(AuthenticatedGuard)
    getGuildChannels(@Param('guildId') guildId: string, @Res() res: Response){
        return res.json(this.discordService.getGuildChannels(guildId));
    }

    @Get('test')
    @UseGuards(AuthenticatedGuard)
    test(@Req() req: Request, @Res() res: Response){
        return req;
    }
}