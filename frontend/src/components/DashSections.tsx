'use client';
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import { FaHashtag, FaUsers, FaServer, FaCalendarAlt, FaDiscord } from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';
import { TbCrown, TbCopy, TbCheck, TbArrowRight, TbSettings, TbPlus, TbDiamond, TbExternalLink, TbLanguage, TbUser, TbPalette, TbPhoto, TbRefresh, TbArrowDown } from 'react-icons/tb';
import { BsStars } from 'react-icons/bs';
import { SkeletonBlock } from './DashboardSkeleton';
import {
  DashPageServerOverview,
  DashPageServerGeneralSettings,
  DashPageServerGeneralInfo,
  DashPageServerFunctionWelcomeGoodBye,
  Select,
  InputField,
} from '../utils/styles';
import { PartialGuild, User, localeLabels } from '../utils/types';
import { getAvatarURL, getIconURL } from '../utils/getURL';
import { useGuildList } from '../utils/hooks/useGuildData';
import Cookies from 'js-cookie';

const origin = typeof window !== 'undefined' ? window.location.origin : '';

// Shared by every dashboard page and its loading state.
export function PageHeader({ title }: { title: string }) {
  return (
    <>
      <div id='title'>{title}</div>
      <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px' }} />
    </>
  );
}

// Text line that becomes a SkeletonBlock while `value` is undefined.
const Line = ({ value, width = '120px' }: { value?: ReactNode; width?: string }) =>
  value === undefined ? <SkeletonBlock $width={width} $height="16px" $radius="4px" $margin="4px 0" /> : <h4>{value}</h4>;

type OverviewData = { members?: { user: { bot?: boolean } }[]; channels: { text: number; voice: number } };

export function OverviewCards({ data }: { data?: OverviewData }) {
  return (
    <DashPageServerOverview>
      <div id='total_members' style={{ backgroundColor: 'rgba(137, 43, 226, 0.3)', borderColor: 'blueviolet' }}>
        <div id="title">
          <FaUsers id="icon" style={{ backgroundColor: '#bd24ff' }} />
          <h1>Total Members</h1>
        </div>
        <div id="main">
          {data ? data.members?.length || 0 : <SkeletonBlock $width="40px" $height="28px" $radius="6px" />}
        </div>
        <div id="sub">
          <Line width="60px" value={data && `Bots: ${data.members?.filter(m => m.user.bot === true)?.length || 0}`} />
        </div>
      </div>
      <div id='channels' style={{ backgroundColor: 'rgba(43, 226, 61, 0.3)', borderColor: '#00fa00' }}>
        <div id="title">
          <FaHashtag id="icon" style={{ backgroundColor: '#0a7e18ff' }} />
          <h1>Channels</h1>
        </div>
        <div id="sub">
          <Line value={data && `Text channels: ${data.channels.text}`} />
          <Line value={data && `Voice channels: ${data.channels.voice}`} />
        </div>
      </div>
      <div id='security' style={{ backgroundColor: 'rgba(226, 43, 147, 0.3)', borderColor: 'pink' }}>
        <div id="title">
          <FaShield id="icon" style={{ backgroundColor: '#ff24d3ff' }} />
          <h1>Security</h1>
        </div>
        <div id="sub">
          <Line value={data && 'Status: disabled'} />
          <Line value={data && 'Warnings Count: 0'} />
        </div>
      </div>
    </DashPageServerOverview>
  );
}

type SettingsData = { preferred_locale?: string; prefix?: string };

export function SettingsFields({ data, onChange }: { data?: SettingsData; onChange?: () => void }) {
  return (
    <DashPageServerGeneralSettings>
      <div id="language">
        Language
        <div>
          {data ? (
            <Select key={data.preferred_locale} translate="no" name="language" defaultValue={data.preferred_locale} onChange={onChange}>
              {Object.entries(localeLabels).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </Select>
          ) : (
            <SkeletonBlock $height="50px" $radius="5px" $margin="5px 0 0 0" />
          )}
        </div>
      </div>

      <br />

      <div id="prefix">
        Prefix
        <div>
          {data ? (
            <InputField key={data.prefix} name="prefix" minLength={1} maxLength={1} placeholder='Example: ?' defaultValue={data.prefix} onChange={onChange} />
          ) : (
            <SkeletonBlock $height="50px" $radius="5px" />
          )}
        </div>
      </div>
    </DashPageServerGeneralSettings>
  );
}

type Profile = { username: string; id: string; avatar?: string | null };

export function UserInfoRows({ profile, avatarLink }: { profile?: Profile | null; avatarLink?: ReactNode }) {
  return (
    <DashPageServerGeneralInfo>
      <div id="name">{profile ? `Name : ${profile.username}` : <SkeletonBlock $width="220px" $height="24px" $radius="6px" />}</div>
      {!profile ? (
        <div id="icon"><SkeletonBlock $width="320px" $height="24px" $radius="6px" /></div>
      ) : profile.avatar ? (
        <div id="icon">Icon : {avatarLink}</div>
      ) : null}
      <div id="id">{profile ? `Id : ${profile.id}` : <SkeletonBlock $width="260px" $height="24px" $radius="6px" />}</div>
    </DashPageServerGeneralInfo>
  );
}

// Same wrapper as the live welcome/goodbye card; collapsed body, toggle pending.
export function WelcomeCardSkeleton({ id, name }: { id: 'welcome' | 'goodbye'; name: string }) {
  return (
    <DashPageServerFunctionWelcomeGoodBye $isEnabled={[false, false, false]} id={id}>
      <div>
        <div id="title">
          <div id="name">{name}</div>
          <SkeletonBlock $width="80px" $height="40px" $radius="20px" />
        </div>
      </div>
    </DashPageServerFunctionWelcomeGoodBye>
  );
}

// Shared layout primitives for card-based dashboard pages.
export const DashContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 8px 16px 40px;
  font-family: "Kanit", sans-serif;
  color: #fff;
`;

export const DashCard = styled.div`
  background: rgba(24, 24, 33, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  backdrop-filter: blur(10px);
`;

export const DashGrid = styled.div<{ $cols: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols}, minmax(0, 1fr));
  gap: 14px;

  ${({ $cols }) => $cols > 1 && css`
    @media (max-width: 900px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 500px) {
      grid-template-columns: 1fr;
    }
  `}
`;

export const DashTwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 14px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;


// --- Discord snowflake helpers ---
const DISCORD_EPOCH = BigInt('1420070400000');

const getDiscordCreationDate = (id?: string | null): Date | null => {
  if (!id) return null;
  try {
    const date = new Date(Number((BigInt(id) >> BigInt(22)) + DISCORD_EPOCH));
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// Default avatar for accounts without a custom avatar (new username system).
const getDefaultAvatarURL = (id: string) =>
  `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id) >> BigInt(22)) % BigInt(6))}.png`;

const formatAccountAge = (createdAt?: Date | null): string => {
  if (!createdAt) return 'Unknown';
  const diffMs = Date.now() - createdAt.getTime();
  if (diffMs < 0) return 'Just now';
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  if (years > 0) return months > 0 ? `${years}y ${months}mo` : `${years}y`;
  if (months > 0) return `${months}mo`;
  return `${Math.max(1, diffDays)}d`;
};

const formatFullDate = (date?: Date | null): string =>
  date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

// --- Shared styles ---




const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ButtonLink = styled(Link)<{ $variant?: 'invite' }>`
  padding: 6px 14px;
  border-radius: 8px;
  background: ${({ $variant }) => ($variant === 'invite' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.18)')};
  color: ${({ $variant }) => ($variant === 'invite' ? '#38bdf8' : '#fca5a5')};
  border: 1px solid ${({ $variant }) => ($variant === 'invite' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(239, 68, 68, 0.35)')};
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $variant }) => ($variant === 'invite' ? '#0284c7' : '#dc2626')};
    color: #fff;
    border-color: ${({ $variant }) => ($variant === 'invite' ? '#38bdf8' : '#ef4444')};
  }
`;

const HoverCard = styled(DashCard)<{ $accent?: string }>`
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ $accent }) => $accent || 'rgba(239, 68, 68, 0.4)'};
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
  }
`;

const IconBox = styled.div<{ $color: string; $bg: string; $size?: string }>`
  width: ${({ $size }) => $size || '40px'};
  height: ${({ $size }) => $size || '40px'};
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

// --- Hero ---
const HeroCard = styled(DashCard)`
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
`;

const Banner = styled.div<{ $bg: string; $hasImage?: boolean }>`
  height: 150px;
  width: 100%;
  background: ${({ $bg }) => $bg};
  position: relative;

  ${({ $hasImage }) =>
    $hasImage &&
    css`
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(24, 24, 33, 0.9) 100%);
      }
    `}
`;

const HeroBody = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 0 24px 22px;
  margin-top: -48px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Identity = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 18px;
  flex-wrap: wrap;
`;

const Avatar = styled.a`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid #181821;
  box-shadow: 0 0 24px rgba(239, 68, 68, 0.35);
  overflow: hidden;
  display: block;
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
  }

  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DisplayName = styled.h1`
  margin: 0;
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1.2;
`;

const Subline = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: #94a3b8;
  font-size: 0.95rem;
`;

const CopyChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.18);
    border-color: rgba(239, 68, 68, 0.45);
    color: #fff;
  }
`;

const Badges = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ $color }) => $color};
  background: ${({ $color }) => `${$color}1f`};
  border: 1px solid ${({ $color }) => `${$color}55`};
`;

// --- Stats ---
const StatCard = styled(HoverCard)<{ $accent?: string }>`
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: inherit;
  text-decoration: none;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatTitle = styled.span`
  color: #b89494;
  font-size: 1rem;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.2;
`;

const StatSub = styled.span`
  color: #898989;
  font-size: 0.78rem;
`;

// --- Details ---
const DetailsCard = styled(DashCard)`
  padding: 6px 0;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #b89494;
  font-size: 0.88rem;
`;

const DetailValue = styled.span`
  color: #f9f1f1;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;

  & > a {
    color: #ff8a8a;
  }
`;

const Swatch = styled.span<{ $color?: string }>`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  margin-right: 8px;
  vertical-align: middle;
  background: ${({ $color }) => $color || 'rgba(255, 255, 255, 0.15)'};
`;

// --- Quick actions ---
const ActionCard = styled(HoverCard)`
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: inherit;
  text-decoration: none;

  &:hover .arrow-icon {
    transform: translateX(4px);
    color: #fff;
  }
`;

const ActionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionTexts = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActionLabel = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
`;

const ActionDesc = styled.span`
  font-size: 0.75rem;
  color: #b89494;
`;

const ActionArrow = styled.span`
  display: inline-flex;
  color: #8b6464;
  transition: all 0.2s ease;
`;

// --- Servers hub ---
const ServerCard = styled(HoverCard)`
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ServerLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const ServerIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  background: #553333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: #e1cbcb;
  flex-shrink: 0;

  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ServerName = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: #f9f1f1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyState = styled(DashCard)`
  border-style: dashed;
  padding: 32px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #b89494;
`;

const SERVER_PREVIEW_LIMIT = 6;

function parseAccentColor(accentColor?: string | number | null): string | undefined {
  if (accentColor == null) return undefined;
  if (typeof accentColor === 'number') {
    return `#${accentColor.toString(16).padStart(6, '0')}`;
  }
  const str = String(accentColor).trim();
  if (!str) return undefined;
  if (str.startsWith('#')) return str;
  const num = Number(str);
  if (!Number.isNaN(num) && /^\d+$/.test(str)) {
    return `#${num.toString(16).padStart(6, '0')}`;
  }
  return `#${str.replace(/^#/, '')}`;
}

// --- Sections ---
function Hero({ profile }: { profile?: User }) {
  const [copied, setCopied] = useState(false);
  const avatarUrl = profile && (profile.avatar ? getAvatarURL(profile) : getDefaultAvatarURL(profile.id));
  const bannerUrl = profile?.banner
    ? `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.${profile.banner.startsWith('a_') ? 'gif' : 'png'}?size=600`
    : undefined;
  const userColor = parseAccentColor(profile?.accent_color) || parseAccentColor(profile?.banner_color);
  const bannerBg = bannerUrl
    ? `url("${bannerUrl}") center/cover no-repeat`
    : (userColor || '#334155');
  const createdDate = profile ? getDiscordCreationDate(profile.id) : null;

  const copyId = async () => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; ignore.
    }
  };

  return (
    <HeroCard>
      {profile ? (
        <Banner $bg={bannerBg} $hasImage={Boolean(bannerUrl)} />
      ) : (
        <SkeletonBlock $height="150px" $radius="0" />
      )}
      <HeroBody>
        <Identity>
          {profile && avatarUrl ? (
            <Avatar href={avatarUrl} target="_blank" rel="noreferrer" title="View full avatar">
              <img src={avatarUrl} alt={profile.username} />
            </Avatar>
          ) : (
            <SkeletonBlock $width="96px" $height="96px" $radius="50%" />
          )}
          <NameBlock>
            {profile ? (
              <DisplayName>{profile.global_name || profile.username}</DisplayName>
            ) : (
              <SkeletonBlock $width="200px" $height="26px" />
            )}
            <Subline>
              {profile ? (
                <>
                  <span>@{profile.username}</span>
                  <CopyChip onClick={copyId} title="Copy Discord ID">
                    {copied ? <TbCheck style={{ color: '#4ade80' }} /> : <TbCopy />}
                    {copied ? 'Copied!' : profile.id}
                  </CopyChip>
                </>
              ) : (
                <SkeletonBlock $width="160px" $height="16px" />
              )}
            </Subline>
          </NameBlock>
        </Identity>
        <Badges>
          {profile ? (
            <>
              {createdDate && (
                <Badge $color="#38bdf8">
                  <FaCalendarAlt /> Joined {formatFullDate(createdDate)}
                </Badge>
              )}
              {profile.locale && (
                <Badge $color="#f87171">
                  <TbLanguage /> {(localeLabels as Record<string, string>)[profile.locale] || profile.locale}
                </Badge>
              )}
            </>
          ) : (
            <SkeletonBlock $width="180px" $height="28px" $radius="9999px" />
          )}
        </Badges>
      </HeroBody>
    </HeroCard>
  );
}

function Stats({ profile, guildCount, loadingGuilds }: { profile?: User; guildCount: number; loadingGuilds: boolean }) {
  const createdDate = profile ? getDiscordCreationDate(profile.id) : null;
  return (
    <DashGrid $cols={3}>
      <StatCard $accent="#ef4444">
        <StatHeader>
          <StatTitle>Managed Servers</StatTitle>
          <IconBox $color="#f87171" $bg="rgba(239, 68, 68, 0.15)"><FaServer /></IconBox>
        </StatHeader>
        <StatValue>{loadingGuilds ? <SkeletonBlock $width="100px" $height="28px" /> : `${guildCount} ${guildCount === 1 ? 'Server' : 'Servers'}`}</StatValue>
        <StatSub>Servers with admin permissions</StatSub>
      </StatCard>
      <StatCard $accent="#38bdf8">
        <StatHeader>
          <StatTitle>Account Age</StatTitle>
          <IconBox $color="#38bdf8" $bg="rgba(56, 189, 248, 0.15)"><FaCalendarAlt /></IconBox>
        </StatHeader>
        <StatValue>{profile ? formatAccountAge(createdDate) : <SkeletonBlock $width="80px" $height="28px" />}</StatValue>
        <StatSub>{profile ? (createdDate ? `Created ${formatFullDate(createdDate)}` : 'Discord Member') : <SkeletonBlock $width="130px" $height="14px" />}</StatSub>
      </StatCard>
      <StatCard as={Link} href="/dashboard/user/membership" $accent="#f59e0b">
        <StatHeader>
          <StatTitle>Membership Tier</StatTitle>
          <IconBox $color="#fbbf24" $bg="rgba(245, 158, 11, 0.15)"><TbCrown /></IconBox>
        </StatHeader>
        <StatValue>Standard</StatValue>
        <StatSub style={{ color: '#fbbf24' }}>View benefits & plans →</StatSub>
      </StatCard>
    </DashGrid>
  );
}

function Details({ profile }: { profile?: User }) {
  const createdDate = profile ? getDiscordCreationDate(profile.id) : null;
  const accentHex = parseAccentColor(profile?.accent_color);
  // A row value of undefined renders as a skeleton while profile loads.
  const rows: { icon: ReactNode; label: string; value?: ReactNode }[] = [
    { icon: <TbUser />, label: 'Username', value: profile && `@${profile.username}` },
    { icon: <TbUser />, label: 'Display Name', value: profile && (profile.global_name || '-') },
    { icon: <FaCalendarAlt />, label: 'Created Date', value: profile && formatFullDate(createdDate) },
    { icon: <TbLanguage />, label: 'Language', value: profile && ((localeLabels as Record<string, string>)[profile.locale ?? ''] || profile.locale || '-') },
    {
      icon: <TbPalette />,
      label: 'Accent Color',
      value: profile && (accentHex ? (
        <>
          <Swatch $color={accentHex} />
          {accentHex}
        </>
      ) : '-'),
    },
    {
      icon: <TbPhoto />,
      label: 'Avatar',
      value: profile && (profile.avatar ? <a href={getAvatarURL(profile)} target="_blank" rel="noreferrer">View full size</a> : 'Default'),
    },
    {
      icon: <TbPhoto />,
      label: 'Banner',
      value: profile && (profile.banner ? <a href={`https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.${profile.banner.startsWith('a_') ? 'gif' : 'png'}?size=600`} target="_blank" rel="noreferrer">View full size</a> : 'Default'),
    },
  ];

  return (
    <DetailsCard>
      {rows.map(({ icon, label, value }) => (
        <DetailRow key={label}>
          <DetailLabel>{icon} {label}</DetailLabel>
          <DetailValue>{value ?? <SkeletonBlock $width="120px" $height="16px" />}</DetailValue>
        </DetailRow>
      ))}
    </DetailsCard>
  );
}

const ACTIONS = [
  { href: '/dashboard/user/overview#managed-servers', label: 'Manage Servers', desc: 'Configure bot in your servers', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', glow: '#ef4444', icon: <FaServer />, arrow: <TbArrowDown /> },
  { href: `https://discord.com/oauth2/authorize?client_id=1210178730836893719&scope=bot+applications.commands&response_type=code&redirect_uri=${origin}/dashboard/invite_fallback`, label: 'Add Bot to Server', desc: 'Invite Yumi to Discord', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', glow: '#38bdf8', icon: <TbPlus />, arrow: <TbExternalLink /> },
  { href: '/dashboard/user/membership', label: 'Membership Plans', desc: 'Special perks & features', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', glow: '#f59e0b', icon: <TbDiamond />, arrow: <TbArrowRight /> },
  { href: '/dashboard/user/premium', label: 'Manage Premium', desc: 'All premium subscription status', color: '#f472b6', bg: 'rgba(236, 72, 153, 0.15)', glow: '#ec4899', icon: <BsStars />, arrow: <TbArrowRight /> },
];

function QuickActions() {
  return (
    <div>
      <SectionHeader>
        <SectionTitle><TbSettings style={{ color: '#ec5b5b' }} /> Quick Actions</SectionTitle>
      </SectionHeader>
      <DashGrid $cols={1}>
        {ACTIONS.map((action) => (
          <ActionCard key={action.href} as={Link} href={action.href} $accent={action.glow}>
            <ActionInfo>
              <IconBox $color={action.color} $bg={action.bg}>{action.icon}</IconBox>
              <ActionTexts>
                <ActionLabel>{action.label}</ActionLabel>
                <ActionDesc>{action.desc}</ActionDesc>
              </ActionTexts>
            </ActionInfo>
            <ActionArrow className="arrow-icon">{action.arrow}</ActionArrow>
          </ActionCard>
        ))}
      </DashGrid>
    </div>
  );
}

function ManagedServers({ guilds, loading }: { guilds?: PartialGuild[]; loading: boolean }) {
  const preview = guilds?.slice(0, SERVER_PREVIEW_LIMIT) || [];
  const { refreshGuilds } = useGuildList();
  return (
    <div id="managed-servers">
      <SectionHeader>
        <SectionTitle><FaServer style={{ color: '#ec5b5b' }} /> Managed Servers</SectionTitle>
        <div onClick={() => { refreshGuilds(); }} style={{ color: '#ff8484', fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500, cursor: 'pointer' }}>
          Refresh <TbRefresh />
        </div>
      </SectionHeader>
      {loading ? (
        <DashGrid $cols={3}>
          {[1, 2, 3].map((i) => (
            <DashCard key={i} style={{ padding: '14px 16px' }}>
              <ServerLeft>
                <SkeletonBlock $width="44px" $height="44px" $radius="12px" />
                <SkeletonBlock $width="120px" $height="18px" />
              </ServerLeft>
            </DashCard>
          ))}
        </DashGrid>
      ) : preview.length > 0 ? (
        <DashGrid $cols={3}>
          {preview.map((guild) => (
            <ServerCard key={guild.id}>
              <ServerLeft>
                <ServerIcon>
                  {guild.icon ? <img src={getIconURL(guild)} alt={guild.name} /> : guild.name.slice(0, 2).toUpperCase()}
                </ServerIcon>
                <ServerName title={guild.name}>{guild.name}</ServerName>
              </ServerLeft>
              {guild.bot_here ? (
                <ButtonLink href={`/dashboard/server/${guild.id}/overview`}>Manage</ButtonLink>
              ) : (
                <ButtonLink $variant="invite" href={`/dashboard/invite/${guild.id}`}>Invite</ButtonLink>
              )}
            </ServerCard>
          ))}
        </DashGrid>
      ) : (
        <EmptyState>
          <FaServer style={{ fontSize: '2.5rem', color: '#64748b' }} />
          <div>No servers found where you have admin permissions or bot is invited</div>
          <ButtonLink href="/dashboard/invite">Invite Yumi to Server</ButtonLink>
        </EmptyState>
      )}
    </div>
  );
}

// --- Exports ---
export function UserOverview({ profile, guilds, loadingGuilds = false }: { profile?: User; guilds?: PartialGuild[]; loadingGuilds?: boolean }) {
  const guildsLoading = !profile || loadingGuilds;
  return (
    <DashContainer>
      <Hero profile={profile} />
      <Stats profile={profile} guildCount={guilds?.length || 0} loadingGuilds={guildsLoading} />
      <DashTwoColumns>
        <div>
          <SectionHeader>
            <SectionTitle><TbUser style={{ color: '#ec5b5b' }} /> Account Details</SectionTitle>
          </SectionHeader>
          <Details profile={profile} />
        </div>
        <QuickActions />
      </DashTwoColumns>
      <ManagedServers guilds={guilds} loading={guildsLoading} />
    </DashContainer>
  );
}

export function LoginDiscord({ display = "flex", justifyContent = "center", alignItems = "center", cursor = "pointer", backgroundColor = "#5973d4", width = 100, height = 40, borderRadius = 5, ...props }: React.CSSProperties) {
  const path = `/verify?redirect=${typeof window !== 'undefined' && window.location.hostname == process.env.NEXT_PUBLIC_HOSTNAME ? `${process.env.NEXT_PUBLIC_API_DOMAIN}/auth/login` : `${process.env.NEXT_PUBLIC_API_IP_URL}/auth/v2/login`}`

  function login(e: React.MouseEvent) {
    e.preventDefault();
    const to = window.location.pathname;
    Cookies.set('discord_login_redirect', to, { expires: 1, path: '/', sameSite: 'lax' });
    window.location.href = path;
  };

  return (
    <Link href={path} onClick={login} style={{ display, justifyContent, alignItems, cursor, backgroundColor, width, height, borderRadius, ...props }}>
      Login
    </Link>
  );
}
