'use client';

import { useEffect, useState } from "react";
import { getStatus, apiStatusPaths, apiStatusPath } from "../utils/api";
import styled from "styled-components";
import { RiGlobalOffLine } from "react-icons/ri";
import { useOnlineStatus } from "../utils/hooks/useOnlineStatus";

export const OfflineAlert = () => {
  const isOnline = useOnlineStatus();
  const [_isOnline, setIsOnline] = useState(true);
  // const isOnline = false;
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
  }, [statuses, isOnline]);

  const Div = styled.div`
    position: fixed;
    top: 60px; left: 0;
    width: 100vw;
    height: calc(100% - 60px);
    backdrop-filter: blur(2px) grayscale(1) brightness(0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: ${show || !isOnline ? '1' : '0'};
    pointer-events: ${show || !isOnline ? 'auto' : 'none'};
    cursor: ${show || !isOnline ? 'wait' : 'default'};
    transition: all 0.5s ease-in-out;

    z-index: ${show || !isOnline ? '90' : '-999'};

    & > .main {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      filter: drop-shadow(0 0 5px #000) drop-shadow(0 0 5px #000);
      padding: 40px 60px;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 30px;
      
      & > svg {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #fff;
        animation: flash 3s ease-in-out infinite;
        

        @keyframes flash {
          0% { opacity: 1; }
          20% { opacity: 0.3; }
          100% { opacity: 0.3; }
        }
      }

      & > p {
        font-size: 1.5rem;
        font-weight: bold;
        color: #fff;
      }
    }
  `;

  return (<>
    <Div>
      {!isOnline ? <div className="main">
        <RiGlobalOffLine />
        <p>You are offline</p>
      </div> : <div className="other">
      </div>}
    </Div>
  </>);
};
