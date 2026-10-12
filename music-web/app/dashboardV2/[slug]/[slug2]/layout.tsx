import pool from '@/lib/db';

export async function generateMetadata({ params }: { params: { slug: string, slug2: string } }) {
  let title = 'Dashboard';
  const { slug, slug2 } = await params;
  
  const [rows]: any = await pool.query('SELECT name FROM playlists WHERE id = ?', [slug2]);
  title = rows[0]?.name || 'Playlist';

  return { title };
}

export default function DashboardLayout({ children, }: { children: React.ReactNode }) {
  return <>{children}</>
}
