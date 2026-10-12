import { Controller, Post, Body, Put, Param, Res, UseGuards, Headers } from '@nestjs/common';
import { Response } from 'express';
import { MembershipService } from '../services/membership.server';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';

@Controller('membership')
export class MembershipController {
    constructor(private readonly membershipService: MembershipService) {}

    @Post('create')
    @UseGuards(AuthenticatedGuard)
    async createMembership(
        @Body() data: { discordId: string; type: 'premium' | 'membership'; duration: 'monthly' | 'yearly'; serverId: string },
        @Res() res: Response,
        @Headers('x-api-key') apiKey: string
    ) {
        if(apiKey !== process.env.PAYMENT_ADMIN_KEY){
            return res.status(401).json({ success: false, message: 'Unauthorized access' });
        };

        if(!data.discordId || !data.type || !data.duration){
            return res.status(401).json({ success: false, message: 'Missing required fields' });
        };

        try{
            const result = await this.membershipService.createMembership(data);
            return res.status(201).json({ success: true, result });
        }catch(error){
            return res.status(500).json({ success: false, message: error.message });
        };
    }

    @Put('update')
    @UseGuards(AuthenticatedGuard)
    async updateMembership(
        @Body() data: { discordId: string, type: 'premium' | 'membership', duration?: 'monthly' | 'yearly', tier?: number, serverId?: string, serverIds?: string, isActive?: boolean },
        @Res() res: Response,
        @Headers('x-api-key') apiKey: string
    ){
        if(apiKey !== process.env.PAYMENT_ADMIN_KEY){
            return res.status(401).json({ success: false, message: 'Unauthorized access' });
        }

        if(!data.discordId || !data.type){
            return res.status(400).json({ success: false, message: 'discordId and type are required' });
        }

        try{
            const result = await this.membershipService.updateMembership(data);
            return res.status(200).json({ success: true, result });
        }catch(error){
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    @Put('activate')
    @UseGuards(AuthenticatedGuard)
    async activateMembership(
        @Body() data: { discordId: string, type: 'premium' | 'membership', isActive: 'monthly' | 'yearly' },
        @Res() res: Response,
        @Headers('x-api-key') apiKey: string
    ) {
        if(apiKey !== process.env.PAYMENT_ADMIN_KEY){
            return res.status(401).json({ success: false, message: 'Unauthorized access' });
        };

        if(!data || !data.discordId || !data.type){
            return res.status(401).json({ success: false, message: 'Missing required fields' });
        }

        try{
            const result = await this.membershipService.activateMembership(data);
            return res.status(200).json({ success: true, result });
        }catch(error){
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}