'use client';

import { GripVertical, X, Pencil, Plus, Share2, Trash2, User, ArrowLeft, Save } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function PlaylistDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [trackUrl, setTrackUrl] = useState('');
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlaylist = async () => {
    try {
      const id = pathname.split('/')[3];
      const res = await fetch(`/api/playlists/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPlaylist(data);
        setEditName(data.name);
      } else {
        alert('คุณไม่มีสิทธิ์เข้าถึงเพลย์ลิสต์นี้');
        router.push(pathname.split('/').slice(0, 3).join('/'));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [pathname]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
      alert('คัดลอกลิงก์เพลย์ลิสต์เรียบร้อยแล้ว!');
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('คัดลอกลิงก์เพลย์ลิสต์เรียบร้อยแล้ว!');
      } catch (err) {
        alert('ไม่สามารถคัดลอกลิงก์ได้ กรุณาคัดลอก URL ด้านบนด้วยตัวเอง');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleClonePlaylist = async () => {
    setIsSubmitting(true);
    try {
      const id = pathname.split('/')[3];
      const res = await fetch(`/api/playlists/${id}/clone`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert('บันทึกเป็นเพลย์ลิสต์ของคุณเรียบร้อยแล้ว!');
        router.push(`/playlists/${data.newId}`);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกเพลย์ลิสต์');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTrack = async () => {
    if (!trackUrl) return;
    setIsSubmitting(true);
    try {
      const id = pathname.split('/')[3];
      const res = await fetch(`/api/playlists/${id}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trackUrl })
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setTrackUrl('');
        fetchPlaylist();
      } else {
        const data = await res.json();
        alert(data.error || 'เกิดข้อผิดพลาดในการเพิ่มเพลง');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlaylist = async () => {
    if (!editName.trim()) return;
    setIsSubmitting(true);
    try {
      const id = pathname.split('/')[3];
      const res = await fetch(`/api/playlists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchPlaylist();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlaylist = async () => {
    setIsSubmitting(true);
    try {
      const id = pathname.split('/')[3];
      const res = await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
      if (res.ok) router.push('/playlists');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเพลงนี้ออกจากเพลย์ลิสต์?')) return;
    try {
      const id = pathname.split('/')[3];
      const res = await fetch(`/api/playlists/${id}/tracks/${trackId}`, { method: 'DELETE' });
      if (res.ok) fetchPlaylist();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="pt-10 text-center text-white/50">กำลังโหลด...</div>;
  if (!playlist) return <div className="pt-10 text-center text-white/50">ไม่พบเพลย์ลิสต์</div>;

  return (
    <div className="flex flex-col min-h-[85vh] pt-4 relative">
      <Link href={pathname.split('/').slice(0, 3).join('/')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 w-fit text-sm">
        <ArrowLeft size={16} /> ย้อนกลับ
      </Link>

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-1">{playlist.name}</h1>
        <p className="text-white/50 text-sm">เพลงทั้งหมด {playlist.trackCount} เพลง</p>
      </div>

      <hr className="border-white/10 mb-8" />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[400px] flex flex-col gap-6 p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl h-fit">
          <img src={playlist.cover} alt={playlist.name} className="w-full aspect-square object-cover rounded-xl" />
          <div>
            <h2 className="text-xl font-bold text-white">{playlist.name}</h2>
            <p className="text-white/50 text-sm mt-1">
              เพลย์ลิสต์ • {playlist.visibility === 'public' ? 'สาธารณะ' : 'ส่วนตัว'} • {playlist.trackCount} เพลง
            </p>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-[#111] border border-white/5 rounded-xl">
            <span className="text-white/60 text-xs font-bold">สร้างโดย</span>
            <div className="flex items-center gap-3">
              <img src={playlist.creator?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-10 h-10 rounded-full object-cover" alt="Creator" />
              <div>
                <p className="text-white text-sm font-medium">{playlist.creator?.name || 'Unknown'}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 bg-white/10 rounded-full text-[10px] text-white/80">
                  <User size={10} /><span>@{playlist.creator?.username || 'unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {playlist.isOwner ? (
              <>
                <button onClick={() => setIsEditModalOpen(true)} className="w-10 h-10 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] border border-white/10 rounded-full text-white/70 transition-all" title="แก้ไขชื่อ"><Pencil size={16} /></button>
                <button onClick={() => setIsAddModalOpen(true)} className="w-10 h-10 flex items-center justify-center bg-primary/20 hover:bg-primary/40 border border-primary/50 rounded-full text-white transition-all" title="เพิ่มเพลง"><Plus size={16} /></button>
              </>
            ) : (
              <button onClick={handleClonePlaylist} disabled={isSubmitting} className="w-10 h-10 flex items-center justify-center bg-primary/20 hover:bg-primary/40 border border-primary/50 rounded-full text-white transition-all" title="บันทึกลงเพลย์ลิสต์ของฉัน">
                <Save size={16} />
              </button>
            )}
            
            <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] border border-white/10 rounded-full text-white/70 transition-all" title="แชร์เพลย์ลิสต์"><Share2 size={16} /></button>
            
            {playlist.isOwner && (
              <button onClick={() => setIsDeleteModalOpen(true)} className="w-10 h-10 flex items-center justify-center bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 rounded-full text-red-500 transition-all" title="ลบเพลย์ลิสต์"><Trash2 size={16} /></button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 bg-[#0a0a0a] border border-white/5 rounded-2xl min-h-[500px]">
          {playlist.tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50 gap-2">
              <p>ยังไม่มีเพลงในเพลย์ลิสต์นี้</p>
              {playlist.isOwner && <button onClick={() => setIsAddModalOpen(true)} className="text-primary hover:underline text-sm mt-2">คลิกเพื่อเพิ่มเพลงแรกเลย</button>}
            </div>
          ) : (
            playlist.tracks.map((track: any) => (
              <div key={track.id} className="flex items-center justify-between p-3 hover:bg-[#111] rounded-xl transition-all group">
                <div className="flex items-center gap-4">
                  {playlist.isOwner ? (
                    <GripVertical size={20} className="text-white/20 cursor-grab hover:text-white/50" />
                  ) : (
                    <div className="w-5" /> 
                  )}
                  <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h4 className="text-white text-sm font-medium group-hover:text-primary transition-colors">{track.title}</h4>
                    <p className="text-white/50 text-xs mt-1">{track.artist}</p>
                  </div>
                </div>
                {playlist.isOwner && (
                  <button onClick={() => handleDeleteTrack(track.id)} className="p-2 text-white/30 hover:text-red-500 transition-colors"><X size={18} /></button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">เพิ่มเพลงใหม่</h2>
            <input 
              type="text" placeholder="วางลิงก์ YouTube ที่นี่..." value={trackUrl}
              onChange={(e) => setTrackUrl(e.target.value)}
              className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary/50 mb-6" autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5">ยกเลิก</button>
              <button onClick={handleAddTrack} disabled={!trackUrl || isSubmitting} className="px-6 py-2 bg-primary hover:bg-red-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
                {isSubmitting ? 'กำลังค้นหา...' : 'เพิ่มเพลง'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">แก้ไขชื่อเพลย์ลิสต์</h2>
            <input 
              type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary/50 mb-6" autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5">ยกเลิก</button>
              <button onClick={handleEditPlaylist} disabled={!editName.trim() || isSubmitting} className="px-6 py-2 bg-primary hover:bg-red-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0a0a0a] border border-red-900/30 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-red-500 mb-2">ยืนยันการลบ</h2>
            <p className="text-white/60 text-sm mb-6">คุณแน่ใจหรือไม่ที่จะลบเพลย์ลิสต์นี้? ข้อมูลเพลงทั้งหมดจะหายไปและไม่สามารถกู้คืนได้</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5">ยกเลิก</button>
              <button onClick={handleDeletePlaylist} disabled={isSubmitting} className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
                {isSubmitting ? 'กำลังลบ...' : 'ลบเพลย์ลิสต์'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}