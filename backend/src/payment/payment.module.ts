import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/utils/typeorm/entities/Payment';
import { Membership } from 'src/utils/typeorm/entities/Membership';
import { MembershipController } from './controllers/membership.controller';
import { PaymentController } from './controllers/payment.controller';
import { MembershipService } from './services/membership.server';
import { PaymentService } from './services/payment.service';
import { User } from 'src/utils/typeorm/entities/User';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Membership, User])],
    controllers: [MembershipController, PaymentController],
    providers: [
        MembershipService,
        PaymentService,
    ],
})
export class PaymentModule {}
