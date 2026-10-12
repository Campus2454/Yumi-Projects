'use client';

import { useSession, signOut } from 'next-auth/react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [servers, setServers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

// ในไฟล์ app/dashboard/page.tsx
  const fetchServers = async () => {
    const token = (session as any)?.accessToken;
    if (!token) return;

    try {
      setIsLoading(true);
      // ยิงไปหา API ที่เราสร้างเมื่อกี้แทน
      const res = await fetch('/api/servers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const mutualGuilds = await res.json();

      // จัดรูปแบบให้พร้อมแสดงผล
      const formattedServers = mutualGuilds.map((guild: any) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon 
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` 
          : 'https://cdn.discordapp.com/embed/avatars/0.png'
      }));

      setServers(formattedServers);
    } catch (error) {
      console.error("Failed to fetch servers", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchServers();
    }
  }, [session, status]);

  return (
    <div className="flex flex-col min-h-[85vh] pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-white/50 text-sm">แผนควบคุมบอท</p>
      </div>

      <hr className="border-white/10 mb-8" />

      {/* Profile Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <img 
            src={session?.user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
            alt="Profile" 
            className="w-16 h-16 rounded-full border border-white/10 object-cover"
          />
          <div>
            {/* โชว์ Display Name */}
            <h2 className="text-xl font-bold text-white">
              {(session?.user as any)?.displayName || 'Loading...'}
            </h2>
            {/* โชว์ @username ของจริง */}
            <div className="inline-block px-3 py-1 mt-1 bg-white/10 rounded-full text-xs text-white/70">
              @{(session?.user as any)?.username || 'username'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/playlists" className="flex-1 md:flex-none text-center px-6 py-2.5 bg-[#141414] hover:bg-[#1f1f1f] border border-white/5 text-white/90 rounded-xl text-sm transition-all">
            จัดการเพลย์ลิสต์
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex-1 md:flex-none text-center px-6 py-2.5 bg-[#2a0808] hover:bg-[#3a0b0b] border border-red-900/30 text-red-400 rounded-xl text-sm transition-all"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาเซิร์ฟเวอร์" 
            className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f0f] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/invite" className="flex-1 md:flex-none text-center px-6 py-2 bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-white/5 text-white/80 rounded-xl text-sm transition-all">
            เชิญบอท
          </Link>
          <button onClick={()=>fetchServers()} className="flex-1 md:flex-none text-center px-6 py-2 bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-white/5 text-white/80 rounded-xl text-sm transition-all">
            รีโหลด
          </button>
        </div>
      </div>

      {/* Server Grid */}
      {isLoading ? (
        <div className="text-white/50 text-sm">กำลังโหลดเซิร์ฟเวอร์...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((server) => (
            <Link href={`/dashboard/${server.id}`} key={server.id} className="flex items-center gap-4 p-4 bg-[#0a0a0a] hover:bg-[#111] border border-white/5 rounded-2xl transition-all group">
              <img 
                src={server.icon} 
                alt={server.name} 
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div>
                <h3 className="text-white/90 text-sm font-medium group-hover:text-primary transition-colors">{server.name}</h3>
                <div className="inline-block px-2 py-0.5 mt-1.5 bg-white/5 border border-white/5 rounded text-[10px] text-white/50">
                  ห้องเล่นเพลง
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-16 pb-8 text-center text-xs text-white/40 flex flex-col gap-2">
        <p className="text-white/60">"ยูมิ โปรเจกต์"</p>
        <p>Copyright © 2026 yumiproject. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
        </div>
        <p className="mt-2">Made with <span className="text-red-500">❤️</span> by Yumi Team | Join Our Discord</p>
      </footer>
    </div>
  );
}