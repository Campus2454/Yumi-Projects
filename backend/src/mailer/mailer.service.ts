import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import Mail from 'nodemailer/lib/mailer';
import { SendEmailDto } from './mailer.controller';
const nodemailer = require('nodemailer');

@Injectable()
export class MailerService {
//   private transporter;

//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.GMAIL,
//         pass: process.env.APP_PASSWORD_Nodemailer,
//       },
//     });
//   }
  
    async sendEmail(body: SendEmailDto) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL,
                pass: process.env.APP_PASSWORD_Nodemailer,
            },
        });

        const mailOptions: Mail.Options = {
            from: `"${body.name}" <support@camming.xyz>`,
            to: body.to,
            subject: body.subject,
        };
        if(body.message){mailOptions.text = body.message};
        if(body.html){mailOptions.html = body.html};

        try{
            const info = await transporter.sendMail(mailOptions);
            return { success: true, message: info.response };
        }catch(error){
            throw new Error(`Failed to send email: ${error.message}`);
        };
    }
}