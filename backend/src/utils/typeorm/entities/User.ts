import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Membership } from "./Membership";
import { Payment } from "./Payment";

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, name: 'discord_id', length: 64 })
    discordId: string;

    @Column({ name: 'access_token', length: 191 })
    accessToken: string;

    @Column({ name: 'refresh_token', length: 191 })
    refreshToken: string;
}