import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { entities } from './utils/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DiscordModule } from './discord/discord.module';
import { PaymentModule } from './payment/payment.module';
import { MailerModule } from './mailer/mailer.module';
import { BotModule } from './bot/bot.module';
import { TurnstileModule } from './turnstile/turnstile.module';

import { MainController } from './main.controller';
import { TurnstileMiddleware } from './turnstile.middleware';
import { SysModule } from './system/sys.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    PassportModule.register({ session: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_DB_HOST,
      port: 3306,
      username: process.env.MYSQL_DB_USER,
      password: process.env.MYSQL_DB_PASSWORD,
      database: process.env.MYSQL_DB_DATABASE,
      synchronize: true,
      entities,
    }),
    AuthModule,
    UserModule,
    DiscordModule,
    PaymentModule,
    MailerModule,
    BotModule,
    TurnstileModule,
    SysModule,
  ],
  controllers: [MainController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TurnstileMiddleware).forRoutes('*');
  }
}
