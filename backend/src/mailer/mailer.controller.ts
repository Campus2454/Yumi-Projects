import { Controller, Post, Body, Headers, HttpException, HttpStatus, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { Response } from 'express';
import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail({}, { each: true })
    @IsOptional()
    to: string | string[];
  
    @IsNotEmpty()
    subject: string;
  
    @IsOptional()
    message?: string;

    @IsOptional()
    html?: string;
}

@Controller('email')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async sendEmail(@Headers('x-api-key') apiKey: string, @Body() body: SendEmailDto, @Res() res: Response) {
    if(apiKey !== process.env.EMAIL_API_KEY){
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    };

    try{
        const result = await this.mailerService.sendEmail(body);
        return res.status(200).json(result);
    }catch(error){
        return res.status(500).json({ success: false, message: error.message });
    };
  }
}