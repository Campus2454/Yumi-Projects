import { useEffect, useState } from 'react';
import {
  useDashboardStore as uDS,
  useHomeStore as uHS,
  useGuildStore as uGS,
} from '../utils/zustand';
import { useShallow } from 'zustand/react/shallow';
import { useRouter, useSearchParams } from 'next/navigation';
import { KazagumoSearchResult, KazagumoTrack } from 'kazagumo';
import { Search as SSearch } from '../utils/styles';
import { FaFaceFrown } from 'react-icons/fa6';
import Link from 'next/link';

export const Search = () => {
  const [user, search, setSearch] = uDS(useShallow((s) => [s.user, s.search, s.setSearch]));
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<KazagumoSearchResult | null>();
  const [searchError, setSearchError] = useState<string | undefined>(undefined);

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

  async function fetchSearch(q: string){
    try {
      setLoading(true);
      const res = await fetch('/api/player/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q }),
      });
      if(res.ok)setResult(await res.json());
      else throw new Error(await res.text());
    } catch (error) {
      console.error(error);
      setSearchError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if(loading && !searchError){
        setSearchError('Timeout');
        setLoading(false);
      };
    }, 10_000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if(!q) return router.replace(`/dashboardV2${searchParams.size>0 ? '?'+searchParams.toString() : ''}`);
    if (q !== query) {
      setSearch(q);
      fetchSearch(q);
    };
    setQuery(q);
  }, [searchParams]);

  const NoResult = () => {
    return <div className='flex flex-col w-full h-full items-center justify-center'>
      <FaFaceFrown className='text-6xl text-zinc-100 mb-4'/>
      <h1 className='text-3xl font-bold text-zinc-100'>No result</h1>
      <p className='text-md text-zinc-300'>Please try other keywords</p>
    </div>;
  };

  const PError = () => {
    return <div className='flex flex-col w-full h-full items-center justify-center'>
      <FaFaceFrown className='text-6xl text-zinc-100 mb-4'/>
      <h1 className='text-3xl font-bold text-zinc-100'>Something went wrong</h1>
      <p className='text-md text-zinc-300'>Please try again later</p>
    </div>;
  };

  return (<SSearch>
    {
      loading ? 
      <div id='search-result'>{
          Array.from({ length: 20 }).map((_, i) => {
            return <Link href={`#`} key={'search-result-loading-'+i} className={`flex gap-3 p-3 rounded-md overflow-hidden transition-colors duration-100 pointer-events-none`}>
                <div className={`img shrink-0 rounded-lg overflow-hidden animate-pulse bg-zinc-500`}>
                    <img 
                      src={undefined} 
                      alt={undefined} 
                      className='w-full h-full object-cover'/>
                </div>
                <div className={`flex flex-col gap-1`}>
                    <div className={`animate-pulse bg-zinc-500 w-64 h-5 rounded-md font-medium text-zinc-100 line-clamp-2 text-nowrap`}/>
                    <div className={`animate-pulse bg-zinc-500 w-32 h-4 rounded-md text-sm text-zinc-300 line-clamp-1 text-nowrap`}/>
                    <div className={`animate-pulse bg-zinc-500 w-12 h-4 rounded-md text-sm text-zinc-300 line-clamp-1 text-nowrap`}/>
                </div>
              </Link>
          })
        }</div> :
      !result || result?.tracks?.length === 0 ? 
        searchError ? 
          <PError /> : <NoResult /> :
          <div id='search-result'>{
            result.tracks.map((item: any, i: number) => {
              return <Link key={'search-result-item-'+i} href={`/dashboardV2/search?play=${item?.uri?.replace(/^[^=]*=/, '')}${searchParams.size>0 ? '&'+searchParams.toString().replace(/(play=[^&]*&?)+/, '') : ''}`} className={`flex gap-3 p-3 rounded-md overflow-hidden transition-colors duration-100 ${!item ? 'pointer-events-none' : 'cursor-pointer'}`}>
                <div className={`img shrink-0 rounded-lg overflow-hidden ${!item ? 'animate-pulse bg-zinc-500' : ''}`}>
                    <img 
                      src={item?.thumbnail} 
                      alt={item?.title} 
                      className='w-full h-full object-cover'/>
                </div>
                <div className={`flex flex-col gap-1`}>
                    <div className={`${!item ? 'animate-pulse bg-zinc-500 w-64 h-5 rounded-md' : ''} font-medium text-zinc-100 line-clamp-2 text-nowrap`}>{item?.title}</div>
                    <div className={`${!item ? 'animate-pulse bg-zinc-500 w-32 h-4 rounded-md' : ''} text-sm text-zinc-300 line-clamp-1 text-nowrap`}>{item?.author}</div>
                    <div className={`${!item ? 'animate-pulse bg-zinc-500 w-12 h-4 rounded-md' : ''} text-sm text-zinc-300 line-clamp-1 text-nowrap`}>{item?.length ? new Date(item.length).toISOString().slice(11, 19).replace(/^(00:)?0?/, '') : ''}</div>
                </div>
              </Link>
            })}
          </div>
    }
  </SSearch>);
};
