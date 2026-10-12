'use client';
import { useSession, signOut, signIn } from 'next-auth/react';
import { AlertTriangle, Brush, ChevronDown, ChevronUp, Globe, Languages, LoaderCircle, LogIn, LogOut, Menu, Plus, Search, Settings, X } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { HiHome, HiOutlineHome } from 'react-icons/hi';
import { Page, Player as SPlayer, Sidebar } from '../utils/styles';
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaAngleDown, FaAngleUp, FaArrowAltCircleUp, FaRegArrowAltCircleUp, FaVolumeUp } from 'react-icons/fa';
import { FaBookmark, FaPause, FaPlay, FaRegBookmark, FaVolumeHigh } from 'react-icons/fa6';
import { Home } from '../pages/home';
import { Playlist } from '../pages/playlists';
import { Search as SearchPage } from '../pages/search';
import { NotFound } from '../pages/404';
// import { PopupGuilds } from './popupGuilds';
import { useDashboardStore as uDS, useGuildStore as uGS } from '../utils/zustand';
import { useShallow } from 'zustand/shallow';
import ProgressBar from './ProgressBar';
import { createQuery, deleteQuery } from '../utils/helper';
import AppLink from './AppLink';
import { BiServer, BiSolidServer } from 'react-icons/bi';
import { countryMap, Guild, Player } from '../utils/types';
import { TbLoader2, TbPlayerSkipBackFilled, TbPlayerSkipForwardFilled, TbRepeat, TbRepeatOff, TbRepeatOnce } from 'react-icons/tb';
import { MdVolumeOff, MdVolumeUp } from 'react-icons/md';
import { Server } from '../pages/server';
import Flag from 'react-world-flags';
import Cookies from 'js-cookie';
import Link from 'next/link';

export const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [guild, setGuild] = uGS(useShallow(s => [s.guild, s.setGuild,]));
  const [guilds, setGuilds] = uGS(useShallow(s => [s.guilds, s.setGuilds]));
  const [isGuildsFetching, isBotsFetching, setIsGuildsFetching, setIsBotsFetching] = uGS(useShallow(s => [s.isGuildsFetching, s.isBotsFetching, s.setIsGuildsFetching, s.setIsBotsFetching]));
  const [iconDefault] = uGS(useShallow(s => [s.iconDefault]));
  const [popupGuildsShow, setPopupGuildsShow] = uDS(useShallow(s => [s.popupGuildsShow, s.setPopupGuildsShow]));
  const [user, setUser] = uDS(useShallow(s => [s.user, s.setUser]));
  const [loading, setLoading] = uDS(useShallow(s => [s.isLoading, s.setLoading]));
  const [sidebarShow, setSidebarShow] = uDS(useShallow(s => [s.sidebarShow, s.setSidebarShow]));
  const [search, setSearch] = uDS(useShallow(s => [s.search, s.setSearch]));
  const [loadingProgress, setLoadingProgress, setLoadingMaxProgress] = uDS(useShallow((s) => [s.loadingProgress, s.setLoadingProgress, s.setLoadingMaxProgress]));
  const [player, setPlayer] = uDS(useShallow((s) => [s.player, s.setPlayer]));
  const [country, setCountry] = uDS(useShallow(s => [s.country, s.setCountry]));
  const [SSAlert, setSSAlert] = useState(false);
  const [settingBoxShow, setSettingBoxShow] = useState(false);
  const [searchResultShow, setSearchResultShow] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef(search);
  const searchLastRef = useRef('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const slug = path.split('/')[2] || 'home';

  // function _loadGuild(sP: ReadonlyURLSearchParams = searchParams) {
  //   const id = sP.get('server');
  //   setLoadingProgress(70);
  //   setLoadingMaxProgress(70);

  //   const g = guilds?.find(g=>g.id == id) || guild || undefined;

  //   setGuild(g);
  //   if(!isGuildsFetching || !isBotsFetching){
  //     setLoadingProgress(100);
  //   }
  //   else{
  //     setLoadingProgress(100);
  //   };
  //   return;
  // };

  function createQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/dashboardV2?${params.toString()}`, { scroll: false });
  };
  
  function deleteQuery(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/dashboardV2?${params.toString()}`, { scroll: false });
  };

  const fetchGuilds = async () => {
    const token = (session as any)?.accessToken || '';

    try {
      setIsGuildsFetching(true);
      const res = await fetch('/api/servers', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 429) return console.log('Too many requests', await res.json());
      if (res.status === 404) return console.log('No servers found', await res.json());
      if (!res.ok) throw res;

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
      setIsGuildsFetching(false);
    }
  };

  useEffect(() => {
    // loadGuild();
  }, []);

  useEffect(() => {
    const token = (session as any)?.accessToken;
    if (!token) return;

    if (session && session.user) {
      setUser(session.user as any);
    };

    if (status === 'authenticated') {
      fetchGuilds();
    };
  }, [session, status]);

  useEffect(() => {
    setLoadingProgress(60);
    setLoadingMaxProgress(70);

    // const readyState = async() => {
    //   await wait(300);
    if (document.readyState === 'complete') setLoadingProgress(100);
    // };
    // readyState();

    const handleLoad = () => {
      setLoadingProgress(100);
    };

    window.addEventListener('load', handleLoad);
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [path]);

  useEffect(() => {
    if (searchParams.has('alert')) {
      const alert = searchParams.get('alert');
      if (alert == 'spa') {
        deleteQuery('alert');
        const e = document.getElementById('sidebar_player_alert');
        if (!e) return;
        e.style.animation = 'shake 0.25s ease-in-out infinite';
        setTimeout(() => {
          e.style.animation = '';
        }, 500);
      };
    };
  }, [searchParams]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    if (!searchResultShow) return;

    const intervalId = setInterval(async () => {
      const currentQuery = searchRef.current;
      const lastQuery = searchLastRef.current;

      if (!currentQuery.trim() || currentQuery === lastQuery || currentQuery.length < 3) return;

      searchLastRef.current = currentQuery;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        console.log('Searching for:', currentQuery);
        
        const res = await fetch('/api/player/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: currentQuery }),
          signal: controller.signal,
          cache: 'no-store'
        });
        
        if (!res.ok) throw new Error(await res.text());
        
        const data = await res.json();
        setSearchResult(old => data?.tracks && data.tracks.length > 0 ? data.tracks : old || []);
        
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Fetch Error:', error);
        } else {
          console.log('Cancelled stale request for:', lastQuery);
        }
      }
    }, 3_000);

    return () => {
      clearInterval(intervalId);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [searchResultShow]);

  return (
    <Page className='absolute top-0 left-0 min-h-[100vh] w-[100%] flex flex-col'>
      <div className='fixed top-0 left-0 min-h-[100vh] w-[100vw] flex flex-col bg-[#09090b] z-[-100]' />
      <ProgressBar top={0} zIndex={999} />

      {/* Header */}
      <div className='fixed top-0 h-[60px] w-[calc(100%-64px)] px-5 py-3 border-b-white/20 border-b-1 bg-[#09090b]/80 backdrop-blur-[20px] flex flex-row gap-2 justify-between align-center ml-[64] z-100'>
        <AppLink href='/' className='flex flex-row items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white'>Y</div>
          <h1 className='text-xl font-bold text-white'>Yumi Music</h1>
        </AppLink>

        <div className='flex flex-row align-center w-[40vw] h-9 bg-[#1e1e1e] border-1 border-white/50 p-2 rounded-md' onClick={() => setSearchResultShow(true)}>
          <Search height={17} />
          <input type='text' onKeyUp={(e) => { if (e.key === 'Enter') router.push(`/dashboardV2/search?q=${search}${searchParams.size>0 ? '&'+searchParams.toString().replace(/(q=[^&]*&?)+/, '') : ''}`); }} name='search' id='search' placeholder='Search' value={search} onChange={v => setSearch(v.target.value)} className='pl-2 w-[100%] outline-none' />
          {searchResult && searchResult.length > 0 && searchResultShow ? <div className='absolute z-100 left-[50%] translate-x-[-50%] top-[60px] w-[min(80vw,800px)] flex flex-col p-2 gap-1 mt-2 h-[50vh] bg-[#1e1e1e] rounded-md overflow-y-auto overflow-x-hidden'>
            {searchResult.map((v:any,i:number)=>{return <Link className='text-nowrap hover:bg-white/10 p-2 rounded-md' key={i} href={`/dashboardV2/search?q=${v.title}${searchParams.size>0 ? '&'+searchParams.toString().replace(/(q=[^&]*&?)+/, '') : ''}`}>
              {v.title} - {v.author}
            </Link>})}
          </div> : <></>}
        </div>
        {searchResult && searchResult.length > 0 && searchResultShow ? <div className='absolute z-99 left-[0%] top-[60px] w-[100vw] h-[100vh]' onClick={() => setSearchResultShow(false)} /> : <></>}

        <div className='flex flex-row items-center gap-2'>
          {status !== 'loading' && !session && (
            <button
              onClick={() => signIn('discord', { callbackUrl: path })}
              className='flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-800 text-white rounded-full text-sm font-medium transition-all cursor-pointer'
            >
              <LogIn size={16} />
              <span className='hidden md:inline'>Login</span>
            </button>
          )}

          <Settings onClick={() => setSettingBoxShow(v => !v)} className='w-6 h-6 cursor-pointer text-white hover:rotate-30 transition-transform' />
        </div>
      </div>

      {/* Page */}
      <div className='flex flex-row'>
        {/* Sidebar */}
        <Sidebar className={`${sidebarShow ? 'sidebar_show' : ''}`}>
          <div id='sidebar_menu' onClick={() => setSidebarShow(v => !v)} className={`sticky top-0 flex items-center justify-center h-[60] cursor-pointer`}><Menu /></div>
          <div id='sidebar_bar' className={`sticky top-[60] flex flex-col items-start justify-start gap-1 p-2 h-[calc(100vh-60px-70px)] border-r-white/20 border-r-1 overflow-x-hidden overflow-y-auto`}>{(() => {
            const to = (t: string) => `/dashboardV2/${t}`; return <>
              {/* Server */}
              {guild ? <><AppLink href={to('server')} id='sidebar_servers' onClick={() => setPopupGuildsShow(true)} className='relative'>
                {guild ? <img src={guild.icon} /> : <img src={iconDefault} />}
                <p>{guild ? guild.name : ''}</p>
              </AppLink>
                <hr /></> : <></>}

              {/* Nav */}
              <AppLink href={to('')} className={slug == 'home' ? 'sidebar_active' : ''}>{slug == 'home' ? <HiHome /> : <HiOutlineHome />}<p>Home</p></AppLink>
              <AppLink href={to('playlist')} className={slug == 'playlist' ? 'sidebar_active' : ''}>{slug == 'playlist' ? <FaBookmark /> : <FaRegBookmark />}<p>Playlist</p></AppLink>
              <AppLink href={to('server')} className={slug == 'server' ? 'sidebar_active' : ''}>{slug == 'server' ? <BiSolidServer /> : <BiServer />}<p>Server</p></AppLink>
              <AppLink href={to('upgrade')} className={slug == 'upgrade' ? 'sidebar_active' : ''}>{slug == 'upgrade' ? <FaArrowAltCircleUp /> : <FaRegArrowAltCircleUp />}<p>Upgrade</p></AppLink>

              {/* Playlist */}
              <div id='sidebar_playlist' className='flex flex-col items-center align-start justify-center w-[100%]'><hr />
                <div id='newPlaylist' className='flex flex-row items-center justify-center w-[90%] h-[40] my-[5] rounded-[20] gap-1 cursor-pointer bg-[#323232] text-nowrap'>
                  <Plus /> New playlist
                </div>
              </div>
            </>
          })()}</div>
        </Sidebar>

        {/* Page */}
        <div className='w-[calc(100vw-64px)] mt-[60] p-3 overflow-x-hidden'>
          {(() => {
            switch (slug) {
              case 'home': return <Home />;
              case 'playlist': return <Playlist />;
              case 'server': return <Server />;
              case 'search': return <SearchPage />;
              // case 'upgarde': return<Upgarde />;

              default: return <NotFound />;
            }
          })()}
        </div>
      </div>

      {/* Player */}
      <SPlayer className='sticky bottom-0 z-10 flex flex-row align-center justify-center items-center w-[100%] h-[70px] px-8 py-2 bg-[#111111] border-t-white/20 border-t-0 shadow-[0px_-2px_10px_5px_#0000006a]'>{(() => {
        const [show, setShow] = useState(false);
        const [mouseDown, setMouseDown] = useState(false);
        const [rawMouseX, setRawMouseX] = useState(0);
        const [mouseX, setMouseX] = useState(0);
        const [touchV, setTouchV] = useState(false);
        const [mouseVDown, setMouseVDown] = useState(false);
        const [mouseVY, setMouseVY] = useState(0);
        const [hoverTime, setHoverTime] = useState('0:00');
        const barRef = useRef<HTMLDivElement>(null);
        const hoverTimeRef = useRef<HTMLDivElement>(null);
        const barVRef = useRef<HTMLDivElement>(null);
        // const audioRef = useRef<HTMLAudioElement>(null);
        const playerRef = useRef<Player | null>(player);
        const lastActionRef = useRef(0);
        const loadingRef = useRef(false);

        const [position, setPosition] = useState(0);
        const [playing, setPlaying] = useState(false);
        const [volume, setVolume] = useState(20);
        const [oldVolume, setOldVolume] = useState(20);
        const [loop, setLoop] = useState<'none' | 'queue' | 'track'>('none');

        function formatTime(seconds: number): string {
          if (seconds < 0) seconds = 0;
          const hrs = Math.floor(seconds / 3600);
          const mins = Math.floor((seconds % 3600) / 60);
          const secs = Math.round(seconds % 60);

          const hStr = hrs > 0 ? `${hrs}:` : '';
          const mStr = `${hrs > 0 ? mins.toString().padStart(2, '0') : mins}`;
          const sStr = secs.toString().padStart(2, '0');

          return `${hStr}${mStr}:${sStr}`;
        };

        async function findPlayer() {
          try {
            const userId = (uDS.getState().user)?.id;
            if (!userId) return;
            type FindPlayer = { guildId: string; channelId: string; hasPlayer: boolean; botId: number | undefined };
            const res = await fetch(`/api/player/${userId}`, { method: 'GET', cache: 'no-store' });
            const { guildId, channelId, hasPlayer, botId } = await res.json() as FindPlayer;

            if (channelId && hasPlayer && botId) {
              setSSAlert(false);
            } else {
              setSSAlert(true);
              uDS.setState({ player: undefined });
            };

            uGS.setState(s => {
              const g = s.guilds?.find(g => g.id === guildId)
              return {
                guild: g ? { ...g, userVoiceId: channelId, hasPlayer, botId } : undefined
              }
            });
            // setGuild(guild ? { ...guild, userVoiceId: channelId } : undefined);

            return;
          } catch (e) {
            return console.error('Find player error:', e);
          };
        };
        async function fetchPlayer() {
          if (Date.now() - lastActionRef.current < 3000) return;
          try {
            const userId = (uDS.getState().user)?.id;
            if (!userId) return;
            const { guild } = uGS.getState();
            if (guild && guild.hasPlayer && guild.botId) {
              const res = await fetch(`/api/player/${guild.botId}/${guild.id}/${guild.userVoiceId}`, { method: 'GET', cache: 'no-store' });
              const { player } = await res.json() as { player: Player | null };
              uDS.setState(s => { return { player: player || undefined } });
              uGS.setState(s => {
                return { guild: s.guild && { ...s.guild, hasPlayer: !!player } };
              });
            };

            syncPlayer(player);
            return;
          } catch (e) {
            return console.log('Fetch player error:', e);
          };
        };

        function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) {
          e.preventDefault();
          const eProgressBar = document.getElementById('player_progressbar') as HTMLDivElement;
          const rect = eProgressBar.getBoundingClientRect();
          const x = (('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left);
          setRawMouseX(x);
          const hoverTimeWidth = hoverTimeRef.current!.offsetWidth;
          const hoverTimeHalf = (hoverTimeWidth + 10 || 0) / 2;
          const minX = hoverTimeHalf;
          const maxX = rect.width - hoverTimeHalf;
          setMouseX(Math.min(Math.max(x, minX), maxX));
          setHoverTime(formatTime((x / barRef.current!.offsetWidth) * ((player?.queue.current?.length || 0) / 1000)));

          if (mouseDown) {
            document.body.style.userSelect = 'none';
            jumpPosition();
          } else {
            document.body.style.userSelect = '';
          };
        };
        function jumpPosition() {
          const p = Math.min(1, Math.max(0, rawMouseX / barRef.current!.offsetWidth)) * ((player?.queue.current?.length || 0) / 1000);
          setPosition(p);
          // audioRef.current!.currentTime = p;
          navigator.mediaSession.setPositionState({
            duration: ((player?.queue.current?.length || 0) / 1000),
            playbackRate: 1,
            position: p || 0
          });

          return p;
        };
        function handleMouseVMove(e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) {
          e.preventDefault();
          const eVBar = document.getElementById('player_control_right')?.querySelector('#volume')?.querySelector('#bar') as HTMLDivElement;
          const rect = eVBar.getBoundingClientRect();
          const x = (('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left);
          const y = (('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.bottom);
          setMouseVY(-y);

          if (mouseVDown) {
            document.body.style.userSelect = 'none';
            handleSetVolume();
          } else {
            document.body.style.userSelect = '';
          };
        };
        function handleSetVolume() {
          const y = Math.round(Math.min(200, Math.max(0, (mouseVY / barVRef.current!.offsetWidth) * 100)));
          const v = y < 100 ? y : y < 150 ? 100 : y < 200 ? 120 : 140;
          if (!mouseVDown) setOldVolume(v == 0 ? oldVolume : v);
          setVolume(v);

          return y;
        };
        function toggleLoopMode() {
          setLoop(v => {
            const arr = ['none', 'queue', 'track'] as const;
            const i = (arr.indexOf(v) + 1) % arr.length;
            action('loop', arr[i]);
            return arr[i];
          });
        };
        function syncPlayer(player: Player | null = playerRef.current) {
          if (!player) return;

          const positionN = (player.position || 0) / 1000;
          setPosition(v => (v > (positionN + 7) || v < positionN) ? positionN : v);
          setPlaying(!!player.playing);
          setVolume(typeof player.volume === 'number' ? (player.volume <= 100 ? player.volume : player.volume <= 150 ? 120 : 140) : 20);
          setLoop(player.loop || 'none');
        };
        type ActionMap = {
          play: string;

          pause: void;
          resume: void;
          skip: void;
          previous: void;
          stop: void;
          shuffle: void;
          clear: void;

          seek: number;
          forward: number | undefined;
          rewind: number | undefined;
          volume: number;
          loop: 'none' | 'track' | 'queue';
          remove: number;
          jump: number;
          247: boolean;
        };
        async function action<K extends keyof ActionMap>(action: K, ...[value]: ActionMap[K] extends void ? [] : [ActionMap[K]]) {
          lastActionRef.current = Date.now();
          loadingRef.current = true;
          setPlaying(false);

          try {
            const userId = (uDS.getState().user)?.id;
            if (!userId) return;
            const { guild } = uGS.getState();
            if (guild && guild.hasPlayer && guild.botId) {
              const res = await fetch(`/api/player/${guild.botId}/${guild.id}/${guild.userVoiceId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: action,
                  value: value,
                  requester: {
                    id: userId,
                    username: (session as any)?.user?.name || 'unknown',
                    avatar: (session as any)?.user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png'
                  }
                })
              });
              const { player } = await res.json() as { player: Player | null };
              uDS.setState(s => { return { player: player || undefined } });
              uGS.setState(s => {
                return { guild: s.guild && { ...s.guild, hasPlayer: !!player } };
              });
              syncPlayer(player);
            };
          }
          catch (e) {
            console.error(e);
          }
          finally {
            loadingRef.current = false;
          };
        };

        useEffect(() => {
          // const audio = audioRef.current!;
          const current = player?.queue.current;

          // if (playing) audio.play()
          // else audio.pause();
          // audio.muted = true;
          // audio.volume = 0;

          if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: current?.title || 'unknown',
              artist: current?.author || 'unknown',
              album: current?.author || 'unknown',
              artwork: current?.thumbnail ? [
                { src: `${current.thumbnail}`, sizes: '512x512' }
              ] : undefined
            });

            navigator.mediaSession.setActionHandler('play', () => {
              // audio.play();
              setPlaying(true);
            });
            navigator.mediaSession.setActionHandler('pause', () => {
              // audio.pause();
              setPlaying(false);
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => { });
            navigator.mediaSession.setActionHandler('previoustrack', () => { });
            navigator.mediaSession.setActionHandler('seekto', (details) => {
              // audio.currentTime = details.seekTime || 0;
              details.fastSeek = true;
              setPosition(details.seekTime || 0);
            });
            navigator.mediaSession.setPositionState({
              duration: Math.max(position + 5, (current?.length || 0) / 1000),
              playbackRate: 1,
              position: position || 0
            });
          };

          // const i = setInterval(()=>{
          //   audio.volume = 0;
          // }, 1000);
          // return ()=>clearInterval(i);
        }, []);

        useEffect(() => {
          // const audio = audioRef.current!;
          const current = player?.queue.current;
          // if (playing) audio.play()
          // else audio.pause();

          // audio.loop = (loop === 'track');

          if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: current?.title || 'unknown',
              artist: current?.author || 'unknown',
              album: current?.author || 'unknown',
              artwork: current?.thumbnail ? [
                { src: `${current.thumbnail}`, sizes: '512x512' }
              ] : undefined
            });
            navigator.mediaSession.setPositionState({
              duration: Math.max(position + 5, (current?.length || 0) / 1000),
              playbackRate: 1,
              position: position || 0
            });
          };
        }, [player, playing, position]);

        useEffect(() => {
          if (!playing) return;
          const duration = (player?.queue.current?.length || 0) / 1000;

          const i = setInterval(() => {
            setPosition(v => Math.min(duration, v + 0.2));
          }, 200);
          return () => clearInterval(i);
        }, [playing, player?.queue.current]);

        useEffect(() => {
          playerRef.current = player;
        }, [player]);

        useEffect(() => {
          const i = setInterval(() => {
            syncPlayer();
          }, 5_000);
          return () => clearInterval(i);
        }, []);

        useEffect(() => {
          const i = setInterval(() => { findPlayer() }, 5000);
          const ii = setInterval(() => { fetchPlayer() }, guild?.hasPlayer ? 3000 : 5000);
          return () => {
            clearInterval(i);
            clearInterval(ii);
          };
        }, [guild?.hasPlayer]);

        useEffect(() => {
          if (searchParams.has('play') && guild?.hasPlayer) {
            try {
              const play = searchParams.get('play');
              const url = `https://youtube.com/watch?v=${play}`;
              action('play', url);
            } catch (error) {
              console.error(error);
            } finally { deleteQuery('play'); deleteQuery('q'); setSearch('') };
          };
          deleteQuery('play');
        }, [searchParams, guild?.hasPlayer]);

        useEffect(() => {
          const h = (event: KeyboardEvent) => {
            const activeElement = document.activeElement;

            if (activeElement) {
              const tagName = activeElement.tagName.toLowerCase();
              if (tagName === 'input' || tagName === 'textarea' || (activeElement as HTMLElement).isContentEditable) return;
            };
            if (event.key === ' ') {
              event.preventDefault();
              action(playing ? 'pause' : 'resume');
            };
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              action('rewind', 10_000);
            };
            if (event.key === 'ArrowRight') {
              event.preventDefault();
              action('forward', 10_000);
            };
          };
          document.addEventListener('keyup', h);
          return () => document.removeEventListener('keyup', h);
        }, [playing]);

        return <>
          {/* <audio src={'/sounds/Sound_E.mp3'} ref={audioRef} /> */}

          {/* Progress */}
          {player?.queue.current?.length ? <div id='player_progressbar' style={{ ['--position' as any]: `${Math.min(0.999, position / ((player?.queue.current?.length || 0) / 1000))}`, ['--mouse-position' as any]: `${mouseX}px` }} ref={barRef}>
            <div id='hover_time' ref={hoverTimeRef}>{hoverTime}</div>
            <div id='mouseEvents' className={`${mouseDown ? 'mouseDown' : ''}`} onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onClick={() => { const p = jumpPosition(); action('seek', Math.round(p * 1000)); }} onMouseDown={() => setMouseDown(true)} onMouseUp={() => setMouseDown(false)} onMouseLeave={() => setMouseDown(false)} onTouchStart={() => setMouseDown(true)} onTouchEnd={() => setMouseDown(false)} onTouchCancel={() => setMouseDown(false)} />
          </div> : <></>}

          {/* Controller */}
          <div id='player_controller' onClick={e => { if (!guild?.hasPlayer) { e.stopPropagation(); setSSAlert(true) } }} className={`grid items-center gap-4 w-[100%] h-[100%]`}>

            <div id='player_control_left' className='justify-start'>
              {player?.queue.current ? <>
                <div id='image' style={{ ['--bg' as any]: `url(${player.queue.current.thumbnail})` }}>
                  {player.queue.current.thumbnail
                    ? <img src={player.queue.current.thumbnail} alt='image' />
                    : <>?</>}
                </div>
                <div id='info'>
                  <p id='name'>{player.queue.current.title}</p>
                  <p id='author'>{player.queue.current.author}</p>
                </div>
                <div id='duration'>{formatTime(position)}/{formatTime((player.queue.current.length || 0) / 1000)}</div>
              </>
                : <></>
              }
            </div>

            <div id='player_control_center' className='justify-center'>
              {true ? <>
                <div id='skipBack' className={`${player?.queue.previous.length && !loadingRef.current ? '' : 'block'}`} onClick={() => player?.queue.previous.length && action('previous')}><TbPlayerSkipBackFilled /></div>
                <div id='play' className={`${player?.queue.current && !loadingRef.current ? '' : 'block'}`} onClick={() => player?.queue.current && setPlaying(v => { action(v ? 'pause' : 'resume'); return !v })}>{loadingRef.current ? <TbLoader2 className='animate-spin' /> : (playing === true ? <FaPause /> : <FaPlay />)}</div>
                <div id='skipForward' className={`${player?.queue.items.length && !loadingRef.current ? '' : 'block'}`} onClick={() => player?.queue.items.length && action('skip')}><TbPlayerSkipForwardFilled /></div>
              </>
                : <></>
              }
            </div>

            <div id='player_control_right' className='justify-end'>
              {true ? <>
                <div id='volume' className={`${player && !loadingRef.current ? '' : 'block'}`}>
                  {volume > 0 ? <MdVolumeUp onTouchStart={() => setTouchV(true)} onClick={() => player && (touchV ? setTouchV(false) : setVolume(v => v !== 0 ? (() => { setOldVolume(v); action('volume', 0); return 0 })() : (() => { action('volume', oldVolume); return oldVolume })()))} /> : <MdVolumeOff onTouchStart={() => setTouchV(true)} onClick={() => player && (touchV ? setTouchV(false) : setVolume(v => v !== 0 ? (() => { setOldVolume(v); action('volume', v); return 0 })() : (() => { action('volume', oldVolume); return oldVolume })()))} />}
                  <div id='box'>
                    <div id='bar' style={{ ['--volume' as any]: `${Math.min(100, volume)}`, ['--bar-color' as any]: volume <= 100 ? '#cd2121' : volume <= 120 ? '#ff00cc' : '#9d00ff', }} ref={barVRef}>
                      <div id='mouseEvents' className={`${mouseVDown ? 'mouseDown' : ''}`} onMouseMove={handleMouseVMove} onTouchMove={handleMouseVMove} onClick={() => { const y = handleSetVolume(); action('volume', y <= 100 ? y : y < 150 ? 100 : y < 200 ? 150 : 200) }} onMouseDown={() => setMouseVDown(true)} onMouseUp={() => setMouseVDown(false)} onMouseLeave={() => setMouseVDown(false)} onTouchStart={() => setMouseVDown(true)} onTouchEnd={() => setMouseVDown(false)} onTouchCancel={() => setMouseVDown(false)} />
                    </div>
                  </div>
                </div>
                <div id='loop' className={`${player && !loadingRef.current ? '' : 'block'}`} onClick={() => player && toggleLoopMode()}>{{ 'none': <TbRepeatOff />, 'queue': <TbRepeat />, 'track': <TbRepeatOnce /> }[loop]}</div>
                <div id='toggleShow' className={`${show ? 'show' : ''}`} onClick={() => setShow(v => !v)}><FaAngleUp /></div>
              </> : <></>
              }
            </div>

          </div>

          {/* Block */}
          {/* {!player?<div id='player_block' onClick={()=>setSSAlert(true)} className='absolute w-full h-full flex items-center justify-center cursor-not-allowed bg-black/0 pointer-events-none'>
          <div onClick={()=>setPopupGuildsShow(true)} className='px-5 py-1 bg-white/20 rounded-[20] backdrop-blur-[2px] backdrop-brightness-[0.5] font-medium shadow-[0_1px_5px_rgb(0_0_0_/_0.2)] text-shadow-[0_1px_2px_rgb(0_0_0)] cursor-pointer'>{guild&&!guild.bot?'Select Bot':'Select Server'}</div>
        </div>:<></>} */}
        </>
      })()}</SPlayer>

      {/* Setting Box */}
      {(() => {
        const [localeShow, setLocaleShow] = useState(false);
        const [languageShow, setLanguageShow] = useState(false);

        const languages = [
          { value: 'US', label: 'English' },
        ];

        return (
          <div id='setting-box' className={`absolute right-0 top-0 w-full h-full z-500 pointer-events-none flex items-start justify-end overflow-hidden`}>
            <div className={`flex flex-col items-center justify-start gap-2 p-2 transition-all duration-[0.3s] ease-in-out backdrop-blur-sm bg-[#1e1e1e]/95 h-full ${settingBoxShow ? 'pointer-events-auto' : 'pointer-events-none translate-x-full'}`}>
              {!session && <div onClick={() => setSettingBoxShow(false)} className='flex w-full justify-end px-2 pt-2'><X className='w-8 h-8 p-1 cursor-pointer hover:bg-white/10 transition-all duration-[0.2s] ease-in-out rounded-[50%] ' /></div>}
              <div className='w-full px-5'>
                {session ? <div className='flex flex-row items-center justify-between gap-2 p-2 w-full'><img className='w-8 h-8 rounded-[50%] ' src={session.user?.image || ''} /> {session.user?.name || ''} <X className='w-8 h-8 p-1 cursor-pointer hover:bg-white/10 transition-all duration-[0.2s] ease-in-out rounded-[50%] ' onClick={() => setSettingBoxShow(false)} /></div> : <></>}
                <hr className='my-2 border-white/20' />
                <div className='flex flex-row items-center justify-between gap-2 p-2 w-full cursor-pointer hover:bg-white/10 transition-all duration-[0.2s] ease-in-out rounded-[20]' onClick={() => setLocaleShow(v => !v)}><div className='flex items-center gap-2'><Globe /> Locale</div> {localeShow ? <ChevronUp /> : <ChevronDown />}</div>
                <div className={`${localeShow ? 'max-h-[200px]' : 'max-h-0'} px-5 overflow-y-scroll transition-all duration-[0.3s] ease-in-out`}>
                  {Object.entries(countryMap).map(([value, label], index) => (
                    <div key={index} className={`flex flex-row items-center justify-start gap-2 px-3 py-1 w-full cursor-pointer hover:bg-white/10 transition-all duration-[0.2s] ease-in-out rounded-[20] ${country == value ? 'bg-white/10' : ''}`} onClick={() => { Cookies.set('locale', value, { expires: 365 }); window.location.reload(); }}>
                      <Flag code={value} className='w-5 h-5' />
                      <div>{label}</div>
                    </div>
                  ))}
                </div>

                <div className='flex flex-row items-center justify-between gap-2 p-2 w-full cursor-pointer hover:bg-white/10 transition-all duration-[0.2s] ease-in-out rounded-[20]' onClick={() => setLanguageShow(v => !v)}><div className='flex items-center gap-2'><Languages /> Language</div> {languageShow ? <ChevronUp /> : <ChevronDown />}</div>
                <div className={`${languageShow ? 'max-h-[200px]' : 'max-h-0'} px-5 overflow-y-scroll transition-all duration-[0.3s] ease-in-out`}>
                  {languages.map((language, index) => (
                    <div key={index} className={`flex flex-row items-center justify-start gap-2 px-3 py-1 w-full cursor-pointer hover:bg-white/10 transition-all duration-[0.2s] ease-in-out rounded-[20] ${language.value == 'US' ? 'bg-white/10' : ''}`} onClick={() => { Cookies.set('language', language.value, { expires: 365 }); window.location.reload(); }}>
                      <Flag code={language.value} className='w-5 h-5' />
                      <div>{language.label}</div>
                    </div>
                  ))}
                </div>

                <hr className='m-2 border-white/0' />
                <div className='flex flex-row items-center justify-start gap-2 p-2 w-full cursor-pointer hover:bg-white/10 transition-all duration-[0.2s] ease-in-out rounded-[20]' onClick={() => { session ? signOut() : signIn('discord', { callbackUrl: path }) }} style={{ color: session ? '#ff4444' : 'white' }}>{session ? <LogOut /> : <LogIn />} {session ? 'Logout' : 'Login'}</div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Popup Guilds */}
      {/* <PopupGuilds /> */}

      {/* alert */}
      {/* {SSAlert&&guilds&&!guild?<div id='sidebar_servers_alert' className={`fixed top-[70] duration-[0.3s] ease-in-out ${sidebarShow ? 'show' : ''}`}>
        <div className={`flex flex-row gap-3 relative bg-yellow-800 text-white px-4 py-2 rounded
            before:content-[''] before:absolute before:-left-2 before:top-1/2
            before:-translate-y-1/2
            before:border-r-8 before:border-r-yellow-800
            before:border-t-8 before:border-t-transparent
            before:border-b-8 before:border-b-transparent
          `}>
          <AlertTriangle />
          Please select a server to control the player
          <X className='cursor-pointer' onClick={()=>setSSAlert(false)} />
        </div>
      </div>:<></>} */}
      {SSAlert ? <div id='sidebar_player_alert' className={`fixed top-[70] left-[50%] -translate-x-[50%] duration-[0.3s] ease-in-out`}>
        <div className={`flex flex-row gap-3 relative bg-yellow-800 text-white px-4 py-2 rounded
          `}>
          <AlertTriangle />
          {status === 'unauthenticated' ? <p>Please <b>log in</b>.</p>
            : !guild || !guild.userVoiceId
              ? <p>Connect the <b>Voice Channel</b> to control the player.</p>
              : !guild.hasPlayer
                ? <p>Please use the command <b>/connect</b> first.</p>
                // :<></>
                : <p>Failed to find the player. Please try <b onClick={() => document.location.reload()} className='cursor-pointer'>refreshing</b> the page.</p>
          }
          <X className='cursor-pointer' onClick={() => setSSAlert(false)} />
        </div>
      </div> : <></>}
    </Page>
  );
}