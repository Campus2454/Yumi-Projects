import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. ดึงข้อมูลเพลย์ลิสต์ต้นฉบับ
    const [playlistRows] = await pool.query(`SELECT * FROM playlists WHERE id = ?`, [id]);
    if ((playlistRows as any[]).length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const originalPlaylist = (playlistRows as any[])[0];

    // เช็คสิทธิ์ (ต้องเป็น public หรือเป็นเจ้าของเอง)
    if (originalPlaylist.visibility !== 'public' && originalPlaylist.discord_id !== token.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. สร้างเพลย์ลิสต์ใหม่ให้คนกดบันทึก (ตั้งชื่อต่อท้ายว่า Copy)
    const newName = `${originalPlaylist.name} (Copy)`;
    const [insertResult] = await pool.query(
      `INSERT INTO playlists (discord_id, name, visibility) VALUES (?, ?, 'private')`,
      [token.sub, newName]
    );
    const newPlaylistId = (insertResult as any).insertId;

    // 3. คัดลอกเพลงทั้งหมดมาใส่เพลย์ลิสต์ใหม่
    const [trackRows] = await pool.query(`SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY position ASC`, [id]);
    const tracks = trackRows as any[];

    if (tracks.length > 0) {
      const values = tracks.map(t => [newPlaylistId, t.title, t.artist, t.thumbnail, t.url, t.position]);
      await pool.query(
        `INSERT INTO playlist_tracks (playlist_id, title, artist, thumbnail, url, position) VALUES ?`,
        [values]
      );
    }

    return NextResponse.json({ success: true, newId: newPlaylistId });
  } catch (error) {
    console.error("Clone Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}