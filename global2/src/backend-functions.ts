import 'dotenv/config';
import * as nodemailer from 'nodemailer';


// 👉 ส่งอีเมล
export function sendEmailAlert(mail: string, subject: string, text: string) {
			const transporter = nodemailer.createTransport({
					service: 'gmail',
					auth: {
							user: process.env.EMAIL,
							pass: process.env.EMAIL_PASS
					}
			});

			const mailOptions = {
					from: process.env.EMAIL,
					to: mail,
					subject: subject,
					text: text
			};

			transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
							console.error('ไม่สามารถส่งอีเมลได้:', error);
					} else {
							console.log('ส่งอีเมลสำเร็จ:', info.response);
					}
			});

};