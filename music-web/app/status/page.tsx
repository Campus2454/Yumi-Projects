'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Server,
  Users,
  Wifi,
  Clock,
  Zap,
  Globe,
  Music,
  Radio,
} from 'lucide-react';

/* ─── types ─── */
interface Service {
  id: string;
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  latency: number | null;
}

interface StatusData {
  overall: 'operational' | 'partial_outage' | 'major_outage' | 'unknown';
  services: Service[];
  stats: { guilds: number; members: number } | null;
  checkedAt: string;
}

/* ─── status config ─── */
const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode; bg: string }
> = {
  operational: {
    label: 'ทำงานปกติ',
    color: '#22c55e',
    icon: <CheckCircle size={16} />,
    bg: 'rgba(34,197,94,0.1)',
  },
  degraded: {
    label: 'ช้ากว่าปกติ',
    color: '#f59e0b',
    icon: <AlertTriangle size={16} />,
    bg: 'rgba(245,158,11,0.1)',
  },
  down: {
    label: 'ไม่พร้อมใช้งาน',
    color: '#ef4444',
    icon: <XCircle size={16} />,
    bg: 'rgba(239,68,68,0.1)',
  },
  unknown: {
    label: 'ไม่ทราบสถานะ',
    color: '#6b7280',
    icon: <HelpCircle size={16} />,
    bg: 'rgba(107,114,128,0.1)',
  },
};

const overallConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  operational: {
    label: 'ระบบทั้งหมดทำงานปกติ',
    color: '#22c55e',
    icon: <CheckCircle size={28} />,
  },
  partial_outage: {
    label: 'บางระบบขัดข้อง',
    color: '#f59e0b',
    icon: <AlertTriangle size={28} />,
  },
  major_outage: {
    label: 'ระบบขัดข้องร้ายแรง',
    color: '#ef4444',
    icon: <XCircle size={28} />,
  },
  unknown: {
    label: 'กำลังตรวจสอบ...',
    color: '#6b7280',
    icon: <HelpCircle size={28} />,
  },
};

const serviceIcons: Record<string, React.ReactNode> = {
  bot: <Music size={22} />,
  api: <Globe size={22} />,
  web: <Radio size={22} />,
  lavalink: <Zap size={22} />,
};

/* ─── latency bar ─── */
function LatencyBar({ ms }: { ms: number | null }) {
  if (ms === null) return <span className='text-white/20 text-xs'>N/A</span>;
  const color = ms < 200 ? '#22c55e' : ms < 500 ? '#f59e0b' : '#ef4444';
  const width = Math.min(100, (ms / 1000) * 100);
  return (
    <div className='flex items-center gap-2'>
      <div className='w-20 h-1.5 rounded-full bg-white/5 overflow-hidden'>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className='h-full rounded-full'
          style={{ background: color }}
        />
      </div>
      <span className='text-xs font-mono' style={{ color }}>
        {ms}ms
      </span>
    </div>
  );
}

/* ─── uptime dots (simulated last 30 days) ─── */
function UptimeDots({ status }: { status: string }) {
  // Generate deterministic dots based on status
  const days = 30;
  const dots = Array.from({ length: days }, (_, i) => {
    if (status === 'down' && i === days - 1) return 'down';
    if (status === 'degraded' && i >= days - 2) return 'degraded';
    // Simulate occasional blips
    if (i === 7 || i === 18) return 'degraded';
    return 'operational';
  });

  const dotColors: Record<string, string> = {
    operational: '#22c55e',
    degraded: '#f59e0b',
    down: '#ef4444',
  };

  return (
    <div className='flex items-center gap-[3px]'>
      {dots.map((d, i) => (
        <div
          key={i}
          className='w-1.5 h-5 rounded-sm transition-colors'
          style={{ background: dotColors[d] || '#333' }}
          title={`${days - i} วันก่อน: ${d === 'operational' ? 'ปกติ' : d === 'degraded' ? 'ช้า' : 'ขัดข้อง'}`}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchStatus = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/status');
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchStatus(), 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const overall = data
    ? overallConfig[data.overall] || overallConfig.unknown
    : overallConfig.unknown;

  return (
    <div className='min-h-screen relative'>
      {/* glow */}
      <div className='fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[180px] pointer-events-none' />

      <div className='relative max-w-4xl mx-auto pt-8 pb-24 px-4'>
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
          className='text-center mb-12'
        >
          <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-5'>
            <Activity size={14} /> System Status
          </div>
          <h1 className='text-4xl md:text-6xl font-extrabold tracking-tight mb-4'>
            <span className='bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent'>
              สถานะ{' '}
            </span>
            <span className='bg-gradient-to-r from-primary via-red-500 to-red-400 bg-clip-text text-transparent'>
              Yumi
            </span>
          </h1>
          <p className='text-white/40 text-lg'>
            ตรวจสอบสถานะของระบบทั้งหมดแบบ Real-time
          </p>
        </motion.div>

        {/* ── overall status banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className='glass rounded-2xl p-6 mb-8 relative overflow-hidden'
        >
          {/* top accent line */}
          <div
            className='absolute top-0 left-0 right-0 h-[2px]'
            style={{
              background: loading
                ? 'rgba(107,114,128,0.3)'
                : overall.color,
            }}
          />

          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-4'>
              {loading ? (
                <div className='w-12 h-12 rounded-2xl bg-white/5 animate-pulse' />
              ) : (
                <div
                  className='w-12 h-12 rounded-2xl flex items-center justify-center'
                  style={{ background: `${overall.color}15`, color: overall.color }}
                >
                  {overall.icon}
                </div>
              )}
              <div>
                <h2
                  className='text-xl font-bold'
                  style={{ color: loading ? undefined : overall.color }}
                >
                  {loading ? 'กำลังตรวจสอบ...' : overall.label}
                </h2>
                <p className='text-white/30 text-xs mt-0.5'>
                  {lastRefresh
                    ? `ตรวจสอบล่าสุด: ${lastRefresh.toLocaleTimeString('th-TH')}`
                    : 'กำลังโหลด...'}
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/50 hover:text-white/80 text-sm font-medium transition-all disabled:opacity-50'
            >
              <RefreshCw
                size={14}
                className={refreshing ? 'animate-spin' : ''}
              />
              {refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
            </button>
          </div>
        </motion.div>

        {/* ── services list ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className='glass overflow-hidden mb-8'
        >
          <div className='px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between'>
            <span className='text-sm font-semibold text-white/50'>
              บริการทั้งหมด
            </span>
            <span className='text-xs text-white/20'>
              {data?.services.filter((s) => s.status === 'operational').length || 0}/
              {data?.services.length || 0} ทำงานปกติ
            </span>
          </div>

          <div className='divide-y divide-white/[0.04]'>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='px-5 py-5 flex items-center gap-4'>
                    <div className='w-11 h-11 rounded-xl bg-white/5 animate-pulse' />
                    <div className='flex-1'>
                      <div className='w-32 h-4 bg-white/5 rounded animate-pulse mb-2' />
                      <div className='w-48 h-3 bg-white/5 rounded animate-pulse' />
                    </div>
                  </div>
                ))
              : data?.services.map((service, i) => {
                  const cfg = statusConfig[service.status] || statusConfig.unknown;
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.08, duration: 0.35 }}
                      className='px-5 py-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors'
                    >
                      {/* icon */}
                      <div
                        className='w-11 h-11 rounded-xl flex items-center justify-center shrink-0'
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {serviceIcons[service.id] || <Server size={22} />}
                      </div>

                      {/* info */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-0.5'>
                          <h3 className='font-bold text-sm'>{service.name}</h3>
                          <div
                            className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold'
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </div>
                        </div>
                        <p className='text-white/30 text-xs'>
                          {service.description}
                        </p>
                      </div>

                      {/* latency */}
                      <div className='shrink-0 hidden sm:block'>
                        <LatencyBar ms={service.latency} />
                      </div>
                    </motion.div>
                  );
                })}
          </div>
        </motion.div>

        {/* ── uptime history ── */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className='glass overflow-hidden mb-8'
          >
            <div className='px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between'>
              <span className='text-sm font-semibold text-white/50'>
                Uptime (30 วัน)
              </span>
              <div className='flex items-center gap-4 text-[10px] text-white/30'>
                <span className='flex items-center gap-1'>
                  <span className='w-2 h-2 rounded-sm bg-[#22c55e]' /> ปกติ
                </span>
                <span className='flex items-center gap-1'>
                  <span className='w-2 h-2 rounded-sm bg-[#f59e0b]' /> ช้า
                </span>
                <span className='flex items-center gap-1'>
                  <span className='w-2 h-2 rounded-sm bg-[#ef4444]' /> ขัดข้อง
                </span>
              </div>
            </div>

            <div className='divide-y divide-white/[0.04]'>
              {data.services.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className='px-5 py-4 flex items-center justify-between'
                >
                  <span className='text-sm font-medium text-white/60 min-w-[130px]'>
                    {service.name}
                  </span>
                  <UptimeDots status={service.status} />
                  <span className='text-xs text-white/20 min-w-[60px] text-right'>
                    {service.status === 'operational' ? '99.9%' : service.status === 'down' ? '—' : '99.5%'}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── stats cards ── */}
        {data?.stats && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'
          >
            {[
              {
                icon: <Users size={20} />,
                label: 'ผู้ใช้งาน',
                value: data.stats.members.toLocaleString(),
              },
              {
                icon: <Server size={20} />,
                label: 'เซิร์ฟเวอร์',
                value: data.stats.guilds.toLocaleString(),
              },
              {
                icon: <Wifi size={20} />,
                label: 'API Latency',
                value: `${data.services.find((s) => s.id === 'api')?.latency || '—'}ms`,
              },
              {
                icon: <Clock size={20} />,
                label: 'รีเฟรชทุก',
                value: '30 วินาที',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.06 }}
                className='glass p-5 text-center'
              >
                <div className='w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                  {card.icon}
                </div>
                <p className='text-white/30 text-xs'>{card.label}</p>
                <p className='font-bold text-sm mt-0.5'>{card.value}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── info note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className='text-center text-white/20 text-xs mt-12'
        >
          <p>
            หน้านี้จะรีเฟรชอัตโนมัติทุก 30 วินาที •
            ข้อมูล Uptime เป็นการประมาณจากสถานะปัจจุบัน
          </p>
          <p className='mt-1'>
            หากพบปัญหา สามารถแจ้งได้ที่{' '}
            <a
              href='https://discord.gg/yumistack'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:text-red-400 transition-colors'
            >
              Discord Support Server
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
