export type Guild = {
  id: string;
  name: string;
  icon: any;
  botId: number | undefined;
  userVoiceId: string | undefined;
  hasPlayer: boolean;
};

enum PlayerState {
  CONNECTING = 0,
  CONNECTED = 1,
  DISCONNECTING = 2,
  DISCONNECTED = 3,
  DESTROYING = 4,
  DESTROYED = 5
};
type Track = {
  requester: unknown | undefined;
  sourceName: string;
  title: string;
  uri?: string;
  author: string | undefined;
  length: number | undefined;
  thumbnail: string | undefined;
};
export type Player = {
  guildId: string;
  channelId: string | null;
  queue: {
    items: Track[];
    current: Track | undefined | null;
    previous: Track[];
    size: number;
    totalSize: number;
    isEmpty: boolean;
  };
  playing: boolean;
  loop: 'none' | 'queue' | 'track';
  volume: number;
  position: number;
  state: PlayerState;
} | undefined;

export const countryMap: Record<string, string> = {
  TH: 'ไทย',
  US: 'USA',
  GB: 'UK',
  JP: '日本',
  KR: '한국',
  CN: '中国',
  IN: 'India',
  AU: 'Australia',
  CA: 'Canada',
  DE: 'Deutschland',
  FR: 'France',
  IT: 'Italia',
  ES: 'España',
  NL: 'Nederland',
  SE: 'Sverige',
  NO: 'Norge',
  FI: 'Suomi',
  DK: 'Danmark',
  CH: 'Schweiz',
  AT: 'Österreich',
  BE: 'België',
  IE: 'Éire',
  NZ: 'New Zealand',
  SG: 'Singapore',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Pilipinas',
  VN: 'Việt Nam',
  HK: '香港',
  TW: '臺灣',
  BR: 'Brasil',
  MX: 'México',
  AR: 'Argentina',
  CL: 'Chile',
  ZA: 'South Africa',
  EG: 'مصر',
  AE: 'الإمارات',
  SA: 'السعودية',
  TR: 'Türkiye',
  RU: 'Россия',
  UA: 'Україна',
  PL: 'Polska',
  CZ: 'Česko',
  HU: 'Magyarország',
  GR: 'Ελλάδα',
  PT: 'Portugal',
  IL: 'ישראל',
  PK: 'پاکستان',
  BD: 'বাংলাদেশ',
  LK: 'ශ්‍රී ලංකා',
  NP: 'नेपाल'
};
