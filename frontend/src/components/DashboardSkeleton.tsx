'use client';
import styled, { keyframes } from 'styled-components';
import { Spinner_ring } from './Spinner';

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
