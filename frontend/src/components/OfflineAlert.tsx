'use client';

import { useEffect, useState } from "react";
import { useOnlineStatus } from "../utils/hooks/useOnlineStatus";
import { getStatus, apiStatusPaths, apiStatusPath } from "../utils/api";
import styled from "styled-components";

export const OfflineAlert = () => {
  const isOnline = useOnlineStatus();
  const [statuses, setStatuses] = useState<Partial<Record<apiStatusPath, boolean>>>({});
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkApis = async () => {
      const results = await Promise.all(
        apiStatusPaths.map(async (path) => {
          try {
            const res = await getStatus(path);
            if (res.status === 429) return { path, status: 'skip' };
            if (res.status === 200) return { path, status: true };
            return { path, status: false };
          } catch {
            return { path, status: false };
          }
        })
      );

      setStatuses((prev) => {
        const next = { ...prev };
        results.forEach(({ path, status }) => {
          if (typeof status === 'boolean') {
            next[path] = status;
          }
        });
        return next;
      });
    };

    checkApis();
    const interval = setInterval(checkApis, 10_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const isSomeOffline = Object.values(statuses).includes(false);
    setShow((isSomeOffline && isOnline) || !isOnline);
    console.log(statuses, isSomeOffline, !isOnline);
  }, [statuses, isOnline]);

  const Div = styled.div`
    position: fixed;
    top: 60px; left: 0;
    width: 100vw;
    height: calc(100% - 60px);
    backdrop-filter: blur(2px) grayscale(1) brightness(0.8);
    opacity: ${show || !isOnline ? '1' : '0'};
    pointer-events: ${show || !isOnline ? 'auto' : 'none'};
    transition: all 0.2s ease-in-out;

    z-index: ${show || !isOnline ? '90' : '-999'};

    & > .main {
      
    }
  `;

  return (
    <Div>
      {!isOnline ? <div className="main">
        <p>You are offline</p>
      </div> : <div className="other">
      </div>}
    </Div>
  );
};
