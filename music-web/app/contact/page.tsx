'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Globe,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Heart,
  Shield,
  Clock,
  Users,
  HelpCircle,
  Send,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

/* ─── FAQ data ─── */
const faqs = [
  {
    q: 'Yumi ฟรีหรือเปล่า?',
    a: 'ฟรี 100%! ฟีเจอร์ทุกอย่างของ Yumi ใช้ได้ฟรีไม่มีข้อจำกัด ไม่มี Paywall ไม่มีโฆษณา',
  },
  {
    q: 'บอทไม่ตอบสนอง / ไม่เข้าห้องเสียง ทำอย่างไร?',
    a: 'ตรวจสอบว่าบอทมีสิทธิ์ Connect และ Speak ในห้องเสียง และลองใช้คำสั่ง /ping เพื่อเช็คสถานะ หากยังมีปัญหาสามารถแจ้งได้ที่ Support Server',
  },
  {
    q: 'รองรับแพลตฟอร์มอะไรบ้าง?',
    a: 'Yumi รองรับ YouTube, Spotify, SoundCloud, Apple Music, Deezer, Bandcamp และอีกมากมาย ผ่าน Lavalink Audio Server',
  },
  {
    q: 'สามารถใช้ Yumi ได้พร้อมกันกี่เซิร์ฟเวอร์?',
    a: 'ไม่จำกัด! Yumi สามารถเล่นเพลงในหลายเซิร์ฟเวอร์พร้อมกันได้ แต่ละเซิร์ฟเวอร์จะมีคิวเพลงแยกกัน',
  },
  {
    q: 'Web Dashboard ใช้งานยังไง?',
    a: 'ล็อกอินด้วย Discord ที่เว็บไซต์นี้ แล้วเลือกเซิร์ฟเวอร์ที่ต้องการ คุณจะสามารถควบคุมเพลง, ดูคิว, ปรับฟิลเตอร์ ได้แบบ Real-time',
  },
  {
    q: 'อยากเสนอฟีเจอร์ใหม่ ทำได้ไหม?',
    a: 'ได้เลย! เข้า Support Server แล้วไปที่ช่อง #suggestions เพื่อเสนอไอเดียของคุณ ทีมพัฒนาจะพิจารณาทุกข้อเสนอ',
  },
];

/* ─── contact channels ─── */
const channels = [
  {
    icon: <MessageCircle size={28} />,
    title: 'Discord Support Server',
    description: 'ช่องทางหลักในการติดต่อทีมพัฒนา ตอบไว มีชุมชนช่วยเหลือ',
    link: 'https://discord.gg/yumistack',
    linkText: 'เข้าร่วม Discord',
    color: '#5865F2',
    highlight: true,
  },
  {
    icon: <Mail size={28} />,
    title: 'อีเมล',
    description:
      'สำหรับเรื่องสำคัญ เช่น ร่วมงาน, ปัญหาความปลอดภัย หรือการร้องเรียน',
    link: 'mailto:contact@yumistack.net',
    linkText: 'contact@yumistack.net',
    color: '#b91c1c',
    highlight: false,
  },
  {
    icon: <Globe size={28} />,
    title: 'เว็บไซต์',
    description: 'ติดตามข่าวสาร อัพเดต และฟีเจอร์ใหม่ๆ ได้ที่เว็บไซต์ของเรา',
    link: 'https://yumistack.net',
    linkText: 'yumistack.net',
    color: '#059669',
    highlight: false,
  },
];

/* ─── FAQ Item ─── */
function FaqItem({
  item,
  index,
}: {
  item: { q: string; a: string };
  index: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-start gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors text-left group'
      >
        <div className='w-7 h-7 mt-0.5 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0'>
          <HelpCircle size={14} />
        </div>
        <div className='flex-1'>
          <p className='font-semibold text-sm text-white/90 group-hover:text-white transition-colors'>
            {item.q}
          </p>
          <AnimatePresence>
            {open && (
              <motion.p
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.2 }}
                className='text-white/40 text-sm leading-relaxed overflow-hidden'
              >
                {item.a}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <ChevronDown
          size={16}
          className={`text-white/20 mt-1 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function ContactPage() {
  return (
    <div className='min-h-screen relative'>
      {/* glow */}
      <div className='fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[180px] pointer-events-none' />

      <div className='relative max-w-5xl mx-auto pt-8 pb-24 px-4'>
        {/* ── back link ── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-8'
          >
            <ArrowLeft size={16} /> กลับหน้าแรก
          </Link>
        </motion.div>

        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-16'
        >
          <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-5'>
            <Mail size={14} /> Contact Us
          </div>
          <h1 className='text-4xl md:text-6xl font-extrabold tracking-tight mb-4'>
            <span className='bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent'>
              ติดต่อ{' '}
            </span>
            <span className='bg-gradient-to-r from-primary via-red-500 to-red-400 bg-clip-text text-transparent'>
              Yumi Team
            </span>
          </h1>
          <p className='text-white/40 text-lg max-w-xl mx-auto'>
            มีคำถาม ข้อเสนอแนะ หรือต้องการความช่วยเหลือ?
            <br className='hidden sm:block' />
            เราพร้อมให้บริการคุณเสมอ
          </p>
        </motion.div>

        {/* ── contact channels ── */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mb-20'>
          {channels.map((ch, i) => (
            <motion.a
              key={i}
              href={ch.link}
              target='_blank'
              rel='noopener noreferrer'
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`group glass p-6 flex flex-col gap-4 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer ${
                ch.highlight
                  ? 'border-[#5865F2]/30 md:scale-[1.02]'
                  : 'hover:border-white/20'
              }`}
            >
              {ch.highlight && (
                <div className='absolute -top-px left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#5865F2] to-transparent' />
              )}
              <div
                className='w-14 h-14 rounded-2xl flex items-center justify-center transition-colors'
                style={{ background: `${ch.color}15`, color: ch.color }}
              >
                {ch.icon}
              </div>
              <div>
                <h3 className='font-bold text-lg mb-1'>{ch.title}</h3>
                <p className='text-white/40 text-sm leading-relaxed'>
                  {ch.description}
                </p>
              </div>
              <div
                className='mt-auto pt-2 flex items-center gap-2 text-sm font-medium transition-colors'
                style={{ color: ch.color }}
              >
                {ch.linkText}
                <ExternalLink
                  size={14}
                  className='group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform'
                />
              </div>
            </motion.a>
          ))}
        </div>

        {/* ── quick info cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='mb-20'
        >
          <div className='text-center mb-10'>
            <span className='text-primary text-sm font-semibold tracking-widest uppercase'>
              Support
            </span>
            <h2 className='text-3xl md:text-4xl font-extrabold mt-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent'>
              เราพร้อมช่วยเหลือคุณ
            </h2>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {[
              {
                icon: <Clock size={22} />,
                label: 'ตอบกลับภายใน',
                value: '< 24 ชม.',
              },
              {
                icon: <Users size={22} />,
                label: 'ชุมชน Discord',
                value: 'Active',
              },
              {
                icon: <Shield size={22} />,
                label: 'ความปลอดภัย',
                value: 'สูงสุด',
              },
              {
                icon: <Heart size={22} />,
                label: 'ให้บริการ',
                value: 'ฟรี 100%',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className='glass p-5 text-center hover:border-primary/20 transition-all duration-300'
              >
                <div className='w-11 h-11 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                  {item.icon}
                </div>
                <p className='text-white/40 text-xs mb-0.5'>{item.label}</p>
                <p className='font-bold text-sm'>{item.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='mb-20'
        >
          <div className='text-center mb-10'>
            <span className='text-primary text-sm font-semibold tracking-widest uppercase'>
              FAQ
            </span>
            <h2 className='text-3xl md:text-4xl font-extrabold mt-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent'>
              คำถามที่พบบ่อย
            </h2>
            <p className='text-white/40 mt-3 text-sm'>
              คำตอบสำหรับคำถามยอดนิยม ก่อนติดต่อเราลองดูที่นี่ก่อนนะ
            </p>
          </div>

          <div className='glass overflow-hidden divide-y divide-white/[0.04]'>
            {faqs.map((faq, i) => (
              <FaqItem key={i} item={faq} index={i} />
            ))}
          </div>
        </motion.div>

        {/* ── bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='glass rounded-2xl p-10 text-center border-primary/10 relative overflow-hidden'
        >
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent' />
          <Sparkles size={28} className='mx-auto text-primary mb-3' />
          <h3 className='text-2xl font-extrabold mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent'>
            ยังหาคำตอบไม่เจอ?
          </h3>
          <p className='text-white/40 text-sm mb-6 max-w-md mx-auto'>
            เข้ามาคุยกับเราใน Discord Support Server ได้เลย
            ทีมงานและชุมชนพร้อมช่วยคุณ!
          </p>
          <a
            href='https://discord.gg/yumistack'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 px-8 py-3.5 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-full font-semibold transition-all duration-300 shadow-[0_0_30px_rgba(88,101,242,0.3)]'
          >
            <MessageCircle size={18} /> เข้าร่วม Support Server
          </a>
        </motion.div>
      </div>
    </div>
  );
}
