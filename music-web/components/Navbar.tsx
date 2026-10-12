'use client';

import Link from 'next/link';
import { Home, Terminal, Star, Mail, Activity, LogIn } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-4 z-50 w-full glass px-6 py-4 flex items-center justify-between mx-auto max-w-7xl">
      {/* Logo */}
      <Link href="/" className="font-bold text-xl flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">Y</div>
        <span>Yumi</span>
      </Link>

      {/* Navigation & Status (เปลี่ยน Status เป็นไอคอนปกติแล้ว) */}
      <div className="flex items-center gap-6 text-white/70 text-sm font-medium">
        <Link href="/" className="flex items-center gap-2 hover:text-primary transition-colors">
          <Home size={20} />
          <span className="hidden md:inline">หน้าแรก</span>
        </Link>
        <Link href="/commands" className="flex items-center gap-2 hover:text-primary transition-colors">
          <Terminal size={20} />
          <span className="hidden md:inline">คำสั่ง</span>
        </Link>
        <Link href="/premium" className="flex items-center gap-2 hover:text-primary transition-colors">
          <Star size={20} />
          <span className="hidden md:inline">พรีเมียม</span>
        </Link>
        <Link href="/contact" className="flex items-center gap-2 hover:text-primary transition-colors">
          <Mail size={20} />
          <span className="hidden md:inline">ติดต่อเรา</span>
        </Link>
        <Link href="/status" className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
          <Activity size={20} />
          <span className="hidden md:inline">Status</span>
        </Link>
      </div>

      {/* Auth Section (มุมขวา) */}
      <div>
        {status === 'loading' ? (
          // ระหว่างโหลด ให้แสดงวงกลมสีเทาๆ กระพริบ
          <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse"></div>
        ) : session ? (
          // ถ้าล็อกอินแล้ว โชว์รูปโปรไฟล์ (กดแล้วไปหน้า Dashboard)
          <Link href="/dashboard" title="Go to Dashboard">
            <img 
              src={session.user?.image || ''} 
              alt="Profile" 
              className="w-9 h-9 rounded-full border-2 border-transparent hover:border-primary transition-all object-cover"
            />
          </Link>
        ) : (
          // ถ้ายังไม่ล็อกอิน โชว์ปุ่ม Login
          <button 
            onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-800 text-white rounded-full text-sm font-medium transition-all"
          >
            <LogIn size={16} />
            <span className="hidden md:inline">Login</span>
          </button>
        )}
      </div>
    </nav>
  );
}