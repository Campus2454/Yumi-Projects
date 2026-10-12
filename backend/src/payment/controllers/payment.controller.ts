import { Controller, Post, Put, Body, Param, Res, UseGuards, Headers, HttpCode, RawBody, Req } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import Stripe from 'stripe';

@Controller('payment')
export class PaymentController {
    constructor( private readonly paymentService: PaymentService, ) {}

    @Post('create')
    // @UseGuards(AuthenticatedGuard)
    create(@Body() data: { discordId: string; tier: number; duration: 'monthly' | 'yearly'; }) {
      return this.paymentService.createPayment(data.tier, data.duration, data.discordId);
    }

    @Post('stripe-webhook')
    async handleStripeWebhook(@Req() request: Request, @Res() response: Response, @Body() body: any) {
      const sig = request.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
      let event: Stripe.Event;
  
      try{
        const rawBody = request.body;
        event = this.paymentService.constructEvent(rawBody, sig, webhookSecret);
      }catch(err: any){
        return response.status(400).send(`Webhook Error: ${err.message}`);
      }

      switch(event.type){
        case 'checkout.session.completed':
            const session = event.data.object;
            const userId = session?.metadata?.userId;
            const orderId = session?.metadata?.orderId;
  
            if(userId && orderId){
                try{
                    await this.paymentService.fulfillOrder(session);
                    // console.log(`Order ${orderId} completed for user ${userId}`);
                }catch(error){
                    // console.error('Error fulfilling order:', error);
                    response.status(500).send('Error processing order');
                    return;
                }
            }else{
                console.warn('Missing metadata in checkout.session.completed event:', session);
            }
            break;
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            // ดึง metadata ถ้ามีจาก invoice.subscription หรือ invoice.customer
            await this.paymentService.paymentSuccess(invoice);
            break;
        
        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            // await this.paymentService.paymentFailed(failedInvoice);
            break;
        
        case 'customer.subscription.updated':
            const updatedSub = event.data.object;
            // await this.paymentService.subUpdate(updatedSub);
            break;
        
        case 'customer.subscription.deleted':
            const deletedSub = event.data.object;
            // await this.paymentService.cancelUserAccess(deletedSub);
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
      }
  
      response.json({ received: true });
    }

    // @Post('submit')
    // @UseGuards(AuthenticatedGuard)
    // async submitPayment(
    //     @Body() data: { discordId: string; slipUrl: string; membershipType: string; amount: number },
    //     @Res() res: Response,
    //     @Headers('x-api-key') apiKey: string
    // ) {
    //     if(apiKey !== process.env.PAYMENT_ADMIN_KEY){
    //         return res.status(401).json({ success: false, message: 'Unauthorized access' });
    //     };

    //     if(!data.discordId || !data.slipUrl || !data.membershipType || !data.amount){
    //         return res.status(401).json({ success: false, message: 'Missing required fields' });
    //     };

    //     if (!data.slipUrl.match(/^https?:\/\/[^\s$.?#].[^\s]*$/)) {
    //         return res.status(400).json({ success: false, message: 'Invalid slip URL' });
    //     }
        
    //     try{
    //         const result = await this.paymentService.submitPayment(data);
    //         return res.status(200).json({ success: true, result });
    //     }catch(error){
    //         return res.status(500).json({ success: false, message: error.message });
    //     }
    // }

    // @Put('verify/:discordId')
    // @UseGuards(AuthenticatedGuard)
    // async verifyPayment(
    //     @Param('discordId') discordId: string,
    //     @Res() res: Response,
    //     @Headers('x-api-key') apiKey: string
    // ) {
    //     if(apiKey !== process.env.PAYMENT_ADMIN_KEY){
    //         return res.status(401).json({ success: false, message: 'Unauthorized access' });
    //     };

    //     try{
    //         const result = await this.paymentService.verifyPayment(discordId);
    //         return res.status(200).json({ success: true, result });
    //     }catch(error){
    //         return res.status(500).json({ success: false, message: error.message });
    //     }
    // }
}