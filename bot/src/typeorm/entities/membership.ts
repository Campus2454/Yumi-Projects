import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'memberships' })
export class Membership {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'discord_id', length: 64 })
    discordId: string;

    @Column({ name: 'type', length: 24 })
    type: 'premium' | 'membership';
    
    @Column({ name: 'duration', length: 24 })
    duration: 'monthly' | 'yearly';

    @Column({ name: 'tier', nullable: true })
    tier: number;

    @Column({ name: 'server_id', nullable: true, unique: true, length: 64 })
    serverId: string;

    @Column({ name: 'server_ids', type: 'json', nullable: true })
    serverIds: string[];

    @Column({ name: 'is_active', default: false })
    isActive: boolean;

    @Column({ name: 'start_date', type: 'datetime', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'datetime', nullable: true })
    endDate: Date;
}