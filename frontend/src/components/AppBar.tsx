'use client';

import { AppBarStyle, Spinner_lds_ring, TopBarShortCutLink } from "../utils/styles"
import axios from "axios";
import { User, AuthStatus } from "../utils/types";
import { createContext, HTMLAttributeAnchorTarget, useContext, useEffect, useRef, useState } from "react";
import { getAvatarURL } from "../utils/getURL";
import { GuildContext, UserContext } from "../utils/contexts/Contexts";
import { useFetchUser } from "../utils/hooks/useFetchUser";
import { FaBars, FaDonate, FaHome } from "react-icons/fa";
import { TbLayoutDashboardFilled, TbLogout } from "react-icons/tb";
import { BsSlashSquareFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { IoChatbubblesSharp } from "react-icons/io5";
import { getAuthStatus, getAuthStatusLocalhost } from "../utils/api";
import { usePathname, useRouter } from "next/navigation";
// import { hideLoading } from "../App";
import { Turnstile } from "@marsidev/react-turnstile";
import { Spinner_ring } from "./Spinner";
import { useHideLoading } from "../utils/hooks/useHideLoading";
import Link from "next/link";
import { LoginDiscord } from "./DashSections";

// type UserContextType = {
//     user?: AuthStatus;
//     updateUser: (user: AuthStatus) => void;
// }
// type ProfileContextType = {
//     profile?: User;
//     updateProfile: (profile: User) => void;
// }
// export const AuthStatusContext = createContext<UserContextType>({
//     updateUser: () => {},
// });
// export const ProfileContext = createContext<ProfileContextType>({
//     updateProfile: () => {},
// });


export const AppBar = () => {
    const { guild } = useContext(GuildContext);
    const { user: profile, loadingUser: loadingProfile, userError, updateUser, updateLoadingUser, updateUserError } = useContext(UserContext);
    const { user, errorUser, loadingUser } = useFetchUser();
    // const [user, setUser] = useState<AuthStatus>();
    // const [errorUser, setError] = useState('');
    // const [profile, setProfile] = useState<User>();
    const [menuActive, setMenuActive] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const [token, setToken] = useState<string>("");
    const ref = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    let leaveTimeout: ReturnType<typeof setTimeout>;
    const isAdminPage = typeof window !== 'undefined' && window.location.hostname.split('.')[0] === 'admin';

    // console.log(guild);
    
    useEffect(() => {
        updateUserError(undefined);
        updateLoadingUser(true);
        if(user){
            try{
                axios.get<User>('https://discord.com/api/users/@me', {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    }
                }).then(({data}) => {
                    // setProfile(data);
                    // console.log(`UserData: ${data}`);
                    updateUser(data);
                    updateUserError(undefined);
                    updateLoadingUser(false);
                }).catch((err) => {
                    updateUserError(err);
                    updateLoadingUser(false);
                    console.error(`UserError: ${err}`);
                });
            }catch(err){
                updateLoadingUser(false);
                console.error(`UserError: ${err}`);
            };
        // }else if(!loadingUser){
        //     updateUserError('User not found');
        //     updateLoadingUser(false);
        };
        if (errorUser && !loadingUser){
            updateUserError(errorUser);
            updateLoadingUser(false);
        };
        
        // hideLoading();
    
        // window.addEventListener('load', hideLoading);
    
        // return () => {
        //     window.removeEventListener('load', hideLoading);
        // };
        useHideLoading();
    }, [user, loadingUser]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if(ref.current && !ref.current.contains(event.target as Node)){
                if((profileRef.current && !profileRef.current.contains(event.target as Node)))setMenuActive(false);
            }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        setMenuActive(!menuActive);
    };
    const handleMouseEnter = () => {
        clearTimeout(leaveTimeout);
        setMenuActive(true);
    };
    const handleMouseLeave = () => {
        leaveTimeout = setTimeout(() => {
            setMenuActive(false);
        }, 500);
    };

    const mapShortCut = Object.values({
        0: [
            { name: 'Home', path: 'home', icon: <FaHome />, onlyHamburger: false },
            { name: 'Dashboard', path: 'dashboard', icon: <TbLayoutDashboardFilled />, onlyHamburger: false },
            { name: 'Commands', path: 'commands', icon: <BsSlashSquareFill />, onlyHamburger: false },
        ],
        1: [
            { name: 'Support', path: 'support', icon: <IoChatbubblesSharp />, onlyHamburger: false, target: '_blank' }
        ],
        2: [
            { name: 'Donate', path: 'donate', icon: <FaDonate />, onlyHamburger: true },
            profile ? { name: 'Logout', path: 'dashboard/user/logout', icon: <TbLogout />, onlyHamburger: true } : {},
        ],
    }) as ({ name: string; path: string; icon: React.ReactNode; onlyHamburger: boolean; target?: HTMLAttributeAnchorTarget | undefined }[])[];
    
    // if (profile) {
    //     return (
    //     <div>
    //         {/* <AppBarStyle>
    //             <p>{profile.global_name}</p>
    //             {profile.avatar && <img src={getAvatarURL(profile)} alt={profile.username} height={45} width={45} style={{ borderRadius: '50%' }} />}
    //             {!profile.avatar && <img src='https://cdn.discordapp.com/embed/avatars/0.png' alt={profile.username} height={45} width={45} style={{ borderRadius: '50%' }} />}
    //         </AppBarStyle> */}

    //         <div style={{ position: "fixed", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#171717e0", boxShadow: "0 2px 10px 0 rgba(23, 23, 23, 0.88)", top: 0, zIndex: 100, width: "100%", height: 60, maxHeight: "40%", }} >
    //         <div style={{ display: "flex", justifyContent: "space-between", marginLeft: 20, marginRight: 20, width: "100%", }} >
    //             <a href="/" style={{ color: "white", textDecoration: "none", width: 150, fontSize: 20, display: "flex", alignItems: "center", }}>
    //                 <img src="/assets/images/logo2.png" alt="logo" width={40} style={{ borderRadius: 5, marginRight: 15, }} />
    //                 <span>Camming</span>
    //             </a>
    //             <div className={`topBarShortCutLink ${menuActive ? 'mobile-active' : ''}`} style={{ width: "40%", justifyContent: "space-between", alignItems: "center", animation: menuActive ? 'mobile-active-show 0.5s ease-out;' : 'mobile-active-hide 0.5s ease-out;', }}>
    //                 <TopBarShortCutLink href='/homepagetest' isActive={window.location.pathname == '/homepagetest'}>
    //                     <FaHome style={{ marginRight: 10, }} />
    //                     <span>Home</span>
    //                 </TopBarShortCutLink>
    //                 <TopBarShortCutLink isActive={window.location.pathname == '/null'}>
    //                     <span>item2</span>
    //                 </TopBarShortCutLink>
    //                 <TopBarShortCutLink isActive={window.location.pathname == '/null'}>
    //                     <span>item3</span>
    //                 </TopBarShortCutLink>
    //                 <TopBarShortCutLink isActive={window.location.pathname == '/null'}>
    //                     <span>item4</span>
    //                 </TopBarShortCutLink>
    //                 <TopBarShortCutLink isActive={window.location.pathname == '/null'}>
    //                     <span>item5</span>
    //                 </TopBarShortCutLink>
    //             </div>
    //             <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: 150, }}>
    //                 <a style={{ display: "flex", alignItems: "center",  cursor: "pointer", opacity: 0.5, }}>
    //                     {profile.avatar && <img src={getAvatarURL(profile)} alt={profile.username} width={40} />}
    //                     {!profile.avatar && <img src='https://cdn.discordapp.com/embed/avatars/0.png' alt={profile.username} width={40}/>}
    //                 </a>
    //                 <div className="profile" style={{ marginRight: 20, }}/>
    //                 <div className="hamburger profile" onClick={toggleMenu} style={{ alignItems: "center", }}>
    //                     <FaBars color="white" size={20} />
    //                 </div>
    //             </div>
    //         </div>
    //         </div>
    //     </div>
    //     )
    // }

    return (
        <div id="top" style={{ position: "fixed", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#171717e0", boxShadow: "0 2px 10px 0 rgba(23, 23, 23, 0.88)", top: 0, zIndex: 100, width: "100%", height: 60, maxHeight: "40%", }} >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: 20, marginRight: 20, width: "100%", }} >
                <Link href="/" style={{ color: "white", textDecoration: "none", width: 150, fontSize: 20, display: "flex", alignItems: "center", wordBreak: 'normal', }}>
                    {/* <img src="https://assets.yumistack.net/photos/logo/yumi/001.webp" alt="logo" width={40} style={{ borderRadius: 5, marginRight: 15, }} />
                    <span>YUMI</span> */}
                    <img src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/photos/logo/yumi/logo_yumi_text2.png`} alt="YUMI" width={40} style={{ width: 80 }} />
                </Link>

                {/* <div className={`topBarShortCutLink ${menuActive ? 'topBarShortCutLinkHamburger mobile-active' : ''}`} style={{ width: "40%", justifyContent: "space-between", animation: menuActive ? 'mobile-active-show 0.5s ease-out;' : 'mobile-active-hide 0.5s ease-out;', }}>
                    {mapShortCut.map((shortCut)=>{
                        return <TopBarShortCutLink onClick={() => navigate(`/${shortCut.path != 'home' ? shortCut.path : ''}`)} isActive={shortCut.path == 'home' ? window.location.pathname == '/' : window.location.pathname.startsWith(`/${shortCut.path}`)}>
                            {shortCut.icon}
                            <span>{shortCut.name}</span>
                        </TopBarShortCutLink>
                    })}
                </div> */}

                <div className="topBarShortCutLink">
                    <div>
                        {mapShortCut.flat().filter((shortCut) => !shortCut.onlyHamburger).map((shortCut, index) => (
                                <TopBarShortCutLink
                                    key={shortCut.path || index}
                                    href={`/${shortCut.path !== 'home' ? shortCut.path : ''}`}
                                    target={shortCut.target}
                                    $isActive={shortCut.path === 'home' ? pathname === '/' : (pathname?.startsWith(`/${shortCut.path}`) ?? false)}
                                >
                                    {shortCut.icon}
                                    <span>{shortCut.name}</span>
                                </TopBarShortCutLink>
                        ))}
                    </div>
                </div>

                <div ref={profileRef} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: 150, }}>
                    {profile ? (
                        <a className="hamburger barshortcut" onClick={toggleMenu} style={{ display: "flex", alignItems: "center", cursor: "pointer", }}>
                            {profile.avatar ? (
                            <img src={getAvatarURL(profile)} alt={profile.username} width={40} style={{ borderRadius: "50%", }} />
                            ) : (
                            <img src='https://cdn.discordapp.com/embed/avatars/0.png' alt={profile.username} width={40} style={{ borderRadius: "50%", }} />
                            )}
                        </a>
                    ) : loadingUser || loadingProfile ? (
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                            <a style={{ display: "flex", justifyContent: "center", alignItems: "center", cursor: "progress", backgroundColor: "#5973d4", width: 100, height: 40, borderRadius: 5, }}>
                                <Spinner_ring size={40} border={5}/>
                            </a>

                            <div className="barshortcut" style={{ marginRight: 20, }}/>
                            <div className="hamburger barshortcut" onClick={toggleMenu} style={{ alignItems: "center", }}>
                                <FaBars color="white" size={20} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                            <LoginDiscord display="flex" justifyContent="center" alignItems="center" cursor="pointer" backgroundColor={isAdminPage ? '#db5757' : "#5973d4"} width={100} height={40} borderRadius={5} />

                            <div className="barshortcut" style={{ marginRight: 20, }}/>
                            <div className="hamburger barshortcut" onClick={toggleMenu} style={{ alignItems: "center", }}>
                                <FaBars color="white" size={20} />
                            </div>
                        </div>
                    )}
                </div>

                <div className={`hamburgerMenu ${menuActive ? 'active' : ''}`} id="menuBurgerBar" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={ref}>
                    {mapShortCut.map((category, index) => (
                        <div key={index}>
                            {category.map((shortCut, index) => (
                                <TopBarShortCutLink 
                                    key={shortCut.path || index}
                                    href={`/${shortCut.path != 'home' ? shortCut.path : ''}`}
                                    target={shortCut.target}
                                    $isActive={shortCut.path == 'home' ? pathname == '/' : (pathname?.startsWith(`/${shortCut.path}`) ?? false)}
                                    style={{ fontSize: 20, }}
                                >
                                    {shortCut.icon}
                                    <span>{shortCut.name}</span>
                                </TopBarShortCutLink>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};