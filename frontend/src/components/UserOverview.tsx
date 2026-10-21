'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import { FaServer, FaCalendarAlt, FaDiscord } from 'react-icons/fa';
import { TbCrown, TbCopy, TbCheck, TbArrowRight, TbSettings, TbPlus, TbDiamond, TbExternalLink, TbLanguage, TbUser, TbPalette, TbPhoto } from 'react-icons/tb';
import { BsStars } from 'react-icons/bs';
import { PartialGuild, User, localeLabels } from '../utils/types';
import { getAvatarURL, getIconURL } from '../utils/getURL';
import { SkeletonBlock } from './DashboardSkeleton';

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
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
  margin: 0 auto;
  padding: 8px 16px 40px;
  font-family: "Kanit", sans-serif;
  color: #fff;
`;

const Card = styled.div`
  background: rgba(17, 10, 10, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  backdrop-filter: blur(10px);
`;

const Grid = styled.div<{ $cols: number }>`
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

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 14px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

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

const HoverCard = styled(Card)<{ $accent?: string }>`
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
const HeroCard = styled(Card)`
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
const DetailsCard = styled(Card)`
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

const EmptyState = styled(Card)`
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
function Hero({ profile }: { profile: User }) {
  const [copied, setCopied] = useState(false);
  const avatarUrl = profile.avatar ? getAvatarURL(profile) : getDefaultAvatarURL(profile.id);
  const bannerUrl = profile.banner
    ? `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.${profile.banner.startsWith('a_') ? 'gif' : 'png'}?size=600`
    : undefined;
  const userColor = parseAccentColor(profile.accent_color) || parseAccentColor(profile.banner_color);
  const bannerBg = bannerUrl
    ? `url("${bannerUrl}") center/cover no-repeat`
    : (userColor || '#334155');
  const createdDate = getDiscordCreationDate(profile.id);

  const copyId = async () => {
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
      <Banner $bg={bannerBg} $hasImage={Boolean(bannerUrl)} />
      <HeroBody>
        <Identity>
          <Avatar href={avatarUrl} target="_blank" rel="noreferrer" title="View full avatar">
            <img src={avatarUrl} alt={profile.username} />
          </Avatar>
          <NameBlock>
            <DisplayName>{profile.global_name || profile.username}</DisplayName>
            <Subline>
              <span>@{profile.username}</span>
              <CopyChip onClick={copyId} title="Copy Discord ID">
                {copied ? <TbCheck style={{ color: '#4ade80' }} /> : <TbCopy />}
                {copied ? 'Copied!' : profile.id}
              </CopyChip>
            </Subline>
          </NameBlock>
        </Identity>
        <Badges>
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
        </Badges>
      </HeroBody>
    </HeroCard>
  );
}

function Stats({ profile, guildCount, loadingGuilds }: { profile: User; guildCount: number; loadingGuilds: boolean }) {
  const createdDate = getDiscordCreationDate(profile.id);
  return (
    <Grid $cols={3}>
      <StatCard $accent="#ef4444">
        <StatHeader>
          <StatTitle>Managed Servers</StatTitle>
          <IconBox $color="#f87171" $bg="rgba(239, 68, 68, 0.15)"><FaServer /></IconBox>
        </StatHeader>
        <StatValue>{loadingGuilds ? <SkeletonBlock $width="60px" $height="28px" /> : `${guildCount} ${guildCount === 1 ? 'Server' : 'Servers'}`}</StatValue>
        <StatSub>Servers with admin permissions</StatSub>
      </StatCard>
      <StatCard $accent="#38bdf8">
        <StatHeader>
          <StatTitle>Account Age</StatTitle>
          <IconBox $color="#38bdf8" $bg="rgba(56, 189, 248, 0.15)"><FaCalendarAlt /></IconBox>
        </StatHeader>
        <StatValue>{formatAccountAge(createdDate)}</StatValue>
        <StatSub>{createdDate ? `Created ${formatFullDate(createdDate)}` : 'Discord Member'}</StatSub>
      </StatCard>
      <StatCard as={Link} href="/dashboard/user/membership" $accent="#f59e0b">
        <StatHeader>
          <StatTitle>Membership Tier</StatTitle>
          <IconBox $color="#fbbf24" $bg="rgba(245, 158, 11, 0.15)"><TbCrown /></IconBox>
        </StatHeader>
        <StatValue>Standard</StatValue>
        <StatSub style={{ color: '#fbbf24' }}>View benefits & plans →</StatSub>
      </StatCard>
    </Grid>
  );
}

function Details({ profile }: { profile: User }) {
  const createdDate = getDiscordCreationDate(profile.id);
  const accentHex = parseAccentColor(profile.accent_color);
  const rows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [
    { icon: <TbUser />, label: 'Username', value: `@${profile.username}` },
    { icon: <TbUser />, label: 'Display Name', value: profile.global_name || '-' },
    { icon: <FaCalendarAlt />, label: 'Created Date', value: formatFullDate(createdDate) },
    { icon: <TbLanguage />, label: 'Language', value: (localeLabels as Record<string, string>)[profile.locale ?? ''] || profile.locale || '-' },
    {
      icon: <TbPalette />,
      label: 'Accent Color',
      value: accentHex ? (
        <>
          <Swatch $color={accentHex} />
          {accentHex}
        </>
      ) : '-',
    },
    {
      icon: <TbPhoto />,
      label: 'Avatar',
      value: profile.avatar ? <a href={getAvatarURL(profile)} target="_blank" rel="noreferrer">View full size</a> : 'Default',
    },
    {
      icon: <TbPhoto />,
      label: 'Banner',
      value: profile.banner ? <a href={`https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.${profile.banner.startsWith('a_') ? 'gif' : 'png'}?size=600`} target="_blank" rel="noreferrer">View full size</a> : 'Default',
    },
  ];

  return (
    <DetailsCard>
      {rows.map(({ icon, label, value }) => (
        <DetailRow key={label}>
          <DetailLabel>{icon} {label}</DetailLabel>
          <DetailValue>{value}</DetailValue>
        </DetailRow>
      ))}
    </DetailsCard>
  );
}

const ACTIONS = [
  { href: '/dashboard', label: 'Manage Servers', desc: 'Configure bot in your servers', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', glow: '#ef4444', icon: <FaServer />, arrow: <TbArrowRight /> },
  { href: '/dashboard/invite', label: 'Add Bot to Server', desc: 'Invite Yumi to Discord', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', glow: '#38bdf8', icon: <TbPlus />, arrow: <TbExternalLink /> },
  { href: '/dashboard/user/membership', label: 'Membership Plans', desc: 'Special perks & features', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', glow: '#f59e0b', icon: <TbDiamond />, arrow: <TbArrowRight /> },
  { href: '/dashboard/user/premium', label: 'Manage Premium', desc: 'All premium subscription status', color: '#f472b6', bg: 'rgba(236, 72, 153, 0.15)', glow: '#ec4899', icon: <BsStars />, arrow: <TbArrowRight /> },
];

function QuickActions() {
  return (
    <div>
      <SectionHeader>
        <SectionTitle><TbSettings style={{ color: '#ec5b5b' }} /> Quick Actions</SectionTitle>
      </SectionHeader>
      <Grid $cols={1}>
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
      </Grid>
    </div>
  );
}

function ManagedServers({ guilds, loading }: { guilds?: PartialGuild[]; loading: boolean }) {
  const preview = guilds?.slice(0, SERVER_PREVIEW_LIMIT) || [];
  return (
    <div>
      <SectionHeader>
        <SectionTitle><FaServer style={{ color: '#ec5b5b' }} /> Managed Servers</SectionTitle>
        {guilds && guilds.length > 0 && (
          <Link href="/dashboard" style={{ color: '#ff8484', fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
            View All ({guilds.length}) <TbArrowRight />
          </Link>
        )}
      </SectionHeader>
      {loading ? (
        <Grid $cols={3}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ padding: '14px 16px' }}>
              <ServerLeft>
                <SkeletonBlock $width="44px" $height="44px" $radius="12px" />
                <SkeletonBlock $width="120px" $height="18px" />
              </ServerLeft>
            </Card>
          ))}
        </Grid>
      ) : preview.length > 0 ? (
        <Grid $cols={3}>
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
        </Grid>
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
export function UserOverview({ profile, guilds, loadingGuilds }: { profile: User; guilds?: PartialGuild[]; loadingGuilds: boolean }) {
  return (
    <Container>
      <Hero profile={profile} />
      <Stats profile={profile} guildCount={guilds?.length || 0} loadingGuilds={loadingGuilds} />
      <TwoColumns>
        <div>
          <SectionHeader>
            <SectionTitle><TbUser style={{ color: '#ec5b5b' }} /> Account Details</SectionTitle>
          </SectionHeader>
          <Details profile={profile} />
        </div>
        <QuickActions />
      </TwoColumns>
      <ManagedServers guilds={guilds} loading={loadingGuilds} />
    </Container>
  );
}

const SkeletonCard = styled(Card)`
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SkeletonRows = styled(Card)`
  padding: 6px 20px;
`;

export function UserOverviewSkeleton() {
  return (
    <Container>
      <HeroCard>
        <SkeletonBlock $height="150px" $radius="0" />
        <HeroBody>
          <Identity>
            <SkeletonBlock $width="96px" $height="96px" $radius="50%" />
            <NameBlock>
              <SkeletonBlock $width="200px" $height="26px" />
              <SkeletonBlock $width="140px" $height="16px" />
            </NameBlock>
          </Identity>
        </HeroBody>
      </HeroCard>
      <Grid $cols={4}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i}>
            <SkeletonBlock $width="80px" $height="16px" />
            <SkeletonBlock $width="110px" $height="28px" />
            <SkeletonBlock $width="130px" $height="14px" />
          </SkeletonCard>
        ))}
      </Grid>
      <TwoColumns>
        <SkeletonRows>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonBlock key={i} $height="34px" $radius="6px" $margin="10px 0" />
          ))}
        </SkeletonRows>
        <Grid $cols={1}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: '16px 18px' }}>
              <SkeletonBlock $width="42px" $height="42px" $radius="10px" />
              <SkeletonBlock $width="60%" $height="16px" />
            </SkeletonCard>
          ))}
        </Grid>
      </TwoColumns>
      <Grid $cols={3}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
            <ServerLeft>
              <SkeletonBlock $width="44px" $height="44px" $radius="12px" />
              <SkeletonBlock $width="120px" $height="18px" />
            </ServerLeft>
            <SkeletonBlock $width="64px" $height="30px" $radius="8px" />
          </SkeletonCard>
        ))}
      </Grid>
    </Container>
  );
}
