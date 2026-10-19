'use client';

import { FaDiscord, FaQuestionCircle } from 'react-icons/fa';
import { BackgroundFixed, ButtonSubmit, InputField, Login, Login2 } from "../../src/utils/styles";
import { useEffect, useRef, useState, Suspense } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import axios from 'axios';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const VerifyPage = () => {
    // // const popupRef = useRef<HTMLSpanElement>(null);
    // // const popupLoginClose = (event: React.MouseEvent) => {
    // //     const popup = popupRef.current;
    // //     const link = event.target as HTMLAnchorElement;
        
    // //     if (!popup) return;
        
    // //     // กำหนดตำแหน่งของป๊อปอัพให้ตรงกับตำแหน่งของปุ่ม
    // //     popup.style.left = `${link.offsetLeft}px`;
    // //     popup.style.top = `${link.offsetTop + link.offsetHeight}px`;
        
    // //     // แสดงป๊อปอัพ
    // //     popup.style.display = 'block';
        
    // //     // ซ่อนป๊อปอัพเมื่อคลิกนอกป๊อปอัพ
    // //     document.addEventListener('click', function hidePopup(e) {
    // //         if (!popup.contains(e.target as Node) && !link.contains(e.target as Node)) {
    // //             popup.style.display = 'none';
    // //             document.removeEventListener('click', hidePopup);
    // //         }
    // //     });
    // // };

    // const redirect = (event: React.MouseEvent) => {
    //     window.location.href = 'https://api.yumistack.net/auth/login';
    //     // popupLoginClose(event);
    // };

    // return (
    // <html lang="en">
    //     <head>
    //         <title>Login - Camming</title>
    //     </head>
    //     <div style={{
    //         display: "flex",
    //         flexDirection: "column",
    //         justifyContent: "space-between",
    //         alignItems: "center",
    //         height: "100vh",
    //         width: "100vw",
    //         padding: "20px 0px",
    //         boxSizing: "border-box",
    //     }}>
    //         <div></div>
    //         <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', blockSize: '150px', }}>
    //             <a onClick={redirect}>
    //                 <Login>
    //                 <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '300px', borderRadius: '10px', }}>
    //                     <div style={{ display: 'flex', width: '230px', justifyContent: 'flex-start', alignItems: 'center', }}>
    //                         <FaDiscord size={35} />
    //                         <p style={{paddingLeft: '30px', fontSize: '20px'}}>Login with Discord</p>
    //                     </div>
    //                 </div>
    //                 {/* <div>
    //                     <span>Login temporarily disabled</span>
    //                 </div> */}
    //                 </Login>
    //             </a>
    //             <a href='https://discord.gg/brxPZB3Jzy' target='_blank' style={{ textDecoration: 'none', }}>
    //                 <Login2>
    //                 <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '300px', borderRadius: '10px', color: '#fff', }}>
    //                     <div style={{ display: 'flex', width: '230px', justifyContent: 'flex-start', alignItems: 'center', }}>
    //                         <FaQuestionCircle size={35}/>
    //                         <p style={{paddingLeft: '30px', fontSize: '20px'}}>Support server</p>
    //                     </div>
    //                 </div>
    //             </Login2></a>
    //         </div>
    //         <div style={{ display: 'flex', width: '400px', justifyContent: 'space-between' }}>
    //             <span>Privacy Policy</span>
    //             <span>Terms of Service</span>
    //             <span>Contact Us</span>
    //         </div>
    //     </div>
    // </html>
    // )

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


// const [token, setToken] = useState('');
//     const [devPass, setDevPass] = useState('');
//     const next

//     const handleSubmit = async(e: React.FormEvent) => {
//         e.preventDefault();
//         try{
//             const res = await axios.post('https://api.yumistack.net/turnstile/verify', { turnstileToken: token, });
    
//             console.log(res.data.message);
//         }catch(error){
//             console.error('Failed verification', error);
//             alert("Failed verification");
//         }
//     };

//     const handleDevSubmit = async(e: React.FormEvent) => {
//         e.preventDefault();
//         try{
//             const res = await axios.post('http://173.249.0.115:3001/turnstile/verify', { devPass, });
            
//             alert("Hello Dev! :)");
//             window.location.href = 'http://173.249.0.115:3001/auth/v2/login';
//         }catch(error){
//             alert(`Incorrect password!`);
//         }
//     };
    
//     // if(window.location.hostname == hostname){window.location.href = 'https://api.yumistack.net/auth/login'}
//     // else{window.location.href = 'http://173.249.0.115:3001/auth/v2/login'}

//     return(
//         <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', textAlign: 'center', justifyContent: 'center' }}>
//             <BackgroundFixed id="background"/>

//             <div>
//                 <h1 style={{ fontWeight: '900', margin: 0 }}>Wait a sec!</h1>
//                 <form onSubmit={handleSubmit}>
//                     <Turnstile siteKey="0x4AAAAAAA6shYNiDgTY5AUQ" onSuccess={setToken} style={{ marginTop: 10 }}/>
//                     <ButtonSubmit type="submit" disabled={!devPass || !token}>Submit</ButtonSubmit>
//                 </form>
//             </div>
//         </div>
//     )