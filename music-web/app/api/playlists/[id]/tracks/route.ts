import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

// ฟังก์ชันแกะ Video ID จากลิงก์ YouTube
function extractYouTubeID(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { url } = body;

    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const videoId = extractYouTubeID(url);
    if (!videoId) return NextResponse.json({ error: 'ลิงก์ YouTube ไม่ถูกต้อง' }, { status: 400 });

    // ดึงข้อมูลจาก YouTube API
    const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`);
    const ytData = await ytRes.json();

    if (!ytData.items || ytData.items.length === 0) {
      return NextResponse.json({ error: 'ไม่พบวิดีโอนี้บน YouTube' }, { status: 404 });
    }

    const snippet = ytData.items[0].snippet;
    const title = snippet.title;
    const artist = snippet.channelTitle; // ใช้ชื่อช่องเป็นชื่อศิลปิน
    const thumbnail = snippet.thumbnails.high?.url || snippet.thumbnails.default?.url;

    // หาลำดับ (position) ล่าสุดในเพลย์ลิสต์
    const [rows] = await pool.query(
      `SELECT MAX(position) as maxPos FROM playlist_tracks WHERE playlist_id = ?`, 
      [id]
    );
    const nextPos = ((rows as any[])[0].maxPos || 0) + 1;

    // บันทึกเพลงใหม่ลงฐานข้อมูล
    await pool.query(
      `INSERT INTO playlist_tracks (playlist_id, title, artist, thumbnail, url, position) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, title, artist, thumbnail, url, nextPos]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add Track Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

// API สำหรับลบเพลย์ลิสต์
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ข้อมูลเพลงใน playlist_tracks จะถูกลบอัตโนมัติด้วย (ON DELETE CASCADE)
    await pool.query(`DELETE FROM playlists WHERE id = ? AND discord_id = ?`, [id, token.sub]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}