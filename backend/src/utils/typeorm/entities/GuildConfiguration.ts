import { RESTPostAPIChannelMessageJSONBody } from "discord.js";
import { GuildWelcomeSetting } from "global/src/types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'guild_configurations' })
export class GuildConfiguration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true , name: 'guild_id', length: 64 })
    guildId: string;

    @Column({ default: '!', length: 1 })
    prefix: string;

    @Column({ type: 'longtext', name: 'audit_log_settings', nullable: true })
    auditLogSettings: string | null;

    @Column({ type: 'longtext', name: 'welcome_setting', nullable: true })
    private _welcomeSetting: string | null;
    get welcomeSetting(): GuildWelcomeSetting | null {
        return this._welcomeSetting ? JSON.parse(this._welcomeSetting) : null;
    }
    set welcomeSetting(value: GuildWelcomeSetting | null) {
        this._welcomeSetting = value ? JSON.stringify(value) : null;
    }
    toJSON() {
        const { _welcomeSetting, ...rest } = this as any;

        return {
            ...rest,
            welcomeSetting: this.welcomeSetting,
        };
    }

    @Column({ type: 'longtext', name: 'cache', nullable: true })
    private _cache: string | null;
    get cache(): { commandUser: { channelId: string; messageId: string }[] } | null {
        return this._cache ? JSON.parse(this._cache) : null;
    }
    set cache(value: { commandUser: { channelId: string; messageId: string }[] } | null) {
        this._cache = value ? JSON.stringify(value) : null;
    }
}
