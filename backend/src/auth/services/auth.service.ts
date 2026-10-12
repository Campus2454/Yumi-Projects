import { Inject, Injectable } from '@nestjs/common';
import { IUserService } from 'src/user/interfaces/user';
import { SERVICES } from 'src/utils/constants';
import { IAuthService } from '../interfaces/auth';
import { UserDetails } from 'src/utils/types';

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject(SERVICES.USER) private readonly userService: IUserService,
    ) {}

    async validateUser(details: UserDetails) {
        const user = await this.userService.findUser(details.discordId);
        return user || this.userService.createUser(details);
    }
}
