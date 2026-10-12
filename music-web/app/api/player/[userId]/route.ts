import { NextResponse } from "next/server";

async function findGuildId(userId: string) {
  try{
    const pathAll = ['', '/main', '/dev'];
    const playerRes = await Promise.all(pathAll.map(async(p)=>{
      const res = await fetch(`https://api.yumistack.net/music${p}/userChannelId/${userId}`, {
        headers: { Authorization: 'Basic '+btoa(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`) }
      });
      if(!res.ok)return null;
      return res.json() as Promise<{ userId: string; guildId: string | null; channelId: string | null; updatedAt: number; }>;
    }));
    let latest = null;
    for(const p of playerRes){
      if(!p || !p.updatedAt)continue;

      if(!latest || (p.updatedAt > latest.updatedAt)){
        latest = p;
      }
    };
    if(!latest)return null;
    return { userId, guildId: latest.guildId, channelId: latest.channelId };
  }catch(error){ throw error };
};

async function findPlayer(guildId: string, channelId: string) {
  try{
    const pathAll = ['', '/main', '/dev'];
    const hasPlayerRes = await Promise.all(pathAll.map(async(p)=>{
      const res = await fetch(`https://api.yumistack.net/music${p}/${guildId}/${channelId}/hasPlayer`, {
        headers: { Authorization: 'Basic '+btoa(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`) }
      });
      if(!res.ok)return null;
      return res.json() as Promise<{ hasPlayer: boolean; id: number; }>;
    }));
    let botId: number | undefined;
    const hasPlayer = hasPlayerRes.some(v=>{
      if(v?.hasPlayer === true){
        botId = v.id;
        return true;
      };
    });
    return { hasPlayer, botId };
  }catch(error){ throw error };
};

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try{
    const { userId } = await params;
    if(!userId)return NextResponse.json({ message: 'Missing userId' }, { status: 400 });

    const { guildId, channelId } = (await findGuildId(userId)) || {};
    if(!guildId || !channelId)return NextResponse.json({ message: 'No user voice channel found' }, { status: 404 });

    const { hasPlayer, botId } = await findPlayer(guildId, channelId);

    return NextResponse.json({ guildId, channelId, hasPlayer, botId }, { status: 200 });
  }catch(error){
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
