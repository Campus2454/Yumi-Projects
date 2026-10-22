'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { mockGuilds } from "../../src/__mocks__/guilds";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../src/utils/contexts/Contexts";
import { GuildMenuItem } from "../../src/components/GuildMenuItem";
import { Container, GuildMenuItemStyle, GuildMenuItemStyleLoading, NotFoundImg, NotFoundText, ShowPopupLoadingErrorBox, ShowPopupLoadingError, BackgroundFixed, GuildMenuCreateData, UserMenuItem } from "../../src/utils/styles";
import { useFetchUser } from "../../src/utils/hooks/useFetchUser";
import { useGuildList } from "../../src/utils/hooks/useGuildData";
import axios from "axios";
import { PartialGuild, AuthStatus } from "../../src/utils/types";
import { getMutualGuilds, getAuthStatus, getAuthStatusLocalhost, getMutualGuildsLocalhost } from "../../src/utils/api";
import { PulseLoader } from "react-spinners";
import { getAvatarURL } from "../../src/utils/getURL";
import { TbRefresh } from "react-icons/tb";
import Link from 'next/link';
import { Spinner_ring } from '@/src/components/Spinner';
import { FullLayoutSkeleton } from '@/src/components/DashboardSkeleton';
import { LoginDiscord } from '@/src/components/DashSections';
// import { wait } from "@testing-library/user-event/dist/utils";

function MenuPageContent() {
    // const [loading, setLoading] = useState(true);
    const [_, setLoadingGuilds] = useState(true);
    // const { user, errorUser, loadingUser } = useFetchUser();
    // const { guilds, errorGuilds, loadingGuilds } = useFetchGuilds();
    // const [error, setError] = useState('');
    const [showPopupLoadingError, setShowPopupLoadingError] = useState(false);
    const [internetError, setInternetError] = useState(false);
    const [showPopupCreateDataInDatabase, setShowPopupCreateDataInDatabase] = useState(false);
    const [createDataInDatabaseLoading, setCreateDataInDatabaseLoading] = useState(false);
    // const [errorGuildsCount, setErrorGuildsCount] = useState(0);

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { user, userError, loadingUser } = useContext(UserContext);
    const { guilds, loadingGuilds, errorGuilds, refreshGuilds } = useGuildList();

    const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
    const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
    const apiIp = process.env.NEXT_PUBLIC_API_IP_URL;

    // if(window.location.pathname === '/dashboard/'){
    //     window.history.replaceState(null, '', '/dashboard');
    // };

    useEffect(() => {
        const to = searchParams?.get('to');
        if(!to)return;
        const guildId = to.replace(/\D/g, '');
        if(to.startsWith('server') && guilds){
            const guild = guilds.find(g => g.id == guildId);
            if(!guild){router.push(pathname || '/dashboard');return};
            router.push(`/dashboard/server/${guildId}/${to.split('/')[2]}`);
        }else if(to.startsWith('user') && user){ router.push(`/dashboard/user/${to.split('/')[1]}`) }
    }, [user, guilds]);

    useEffect(() => {
        // if(loadingUser || loadingGuilds){
        if(!user || loadingGuilds){
            const timeShowPopupLoadingError = setTimeout(() => {
                setShowPopupLoadingError(true);
            }, 3000);
            return () => clearTimeout(timeShowPopupLoadingError);
        }else if(showPopupLoadingError){setShowPopupLoadingError(false)}
    }, [loadingGuilds]);

    if(loadingUser || (!user && !userError)){
    return (
        <>

            <BackgroundFixed id="background"/>
            <div style={{ marginTop: 70 }}>
                <Container><h2>Loading User<span className='loadingDot'></span></h2></Container>
                <Container>
                    <GuildMenuItemStyleLoading><div/><p/></GuildMenuItemStyleLoading>
                    <GuildMenuItemStyleLoading><div/><p/></GuildMenuItemStyleLoading>
                    <GuildMenuItemStyleLoading><div/><p/></GuildMenuItemStyleLoading>
                    <GuildMenuItemStyleLoading><div/><p/></GuildMenuItemStyleLoading>
                </Container>
                {showPopupLoadingError && (
                    <ShowPopupLoadingErrorBox>
                        <ShowPopupLoadingError>
                        If there is a problem obtaining user information, please contact the system administrator: <Link href="https://discord.gg/brxPZB3Jzy" style={{ color: '#ff8f8f', textDecorationColor: '#ffbdbd' }} >Discord</Link>
                        </ShowPopupLoadingError>
                    </ShowPopupLoadingErrorBox>
                )}
            </div>
        </>
    );
    };

    if(user){
        return (<>

            <BackgroundFixed id="background"/>

            <Container style={{ marginTop: 70 }}>
                <h2>User</h2>
                <UserMenuItem href='/dashboard/user/overview'>
                    {user.avatar && (
                        <img src={getAvatarURL(user)} alt={user.username} width={40} height={40} />
                    )}
                    {!user.avatar && (
                        <img src={'https://cdn.discordapp.com/embed/avatars/0.png'} alt={user.username} width={40} height={40} />
                    )}
                    <p translate="no" style={{ display: 'flex', justifyContent: 'right', height: '25px', width: '250px', marginTop: '16px', marginBottom: '16px' }}>{user.username}</p>
                </UserMenuItem>

                {loadingGuilds ? 
                <div>
                    <h2>Loading Guilds<span className='loadingDot'></span></h2>
                    <div>
                        <GuildMenuItemStyleLoading><div/><p/></GuildMenuItemStyleLoading>
                        <GuildMenuItemStyleLoading><div/><p/></GuildMenuItemStyleLoading>
                        <GuildMenuItemStyleLoading><div/><p/></GuildMenuItemStyleLoading>
                        <GuildMenuItemStyleLoading><div/><p/></GuildMenuItemStyleLoading>
                    </div>
                    {showPopupLoadingError && (
                        <ShowPopupLoadingErrorBox>
                            <ShowPopupLoadingError>
                            If there is a problem obtaining user information, please contact the system administrator: <Link href="https://discord.gg/brxPZB3Jzy" style={{ color: '#ff8f8f', textDecorationColor: '#ffbdbd' }} >Discord</Link>
                            </ShowPopupLoadingError>
                        </ShowPopupLoadingErrorBox>
                    )}
                </div> : guilds ? 
                <div>
                    <GuildMenuCreateData $isShow={showPopupCreateDataInDatabase}>
                        <div>
                            <div style={{ fontSize: 30, fontWeight: 900, }}>Setting up server information in database</div>
                            <p>Please wait a moment.</p>
                            {createDataInDatabaseLoading ? <PulseLoader color='#fff' /> : <div id="createStatus">Loading...</div>}
                        </div>
                    </GuildMenuCreateData>
                
                    <h2 style={{ display: 'flex', alignItems: 'center', }}>
                        Guilds
                        <TbRefresh style={{ marginLeft: 10, color: 'rgb(255, 100, 100)', cursor: 'pointer', }} onClick={()=>refreshGuilds()}/>
                    </h2>
                    {/* <h2 style={{ marginTop: 0, }}>Select a Server</h2> */}
                    {guilds.map((guild) => (
                        <div key={guild.id}>
                            <GuildMenuItem href={guild.bot_here ? `/dashboard/server/${guild.id}` : `/dashboard/invite/${guild.id}`} guild={guild} />
                        </div>
                    ))}
                    <br />
                </div> : <div style={{ display: 'flex', alignItems: 'center', }}>The server you are administrator was not found.<TbRefresh style={{ marginLeft: 10, color: 'rgb(255, 100, 100)', cursor: 'pointer', }} onClick={()=>refreshGuilds()}/></div>}
                
            </Container>
        </>);
    };
    
    if(userError){
        console.log('User Error:', userError);
        return (
            <>

                <BackgroundFixed id="background"/>
                <div style={{ height: '70vh', width: '100vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
                    <NotFoundImg>
                        <img src={userError == '403' ? 'https://assets.camming.xyz/photos/not-found/not%20found%20403.webp' : 'https://assets.camming.xyz/photos/not-found/not%20found1.webp'} alt='Not Found' width={130} height={130} />
                    </NotFoundImg>
                    <NotFoundText style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <h1>Please login</h1>
                        <LoginDiscord display="flex" justifyContent="center" alignItems="center" cursor="pointer" backgroundColor="#4d7cff" width={100} height={40} borderRadius={5} />
                        <p style={{ margin: '0' }}>or</p>
                        <Link href='/' style={{ color: '#fff', textDecoration: 'none', backgroundColor: '#ff3333', padding: 10, borderRadius: 5, }}>Back to Home Page</Link>
                    </NotFoundText>
                    {showPopupLoadingError && (
                        <ShowPopupLoadingErrorBox>
                            <ShowPopupLoadingError>
                            If there is a problem obtaining user information, please contact the system administrator: <Link href="https://discord.gg/brxPZB3Jzy" style={{ color: '#ff8f8f', textDecorationColor: '#ffbdbd' }} >Discord</Link>
                            </ShowPopupLoadingError>
                        </ShowPopupLoadingErrorBox>
                    )}
                </div>
            </>
        );
    }else
    if(errorGuilds){
    return (
        <>

            <BackgroundFixed id="background"/>
            <div style={{ height: '70vh', width: '100vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
                <NotFoundImg>
                    <img src={errorGuilds == '403' ? 'https://assets.camming.xyz/photos/not-found/not%20found%20403.webp' : 'https://assets.camming.xyz/photos/not-found/not%20found1.webp'} alt='Not Found' width={130} height={130} />
                </NotFoundImg>
                <NotFoundText style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <h2 style={{ margin: '0' }}>Not Found</h2>
                    <p style={{ margin: '0' }}>{errorGuilds}</p>
                    <LoginDiscord color='#fff' textDecoration='none' backgroundColor='#4d7cff' padding='10px 40px' borderRadius={5} marginTop={10} cursor='pointer' />
                    <p style={{ margin: '0' }}>or</p>
                    <Link href='/' style={{ color: '#fff', textDecoration: 'none', backgroundColor: '#ff3333', padding: 10, borderRadius: 5, }}>Back to Home Page</Link>
                </NotFoundText>
                {showPopupLoadingError && (
                    <ShowPopupLoadingErrorBox>
                        <ShowPopupLoadingError>
                        If there is a problem obtaining user information, please contact the system administrator: <Link href="https://discord.gg/brxPZB3Jzy" style={{ color: '#ff8f8f', textDecorationColor: '#ffbdbd' }} >Discord</Link>
                        </ShowPopupLoadingError>
                    </ShowPopupLoadingErrorBox>
                )}
            </div>
        </>
    );
    };

    return (<>

        <BackgroundFixed id="background"/>
        <div style={{ height: '70vh', width: '100vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
            <NotFoundImg>
                <img src='https://assets.camming.xyz/photos/not-found/not%20found1.webp' alt='Not Found' width={130} height={130} />
            </NotFoundImg>
            <NotFoundText style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                <h2 style={{ margin: '0' }}>Not Found</h2>
                <LoginDiscord display="flex" justifyContent="center" alignItems="center" cursor="pointer" backgroundColor="#4d7cff" width={100} height={40} borderRadius={5} />
                <p style={{ margin: '0' }}>or</p>
                <Link href='/' style={{ color: '#fff', textDecoration: 'none', backgroundColor: '#ff3333', padding: 10, borderRadius: 5, }}>Back to Home Page</Link>
            </NotFoundText>
            {showPopupLoadingError && (
                <ShowPopupLoadingErrorBox>
                    <ShowPopupLoadingError>
                    If there is a problem obtaining user information, please contact the system administrator: <Link href="https://discord.gg/brxPZB3Jzy" style={{ color: '#ff8f8f', textDecorationColor: '#ffbdbd' }} >Discord</Link>
                    </ShowPopupLoadingError>
                </ShowPopupLoadingErrorBox>
            )}
        </div>
    </>);
}

export default function MenuPage() {

    return (
        <Suspense fallback={<div>Loading dashboard...</div>}>
            {/* <MenuPageContent /> */}
            <FullLayoutSkeleton />
        </Suspense>
    );
}
