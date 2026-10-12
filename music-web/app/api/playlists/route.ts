import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db'; // ไฟล์เชื่อม DB ที่เราสร้างไว้

export async function GET(request: Request) {
  try {
    // ดึงข้อมูล User จาก Token (token.sub คือ Discord ID)
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ดึงข้อมูลเพลย์ลิสต์ พร้อมนับจำนวนเพลง และดึงรูปปกจากเพลงแรก
    const [rows] = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        p.created_at as date,
        (SELECT thumbnail FROM playlist_tracks WHERE playlist_id = p.id ORDER BY position ASC LIMIT 1) as image,
        (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as trackCount
      FROM playlists p
      WHERE p.discord_id = ?
      ORDER BY p.created_at DESC
    `, [token.sub]);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("API Playlists Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    // บันทึกเพลย์ลิสต์ใหม่ลง Database
    const [result] = await pool.query(
      `INSERT INTO playlists (discord_id, name, visibility) VALUES (?, ?, 'public')`,
      [token.sub, body.name]
    );

    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error("Create Playlist Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}