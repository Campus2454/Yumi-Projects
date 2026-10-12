import { Player } from "@/app/dashboardV2/utils/types";
import { NextResponse } from "next/server";

const pathAll = {
  32063: '',
  32062: '/main',
  32162: '/dev'
};

async function playerData(guildId: string, channelId: string, botId: 32062 | 32063 | 32162) {
  try {
    const player = await (async () => {
      const p = pathAll[botId];
      const res = await fetch(`https://api.yumistack.net/music${p}/${guildId}/${channelId}/data`, {
        headers: { Authorization: 'Basic ' + btoa(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`) }
      });
      if (!res.ok) return null;
      return await res.json() as Player;
    })();
    return player;
  } catch (error) { throw error };
};

async function playerAction(guildId: string, channelId: string, action: string, value: any, requester: any, botId: 32062 | 32063 | 32162) {
  try {
    const res = await (async () => {
      const p = pathAll[botId];
      const res = await fetch(`https://api.yumistack.net/music${p}/${guildId}/${channelId}/control`, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, value, requester })
      });
      if (!res.ok) return null;
      return await (res.json() as Promise<{ player: Player, success: boolean }>);
    })();
    return res?.player;
  } catch (error) { throw error };
};

export async function GET(req: Request, { params }: { params: Promise<{ userId: string, guildId: string, channelId: string }> }) {
  try {
    const { userId, guildId, channelId } = await params;
    const botId = parseInt(userId) as 32062 | 32063 | 32162;
    if (!botId) return NextResponse.json({ message: 'Missing botId' }, { status: 400 });
    if (!guildId) return NextResponse.json({ message: 'Missing guildId' }, { status: 400 });
    if (!channelId) return NextResponse.json({ message: 'Missing channelId' }, { status: 400 });

    const player = await playerData(guildId, channelId, botId);

    return NextResponse.json({ player }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

export async function POST(req: Request, { params }: { params: Promise<{ userId: string, guildId: string, channelId: string }> }) {
  try {
    const { userId, guildId, channelId } = await params;
    const { action, value, requester } = await req.json() as { action?: string; value?: any; requester?: any };
    const botId = parseInt(userId) as 32062 | 32063 | 32162;
    if (!botId) return NextResponse.json({ message: 'Missing botId' }, { status: 400 });
    if (!guildId) return NextResponse.json({ message: 'Missing guildId' }, { status: 400 });
    if (!channelId) return NextResponse.json({ message: 'Missing channelId' }, { status: 400 });
    if (!action) return NextResponse.json({ message: 'Missing action' }, { status: 400 });

    const player = await playerAction(guildId, channelId, action, value, requester, botId);
    console.log(player);

    return NextResponse.json({ player }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
