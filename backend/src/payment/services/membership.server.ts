import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Membership } from 'src/utils/typeorm/entities/Membership';
import { User } from 'src/utils/typeorm/entities/User';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MembershipService {
    @InjectRepository(Membership) private readonly membershipRepo: Repository<Membership>
    @InjectRepository(User) private readonly userRepo: Repository<User>

    async createMembership(data: { discordId: string, type: 'premium' | 'membership', duration: 'monthly' | 'yearly', serverId: string }) {
        const user = await this.userRepo.findOne({ where: { discordId: data.discordId } });
        if(!user){
            throw new Error('User not found');
        };

        const membership = await this.membershipRepo.findOne({ where: { discordId: data.discordId, type: data.type } });
        if(membership){
            return 'Your application information of this type is already in the database'
        }else{
            const newMembership = this.membershipRepo.create({
                discordId: data.discordId,
                type: data.type,
                duration: data.duration,
                serverId: data.serverId,
                isActive: false,
                startDate: new Date(),
                endDate: this.calculateEndDate(data.duration),
            });
    
            return await this.membershipRepo.save(newMembership);
        }
    }

    async updateMembership(data: { discordId: string, type: 'premium' | 'membership', duration?: 'monthly' | 'yearly', tier?: number, serverId?: string, serverIds?: string, isActive?: boolean }) {
        let membership: Membership;
        membership = await this.membershipRepo.findOne({ where: { discordId: data.discordId, type: data.type } });
        if(!membership){
            throw new Error('Membership not found');
        };
        
        if (data.duration) membership.duration = data.duration;
        if (data.tier !== undefined) membership.tier = data.tier;
        if (data.isActive !== undefined) membership.isActive = data.isActive == true ? true : false;

        if (data.type === 'membership') {
            if(data.serverIds == null || data.serverIds.length == 0){ membership.serverIds = null }
            else if(data.serverIds){ membership.serverIds = [...new Set([...data.serverIds])] };
        };
        return await this.membershipRepo.save(membership);
    }

    async activateMembership(data: { discordId: string, type: 'premium' | 'membership', isActive: string }) {
        const membership = await this.membershipRepo.findOne({ where: { discordId: data.discordId, type: data.type } });
        if(!membership){
            throw new Error('Membership not found');
        };

        membership.isActive = data.isActive == 'true' ? true : false;
        return await this.membershipRepo.save(membership);
    }

    private calculateEndDate(duration: 'monthly' | 'yearly'): Date {
        const now = new Date();
        if(duration === 'monthly'){
            now.setMonth(now.getMonth() + 1);
        }else if(duration === 'yearly'){
            now.setFullYear(now.getFullYear() + 1);
        };
        return now;
    }
}