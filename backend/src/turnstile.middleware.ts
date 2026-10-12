import { Injectable, NestMiddleware, HttpException, HttpStatus, Body } from '@nestjs/common';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TurnstileMiddleware implements NestMiddleware {
    private readonly secretKey = process.env.TURNSTILE_BACKEND_SECRET;
    async use(req: Request, res: Response, next: NextFunction) {
        return next();

        if (req.originalUrl === '/turnstile/verify') {
            return next();
        };
        
        const token: string | undefined = req.body['cf-turnstile-response'];
        
        if(!token){
            res.send(`<body style="font-family: sans-serif; color: white; margin: 0;">
            <style>
                @keyframes lds-ring {
                    0% {
                    transform: rotate(0deg);
                    }
                    100% {
                    transform: rotate(360deg);
                    }
                }
            </style>
            <div style="height: 100vh; display: flex; flex-direction: column; text-align: center; justify-content: center;">
                <div style="position: fixed; z-index: -50; top: 0; left: 0; height: 100%; width: 100%; background: linear-gradient(160deg, rgb(197 0 0) 0%, rgb(61 0 0) 40%, rgb(0 0 0) 100%);"></div>

                <div>
                    <h1>Verifying the accuracy...</h1>
                    <div class="lds-ring" style="display: inline-block; position: relative; width: 80px; height: 80px;">
                        <div style="box-sizing: border-box; display: block; position: absolute; width: 64px; height: 64px; margin: 8px; border: 8px solid currentColor; border-radius: 50%; animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; border-color: currentColor transparent transparent transparent; animation-delay: -0.45s;"></div>
                        <div style="box-sizing: border-box; display: block; position: absolute; width: 64px; height: 64px; margin: 8px; border: 8px solid currentColor; border-radius: 50%; animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; border-color: currentColor transparent transparent transparent; animation-delay: -0.3s;"></div>
                        <div style="box-sizing: border-box; display: block; position: absolute; width: 64px; height: 64px; margin: 8px; border: 8px solid currentColor; border-radius: 50%; animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; border-color: currentColor transparent transparent transparent; animation-delay: -0.15s;"></div>
                        <div style="box-sizing: border-box; display: block; position: absolute; width: 64px; height: 64px; margin: 8px; border: 8px solid currentColor; border-radius: 50%; animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; border-color: currentColor transparent transparent transparent;"></div>
                    </div>
                </div>

                <!-- <div class="cf-turnstile" data-sitekey="0x4AAAAAAA8g3tQPSaOmhKuF" data-callback="onSuccess"></div> -->
                <form method="POST">
                    <div class="cf-turnstile" data-sitekey="0x4AAAAAAA8g3tQPSaOmhKuF" data-callback="onSuccess"></div>
                    <!-- <input type="hidden" name="cf-turnstile-response" id="turnstile-token"> -->
                </form>
                <script>
                    function onSuccess(token) {
                        // document.getElementById('turnstile-token').value = token;
                        document.forms[0].submit();
                    }
                </script>

                <script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>

                <!-- <script>
                    function onSuccess(token) {
                        console.log(token);
                        fetch(window.location.href, {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: JSON.stringify({ 'cf-turnstile-response': token })
                        });
                    }
                </script> -->
            </div></body>`);
        }else{
            await axios.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                secret: this.secretKey,
                response: token,
                }, { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            ).then((response)=>{
                if(response.data.success){
                    return next();
                }else{
                    return res.status(HttpStatus.FORBIDDEN).json({ message: 'Turnstile verification failed', error: response.data });
                }
            })
            .catch((error) => {
                console.error('Turnstile Verification Error:', error.response?.data || error.message);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error verifying Turnstile token', error: error.response?.data || error.message });
            });
        };
    }
}
