import { Home as SHome } from '../utils/styles';
import { useEffect, useState } from 'react';
import {
  useDashboardStore as uDS,
  useHomeStore as uHS,
  useGuildStore as uGS,
} from '../utils/zustand';
import { useShallow } from 'zustand/react/shallow';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { TbLoader2, TbMoodEmpty, TbMoodPuzzled } from 'react-icons/tb';
import { countryMap } from '../utils/types';
import Link from 'next/link';
import { FaPlay } from 'react-icons/fa6';
import { useRouter, useSearchParams } from 'next/navigation';

export const Home = () => {
  const user = uDS(useShallow((s) => s.user));
  const [guild] = uGS(useShallow(s => [s.guild]));
  const [country, setCountry] = uDS(
    useShallow((s) => [s.country, s.setCountry]),
  );
  const [recommended, setRecommended] = uHS(
    useShallow((s) => [s.recommended, s.setRecommended]),
  );
  const [trending, setTrending] = uHS(
    useShallow((s) => [s.trending, s.setTrending]),
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchRecommended = async () => {
    const res = await fetch('/api/youtube/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'recommended',
        maxResults: 10,
        type: 'video',
        videoCategoryId: 10,
        videoType: 'any',
        videoDuration: 'any',
        videoDefinition: 'any',
        videoDimension: 'any',
        videoSyndicated: 'any',
        videoLicense: 'any',
        videoEmbeddable: 'any',
      }),
    });

    const data = await res.json();
    setRecommended(data.items);
  };
  const fetchTrending = async () => {
    const res = await fetch('/api/youtube/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'trending',
        maxResults: 40,
        type: 'video',
        videoCategoryId: 10,
        videoType: 'any',
        videoDuration: 'any',
        videoDefinition: 'any',
        videoDimension: 'any',
        videoSyndicated: 'any',
        videoLicense: 'any',
        videoEmbeddable: 'any',
        chart: 'mostPopular',
        // regionCode: 'TH',
      }),
    });

    const data = await res.json();
    setTrending(data.items);
    setCountry(data.regionCode);
    console.log(data);
  };
  const scroll = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: 'left' | 'right',
  ) => {
    const list = e.currentTarget.parentElement?.querySelector('.list');
    if (!list) return;
    const scrollAmount = 600;
    const currentScroll = list.scrollLeft;
    const newScroll =
      direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;
    list.scrollLeft = newScroll;
  };
  const updateScrollArrows = (container: Element) => {
    const arrowLeft = container.querySelector('.arrow_left') as HTMLDivElement;
    const arrowRight = container.querySelector(
      '.arrow_right',
    ) as HTMLDivElement;
    const list = container.querySelector('.list') as HTMLDivElement;
    if (!arrowLeft || !arrowRight || !list) return;
    const isAtStart = list.scrollLeft <= 0;
    const isAtEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 1; // -1 กันเลขทศนิยม
    arrowLeft.style.opacity = isAtStart ? '0' : '1';
    arrowLeft.style.pointerEvents = isAtStart ? 'none' : 'all';
    arrowRight.style.opacity = isAtEnd ? '0' : '1';
    arrowRight.style.pointerEvents = isAtEnd ? 'none' : 'all';
  };

  const createQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/dashboardV2?${params.toString()}`, { scroll: false });
  };
  const deleteQuery = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/dashboardV2?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    // setTimeout(()=>{
      fetchTrending();
    // },5_000);
  }, []);

  useEffect(() => {
    // user?.history?.length > 0 && fetchRecommended();
    // fetchRecommended();
  }, [user]);

  useEffect(() => {
    const containers = document.querySelectorAll('.list_container');

    containers.forEach((container) => {
      const list = container.querySelector('.list');
      if (!list) return;
      // 1. ตรวจสอบทันทีที่ข้อมูลเปลี่ยน (ใช้ ResizeObserver ช่วยตรวจจับเมื่อข้อมูลถูก Render ลงใน DOM)
      const resizeObserver = new ResizeObserver(() =>
        updateScrollArrows(container),
      );
      resizeObserver.observe(list);
      // 2. ตรวจสอบทุกครั้งที่มีการเลื่อน
      list.addEventListener('scroll', () => updateScrollArrows(container));
      // Cleanup
      return () => {
        resizeObserver.disconnect();
        list.removeEventListener('scroll', () => updateScrollArrows(container));
      };
    });

    // const loading_state = document.getElementById('loading_state') as HTMLDivElement;
    // const loading = document.getElementById('loading_spiner') as HTMLDivElement;
    // const notThing = document.getElementById('not_thing') as HTMLDivElement;

    // if (trending.length > 0 || recommended.length > 0) {
    //   loading.style.opacity = '0';
    //   notThing.style.display = 'none';
    // } else {
    //   loading.style.opacity = '1';
    //   notThing.style.display = 'flex';
    // }

    // const t = setTimeout(() => {
    //   if (!notThing) return;
    //   loading.style.opacity = '0';
    //   if (trending.length > 0 || recommended.length > 0) {
    //     notThing.style.display = 'none';
    //     notThing.style.opacity = '0';
    //   } else {
    //     notThing.style.display = 'flex';
    //     notThing.style.opacity = '1';
    //   }
    // }, 5_000);

    // return () => clearTimeout(t);
  }, [trending, recommended]);

  return (
    <>
      <SHome>
        {/* Slides */}
        {[...Object.entries({'trending 🔥': trending})].map(([key, x])=>(
        <div key={key} id={key}>
          <h1>{key.charAt(0).toUpperCase() + key.slice(1)}</h1>
          <div className='list_container'>
            <div className='arrow_left' onClick={(e) => scroll(e, 'left')}>
              <ChevronLeft />
            </div>
            <div className='list'>
              {x.length > 0 ? x.map((item: any, index: number) => (
                <div key={index} className='flex gap-4 items-center p-2'>
                  <div id='img'>
                    <img
                      src={
                        item.snippet.thumbnails.medium?.url ||
                        item.snippet.thumbnails.default?.url
                      }
                      alt={item.snippet.title}
                      className='w-20 rounded'
                    />
                    <Link href={!guild?.hasPlayer ? `?alert=spa&play=${item.id}` : `?play=${item.id}`} id='play'><FaPlay /></Link>
                  </div>
                  <div>
                    <Link href={!guild?.hasPlayer ? `?alert=spa&play=${item.id}` : `?play=${item.id}`} className='font-bold hover:underline'>{item.snippet.title}</Link>
                    <Link href={`?c=${item.snippet.channelId}`} className='text-gray-400 text-sm hover:underline'>
                      {item.snippet.channelTitle}
                    </Link>
                  </div>
                </div>
              )) : [0,1,2,3,4,5,6,7,8,9].map((item: any, index: number) => (
                <div key={index} className='flex gap-4 items-center p-2'>
                  <div id='img'
                    className="bg-gray-500 animate-pulse"
                  />
                  <div className='flex flex-col gap-2'>
                    <div className='h-2 w-30 rounded bg-gray-500 animate-pulse'></div>
                    <div className='h-2 w-16 rounded bg-gray-500 animate-pulse'></div>
                  </div>
                </div>
              ))}
            </div>
            <div className='arrow_right' onClick={(e) => scroll(e, 'right')}>
              <ChevronRight />
            </div>
          </div>
        </div>))}

        {/* Trending
        {trending?.length > 0 ? (
          <div id='trending'>
            <h1>
              Trending{' '}
              {country && countryMap[country]
                ? `in ${countryMap[country]}`
                : ''}
            </h1>
            <div className='list_container'>
              <div className='arrow_left' onClick={(e) => scroll(e, 'left')}>
                <ChevronLeft />
              </div>
              <div className='list'>
                {trending?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className='flex flex-col gap-4 items-start p-2'
                  >
                    <img
                      src={
                        item.snippet.thumbnails.medium?.url ||
                        item.snippet.thumbnails.default?.url
                      }
                      alt={item.snippet.title}
                      className='w-20 rounded'
                    />
                    <div>
                      <p className='font-bold'>{item.snippet.title}</p>
                      <p className='text-gray-400 text-sm'>
                        {item.snippet.channelTitle}
                      </p>
                    </div>
                  </div>
                )) || <p>No trending videos</p>}
              </div>
              <div className='arrow_right' onClick={(e) => scroll(e, 'right')}>
                <ChevronRight />
              </div>
            </div>
          </div>
        ) : (
          <></>
        )} */}
      </SHome>

      {/* <div id='loading_state' className='absolute top-0 left-0 w-screen h-screen flex justify-center items-center z-[-10]'>
        <div id='not_thing'>
          <TbMoodPuzzled />
          <h1>Page is empty</h1>
          <div>
            <p>
              <b>User</b>: What happened?
            </p>
            <p>
              <b>Yumi</b>: I don't know. I'll try asking the Backend.
            </p>
            <p>
              <b>Backend</b>: -- Not Respond --
            </p>
            <p>
              <b>Yumi</b>: What is it!? AI what is this thing?
            </p>
            <p>
              <b>AI</b>: I don't know, but I think you should try refreshing the
              page.
            </p>
          </div>
        </div>

        <div id='loading_spiner'>
          <TbLoader2 className='animate-spin' />
        </div>
      </div> */}
    </>
  );
};
