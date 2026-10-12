import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, trackId: string }> }) {
  try {
    const { id, trackId } = await params;
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // เช็คสิทธิ์ว่าเป็นเจ้าของเพลย์ลิสต์ไหม ก่อนให้ลบเพลง
    const [playlists] = await pool.query(`SELECT id FROM playlists WHERE id = ? AND discord_id = ?`, [id, token.sub]);
    if ((playlists as any[]).length === 0) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    await pool.query(`DELETE FROM playlist_tracks WHERE id = ? AND playlist_id = ?`, [trackId, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Track Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}