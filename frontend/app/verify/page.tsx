'use client';

import { FaDiscord, FaQuestionCircle } from 'react-icons/fa';
import { BackgroundFixed, ButtonSubmit, InputField, Login, Login2 } from "../../src/utils/styles";
import { useEffect, useRef, useState, Suspense } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import axios from 'axios';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const VerifyPage = () => {
    const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
    const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
    const apiIp = process.env.NEXT_PUBLIC_API_IP_URL;

    const searchParams = useSearchParams();
    const router = useRouter();
    const redirectUrl = searchParams?.get('redirect');
    
    useEffect(() => {
        if(!redirectUrl && typeof window !== 'undefined'){
            window.history.back();
        }
    }, [redirectUrl]);

    if(!redirectUrl){
        return null;
    }

    const handleSubmit = async(token: string) => {
        try{
            const url = typeof window !== 'undefined' && window.location.hostname === hostname ? `${apiDomain}/turnstile/verify` : `${apiIp}/turnstile/verify`;
            const res = await axios.post(url, { token, })
    
            if(res.data.success){
                if(redirectUrl.startsWith('http')){
                    window.location.href = `/redirect?to=${redirectUrl}`;
                }else{
                    router.push(redirectUrl);
                };
            }else{
                alert("Failed verification");
                if (typeof window !== 'undefined') window.history.back();
            };
        }catch(error){
            console.error('Failed verification', error);
            alert("Failed verification");
            if (typeof window !== 'undefined') window.history.back();
        }
    };

    const handleError = (err: string) => {
        alert(`Failed verification: \n${err}`);
        if (typeof window !== 'undefined') window.history.back();
    };

    return (
        <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', height: "70vh" }}>
            <BackgroundFixed id="background"/>

            <div>
                <h1 style={{ fontWeight: '900', margin: 0 }}>Wait a sec!</h1>
                <h3>Please complete the verification below.</h3>
                <Turnstile siteKey="0x4AAAAAAA6shYNiDgTY5AUQ" onSuccess={(token)=>handleSubmit(token)} onError={handleError} onTimeout={()=>handleError('Timeout')} onExpire={()=>handleError('Expire')} style={{ marginTop: 10 }}/>
            </div>
        </div>
    );
}

export default function VerifyPageWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyPage />
        </Suspense>
    );
}

