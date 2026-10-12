import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import axios from 'axios';

@Controller('turnstile')
export class TurnstileController {
    private readonly secretKey = process.env.TURNSTILE_SECRET;

    @Post("verify")
    async verify(@Body("token") token: string) {
        const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            secret: this.secretKey,
            response: token,
        }, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        return response.data;
    }
}
