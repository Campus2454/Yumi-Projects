import { Module } from '@nestjs/common';
import { AuthController, AuthV2Controller } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserModule } from 'src/user/user.module';
import { SERVICES } from 'src/utils/constants';
import { DiscordStrategyDomain, DiscordStrategyLocalhost } from './utils/DiscordStrategy';
import { SessionSerializer } from './utils/SessionSerializer';
import { tokenService } from './services/token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/utils/typeorm/entities/User';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([User])],
  controllers: [AuthController, AuthV2Controller],
  providers: [
    DiscordStrategyDomain,
    DiscordStrategyLocalhost,
    SessionSerializer,
    tokenService,
    {
      provide: SERVICES.AUTH,
      useClass: AuthService,
    }
  ]
})
export class AuthModule {}
