'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ErrorPopupContext, GuildContext, UserContext } from '../utils/contexts/Contexts';
import { AppBar } from './AppBar';
import { Footer } from './Footer';
import { GuildInfo, User } from '../utils/types';
import { ErrorPopup } from '../utils/styles';
import { MdClose } from 'react-icons/md';
import { useHideLoading } from '../utils/hooks/useHideLoading';
import { OfflineAlert } from './OfflineAlert';

export function Providers({ children }: { children: React.ReactNode }) {
  const [guild, setGuild] = useState<GuildInfo>();
  const updateGuild = (guild: GuildInfo) => setGuild(guild);

  const [user, setUser] = useState<User>();
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [userError, setUserError] = useState();
  const updateUser = (user: User) => setUser(user);
  const updateLoadingUser = (loadingUser: boolean) => setLoadingUser(loadingUser);
  const updateUserError = (error: any) => setUserError(error);

  const [errorPopup, setErrorPopup] = useState<{title?: string, message?: string, show: boolean}>();
  const updateErrorPopup = (errorPopup: {title?: string, message?: string, show: boolean}) => setErrorPopup(errorPopup);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    useHideLoading();
  }, [pathname]);

  return (
    <ErrorPopupContext.Provider value={{ errorPopup, updateErrorPopup }}>
    <UserContext.Provider value={{ user, loadingUser, userError, updateUser, updateLoadingUser, updateUserError }}>
    <GuildContext.Provider value={{ guild, updateGuild }}>

    <ErrorPopup $show={errorPopup?.show} onClick={() => updateErrorPopup({ ...errorPopup, show: false })}>
      {errorPopup?.title || errorPopup?.message ? (<div onClick={(e) => e.stopPropagation()}>
        {errorPopup?.title && <h1>{errorPopup.title}</h1>}
        {errorPopup?.message && <h2>{errorPopup.message}</h2>}
        <MdClose id='close' onClick={() => updateErrorPopup({ ...errorPopup, show: false })}/>
      </div>) : <></>}
    </ErrorPopup>
    
    <div>
      <AppBar />
      <div className="preLoaderBar backdrop-blur" id="PreLoaderBar"><div className="progress"><div className="indeterminate"></div></div></div>
    </div>
    <OfflineAlert />
    {children}
    <Footer/>

    </GuildContext.Provider>
    </UserContext.Provider>
    </ErrorPopupContext.Provider>
  );
}
