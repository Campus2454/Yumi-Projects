import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'discord_id', length: 64 })
  discordId: string;

  @Column({ name: 'order_id', length: 64 })
  orderId: string;

  @Column({ name: 'tier' })
  tier: number;
  
  @Column({ name: 'duration', length: 64 })
  duration: 'monthly' | 'yearly';

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'currency', length: 64 })
  currency: string;

  @Column({ name: 'status', length: 64 })
  status: string;

  @Column({ name: 'paid_at', type: 'datetime' })
  paidAt: Date;

  @Column({ name: 'expired_at', type: 'datetime' })
  expiredAt: Date;
}