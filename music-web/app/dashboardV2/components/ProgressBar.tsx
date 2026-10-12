'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '../utils/zustand';

export default function ProgressBar({ top = 0, zIndex = 'auto' }: { top?: number | string, zIndex?: number | string }) {
  const progress = useDashboardStore((s) => s.loadingProgress);
  const max = useDashboardStore((s) => s.loadingMaxProgress);
  const setProgress = useDashboardStore((s) => s.setLoadingProgress);

  useEffect(() => {
    let interval: any;

    if (progress > 0 && progress < max) {
      interval = setInterval(() => {
        setProgress((prev: number) => {
          const next = prev + Math.random() * 10;
          return next > max ? max : next;
        });
      }, 300);
    }

    return () => clearInterval(interval);
  }, [progress, max, setProgress]);

  useEffect(() => {
    if (progress === 100) {
      const t = setTimeout(() => {
        setProgress(0);
      }, 300);

      return () => clearTimeout(t);
    }
  }, [progress, setProgress]);

  return (
    <div
      style={{
        position: 'fixed',
        top,
        left: 0,
        height: '3px',
        width: `${progress}%`,
        transition: 'width 0.2s ease, opacity 0.2s ease',
        background: '#c51313',
        opacity: progress === 0 ? 0 : 1,
        zIndex
      }}
    />
  );
}