'use client';

import { useState, useEffect, useMemo, MouseEventHandler } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search, Terminal, Music, ListMusic, SlidersHorizontal, Save, Settings,
  ChevronDown, ChevronRight, Hash, Copy, Check, Sparkles, ArrowLeft, X
} from 'lucide-react';

/* ─── types ─── */
interface Command {
  name: string;
  usage: string;
  description: string;
  aliases: string[];
}
interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  commands: Command[];
}

/* ─── category icon mapping ─── */
const categoryIcons: Record<string, React.ReactNode> = {
  music: <Music size={20} />,
  queue: <ListMusic size={20} />,
  filters: <SlidersHorizontal size={20} />,
  playlist: <Save size={20} />,
  utility: <Settings size={20} />,
};

/* ─── copy button ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      onClick={handleCopy}
      className='p-1.5 rounded-lg hover:bg-white/10 text-white/20 hover:text-white/60 transition-all cursor-pointer'
      title='คัดลอกคำสั่ง'
    >
      {copied ? <Check size={14} className='text-green-400' /> : <Copy size={14} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function CommandsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCommands, setTotalCommands] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCmd, setExpandedCmd] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/commands')
      .then(r => r.json())
      .then(d => {
        setCategories(d.categories || []);
        setTotalCommands(d.totalCommands || 0);
      })
      .catch(() => {});
  }, []);

  /* filtered data */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q && !activeCategory) return categories;

    return categories
      .filter(cat => !activeCategory || cat.id === activeCategory)
      .map(cat => ({
        ...cat,
        commands: cat.commands.filter(cmd =>
          !q ||
          cmd.name.toLowerCase().includes(q) ||
          cmd.description.toLowerCase().includes(q) ||
          cmd.aliases.some(a => a.toLowerCase().includes(q))
        ),
      }))
      .filter(cat => cat.commands.length > 0);
  }, [categories, searchQuery, activeCategory]);

  const visibleCount = filtered.reduce((s, c) => s + c.commands.length, 0);

  return (
    <div className='min-h-screen relative'>
      {/* glow */}
      <div className='fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[180px] pointer-events-none' />

      <div className='relative max-w-5xl mx-auto pt-8 pb-24 px-4'>
        {/* ── back link ── */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link href='/' className='inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-8'>
            <ArrowLeft size={16} /> กลับหน้าแรก
          </Link>
        </motion.div>

        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-12'
        >
          <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-5'>
            <Terminal size={14} /> Slash Commands
          </div>
          <h1 className='text-4xl md:text-6xl font-extrabold tracking-tight mb-4'>
            <span className='bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent'>คำสั่งทั้งหมดของ </span>
            <span className='bg-gradient-to-r from-primary via-red-500 to-red-400 bg-clip-text text-transparent'>Yumi Music</span>
          </h1>
          <p className='text-white/40 text-lg'>
            รวม <span className='text-white font-semibold'>{totalCommands}</span> คำสั่ง ใช้งานง่ายด้วย Slash Commands
          </p>
        </motion.div>

        {/* ── search ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className='relative mb-8'
        >
          <Search size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-white/30' />
          <input
            type='text'
            placeholder='ค้นหาคำสั่ง...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full pl-12 pr-12 py-3.5 glass rounded-2xl bg-white/[0.03] text-white placeholder-white/30 outline-none focus:border-primary/40 transition-all text-sm'
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className='absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors'>
              <X size={16} />
            </button>
          )}
        </motion.div>

        {/* ── category pills ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className='flex flex-wrap gap-2 mb-10'
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              !activeCategory
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(185,28,28,0.3)]'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-white/5'
            }`}
          >
            ทั้งหมด ({totalCommands})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'text-white shadow-[0_0_20px_rgba(185,28,28,0.3)]'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-white/5'
              }`}
              style={activeCategory === cat.id ? { background: cat.color } : {}}
            >
              {categoryIcons[cat.id]}
              {cat.name} ({cat.commands.length})
            </button>
          ))}
        </motion.div>

        {/* ── result count ── */}
        {searchQuery && (
          <p className='text-white/30 text-sm mb-6'>
            พบ <span className='text-white/60 font-medium'>{visibleCount}</span> คำสั่ง
            {activeCategory && ' ในหมวดที่เลือก'}
          </p>
        )}

        {/* ── command list ── */}
        <div className='flex flex-col gap-8'>
          <AnimatePresence mode='wait'>
            {filtered.length === 0 ? (
              <motion.div
                key='empty'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='text-center py-20'
              >
                <Search size={48} className='mx-auto text-white/10 mb-4' />
                <p className='text-white/30 text-lg'>ไม่พบคำสั่งที่ค้นหา</p>
                <p className='text-white/20 text-sm mt-1'>ลองใช้คำค้นอื่น หรือเปลี่ยนหมวดหมู่</p>
              </motion.div>
            ) : (
              filtered.map((cat, ci) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ci * 0.08, duration: 0.4 }}
                >
                  {/* category header */}
                  <div className='flex items-center gap-3 mb-4'>
                    <div
                      className='w-9 h-9 rounded-xl flex items-center justify-center'
                      style={{ background: `${cat.color}20`, color: cat.color }}
                    >
                      {categoryIcons[cat.id] || <Hash size={18} />}
                    </div>
                    <div>
                      <h2 className='text-lg font-bold'>{cat.name}</h2>
                      <p className='text-white/30 text-xs'>{cat.description}</p>
                    </div>
                    <span className='ml-auto text-white/20 text-xs font-mono'>{cat.commands.length} คำสั่ง</span>
                  </div>

                  {/* commands */}
                  <div className='glass overflow-hidden divide-y divide-white/[0.04]'>
                    {cat.commands.map((cmd, i) => {
                      const isExpanded = expandedCmd === `${cat.id}-${i}`;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: ci * 0.05 + i * 0.03, duration: 0.3 }}
                        >
                          <button
                            onClick={() => setExpandedCmd(isExpanded ? null : `${cat.id}-${i}`)}
                            className='w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors text-left group'
                          >
                            <code className='text-sm font-mono font-semibold min-w-[160px] shrink-0' style={{ color: cat.color }}>
                              {cmd.name}
                            </code>
                            <span className='text-white/40 text-sm flex-1 truncate'>{cmd.description}</span>
                            <CopyButton text={cmd.name} />
                            <ChevronDown
                              size={14}
                              className={`text-white/20 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className='overflow-hidden'
                              >
                                <div className='px-5 pb-4 pt-1 flex flex-col gap-3 border-t border-white/[0.03] bg-white/[0.01]'>
                                  {/* usage */}
                                  <div>
                                    <span className='text-white/30 text-xs uppercase tracking-wider font-semibold'>การใช้งาน</span>
                                    <div className='mt-1.5 flex items-center gap-2'>
                                      <code className='px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-sm font-mono text-white/70'>
                                        {cmd.usage}
                                      </code>
                                    </div>
                                  </div>
                                  {/* aliases */}
                                  {cmd.aliases.length > 0 && (
                                    <div>
                                      <span className='text-white/30 text-xs uppercase tracking-wider font-semibold'>ชื่อย่อ</span>
                                      <div className='mt-1.5 flex items-center gap-2'>
                                        {cmd.aliases.map(a => (
                                          <code key={a} className='px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-medium'>
                                            {a}
                                          </code>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ── bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='mt-20 glass rounded-2xl p-10 text-center border-primary/10 relative overflow-hidden'
        >
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent' />
          <Sparkles size={28} className='mx-auto text-primary mb-3' />
          <h3 className='text-2xl font-extrabold mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent'>
            พร้อมลองใช้งานแล้วหรือยัง?
          </h3>
          <p className='text-white/40 text-sm mb-6 max-w-md mx-auto'>
            เพิ่ม Yumi เข้าเซิร์ฟเวอร์ แล้วพิมพ์ <code className='text-primary font-mono'>/play</code> เพื่อเริ่มเล่นเพลงได้ทันที!
          </p>
          <Link
            href='/invite'
            target='_blank'
            className='inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-red-700 hover:from-red-700 hover:to-primary text-white rounded-full font-semibold transition-all duration-300 shadow-[0_0_30px_rgba(185,28,28,0.3)]'
          >
            เชิญบอทเข้าเซิร์ฟเวอร์ <ChevronRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
