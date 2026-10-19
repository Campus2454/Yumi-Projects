'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { mockGuilds } from "../../src/__mocks__/guilds";
import { useContext, useState, useEffect } from "react";
import { GuildContext, MapGuildsContext, UserContext } from "../../src/utils/contexts/Contexts";
import { GuildMenuItem } from "../../src/components/GuildMenuItem";
import { Container, GuildMenuItemStyle, GuildMenuItemStyleLoading, NotFoundImg, NotFoundText, ShowPopupLoadingErrorBox, ShowPopupLoadingError, BackgroundFixed, GuildMenuCreateData, UserMenuItem } from "../../src/utils/styles";
import { useFetchUser } from "../../src/utils/hooks/useFetchUser";
import { useFetchGuilds } from "../../src/utils/hooks/useFetchGuilds";
import axios from "axios";
import { PartialGuild, AuthStatus } from "../../src/utils/types";
import { getMutualGuilds, getAuthStatus, getAuthStatusLocalhost, getMutualGuildsLocalhost } from "../../src/utils/api";
import { PulseLoader } from "react-spinners";
import { getAvatarURL } from "../../src/utils/getURL";
import { TbRefresh } from "react-icons/tb";
import Link from 'next/link';
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
    const { updateGuild } = useContext(GuildContext);
    const { user, userError, loadingUser } = useContext(UserContext);
    const { guilds, loadingGuilds, errorGuilds, updateGuilds, updateLoadingGuilds, updateErrorGuilds } = useContext(MapGuildsContext);

    const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
    const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
    const apiIp = process.env.NEXT_PUBLIC_API_IP_URL;

    const handleClick = async (guild: PartialGuild) => {
        updateGuild(guild);
        if(guild.bot_here && guild.database){
            router.push(`/dashboard/server/${guild.id}/main`);
        }else if(guild.bot_here && !guild.database){
            setShowPopupCreateDataInDatabase(true);
            setCreateDataInDatabaseLoading(true);
            const CreateGuild = async () => {
                if(window.location.hostname == hostname){
                    try{
                        const res = await fetch(`${apiDomain}/discord/createGuild/${guild.id}`, {
                            method: 'post'
                        });
                        if(res.ok){
                            return 'Succeed';
                        }else{
                            return `Error ${res.status}`;
                        }
                    }catch(error: any){
                        console.error(error);
                        return `Error: ${error.name}`;
                    };
                }else{
                    try{
                        const res = await fetch(`${apiIp}/discord/createGuild/${guild.id}`, {
                            method: 'post'
                        });
                        if(res.ok){
                            return 'Succeed';
                        }else{
                            return `Error ${res.status}`;
                        }
                    }catch(error: any){
                        console.error(error);
                        return `Error: ${error.name}`;
                    };
                }
            };
            const createGuild = await CreateGuild();
            setTimeout(() => {
                setCreateDataInDatabaseLoading(false);
                setTimeout(() => {
                    const e = document.getElementById('createStatus');
                    if(e){e.textContent = createGuild};
                    setTimeout(() => { window.location.reload() }, 3000);
                }, 1000);
            }, 1000);
        }else{
            router.push(`/dashboard/invite`);
        }
        // window.location.href = `/dashboard/${guild.id}/main`;
    };
    const fetchGuilds = useFetchGuilds();
    // if(window.location.pathname === '/dashboard/'){
    //     window.history.replaceState(null, '', '/dashboard');
    // };

    useEffect(() => {
        if(user && !guilds){
            fetchGuilds();
        };
        
        const to = searchParams?.get('to');
        if(!to)return;
        const guildId = to.replace(/\D/g, '');
        if(to.startsWith('server') && guilds){
            const guild = guilds.find(g => g.id == guildId);
            console.log(guild);
            if(!guild){router.push(pathname || '/dashboard');return};
            updateGuild(guild);
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

    // useEffect(() => {
    //     // console.log(errorGuildsCount);
    //     if(errorGuildsCount > 1)window.location.reload();
    // }, [errorGuildsCount]);
    
    //   const handleClick = (guild: PartialGuild) => {
    //     history.push(`/guilds/${guildId}`);
    //   };

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
                        <TbRefresh style={{ marginLeft: 10, color: 'rgb(255, 100, 100)', cursor: 'pointer', }} onClick={()=>fetchGuilds()}/>
                    </h2>
                    {/* <h2 style={{ marginTop: 0, }}>Select a Server</h2> */}
                    {guilds.map((guild) => (
                        <div key={guild.id}>
                            <GuildMenuItem href={guild.bot_here ? `/dashboard/server/${guild.id}` : `/dashboard/invite/${guild.id}`} guild={guild} />
                        </div>
                    ))}
                    <br />
                </div> : <div style={{ display: 'flex', alignItems: 'center', }}>The server you are administrator was not found.<TbRefresh style={{ marginLeft: 10, color: 'rgb(255, 100, 100)', cursor: 'pointer', }} onClick={()=>fetchGuilds()}/></div>}
                
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
                        <Link href={`/verify?redirect=${window.location.hostname == hostname 
                                    ? `${apiDomain}/auth/login`
                                    : `${apiIp}/auth/v2/login`
                            }`}
                            style={{ color: '#fff', textDecoration: 'none', backgroundColor: '#4d7cff', padding: '10px 40px', borderRadius: 5, marginTop: 10, cursor: 'pointer', }}>Login</Link>
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
                    <Link href={`/verify?redirect=${window.location.hostname == hostname 
                                    ? `${apiDomain}/auth/login`
                                    : `${apiIp}/auth/v2/login`
                        }`}
                        style={{ color: '#fff', textDecoration: 'none', backgroundColor: '#4d7cff', padding: '10px 40px', borderRadius: 5, marginTop: 10, cursor: 'pointer', }}>Login</Link>
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
                <Link href={window.location.hostname == hostname 
                                    ? `${apiDomain}/auth/login`
                                    : `${apiIp}/auth/v2/login`
                    }
                    style={{ color: '#fff', textDecoration: 'none', backgroundColor: '#4d7cff', padding: '10px 40px', borderRadius: 5, marginTop: 10, cursor: 'pointer', }}>Login</Link>
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
            <MenuPageContent />
        </Suspense>
    );
}
