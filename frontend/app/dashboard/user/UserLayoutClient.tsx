'use client';
import { useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserContext, ErrorPopupContext } from "@/src/utils/contexts/Contexts";
import { BackgroundFixed, DashPage, DashPanel } from "@/src/utils/styles";
import { useState } from "react";
import Link from "next/link";
import { BsExclamationTriangle } from "react-icons/bs";

export default function UserLayoutClient({ children }: { children: React.ReactNode }) {
    const { user: profile, loadingUser, userError } = useContext(UserContext);
    const { updateErrorPopup: setErrorPopup } = useContext(ErrorPopupContext);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
    const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
    const apiIp = process.env.NEXT_PUBLIC_API_IP_URL;
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loadingUser && !profile) {
            const sub = pathname.split('/')[3] || '';
            // const path = `/dashboard?to=user/${sub}`;
            // if (userError) {
            //     setErrorPopup({ title: 'Loading User Error', message: `${userError}`, show: true });
            // }
            console.log('Loading User Error:', userError);
            setShowLoginPopup(true);
            // router.push(path);
        }
    }, [profile, loadingUser, userError, pathname, router]);

    useEffect(() => {
        if (profile) {
            const page = pathname.split('/')[3] || 'Overview';
            const formattedPage = page.charAt(0).toUpperCase() + page.slice(1);
            document.title = `${formattedPage}・${profile.global_name || profile.username}`;
        }
    }, [pathname, profile]);

    return (
        <div className="page" id="page">
            <BackgroundFixed id="background" />
            <div style={{ marginTop: '60px' }} />
            <DashPage>
                <div>
                    <DashPanel id="panel" key={pathname}>
                        <div>
                            <div id="user" className="show">
                                {children}
                            </div>
                        </div>
                    </DashPanel>
                </div>

                {<>
                    <div style={{
                        position: 'absolute',
                        top: 60,
                        left: 0,
                        right: 0,
                        width: '100vw',
                        height: 'calc(100vh - 60px)',
                        overflow: 'hidden',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: showLoginPopup ? 1000 : -1000,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backdropFilter: 'blur(20px) grayscale(80%)',
                        transition: 'all 0.5s ease-in-out',
                        transitionDelay: '0.1s',
                        opacity: showLoginPopup ? 1 : 0,
                        pointerEvents: showLoginPopup ? 'auto' : 'none',
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            alignItems: 'center',
                            backgroundColor: '#292c2f',
                            padding: '20px',
                            borderRadius: '10px',
                            width: 'fit-content',
                            height: 'fit-content',
                            border: '2px solid #5973d4',
                            scale: showLoginPopup ? 1 : 0.8,
                            transition: 'all 0.5s ease-in-out',
                            transitionDelay: '0.1s',
                        }}>
                            <div style={{ fontSize: 20, fontWeight: 'bold', padding: '0 50px' }}>Please log in first.</div>
                            <Link href={`/verify?redirect=${typeof window !== 'undefined' && window.location.hostname == process.env.NEXT_PUBLIC_HOSTNAME 
                                    ? `${process.env.NEXT_PUBLIC_API_DOMAIN}/auth/login` 
                                    : `${process.env.NEXT_PUBLIC_API_IP_URL}/auth/v2/login`
                            }`} style={{ display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", backgroundColor: "#5973d4", width: 100, height: 40, borderRadius: 5, }}>
                                Login
                            </Link>
                        </div>
                    </div>
                </>}
            </DashPage>
        </div>
    );
}
