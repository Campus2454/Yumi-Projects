import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-discord";
import { SERVICES } from "src/utils/constants";
import { IAuthService } from "../interfaces/auth";

@Injectable()
export class DiscordStrategyDomain extends PassportStrategy(Strategy, 'discordDomain') {
    constructor(
        @Inject(SERVICES.AUTH) private readonly authService: IAuthService,
    ) {
        super({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_REDIRECT_URL,
            scope: ['identify', 'email', 'guilds'],
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, tokenType: string) {
        // console.log('DiscordStrategy Validate Method');
        // console.log(profile.username);
        return this.authService.validateUser({ discordId: profile.id, accessToken, refreshToken, tokenType });
    }
}

@Injectable()
export class DiscordStrategyLocalhost extends PassportStrategy(Strategy, 'discordLocalhost') {
    constructor(
        @Inject(SERVICES.AUTH) private readonly authService: IAuthService,
    ) {
        super({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_REDIRECT_URL_FROM_IP,
            scope: ['identify', 'email', 'guilds'],
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, tokenType: string) {
        // console.log('DiscordStrategy Validate Method');
        // console.log(profile.username);
        return this.authService.validateUser({ discordId: profile.id, accessToken, refreshToken, tokenType });
    }
}