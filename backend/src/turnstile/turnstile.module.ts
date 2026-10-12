import { Module } from '@nestjs/common';
import { TurnstileController } from './turnstile.controller';

@Module({
    imports: [],
    controllers: [
        TurnstileController
    ],
    providers: [],
})
export class TurnstileModule {}
