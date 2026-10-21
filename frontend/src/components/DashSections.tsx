'use client';
import { ReactNode } from 'react';
import { FaHashtag, FaUsers } from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';
import { SkeletonBlock } from './DashboardSkeleton';
import {
  DashPageServerOverview,
  DashPageServerGeneralSettings,
  DashPageServerGeneralInfo,
  DashPageServerFunctionWelcomeGoodBye,
  Select,
  InputField,
} from '../utils/styles';
import { localeLabels } from '../utils/types';

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
