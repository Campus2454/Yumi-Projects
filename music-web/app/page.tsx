'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Music, ListMusic, SlidersHorizontal, LayoutDashboard, Clock, Disc3, ChevronRight, Sparkles, Terminal, Zap, Server, Users, Play, ArrowRight, ExternalLink, Heart, Shield, Headphones } from 'lucide-react';

/* ─── animated counter ─── */
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    const step = Math.max(1, Math.floor(end / (duration * 60)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

/* ─── section wrapper with reveal ─── */
function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── feature icons map ─── */
const featureIcons: Record<string, React.ReactNode> = {
  music: <Music size={28} />, queue: <ListMusic size={28} />, filter: <SlidersHorizontal size={28} />,
  playlist: <Disc3 size={28} />, dashboard: <LayoutDashboard size={28} />, uptime: <Clock size={28} />,
};

/* ─── floating particles ─── */
function Particles() {
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className='absolute rounded-full'
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(185, 28, 28, ${Math.random() * 0.4 + 0.1})`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 50, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [stats, setStats] = useState({ users: '-', servers: '-', status: 'Unknown' });
  const [botInfo, setBotInfo] = useState<any>(null);
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/stats').then(r => { if (!r.ok) throw r.json(); return r.json(); }).then(d => {
      setStats({ users: d.members || '-', servers: d.guilds || '-', status: 'Online' });
      setStatsLoaded(true);
    }).catch(() => {
      setStats({ users: '-', servers: '-', status: 'Offline' });
      setStatsLoaded(true);
    });

    fetch('/api/bot-info').then(r => r.json()).then(setBotInfo).catch(() => { });
  }, []);

  const features = botInfo?.features || [];
  const commands = botInfo?.commands || [];
  const techStack = botInfo?.techStack || [];

  return (
    <div className='absolute inset-0 bg-background'>
      <div className='flex flex-col gap-32 relative w-[90%] left-[5%] top-[80px]'>
        {/* <Particles />
        <Particles />
        <Particles />
        <Particles />
        <Particles />
        <Particles />
        <Particles />
        <Particles /> */}

        {/* ══════════ HERO ══════════ */}
        <section className='relative flex flex-col items-center justify-center min-h-[85vh] text-center pt-12'>
          {/* glow bg */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none' />
          <div className='absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none' />

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} className='relative'>
            {/* avatar ring */}
            <div className='relative w-36 h-36 mx-auto mb-8'>
              <div className='absolute inset-0 rounded-full bg-gradient-to-br from-primary via-red-600 to-red-900 animate-spin' style={{ animationDuration: '8s' }} />
              <div className='absolute inset-[3px] rounded-full bg-black flex items-center justify-center'>
                <span className='text-6xl font-extrabold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent'>Y</span>
              </div>
              {/* pulse */}
              <div className='absolute inset-0 rounded-full bg-primary/30 animate-ping' style={{ animationDuration: '3s' }} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className='flex flex-col items-center gap-5'>
            <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium'>
              <Sparkles size={14} /> Discord Music Bot
            </div>

            <h1 className='text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.1]'>
              <span className='bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent'>Meet </span>
              <span className='bg-gradient-to-r from-primary via-red-500 to-red-400 bg-clip-text text-transparent'>Yumi</span>
            </h1>

            <p className='text-white/50 text-lg md:text-xl max-w-xl leading-relaxed'>
              บอทเพลง Discord คุณภาพสูง ขับเคลื่อนด้วย Lavalink<br className='hidden sm:block' />
              เล่นเพลงได้ทุกแพลตฟอร์ม พร้อม Web Dashboard ล้ำสมัย
            </p>

            <div className='flex flex-wrap items-center justify-center gap-4 mt-4'>
              <Link href='/invite' target='_blank' className='group relative inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-red-700 hover:from-red-700 hover:to-primary text-white rounded-full font-semibold transition-all duration-300 shadow-[0_0_30px_rgba(185,28,28,0.4)] hover:shadow-[0_0_50px_rgba(185,28,28,0.6)]'>
                <Play size={18} /> เชิญบอทเข้าเซิร์ฟเวอร์
                <ArrowRight size={16} className='group-hover:translate-x-1 transition-transform' />
              </Link>
              <Link href='/commands' className='inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-full font-semibold transition-all duration-300'>
                <Terminal size={18} /> ดูคำสั่งทั้งหมด
              </Link>
            </div>
          </motion.div>

          {/* hero stats bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className='flex items-center gap-8 mt-16 px-8 py-4 glass rounded-2xl'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'><Users size={20} /></div>
              <div className='text-left'>
                <p className='text-2xl font-bold'>{statsLoaded ? (typeof stats.users === 'number' ? <AnimatedCounter value={stats.users} /> : stats.users) : '...'}</p>
                <p className='text-xs text-white/40'>ผู้ใช้งาน</p>
              </div>
            </div>
            <div className='w-px h-10 bg-white/10' />
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'><Server size={20} /></div>
              <div className='text-left'>
                <p className='text-2xl font-bold'>{statsLoaded ? (typeof stats.servers === 'number' ? <AnimatedCounter value={stats.servers} /> : stats.servers) : '...'}</p>
                <p className='text-xs text-white/40'>เซิร์ฟเวอร์</p>
              </div>
            </div>
            <div className='w-px h-10 bg-white/10' />
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl flex items-center justify-center' style={{ background: stats.status == 'Online' ? 'lab(71 -62.55 46.81 / 0.1)' : 'color-mix(in oklab, var(--color-primary) 10%, transparent)', color: stats.status == 'Online' ? 'lab(70.5521% -66.5147 45.8073)' : 'var(--color-primary)' }}><Zap size={20} /></div>
              <div className='text-left'>
                <p className='text-2xl font-bold' style={{ color: stats.status == 'Online' ? 'lab(70.5521% -66.5147 45.8073)' : 'var(--color-primary)' }}>{statsLoaded ? stats.status : '...'}</p>
                <p className='text-xs text-white/40'>สถานะ</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <Section className='flex flex-col items-center gap-16'>
          <div className='text-center max-w-2xl'>
            <span className='text-primary text-sm font-semibold tracking-widest uppercase'>Features</span>
            <h2 className='text-4xl md:text-5xl font-extrabold mt-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent'>ฟีเจอร์สุดล้ำ</h2>
            <p className='text-white/40 mt-4'>ทุกสิ่งที่คุณต้องการสำหรับประสบการณ์เพลงที่ดีที่สุดบน Discord</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full'>
            {features.map((f: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className='group glass p-6 hover:bg-white/[0.08] hover:border-primary/30 transition-all duration-300 cursor-default'
              >
                <div className='w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary mb-4 transition-colors'>
                  {featureIcons[f.icon] || <Sparkles size={28} />}
                </div>
                <h3 className='text-lg font-bold mb-2'>{f.title}</h3>
                <p className='text-white/40 text-sm leading-relaxed'>{f.description}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══════════ COMMANDS PREVIEW ══════════ */}
        <Section className='flex flex-col items-center gap-12'>
          <div className='text-center max-w-2xl'>
            <span className='text-primary text-sm font-semibold tracking-widest uppercase'>Commands</span>
            <h2 className='text-4xl md:text-5xl font-extrabold mt-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent'>คำสั่งที่ใช้งานง่าย</h2>
            <p className='text-white/40 mt-4'>ใช้ Slash Commands ที่เรียบง่าย ไม่ต้องจำ prefix</p>
          </div>

          <div className='w-full glass overflow-hidden'>
            {/* terminal header */}
            <div className='flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/[0.02]'>
              <div className='w-3 h-3 rounded-full bg-red-500/80' />
              <div className='w-3 h-3 rounded-full bg-yellow-500/80' />
              <div className='w-3 h-3 rounded-full bg-green-500/80' />
              <span className='ml-3 text-xs text-white/30 font-mono'>yumi-commands</span>
            </div>
            <div className='divide-y divide-white/5'>
              {commands.map((cmd: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className='flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors group'
                >
                  <code className='text-primary font-mono font-semibold text-sm min-w-[140px]'>{cmd.name}</code>
                  <span className='text-white/40 text-sm'>{cmd.description}</span>
                  <ChevronRight size={14} className='ml-auto text-white/10 group-hover:text-primary/50 transition-colors' />
                </motion.div>
              ))}
            </div>
          </div>

          <Link href='/commands' className='inline-flex items-center gap-2 text-primary hover:text-red-400 font-medium transition-colors'>
            ดูคำสั่งทั้งหมด <ExternalLink size={16} />
          </Link>
        </Section>

        {/* ══════════ TECH STACK ══════════ */}
        <Section className='flex flex-col items-center gap-12'>
          <div className='text-center max-w-2xl'>
            <span className='text-primary text-sm font-semibold tracking-widest uppercase'>Powered By</span>
            <h2 className='text-4xl md:text-5xl font-extrabold mt-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent'>เทคโนโลยีที่ขับเคลื่อน</h2>
            <p className='text-white/40 mt-4'>สร้างขึ้นด้วยเครื่องมือที่ดีที่สุดเพื่อประสิทธิภาพสูงสุด</p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-5 w-full'>
            {techStack.map((t: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                className='glass p-6 text-center hover:border-primary/30 transition-all duration-300'
              >
                <div className='w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center text-primary'>
                  <Headphones size={28} />
                </div>
                <h3 className='font-bold text-sm'>{t.name}</h3>
                <p className='text-white/30 text-xs mt-1'>{t.description}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══════════ WHY YUMI ══════════ */}
        <Section className='flex flex-col items-center gap-12'>
          <div className='text-center max-w-2xl'>
            <span className='text-primary text-sm font-semibold tracking-widest uppercase'>Why Yumi?</span>
            <h2 className='text-4xl md:text-5xl font-extrabold mt-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent'>ทำไมต้อง Yumi?</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
            {[
              { icon: <Shield size={32} />, title: 'เสถียร & ปลอดภัย', desc: 'ระบบ Anti-Crash พร้อม Auto-Recovery ทำงานต่อเนื่องตลอด 24/7 ไม่มีหลุด' },
              { icon: <Zap size={32} />, title: 'เร็วสุดขีด', desc: 'เวลาตอบสนองต่ำกว่า 100ms ด้วย Lavalink Server ที่ Optimize มาเต็มที่' },
              { icon: <Heart size={32} />, title: 'ฟรี 100%', desc: 'ฟีเจอร์ทุกอย่างใช้ได้ฟรี ไม่มี Paywall ไม่มีโฆษณา ไม่มีข้อจำกัด' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className='glass p-8 text-center hover:border-primary/30 hover:bg-white/[0.06] transition-all duration-300'
              >
                <div className='w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-primary'>
                  {item.icon}
                </div>
                <h3 className='text-xl font-bold mb-2'>{item.title}</h3>
                <p className='text-white/40 text-sm leading-relaxed'>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══════════ CTA ══════════ */}
        <Section className='relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-primary/10 via-red-900/10 to-primary/10 rounded-3xl blur-xl pointer-events-none' />
          <div className='relative glass rounded-3xl p-12 md:p-16 text-center flex flex-col items-center gap-6 border-primary/20 overflow-hidden'>
            <div className='absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent' />
            <Sparkles size={40} className='text-primary' />
            <h2 className='text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent'>
              พร้อมเริ่มต้นแล้วหรือยัง?
            </h2>
            <p className='text-white/40 max-w-lg text-lg'>
              เพิ่ม Yumi เข้าเซิร์ฟเวอร์ของคุณวันนี้ แล้วสัมผัสประสบการณ์เพลงที่ดีที่สุดบน Discord
            </p>
            <div className='flex flex-wrap items-center justify-center gap-4 mt-4'>
              <Link href='/invite' className='group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-primary to-red-700 hover:from-red-700 hover:to-primary text-white rounded-full font-bold text-lg transition-all duration-300 shadow-[0_0_40px_rgba(185,28,28,0.4)] hover:shadow-[0_0_60px_rgba(185,28,28,0.6)]'>
                เพิ่มบอท Yumi เลย!
                <ArrowRight size={20} className='group-hover:translate-x-1 transition-transform' />
              </Link>
              <a href='/discord' target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 px-8 py-4 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] rounded-full font-semibold transition-all duration-300'>
                เข้าร่วม Support Server
              </a>
            </div>
          </div>
        </Section>

        {/* ══════════ FOOTER ══════════ */}
        <footer className='border-t border-white/5 pt-12 pb-8'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-8'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-primary to-red-800 flex items-center justify-center text-white font-bold text-lg'>Y</div>
              <div>
                <p className='font-bold text-lg'>Yumi Music</p>
                <p className='text-white/30 text-xs'>Discord Music Bot — Powered by Lavalink</p>
              </div>
            </div>
            <div className='flex items-center gap-6 text-white/30 text-sm'>
              <Link href='/commands' className='hover:text-white/60 transition-colors'>คำสั่ง</Link>
              <Link href='/contact' className='hover:text-white/60 transition-colors'>ติดต่อเรา</Link>
              <Link href='/status' className='hover:text-white/60 transition-colors'>สถานะ</Link>
              <a href='/discord' target='_blank' rel='noopener noreferrer' className='hover:text-white/60 transition-colors'>Support</a>
            </div>
            <p className='text-white/20 text-xs'>© 2026 Yumi Music. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
