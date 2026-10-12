import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

// 1. ดึงข้อมูลเพลย์ลิสต์ (GET)
// ทับเฉพาะฟังก์ชัน GET ใน app/api/playlists/[id]/route.ts
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; 
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });

    const [playlistRows] = await pool.query(`SELECT * FROM playlists WHERE id = ?`, [id]);
    if ((playlistRows as any[]).length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const playlist = (playlistRows as any[])[0];

    const isOwner = token ? token.sub === playlist.discord_id : false;
    if (playlist.visibility !== 'public' && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [trackRows] = await pool.query(`SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY position ASC`, [id]);

    // --- ดึงข้อมูลเจ้าของจาก Discord API ---
    let creator = { name: 'Unknown', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', username: 'unknown' };
    try {
      const userRes = await fetch(`https://discord.com/api/v10/users/${playlist.discord_id}`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
      });
      if (userRes.ok) {
        const u = await userRes.json();
        creator = {
          name: u.global_name || u.username,
          avatar: u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png` : creator.avatar,
          username: u.username
        };
      }
    } catch (e) { console.error("Discord API Error", e); }

    return NextResponse.json({
      ...playlist,
      tracks: trackRows,
      trackCount: (trackRows as any[]).length,
      cover: (trackRows as any[])[0]?.thumbnail || 'https://placeholder.co/400/111111/FFFFFF?text=No+Cover',
      isOwner,
      creator // ส่งข้อมูลคนสร้างไปที่หน้าเว็บ
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. แก้ไขชื่อเพลย์ลิสต์ (PUT)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    await pool.query(
      `UPDATE playlists SET name = ? WHERE id = ? AND discord_id = ?`,
      [name, id, token.sub]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 3. ลบเพลย์ลิสต์ (DELETE)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ข้อมูลเพลงใน playlist_tracks จะถูกลบอัตโนมัติด้วย
    await pool.query(`DELETE FROM playlists WHERE id = ? AND discord_id = ?`, [id, token.sub]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}