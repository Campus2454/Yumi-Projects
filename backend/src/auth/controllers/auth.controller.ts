import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ROUTES } from '../../utils/constants';
import { AuthenticatedGuard, DiscordAuthGuardDomain, DiscordAuthGuardLocalhost } from '../utils/Guards';
import { Request, Response } from 'express';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm/entities/User';
import { tokenService } from '../services/token.service';

@Controller(ROUTES.AUTH)
export class AuthController {
    constructor(private readonly CheckToken: tokenService) {}

    @Get('login')
    @UseGuards(DiscordAuthGuardDomain)
    login() {}

    @Get('redirect')
    @UseGuards(DiscordAuthGuardDomain)
    redirect(@Res() res: Response) {
        res.redirect(`${process.env.WEB_DOMAIN}/login_fallback`);
    }

    @Get('status')
    @UseGuards(AuthenticatedGuard)
    status(@AuthUser() user: User) {
        return user;
    }

    @Post('checkToken')
    async checkToken(@Body() body: { id: number, discordId: string, accessToken: string, refreshToken: string }, @Req() req: Request, @Res() res: Response) {
        const user = body;
        if(user.id == null || user.discordId == null || user.accessToken == null || user.refreshToken == null){
            return res.status(401).json({ statusCode: 0, message: 'The information for inspection is incomplete.' });
        };
        try{
            const isTokenValid = await this.CheckToken.checkToken(user.accessToken);
            if(isTokenValid){
                return res.json({ statusCode: 1, message: 'Token is still valid.' });
            }else{
                const newToken = await this.CheckToken.refreshToken(user.refreshToken);
                console.log('New Token:', newToken);
                if(newToken){
                    await this.CheckToken.updateToken(user.discordId, newToken);
                    console.log({ statusCode: 2, message: 'Token refreshed successfully.' });
                    return res.json({ statusCode: 2, message: 'Token refreshed successfully.' });
                }else{
                    await this.CheckToken.deleteUser(user.id, user.discordId, user.accessToken, user.refreshToken);
                    console.error({ statusCode: 3, message: 'Token expired and user deleted.' });
                    return res.status(401).json({ statusCode: 3, message: 'Token expired and user deleted.' });
                };
            };
        }catch(error){
            await this.CheckToken.deleteUser(user.id, user.discordId, user.accessToken, user.refreshToken);
            console.error({ statusCode: 4, message: 'Failed to refresh token. User deleted.', error: error.message || error.stack || 'Unknown error' });
            return res.status(401).json({ statusCode: 4, message: 'Failed to refresh token. User deleted.', error: error.message || error.stack || 'Unknown error' });
        }
    }

    @Post('logout')
    @UseGuards(AuthenticatedGuard)
    logout(@Res() res: Response) {
        res.clearCookie('connect.sid', { path: '/' });
        res.send('Logged out');
    }
}

@Controller(ROUTES.AUTH2)
export class AuthV2Controller {
    constructor(private readonly CheckToken: tokenService) {}

    @Get('login')
    @UseGuards(DiscordAuthGuardLocalhost)
    login() {}

    @Get('redirect')
    @UseGuards(DiscordAuthGuardLocalhost)
    redirect(@Res() res: Response) {
        res.redirect(`${process.env.WEB_IP}/login_fallback`);
    }

    @Get('status')
    @UseGuards(AuthenticatedGuard)
    status(@AuthUser() user: User) {
        return user;
    }

    @Post('checkToken')
    async checkToken(@Body() body: { id: number, discordId: string, accessToken: string, refreshToken: string }, @Req() req: Request, @Res() res: Response) {
        const user = body;
        if(user.id == null || user.discordId == null || user.accessToken == null || user.refreshToken == null){
            return res.status(401).json({ statusCode: 0, message: 'The information for inspection is incomplete.' });
        };
        try{
            const isTokenValid = await this.CheckToken.checkToken(user.accessToken);
            if(isTokenValid){
                return res.json({ statusCode: 1, message: 'Token is still valid.' });
            }
            const newToken = await this.CheckToken.refreshToken(user.refreshToken);
            if(newToken){
                await this.CheckToken.updateToken(user.discordId, newToken);
                return res.json({ statusCode: 2, message: 'Token refreshed successfully.' });
            }
            await this.CheckToken.deleteUser(user.id, user.discordId, user.accessToken, user.refreshToken);
            return res.status(401).json({ statusCode: 3, message: 'Token expired and user deleted.' });
        }catch(error){
            await this.CheckToken.deleteUser(user.id, user.discordId, user.accessToken, user.refreshToken);
            return res.status(401).json({ statusCode: 4, message: 'Failed to refresh token. User deleted.', error: error.message || error.stack || 'Unknown error' });
        }
    }

    @Post('logout')
    @UseGuards(AuthenticatedGuard)
    logout(@Res() res: Response) {
        res.clearCookie('connect.sid', { path: '/' });
        return res.send('Logged out');
    }
}
