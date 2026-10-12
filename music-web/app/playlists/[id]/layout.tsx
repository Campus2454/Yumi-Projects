// app/playlists/[id]/layout.tsx
import pool from '@/lib/db';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  // ดึงชื่อเพลย์ลิสต์จาก DB มาทำ Title
  const [rows]: any = await pool.query('SELECT name FROM playlists WHERE id = ?', [id]);
  const playlistName = rows[0]?.name || 'Playlist';

  return {
    title: playlistName, // ผลลัพธ์จะเป็น "ชื่อเพลย์ลิสต์ | Chompu"
  };
}

export default function PlaylistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}