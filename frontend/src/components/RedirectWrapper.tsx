'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BackgroundFixed } from "../utils/styles";
import { useEffect, useState } from 'react';
import Link from "next/link";
import Cookies from "js-cookie";

export default function RedirectWrapperPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const route = useRouter();
    const [dot, setDot] = useState('...');

    useEffect(() => {
        const preLoaderBar = document.getElementById('PreLoaderBar');
        if(preLoaderBar){
            preLoaderBar.remove();
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setDot((prevDot) => prevDot + '.');
            if (dot.length > 3) {
                setDot('');
            }
        }, 500);
        return () => {
            clearInterval(interval);
        };
    }, [dot]);

    useEffect(() => {
        const path = searchParams?.get('to');
        console.log(`Path: ${path}, pathname: ${pathname}`);

        if(path == 'discord' || pathname == '/discord'){
            window.location.href = 'https://discord.com/invite/brxPZB3Jzy';
            return;
        }else if(path == 'invite' || pathname == '/invite'){
            window.location.href = 'https://discord.com/oauth2/authorize?client_id=1210178730836893719';
            return;
        }else if(path == 'support' || pathname == '/support'){
            window.location.href = 'https://discord.com/invite/brxPZB3Jzy';
            return;
        }else if(path == 'tos' || pathname == '/tos'){
            window.location.href = '/terms-of-service';
            return;
        }else if(path == 'privacy' || pathname == '/privacy'){
            window.location.href = '/privacy';
            return;
        }else if(path == 'contact' || pathname == '/contact'){
            window.location.href = '/contact';
            return;
        }else if(path == 'login_fallback' || pathname == '/login_fallback'){
            const cookie = Cookies.get('discord_login_redirect');
            let path = '/dashboard';
            if (cookie) {
                Cookies.remove('discord_login_redirect');
                path = cookie;
            };
            window.location.href = path;
            return;
        };

        if(!path){
            router.push('/');
            return;
        }else{
            if(path.startsWith('http')){
                window.location.href = path;
            }else{
                router.replace(path);
            };
        };

    }, [searchParams]);

    return (
        <div className="page">
            <BackgroundFixed id="background" />

            <div style={{ minHeight: 'calc(100vh - 80px)', minWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h1 style={{ fontSize: '4rem', fontWeight: 'bold' }}>Redirecting{dot}</h1>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>We are taking you to the next location.</h3>
                <p style={{ fontSize: '0.8rem', fontWeight: 'lighter', color: '#d5d5d5' }}>If you're not redirected in a few seconds, click <span onClick={() => { window.location.reload(); }} style={{ color: '#ffa1a1', fontWeight: 'bold', cursor: 'pointer' }}>here</span></p>
            </div>
        </div>
    );
}
