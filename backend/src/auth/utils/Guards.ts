import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

function normalizeIp(ip: string | string[] | undefined): string {
    if (!ip) return '';
    if (Array.isArray(ip)) ip = ip[0];
    return ip.split(',')[0].trim().replace('::ffff:', '');
}

@Injectable()
export class DiscordAuthGuardDomain extends AuthGuard('discordDomain') {
    async canActivate(context: ExecutionContext) {
        try {
            const activate = (await super.canActivate(context)) as boolean;
            if (activate) {
                const request = context.switchToHttp().getRequest();
                await super.logIn(request);
                request.session.authInfo = { 
                    ip: normalizeIp(request.headers['x-forwarded-for'] || request.ip),
                    userAgent: request.headers['user-agent'],
                };
                return true;
            } else {
                throw new UnauthorizedException('Authentication failed');
            }
        } catch (err) {
            const response = context.switchToHttp().getResponse();
            const request = context.switchToHttp().getRequest();
            const { error } = request.query;
            if (error) response.redirect(`${process.env.WEB_DOMAIN}/?login_error=${error}`);
            return false;
        }
    }
}

@Injectable()
export class DiscordAuthGuardLocalhost extends AuthGuard('discordLocalhost') {
    async canActivate(context: ExecutionContext) {
        try {
            const activate = (await super.canActivate(context)) as boolean;
            if (activate) {
                const request = context.switchToHttp().getRequest();
                await super.logIn(request);
                request.session.authInfo = { 
                    ip: normalizeIp(request.headers['x-forwarded-for'] || request.ip),
                    userAgent: request.headers['user-agent'],
                };
                return true;
            } else {
                throw new UnauthorizedException('Authentication failed');
            }
        } catch (err) {
            const response = context.switchToHttp().getResponse();
            const request = context.switchToHttp().getRequest();
            const error = err.message || request.query?.error || 'unknown_error';
            console.log('OAuth Code:', request.query);
            response.redirect(`${process.env.WEB_IP}/?login_error=${error}`);
            return false;
        }
    }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        if(!req.session || !req.session.authInfo){
            req.session.destroy(() => {});
            throw new UnauthorizedException('Session missing authentication info');
        }

        // const storedIp = normalizeIp(req.session.authInfo.ip);
        // const currentIp = normalizeIp(req.headers['x-forwarded-for'] || req.ip);
        // const storedUserAgent = req.session.authInfo.userAgent;
        // const currentUserAgent = req.headers['user-agent'];
        
        // if(storedIp !== currentIp || storedUserAgent !== currentUserAgent){
        //     throw new UnauthorizedException('Session invalid due to IP/User-Agent mismatch');
        // }

        return req.isAuthenticated();
    }
}