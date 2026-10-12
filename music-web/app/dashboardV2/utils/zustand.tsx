import { create } from 'zustand';
import { Guild, Player } from './types';

type SetState<T> = T | ((prev: T) => T);
const createSetter = <S,>(set: (fn: (state: S) => Partial<S>) => void) =>
  <K extends keyof S>(key: K) =>
  (v: S[K] | ((prev: S[K]) => S[K])) =>
    set((s) => ({
      [key]:
        typeof v === 'function'
          ? (v as (prev: S[K]) => S[K])(s[key])
          : v,
} as unknown as Partial<S>));

type DashboardStore = {
  user: any;
  isLoading: boolean;
  sidebarShow: boolean;
  popupGuildsShow: boolean;
  search: string;
  loadingProgress: number;
  loadingMaxProgress: number;
  player: Player;
  country: string | null;

  setUser: (v: SetState<any>) => void;
  setLoading: (v: SetState<boolean>) => void;
  setSidebarShow: (v: SetState<boolean>) => void;
  setPopupGuildsShow: (v: SetState<boolean>) => void;
  setSearch: (v: SetState<string>) => void;
  setLoadingProgress: (v: SetState<number>) => void;
  setLoadingMaxProgress: (v: SetState<number>) => void;
  setPlayer: (v: SetState<Player>) => void;
  setCountry: (v: SetState<string | null>) => void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  user: undefined,
  isLoading: true,
  sidebarShow: false,
  popupGuildsShow: false,
  search: '',
  loadingProgress: 10,
  loadingMaxProgress: 80,
  player: undefined,
  country: null,

  setUser: createSetter<DashboardStore>(set)('user'),
  setLoading: createSetter<DashboardStore>(set)('isLoading'),
  setSidebarShow: createSetter<DashboardStore>(set)('sidebarShow'),
  setPopupGuildsShow: createSetter<DashboardStore>(set)('popupGuildsShow'),
  setSearch: createSetter<DashboardStore>(set)('search'),
  setLoadingProgress: createSetter<DashboardStore>(set)('loadingProgress'),
  setLoadingMaxProgress: createSetter<DashboardStore>(set)('loadingMaxProgress'),
  setPlayer: createSetter<DashboardStore>(set)('player'),
  setCountry: createSetter<DashboardStore>(set)('country'),
}));

type GuildStore = {
  guilds: Guild[] | undefined;
  guild: Guild | undefined;
  isGuildsFetching: boolean;
  isBotsFetching: boolean;
  iconDefault: string;
  
  setGuilds: (v: SetState<Guild[] | undefined>) => void;
  setGuild: (v: SetState<Guild | undefined>) => void;
  setIsGuildsFetching: (v: SetState<boolean>) => void;
  setIsBotsFetching: (v: SetState<boolean>) => void;
};

export const useGuildStore = create<GuildStore>((set) => ({
  guilds: undefined,
  guild: undefined,
  isGuildsFetching: false,
  isBotsFetching: false,
  iconDefault: 'https://cdn.discordapp.com/embed/avatars/0.png',

  setGuilds: createSetter<GuildStore>(set)('guilds'),
  setGuild: createSetter<GuildStore>(set)('guild'),
  setIsGuildsFetching: createSetter<GuildStore>(set)('isGuildsFetching'),
  setIsBotsFetching: createSetter<GuildStore>(set)('isBotsFetching'),
}));

type HomeStore = {
  recommended: any[];
  trending: any[];

  setRecommended: (v: SetState<any[]>) => void;
  setTrending: (v: SetState<any[]>) => void;
};

export const useHomeStore = create<HomeStore>((set) => ({
  recommended: [],
  trending: [],

  setRecommended: createSetter<HomeStore>(set)('recommended'),
  setTrending: createSetter<HomeStore>(set)('trending'),
}));
