'use client';
import { useSession } from 'next-auth/react';
import { useContext, useEffect, useState } from 'react';
import { Guild } from '../utils/types';
import { useDashboardStore as uDS, useGuildStore as uGS } from '../utils/zustand';
import { useShallow } from 'zustand/shallow';
import { PopupGuilds as PGuilds } from '../utils/styles';
import { IoMdClose } from 'react-icons/io';
import { HiRefresh } from 'react-icons/hi';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createQuery } from '../utils/helper';
import AppLink from './AppLink';

export function PopupGuilds({ show = true }: { show?: boolean }) {
  const { data: session, status } = useSession();
  const [guild, setGuild] = uGS(useShallow(s=>[ s.guild, s.setGuild, ]));
  const [guilds, setGuilds] = uGS(useShallow(s=>[s.guilds, s.setGuilds]));
  const [popupGuildsShow, setPopupGuildsShow] = uDS(useShallow(s=>[s.popupGuildsShow, s.setPopupGuildsShow]));
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [step, setStep] = useState<'guild' | 'bot'>();
  const searchParams = useSearchParams();

  const fetchGuilds = async () => {
    const token = (session as any)?.accessToken;
    if (!token) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/servers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const mutualGuilds = await res.json();

      const formattedServers: Guild[] = mutualGuilds.map((guild: Guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon 
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` 
          : 'https://cdn.discordapp.com/embed/avatars/0.png'
      }));

      setGuilds(formattedServers);
    } catch (error) {
      console.error('Failed to fetch servers', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(guilds !== undefined)return;

    const i = setInterval(()=>{
      fetchGuilds();
    }, 10_000);

    return () => clearInterval(i);
  }, [guilds]);

  useEffect(() => {
    if(status === 'authenticated'){
      fetchGuilds();
    }
  }, [session, status]);
  
  return <>
  <PGuilds className={`fixed w-full flex align-center items-center justify-center z-20 ${popupGuildsShow ? 'popupGuildsShow' : ''}`}>
    <div className='relative flex flex-col items-center overflow-y-auto bg-[#161616] py-5 px-10 max-w-[90%] max-h-[90%] rounded-[20] shadow-[0px_0px_10px_rgb(0_0_0)]'>
      <div onClick={()=>setPopupGuildsShow(false)} id='popupPlayerClose' className='absolute right-2 top-2 cursor-pointer p-3'><IoMdClose /></div>
      <div className='flex flex-row items-center mb-2 gap-2'><h1>Select Server</h1><HiRefresh onClick={()=>fetchGuilds()} className='cursor-pointer' /></div>
      <div className='flex flex-row align-center w-[40vw] h-9 bg-[#1e1e1e] border-1 border-white/0 hover:border-white/50 focus-within:border-white/50 p-2 mb-2 rounded-md'>
        <Search height={17} />
        <input type="text" name="search" id="search" placeholder='Search' value={search} onChange={v=>setSearch(v.target.value)} className='pl-2 w-[100%] outline-none' />
      </div>
      {/* Guild Grid */}
      {isLoading ? (
        <div className='text-white/50 text-sm'>กำลังโหลดเซิร์ฟเวอร์...</div>
      ) : (()=>{const g = guilds?.filter(v=>v.name.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase())); return g && g.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {g.map((guild) => (
            <AppLink href={createQuery('server', guild.id, searchParams)} key={guild.id} className='flex items-center gap-4 p-4 bg-[#0a0a0a] hover:bg-[#111] border border-white/5 rounded-2xl transition-all group cursor-pointer'>
              <img 
                src={guild.icon} 
                alt={guild.name} 
                className='w-14 h-14 rounded-xl object-cover'
              />
              <div>
                <h3 className='text-white/90 text-sm font-medium group-hover:text-primary transition-colors'>{guild.name}</h3>
                <div className='inline-block px-2 py-0.5 mt-1.5 bg-white/5 border border-white/5 rounded text-[10px] text-white/50'>
                  ห้องเล่นเพลง
                </div>
              </div>
            </AppLink>
          ))}
        </div>
      ) : (<div>No server found.</div>)})()}
    </div>
  </PGuilds>
</>};