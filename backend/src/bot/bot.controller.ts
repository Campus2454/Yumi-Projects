import { Request, Response } from 'express';
import { BotService } from './bot.service';
import { Body, Controller, Headers, Post, Req, Res } from '@nestjs/common';
import { Activity, PresenceStatusData } from 'discord.js';

@Controller('bot')
export class BotController {
    constructor(private readonly botStatusService: BotService) {}

    @Post('status')
    async setStatus(
        @Body() body: { status: PresenceStatusData | undefined, activity: Activity | undefined },
        @Req() req: Request,
        @Res() res: Response,
        @Headers('x-api-key') apiKey: string
    ) {
        if(apiKey !== process.env.ADMIN_API_KEY){
            return res.status(401).json({ success: false, message: 'Unauthorized access' });
        };

        try{
            const { status, activity } = body;
            return await this.botStatusService.setBotStatus(res, status, activity);
        }catch(error){
            return res.status(500).json({ error: error.message });
        }
    }

    @Post('commands')
    async getCommands(@Res() res: Response, @Req() req: Request) {
        return res.json(await this.botStatusService.getBotCommands());
    }
}