'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { FaServer, FaCalendarAlt, FaDiscord } from 'react-icons/fa';
import { TbCrown, TbCopy, TbCheck, TbArrowRight, TbSettings, TbPlus, TbDiamond, TbExternalLink } from 'react-icons/tb';
import { BsStars } from 'react-icons/bs';
import { PartialGuild, User } from '../utils/types';
import { getAvatarURL, getIconURL } from '../utils/getURL';
import { getDiscordCreationDate, formatAccountAge, formatFullDate } from '../utils/discordSnowflake';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`;

const SkeletonBox = styled.div<{ $width?: string; $height?: string; $radius?: string; $margin?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};
  border-radius: ${({ $radius }) => $radius || '8px'};
  margin: ${({ $margin }) => $margin || '0'};
  background: rgba(255, 255, 255, 0.07);
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 8px 16px 40px;
  font-family: "Kanit", sans-serif;
  color: #fff;
`;

// --- Hero Card ---
const HeroCard = styled.div`
  position: relative;
  background: rgba(24, 24, 33, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
`;

const HeroBanner = styled.div<{ $bannerUrl?: string; $accent?: string }>`
  height: 140px;
  width: 100%;
  background: ${({ $bannerUrl, $accent }) =>
    $bannerUrl
      ? `url("${$bannerUrl}") center/cover no-repeat`
      : $accent
      ? `linear-gradient(135deg, ${$accent} 0%, #1e1b4b 100%)`
      : 'linear-gradient(135deg, #4f46e5 0%, #7e22ce 50%, #1e1b4b 100%)'};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(24, 24, 33, 0.85) 100%);
  }
`;

const HeroContent = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 24px 20px;
  margin-top: -50px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    margin-top: -40px;
  }
`;

const HeroIdentity = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 18px;
  flex-wrap: wrap;
`;

const AvatarWrapper = styled.a`
  position: relative;
  width: 92px;
  height: 92px;
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

const IdentityText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DisplayName = styled.h1`
  margin: 0;
  font-size: 1.65rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
`;

const UsernameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Username = styled.span`
  color: #94a3b8;
  font-size: 0.95rem;
`;

const IdChip = styled.button`
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

const HeroBadges = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const Badge = styled.div<{ $color?: string; $bg?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${({ $bg }) => $bg || 'rgba(168, 85, 247, 0.15)'};
  color: ${({ $color }) => $color || '#c084fc'};
  border: 1px solid ${({ $color }) => ($color ? `${$color}40` : 'rgba(168, 85, 247, 0.3)')};
`;

// --- Stats Grid ---
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ $accentColor?: string }>`
  background: rgba(24, 24, 33, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ $accentColor }) => $accentColor || 'rgba(168, 85, 247, 0.4)'};
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatIcon = styled.div<{ $color: string; $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const StatTitle = styled.span`
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 1.45rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
`;

const StatSub = styled.span`
  color: #64748b;
  font-size: 0.78rem;
`;

// --- Quick Actions Grid ---
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled(Link)<{ $glow?: string }>`
  background: rgba(24, 24, 33, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px 18px;
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ $glow }) => $glow || '#a855f7'};
    background: rgba(35, 35, 48, 0.85);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

    .arrow-icon {
      transform: translateX(4px);
      color: #fff;
    }
  }
`;

const ActionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionIcon = styled.div<{ $color: string; $bg: string }>`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
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

// --- Server Hub ---
const ServersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 550px) {
    grid-template-columns: 1fr;
  }
`;

const ServerCard = styled.div`
  background: rgba(24, 24, 33, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    border-color: rgba(168, 85, 247, 0.4);
    transform: translateY(-2px);
    background: rgba(32, 32, 45, 0.75);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
  }
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

const ManageBtn = styled(Link)`
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

const EmptyState = styled.div`
  background: rgba(24, 24, 33, 0.65);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 32px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
`;

export function UserProfileHero({ profile }: { profile?: User }) {
  const [copied, setCopied] = useState(false);

  if (!profile) {
    return (
      <HeroCard>
        <SkeletonBox $height="140px" $radius="0" />
        <HeroContent>
          <HeroIdentity>
            <SkeletonBox $width="92px" $height="92px" $radius="50%" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SkeletonBox $width="180px" $height="26px" />
              <SkeletonBox $width="120px" $height="16px" />
            </div>
          </HeroIdentity>
        </HeroContent>
      </HeroCard>
    );
  }

  const avatarUrl = getAvatarURL(profile);
  const bannerUrl = profile.banner
    ? `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.png?size=600`
    : undefined;
  const createdDate = getDiscordCreationDate(profile.id);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(profile.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <HeroCard>
      <HeroBanner $bannerUrl={bannerUrl} $accent={profile.accent_color ? (profile.accent_color.startsWith('#') ? profile.accent_color : `#${profile.accent_color}`) : undefined} />
      <HeroContent>
        <HeroIdentity>
          <AvatarWrapper href={avatarUrl} target="_blank" rel="noreferrer" title="ดูรูปโปรไฟล์ขนาดเต็ม">
            <img src={avatarUrl} alt={profile.username} />
          </AvatarWrapper>
          <IdentityText>
            <DisplayName>{profile.global_name || profile.username}</DisplayName>
            <UsernameRow>
              <Username>@{profile.username}</Username>
              <IdChip onClick={copyId} title="คัดลอก Discord ID">
                {copied ? <TbCheck style={{ color: '#4ade80' }} /> : <TbCopy />}
                {copied ? 'คัดลอกแล้ว!' : profile.id}
              </IdChip>
            </UsernameRow>
          </IdentityText>
        </HeroIdentity>

        <HeroBadges>
          {createdDate && (
            <Badge $color="#38bdf8" $bg="rgba(56, 189, 248, 0.12)">
              <FaCalendarAlt /> สมัครเมื่อ {formatFullDate(createdDate)}
            </Badge>
          )}
          <Badge $color="#a855f7" $bg="rgba(168, 85, 247, 0.12)">
            <FaDiscord /> บัญชียืนยันตัวตน
          </Badge>
        </HeroBadges>
      </HeroContent>
    </HeroCard>
  );
}

export function UserStatsGrid({
  profile,
  guildCount,
  loading,
}: {
  profile?: User;
  guildCount: number;
  loading?: boolean;
}) {
  const createdDate = getDiscordCreationDate(profile?.id);
  const accountAge = formatAccountAge(createdDate);

  return (
    <StatsGrid>
      <StatCard $accentColor="#a855f7">
        <StatHeader>
          <StatTitle>เซิร์ฟเวอร์ที่ดูแล</StatTitle>
          <StatIcon $color="#c084fc" $bg="rgba(168, 85, 247, 0.15)">
            <FaServer />
          </StatIcon>
        </StatHeader>
        <StatValue>{loading ? <SkeletonBox $width="50px" $height="28px" /> : `${guildCount} เซิร์ฟเวอร์`}</StatValue>
        <StatSub>ที่คุณมีสิทธิ์จัดการบอทได้</StatSub>
      </StatCard>

      <StatCard $accentColor="#38bdf8">
        <StatHeader>
          <StatTitle>อายุบัญชี Discord</StatTitle>
          <StatIcon $color="#38bdf8" $bg="rgba(56, 189, 248, 0.15)">
            <FaCalendarAlt />
          </StatIcon>
        </StatHeader>
        <StatValue>{!profile ? <SkeletonBox $width="80px" $height="28px" /> : accountAge}</StatValue>
        <StatSub>{createdDate ? `สร้างเมื่อ ${formatFullDate(createdDate)}` : 'Discord Member'}</StatSub>
      </StatCard>

      <StatCard $accentColor="#f59e0b" as={Link} href="/dashboard/user/membership" style={{ textDecoration: 'none' }}>
        <StatHeader>
          <StatTitle>ระดับสมาชิก</StatTitle>
          <StatIcon $color="#fbbf24" $bg="rgba(245, 158, 11, 0.15)">
            <TbCrown />
          </StatIcon>
        </StatHeader>
        <StatValue>Standard Member</StatValue>
        <StatSub style={{ color: '#fbbf24' }}>ดูสิทธิประโยชน์และแพ็กเกจ →</StatSub>
      </StatCard>

      <StatCard $accentColor="#5865F2">
        <StatHeader>
          <StatTitle>สถานะการเชื่อมต่อ</StatTitle>
          <StatIcon $color="#818cf8" $bg="rgba(88, 101, 242, 0.15)">
            <FaDiscord />
          </StatIcon>
        </StatHeader>
        <StatValue style={{ color: '#4ade80' }}>เชื่อมต่อแล้ว</StatValue>
        <StatSub>Discord OAuth2 ปลอดภัย</StatSub>
      </StatCard>
    </StatsGrid>
  );
}

export function UserQuickActions() {
  return (
    <div>
      <SectionHeader style={{ marginBottom: 12 }}>
        <SectionTitle>
          <TbSettings style={{ color: '#c084fc' }} /> เมนูด่วน (Quick Actions)
        </SectionTitle>
      </SectionHeader>
      <ActionsGrid>
        <ActionCard href="/dashboard" $glow="#a855f7">
          <ActionInfo>
            <ActionIcon $color="#c084fc" $bg="rgba(168, 85, 247, 0.15)">
              <FaServer />
            </ActionIcon>
            <ActionTexts>
              <ActionLabel>จัดการเซิร์ฟเวอร์</ActionLabel>
              <ActionDesc>เลือกตั้งค่าบอทในเซิร์ฟเวอร์</ActionDesc>
            </ActionTexts>
          </ActionInfo>
          <TbArrowRight className="arrow-icon" style={{ color: '#64748b', transition: 'all 0.2s' }} />
        </ActionCard>

        <ActionCard href="/dashboard/invite" $glow="#38bdf8">
          <ActionInfo>
            <ActionIcon $color="#38bdf8" $bg="rgba(56, 189, 248, 0.15)">
              <TbPlus />
            </ActionIcon>
            <ActionTexts>
              <ActionLabel>เพิ่มบอทลงเซิร์ฟเวอร์</ActionLabel>
              <ActionDesc>เชิญ Yumi เข้า Discord</ActionDesc>
            </ActionTexts>
          </ActionInfo>
          <TbExternalLink className="arrow-icon" style={{ color: '#64748b', transition: 'all 0.2s' }} />
        </ActionCard>

        <ActionCard href="/dashboard/user/membership" $glow="#f59e0b">
          <ActionInfo>
            <ActionIcon $color="#fbbf24" $bg="rgba(245, 158, 11, 0.15)">
              <TbDiamond />
            </ActionIcon>
            <ActionTexts>
              <ActionLabel>แพ็กเกจสมาชิก</ActionLabel>
              <ActionDesc>สิทธิพิเศษและฟังก์ชันพิเศษ</ActionDesc>
            </ActionTexts>
          </ActionInfo>
          <TbArrowRight className="arrow-icon" style={{ color: '#64748b', transition: 'all 0.2s' }} />
        </ActionCard>

        <ActionCard href="/dashboard/user/premium" $glow="#ec4899">
          <ActionInfo>
            <ActionIcon $color="#f472b6" $bg="rgba(236, 72, 153, 0.15)">
              <BsStars />
            </ActionIcon>
            <ActionTexts>
              <ActionLabel>จัดการ Premium</ActionLabel>
              <ActionDesc>สถานะพรีเมียมทั้งหมด</ActionDesc>
            </ActionTexts>
          </ActionInfo>
          <TbArrowRight className="arrow-icon" style={{ color: '#64748b', transition: 'all 0.2s' }} />
        </ActionCard>
      </ActionsGrid>
    </div>
  );
}

export function UserManagedServersHub({
  guilds,
  loading,
}: {
  guilds?: PartialGuild[];
  loading?: boolean;
}) {
  const displayGuilds = guilds?.slice(0, 6) || [];

  return (
    <div>
      <SectionHeader style={{ marginBottom: 12 }}>
        <SectionTitle>
          <FaServer style={{ color: '#38bdf8' }} /> เซิร์ฟเวอร์ที่คุณดูแล
        </SectionTitle>
        <Link
          href="/dashboard"
          style={{
            color: '#a855f7',
            fontSize: '0.88rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 500,
          }}
        >
          ดูทั้งหมด ({guilds?.length || 0}) <TbArrowRight />
        </Link>
      </SectionHeader>

      {loading ? (
        <ServersGrid>
          {[1, 2, 3].map((i) => (
            <ServerCard key={i}>
              <ServerLeft>
                <SkeletonBox $width="44px" $height="44px" $radius="12px" />
                <SkeletonBox $width="120px" $height="18px" />
              </ServerLeft>
              <SkeletonBox $width="64px" $height="30px" $radius="8px" />
            </ServerCard>
          ))}
        </ServersGrid>
      ) : displayGuilds.length > 0 ? (
        <ServersGrid>
          {displayGuilds.map((guild) => {
            const iconUrl = guild.icon ? getIconURL(guild) : undefined;
            return (
              <ServerCard key={guild.id}>
                <ServerLeft>
                  <ServerIcon>
                    {iconUrl ? (
                      <img src={iconUrl} alt={guild.name} />
                    ) : (
                      guild.name.slice(0, 2).toUpperCase()
                    )}
                  </ServerIcon>
                  <ServerName title={guild.name}>{guild.name}</ServerName>
                </ServerLeft>
                <ManageBtn href={`/dashboard/server/${guild.id}/overview`}>
                  จัดการ
                </ManageBtn>
              </ServerCard>
            );
          })}
        </ServersGrid>
      ) : (
        <EmptyState>
          <FaServer style={{ fontSize: '2.5rem', color: '#64748b' }} />
          <div>ยังไม่พบเซิร์ฟเวอร์ที่คุณมีสิทธิ์จัดการ หรือยังไม่ได้เชิญบอท</div>
          <ManageBtn href="/dashboard/invite" style={{ marginTop: 4 }}>
            เชิญ Yumi เข้าเซิร์ฟเวอร์
          </ManageBtn>
        </EmptyState>
      )}
    </div>
  );
}

export function UserOverviewSkeleton() {
  return (
    <Container>
      <HeroCard>
        <SkeletonBox $height="140px" $radius="0" />
        <HeroContent>
          <HeroIdentity>
            <SkeletonBox $width="92px" $height="92px" $radius="50%" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SkeletonBox $width="180px" $height="26px" />
              <SkeletonBox $width="120px" $height="16px" />
            </div>
          </HeroIdentity>
        </HeroContent>
      </HeroCard>

      <StatsGrid>
        {[1, 2, 3, 4].map((i) => (
          <StatCard key={i}>
            <SkeletonBox $width="80px" $height="16px" />
            <SkeletonBox $width="110px" $height="28px" $margin="8px 0" />
            <SkeletonBox $width="130px" $height="14px" />
          </StatCard>
        ))}
      </StatsGrid>

      <ActionsGrid>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: 'rgba(24, 24, 33, 0.65)',
              padding: '16px 18px',
              borderRadius: 14,
            }}
          >
            <SkeletonBox $height="42px" $radius="10px" />
          </div>
        ))}
      </ActionsGrid>

      <ServersGrid>
        {[1, 2, 3].map((i) => (
          <ServerCard key={i}>
            <ServerLeft>
              <SkeletonBox $width="44px" $height="44px" $radius="12px" />
              <SkeletonBox $width="120px" $height="18px" />
            </ServerLeft>
            <SkeletonBox $width="64px" $height="30px" $radius="8px" />
          </ServerCard>
        ))}
      </ServersGrid>
    </Container>
  );
}

export const UserOverviewContainer = Container;
