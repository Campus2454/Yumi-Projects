import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment } from 'src/utils/typeorm/entities/Payment';
import { User } from 'src/utils/typeorm/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>
    @InjectRepository(User) private readonly userRepo: Repository<User>
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    private priceMap = {
      1: { monthly: 'price_1RHk5TBOoFaVL677qdbmTeXE', yearly: 'price_1RHk5TBOoFaVL677mOvAGlkz' },
      2: { monthly: 'price_1RHk8JBOoFaVL677syecyI7x', yearly: 'price_1RHk8JBOoFaVL677Uq508OzY' },
      3: { monthly: 'price_1RHk9UBOoFaVL677pRXgN8ti', yearly: 'price_1RHk9TBOoFaVL677NlB2482Z' },
      0: { monthly: 'price_1RI0j9BOoFaVL677SVnNau9i' },
    };

    // async submitPayment(data: { discordId: string, slipUrl: string, membershipType: string, amount: number }) {
    //     const user = await this.userRepo.findOne({ where: { discordId: data.discordId } });
    //     if(!user){
    //         throw new Error('User not found');
    //     };

    //     const newPayment = this.paymentRepo.create({
    //         discordId: data.discordId,
    //         slipUrl: data.slipUrl,
    //         membershipType: data.membershipType,
    //         amount: data.amount,
    //     });

    //     return await this.paymentRepo.save(newPayment);
    // }

    // async verifyPayment(discordId: string) {
    //     const payment = await this.paymentRepo.findOne({ where: { discordId } });
    //     if(!payment){
    //         throw new Error('Payment not found');
    //     };

    //     payment.isVerified = true;
    //     return await this.paymentRepo.save(payment);
    // }

    async createPayment(tier: number, type: 'monthly' | 'yearly', userId: string) {
      const priceId = this.priceMap[tier][type];
      if (!priceId) {
        throw new Error(`Price ID not found for tier ${tier} and type ${type}`);
      }
  
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: 'https://yumistack.net/dashboard?to=user/premium',
        cancel_url: 'https://yumistack.net/',
        metadata: {
          userId: userId,
          orderId: priceId,
          duration: type,
        },
        subscription_data: {
          metadata: {
            userId: userId,
            orderId: priceId,
            duration: type,
          },
        },
      });
  
      return { url: session.url };
    }
    
    constructEvent(body: any, signature: string | string[], webhookSecret: string): Stripe.Event {
      return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  
    async fulfillOrder(session: Stripe.Checkout.Session): Promise<void> {
      const orderId = session?.metadata?.orderId;
      const userId = session?.metadata?.userId;
  
      if(!orderId || !userId){
        throw new Error('Order ID or User ID is missing in session metadata.');
      }
      // console.log(`Fulfilling order ${orderId} for user ${userId} with amount ${amountTotal}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    async paymentSuccess(invoice: Stripe.Invoice) {
      const metadata = invoice.parent?.subscription_details?.metadata;
      const userId = metadata.userId;
      const user = await this.userRepo.findOne({ where: { discordId: userId } });
      const amount = invoice.amount_due / 100;
      const currency = invoice.currency.toUpperCase();
      const period = invoice.lines.data[0].period;
      const paidAt = new Date(period.start * 1000);
      const expiredAt = new Date(period.end * 1000);
      console.log(`การชำระเงินสำเร็จ สมัครโดย ${userId} จำนวน ${currency + amount} เมื่อ ${paidAt} จนถึง ${expiredAt}`);
      // ดำเนินการอัพเดตสมาชิกใน DB
      // await this.paymentRepo.update(userId, subscriptionId, 'active');
      return console.log(invoice);
    }
}