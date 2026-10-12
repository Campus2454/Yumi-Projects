'use client';

import { Search, List, PlusSquare, Share2, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State สำหรับ Popup สร้างเพลย์ลิสต์
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/playlists');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // ฟังก์ชันกดบันทึกเพลย์ลิสต์
  const handleCreatePlaylist = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        setNewName('');
        setIsModalOpen(false);
        fetchPlaylists(); // โหลดข้อมูลใหม่มาแสดงทันที
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatThaiDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543} ${d.toLocaleTimeString('th-TH')}`;
  };

  return (
    <div className="flex flex-col min-h-[85vh] pt-4 relative">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-1">Playlists</h1>
        <p className="text-white/50 text-sm">ระบบเพลย์ลิสต์</p>
      </div>

      <hr className="border-white/10 mb-8" />

      <div className="flex items-center gap-3 w-full bg-[#0a0a0a] border border-white/5 rounded-xl p-4 mb-6">
        <List size={20} className="text-white/50" />
        <span className="text-sm text-white/80 font-medium">
          เพลย์ลิสต์ทั้งหมด {playlists.length} เพลย์ลิสต์
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาเพลย์ลิสต์" 
            className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-all"
          />
        </div>

        {/* ปุ่มเปิด Popup */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2.5 bg-[#0a0a0a] hover:bg-[#111] border border-white/5 text-white/90 rounded-xl text-sm font-medium transition-all"
        >
          <PlusSquare size={18} />
          <span>สร้างเพลย์ลิสต์</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-white/50 text-sm">กำลังโหลดข้อมูล...</div>
      ) : playlists.length === 0 ? (
        <div className="text-white/50 text-sm">ยังไม่มีเพลย์ลิสต์ กดสร้างเพลย์ลิสต์ได้เลย</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="relative group flex items-center justify-between p-3 bg-[#0a0a0a] hover:bg-[#111] border border-white/5 rounded-2xl transition-all">
              <Link href={`/playlists/${playlist.id}`} className="flex items-center gap-4 flex-1">
                <img 
                  src={playlist.image || 'https://placehold.co/150/111111/FFFFFF?text=No+Cover'} 
                  alt={playlist.name} 
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-white font-medium text-base group-hover:text-primary transition-colors">{playlist.name}</h3>
                  <p className="text-white/40 text-xs mt-1">{formatThaiDate(playlist.date)}</p>
                </div>
              </Link>
              <button className="p-2 text-white/30 hover:text-white transition-colors mr-2">
                <Share2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Popup Modal สร้างเพลย์ลิสต์ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">สร้างเพลย์ลิสต์ใหม่</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ตั้งชื่อเพลย์ลิสต์ของคุณ..." 
              className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-all mb-6"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 transition-all"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleCreatePlaylist}
                disabled={!newName.trim() || isSubmitting}
                className="px-6 py-2 bg-primary hover:bg-red-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all"
              >
                {isSubmitting ? 'กำลังสร้าง...' : 'สร้างเพลย์ลิสต์'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}