'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import styled, { css, keyframes } from 'styled-components';
import { FaServer, FaCalendarAlt, FaDiscord } from 'react-icons/fa';
import { TbCrown, TbCopy, TbCheck, TbArrowRight, TbSettings, TbPlus, TbDiamond, TbExternalLink, TbLanguage, TbUser, TbPalette, TbPhoto } from 'react-icons/tb';
import { BsStars } from 'react-icons/bs';
import { PartialGuild, User, localeLabels } from '../utils/types';
import { getAvatarURL, getIconURL } from '../utils/getURL';

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
  if (!createdAt) return 'ไม่ระบุ';
  const diffMs = Date.now() - createdAt.getTime();
  if (diffMs < 0) return 'เพิ่งสร้าง';
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  if (years > 0) return months > 0 ? `${years} ปี ${months} เดือน` : `${years} ปี`;
  if (months > 0) return `${months} เดือน`;
  return `${Math.max(1, diffDays)} วัน`;
};

const formatFullDate = (date?: Date | null): string =>
  date ? date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

// --- Shared styles ---
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`;

const SkeletonBox = styled.div<{ $width?: string; $height?: string; $radius?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};
  border-radius: ${({ $radius }) => $radius || '8px'};
  background: rgba(255, 255, 255, 0.07);
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const Container = styled.div`
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

const Card = styled.div`
  background: rgba(24, 24, 33, 0.65);
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

const ButtonLink = styled(Link)`
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(168, 85, 247, 0.2);
  color: #d8b4fe;
  border: 1px solid rgba(168, 85, 247, 0.4);
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: #9333ea;
    color: #fff;
    border-color: #a855f7;
  }
`;

const HoverCard = styled(Card)<{ $accent?: string }>`
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ $accent }) => $accent || 'rgba(168, 85, 247, 0.4)'};
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

const Banner = styled.div<{ $bg: string }>`
  height: 150px;
  width: 100%;
  background: ${({ $bg }) => $bg};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(24, 24, 33, 0.9) 100%);
  }
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
  box-shadow: 0 0 24px rgba(168, 85, 247, 0.45);
  overflow: hidden;
  display: block;
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(168, 85, 247, 0.7);
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
    background: rgba(168, 85, 247, 0.2);
    border-color: rgba(168, 85, 247, 0.5);
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
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.2;
`;

const StatSub = styled.span`
  color: #64748b;
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
  color: #94a3b8;
  font-size: 0.88rem;
`;

const DetailValue = styled.span`
  color: #f1f5f9;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;

  & > a {
    color: #8abbff;
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
  color: #94a3b8;
`;

const ActionArrow = styled.span`
  display: inline-flex;
  color: #64748b;
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
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: #cbd5e1;
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
  color: #f1f5f9;
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
  color: #94a3b8;
`;

const SERVER_PREVIEW_LIMIT = 6;

// --- Sections ---
function Hero({ profile }: { profile: User }) {
  const [copied, setCopied] = useState(false);
  const avatarUrl = profile.avatar ? getAvatarURL(profile) : getDefaultAvatarURL(profile.id);
  const bannerUrl = profile.banner
    ? `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.${profile.banner.startsWith('a_') ? 'gif' : 'png'}?size=600`
    : undefined;
  const accent = profile.accent_color ? `#${profile.accent_color.replace('#', '')}` : undefined;
  const bannerBg = bannerUrl
    ? `url("${bannerUrl}") center/cover no-repeat`
    : `linear-gradient(135deg, ${accent || '#4f46e5'} 0%, #7e22ce 50%, #1e1b4b 100%)`;
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
      <Banner $bg={bannerBg} />
      <HeroBody>
        <Identity>
          <Avatar href={avatarUrl} target="_blank" rel="noreferrer" title="ดูรูปโปรไฟล์ขนาดเต็ม">
            <img src={avatarUrl} alt={profile.username} />
          </Avatar>
          <NameBlock>
            <DisplayName>{profile.global_name || profile.username}</DisplayName>
            <Subline>
              <span>@{profile.username}</span>
              <CopyChip onClick={copyId} title="คัดลอก Discord ID">
                {copied ? <TbCheck style={{ color: '#4ade80' }} /> : <TbCopy />}
                {copied ? 'คัดลอกแล้ว!' : profile.id}
              </CopyChip>
            </Subline>
          </NameBlock>
        </Identity>
        <Badges>
          {createdDate && (
            <Badge $color="#38bdf8">
              <FaCalendarAlt /> สมัครเมื่อ {formatFullDate(createdDate)}
            </Badge>
          )}
          {profile.locale && (
            <Badge $color="#c084fc">
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
    <Grid $cols={4}>
      <StatCard $accent="#a855f7">
        <StatHeader>
          <StatTitle>เซิร์ฟเวอร์ที่ดูแล</StatTitle>
          <IconBox $color="#c084fc" $bg="rgba(168, 85, 247, 0.15)"><FaServer /></IconBox>
        </StatHeader>
        <StatValue>{loadingGuilds ? <SkeletonBox $width="60px" $height="28px" /> : `${guildCount} เซิร์ฟเวอร์`}</StatValue>
        <StatSub>ที่คุณมีสิทธิ์จัดการบอท</StatSub>
      </StatCard>
      <StatCard $accent="#38bdf8">
        <StatHeader>
          <StatTitle>อายุบัญชี Discord</StatTitle>
          <IconBox $color="#38bdf8" $bg="rgba(56, 189, 248, 0.15)"><FaCalendarAlt /></IconBox>
        </StatHeader>
        <StatValue>{formatAccountAge(createdDate)}</StatValue>
        <StatSub>{createdDate ? `สร้างเมื่อ ${formatFullDate(createdDate)}` : 'Discord Member'}</StatSub>
      </StatCard>
      <StatCard as={Link} href="/dashboard/user/membership" $accent="#f59e0b">
        <StatHeader>
          <StatTitle>ระดับสมาชิก</StatTitle>
          <IconBox $color="#fbbf24" $bg="rgba(245, 158, 11, 0.15)"><TbCrown /></IconBox>
        </StatHeader>
        <StatValue>สมาชิก</StatValue>
        <StatSub style={{ color: '#fbbf24' }}>ดูสิทธิประโยชน์และแพ็กเกจ →</StatSub>
      </StatCard>
      <StatCard $accent="#5865F2">
        <StatHeader>
          <StatTitle>สถานะการเชื่อมต่อ</StatTitle>
          <IconBox $color="#818cf8" $bg="rgba(88, 101, 242, 0.15)"><FaDiscord /></IconBox>
        </StatHeader>
        <StatValue style={{ color: '#4ade80' }}>เชื่อมต่อแล้ว</StatValue>
        <StatSub>Discord OAuth2</StatSub>
      </StatCard>
    </Grid>
  );
}

function Details({ profile }: { profile: User }) {
  const createdDate = getDiscordCreationDate(profile.id);
  const rows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [
    { icon: <TbUser />, label: 'ชื่อผู้ใช้', value: `@${profile.username}` },
    { icon: <TbUser />, label: 'ชื่อที่แสดง', value: profile.global_name || '-' },
    { icon: <FaCalendarAlt />, label: 'วันที่สร้างบัญชี', value: formatFullDate(createdDate) },
    { icon: <TbLanguage />, label: 'ภาษา', value: (localeLabels as Record<string, string>)[profile.locale ?? ''] || profile.locale || '-' },
    {
      icon: <TbPalette />,
      label: 'สีประจำตัว',
      value: profile.accent_color ? (
        <>
          <Swatch $color={`#${profile.accent_color.replace('#', '')}`} />
          #{profile.accent_color.replace('#', '')}
        </>
      ) : '-',
    },
    {
      icon: <TbPhoto />,
      label: 'รูปโปรไฟล์',
      value: profile.avatar ? <a href={getAvatarURL(profile)} target="_blank" rel="noreferrer">เปิดดูรูปเต็ม</a> : 'ค่าเริ่มต้น',
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
  { href: '/dashboard', label: 'จัดการเซิร์ฟเวอร์', desc: 'เลือกตั้งค่าบอทในเซิร์ฟเวอร์', color: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)', glow: '#a855f7', icon: <FaServer />, arrow: <TbArrowRight /> },
  { href: '/dashboard/invite', label: 'เพิ่มบอทลงเซิร์ฟเวอร์', desc: 'เชิญ Yumi เข้า Discord', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', glow: '#38bdf8', icon: <TbPlus />, arrow: <TbExternalLink /> },
  { href: '/dashboard/user/membership', label: 'แพ็กเกจสมาชิก', desc: 'สิทธิพิเศษและฟังก์ชันพิเศษ', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', glow: '#f59e0b', icon: <TbDiamond />, arrow: <TbArrowRight /> },
  { href: '/dashboard/user/premium', label: 'จัดการ Premium', desc: 'สถานะพรีเมียมทั้งหมด', color: '#f472b6', bg: 'rgba(236, 72, 153, 0.15)', glow: '#ec4899', icon: <BsStars />, arrow: <TbArrowRight /> },
];

function QuickActions() {
  return (
    <div>
      <SectionHeader>
        <SectionTitle><TbSettings style={{ color: '#c084fc' }} /> เมนูด่วน</SectionTitle>
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
        <SectionTitle><FaServer style={{ color: '#38bdf8' }} /> เซิร์ฟเวอร์ที่คุณดูแล</SectionTitle>
        {guilds && guilds.length > 0 && (
          <Link href="/dashboard" style={{ color: '#a855f7', fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
            ดูทั้งหมด ({guilds.length}) <TbArrowRight />
          </Link>
        )}
      </SectionHeader>
      {loading ? (
        <Grid $cols={3}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ padding: '14px 16px' }}>
              <ServerLeft>
                <SkeletonBox $width="44px" $height="44px" $radius="12px" />
                <SkeletonBox $width="120px" $height="18px" />
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
              <ButtonLink href={`/dashboard/server/${guild.id}/overview`}>จัดการ</ButtonLink>
            </ServerCard>
          ))}
        </Grid>
      ) : (
        <EmptyState>
          <FaServer style={{ fontSize: '2.5rem', color: '#64748b' }} />
          <div>ยังไม่พบเซิร์ฟเวอร์ที่คุณมีสิทธิ์จัดการ หรือยังไม่ได้เชิญบอท</div>
          <ButtonLink href="/dashboard/invite">เชิญ Yumi เข้าเซิร์ฟเวอร์</ButtonLink>
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
            <SectionTitle><TbUser style={{ color: '#a855f7' }} /> ข้อมูลบัญชี</SectionTitle>
          </SectionHeader>
          <Details profile={profile} />
        </div>
        <QuickActions />
      </TwoColumns>
      <ManagedServers guilds={guilds} loading={loadingGuilds} />
    </Container>
  );
}

export function UserOverviewSkeleton() {
  return (
    <Container>
      <HeroCard>
        <SkeletonBox $height="150px" $radius="0" />
        <HeroBody>
          <Identity>
            <SkeletonBox $width="96px" $height="96px" $radius="50%" />
            <NameBlock>
              <SkeletonBox $width="200px" $height="26px" />
              <SkeletonBox $width="140px" $height="16px" />
            </NameBlock>
          </Identity>
        </HeroBody>
      </HeroCard>
      <Grid $cols={4}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} style={{ padding: '18px 20px' }}>
            <SkeletonBox $width="80px" $height="16px" />
            <SkeletonBox $width="110px" $height="28px" />
            <SkeletonBox $width="130px" $height="14px" />
          </Card>
        ))}
      </Grid>
      <TwoColumns>
        <Card style={{ padding: '14px 20px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBox key={i} $height="40px" $radius="6px" style={{ margin: '8px 0' }} />
          ))}
        </Card>
        <Grid $cols={1}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} style={{ padding: '16px 18px' }}>
              <SkeletonBox $height="42px" $radius="10px" />
            </Card>
          ))}
        </Grid>
      </TwoColumns>
      <Grid $cols={3}>
        {[1, 2, 3].map((i) => (
          <Card key={i} style={{ padding: '14px 16px' }}>
            <ServerLeft>
              <SkeletonBox $width="44px" $height="44px" $radius="12px" />
              <SkeletonBox $width="120px" $height="18px" />
            </ServerLeft>
          </Card>
        ))}
      </Grid>
    </Container>
  );
}
