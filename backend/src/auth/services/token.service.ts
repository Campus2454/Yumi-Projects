import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { response } from "express";
import { User } from "src/utils/typeorm/entities/User";
import { Repository } from "typeorm";

@Injectable()
export class tokenService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

    async checkToken(token: string) {
        try{
            const res = await fetch('https://discord.com/api/users/@me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(res.ok){
                return true;
            }else{
                return false;
            };
        }catch(error){
            return false;
        };
    };
    async refreshToken(refreshToken: string) {
        try{
            const res = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: process.env.DISCORD_CLIENT_ID,
                    client_secret: process.env.DISCORD_CLIENT_SECRET,
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                }),
            });
            if(res.ok){
                const data = await res.json();
                if (data.access_token && data.refresh_token) {
                    return {
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                    };
                }
                return false;
            }else{
                return false;
            };
        }catch(error){
            return false;
        }
    };
    async updateToken(discordId: string, token: { accessToken: string, refreshToken: string }) {
        try{
            const user = await this.userRepository.findOne({ where: { discordId } });
            user.accessToken = token.accessToken;
            user.refreshToken = token.refreshToken;
            await this.userRepository.save(user);
        }catch(error){
            return false;
        }
    };
    async deleteUser(id: number, discordId: string, accessToken: string, refreshToken: string) {
        const user = await this.userRepository.findOne({ where: { id, discordId, accessToken, refreshToken } });
        if(user){
            return await this.userRepository.delete(user);
        }
        return;
    };
}