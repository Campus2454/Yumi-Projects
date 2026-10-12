import { NextResponse } from 'next/server';

const guildMembershipCache = new Map<string, { inGuild: boolean, expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function GET(request: Request, { params }: { params: Promise<{ guildId: string }> }) {
  try {
    const { guildId } = await params;
    
    const botTokens = Object.keys(process.env)
      .filter(key => key.startsWith('DISCORD_BOT_'))
      .map(key => process.env[key] as string);

    if (botTokens.length === 0) {
      return NextResponse.json({ error: 'ไม่พบ Token บอทในระบบ' }, { status: 400 });
    }

    const activeBots: any[] = [];
    const now = Date.now();

    await Promise.all(botTokens.map(async (token) => {
      try {
        const meRes = await fetch('https://discord.com/api/v10/users/@me', {
          headers: { Authorization: `Bot ${token}` },
          next: { revalidate: 300 }
        });
        if (!meRes.ok) return;
        const meData = await meRes.json();

        const cacheKey = `${guildId}_${meData.id}`;
        let isInGuild = false;

        if (guildMembershipCache.has(cacheKey) && guildMembershipCache.get(cacheKey)!.expires > now) {
          isInGuild = guildMembershipCache.get(cacheKey)!.inGuild;
        } else {
          const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
            headers: { Authorization: `Bot ${token}` },
            cache: 'no-store'
          });
          isInGuild = guildRes.ok;
          guildMembershipCache.set(cacheKey, { inGuild: isInGuild, expires: now + CACHE_TTL });
        }

        if (!isInGuild) return;

        let voiceId = undefined;
        const voiceRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/voice-states/@me`, {
          headers: { Authorization: `Bot ${token}` },
          cache: 'no-store' 
        });
        
        if (voiceRes.ok) {
          const voiceData = await voiceRes.json();
          voiceId = voiceData.channel_id;
        }

        activeBots.push({
          id: meData.id,
          name: meData.username,
          avatar: meData.avatar ? `https://cdn.discordapp.com/avatars/${meData.id}/${meData.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png',
          voiceId: voiceId || undefined,
          connected: !!voiceId
        });

      } catch (error) {
        console.error('Error fetching bot data:', error);
      }
    }));

    return NextResponse.json(activeBots);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}