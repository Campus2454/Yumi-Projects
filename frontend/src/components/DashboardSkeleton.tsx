'use client';
import styled, { keyframes } from 'styled-components';
import { Spinner_ring } from './Spinner';
import { DashPageServerOverview } from '../utils/styles';
import { FaHashtag, FaUsers } from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';

const shimmer = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`;

export const SkeletonBlock = styled.div<{
  $width?: string;
  $height?: string;
  $radius?: string;
  $margin?: string;
}>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};
  border-radius: ${({ $radius }) => $radius || '8px'};
  margin: ${({ $margin }) => $margin || '0'};
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.12) 37%, rgba(255, 255, 255, 0.05) 63%);
  background-size: 400% 100%;
  animation: ${shimmer} 2.5s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

export const SkeletonShell = styled.div`
  width: 100%;
  padding: 10px 0;
  /* animation: fadeIn 0.3s ease; */

  #title-skeleton {
    margin-left: 5%;
    margin-bottom: 20px;
  }

  #line-skeleton {
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    margin: 20px 50px;
  }
`;

export function OverviewSkeleton() {
  return (
    <SkeletonShell>
      <div id='title'>Overview</div>

      <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px' }} />

      <DashPageServerOverview>
        {[1, 2, 3].map((i) => (
          <SkeletonBlock key={i} style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }} />
        ))}
      </DashPageServerOverview>
    </SkeletonShell>
  );
}

export function SettingsSkeleton() {
  return (
    <SkeletonShell>
      <div id='title'>Server Settings</div>

      <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px' }} />

      <div style={{ marginLeft: '5%', maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div>
          <SkeletonBlock $width="120px" $height="20px" $radius="4px" $margin="0 0 10px 0" />
          <SkeletonBlock $width="100%" $height="45px" $radius="10px" />
        </div>
        <div>
          <SkeletonBlock $width="100px" $height="20px" $radius="4px" $margin="0 0 10px 0" />
          <SkeletonBlock $width="100%" $height="45px" $radius="10px" />
        </div>
      </div>
    </SkeletonShell>
  );
}

export function PremiumSkeleton() {
  return (
    <SkeletonShell>
      <div id='title'>Bot Premium</div>

      <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px' }} />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <SkeletonBlock $width="200px" $height="45px" $radius="25px" />
      </div>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 20px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ width: '280px', height: '420px', borderRadius: '15px', background: 'rgba(255, 255, 255, 0.04)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <SkeletonBlock $width="100px" $height="28px" $radius="6px" />
            <SkeletonBlock $width="150px" $height="24px" $radius="6px" />
            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '5px 0' }} />
            {[1, 2, 3, 4, 5].map((j) => (
              <SkeletonBlock key={j} $width="90%" $height="18px" $radius="4px" />
            ))}
            <div style={{ marginTop: 'auto' }}>
              <SkeletonBlock $width="100%" $height="45px" $radius="10px" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonShell>
  );
}

export function WelcomeSkeleton() {
  return (
    <SkeletonShell>
      <div id="title-skeleton">
        <SkeletonBlock $width="280px" $height="40px" $radius="10px" />
      </div>
      <div id="line-skeleton" />
      <div style={{ marginLeft: '5%', marginRight: '5%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {[1, 2].map((card) => (
          <div key={card} style={{ padding: '25px', borderRadius: '15px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <SkeletonBlock $width="140px" $height="28px" $radius="6px" />
              <SkeletonBlock $width="60px" $height="30px" $radius="15px" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <SkeletonBlock $width="100%" $height="40px" $radius="8px" $margin="0 0 15px 0" />
                <SkeletonBlock $width="100%" $height="120px" $radius="10px" />
              </div>
              <div>
                <SkeletonBlock $width="100%" $height="175px" $radius="10px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SkeletonShell>
  );
}

export function SendSkeleton() {
  return (
    <SkeletonShell>
      <div id="title-skeleton">
        <SkeletonBlock $width="180px" $height="40px" $radius="10px" />
      </div>
      <div id="line-skeleton" />
      <div style={{ marginLeft: '5%', marginRight: '5%' }}>
        <SkeletonBlock $width="240px" $height="60px" $radius="12px" />
      </div>
    </SkeletonShell>
  );
}

export function UserInfoSkeleton() {
  return (
    <SkeletonShell>
      <div id="title-skeleton">
        <SkeletonBlock $width="180px" $height="40px" $radius="10px" />
      </div>
      <div id="line-skeleton" />
      <div style={{ marginLeft: '5%', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
        <SkeletonBlock $width="70px" $height="70px" $radius="50%" />
        <SkeletonBlock $width="220px" $height="24px" $radius="6px" />
        <SkeletonBlock $width="280px" $height="20px" $radius="6px" />
      </div>
    </SkeletonShell>
  );
}

export function GenericSkeleton() {
  return (
    <SkeletonShell>
      <div id="title-skeleton">
        <SkeletonBlock $width="200px" $height="40px" $radius="10px" />
      </div>
      <div id="line-skeleton" />
      <div style={{ marginLeft: '5%', marginRight: '5%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <SkeletonBlock $width="60%" $height="24px" $radius="6px" />
        <SkeletonBlock $width="40%" $height="20px" $radius="6px" />
      </div>
    </SkeletonShell>
  );
}

export function FullLayoutSkeleton() {
  return (
    // <div style={{ width: '100%', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', padding: '30px', boxSizing: 'border-box' }}>
    //   <SkeletonBlock $width="260px" $height="42px" $radius="10px" $margin="0 0 20px 0" />
    //   <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '30px' }} />
    //   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
    //     <SkeletonBlock $width="100%" $height="140px" $radius="15px" />
    //     <SkeletonBlock $width="100%" $height="140px" $radius="15px" />
    //     <SkeletonBlock $width="100%" $height="140px" $radius="15px" />
    //   </div>
    // </div>
    <div style={{ position: 'absolute', top: '0', left: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: 'calc(100vh - 60px)' }}>
      <Spinner_ring size={100} border={7} />
    </div>
  );
}
