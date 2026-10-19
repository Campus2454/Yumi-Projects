'use client';

import { BackgroundFixed } from "../../src/utils/styles";

export default function DonatePage() {
    return (
        <div className="page">
            <BackgroundFixed id="background"/>
        
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
                <div style={{ margin: 10, marginTop: 70, minWidth: '70vw', }}>
                    <div style={{ fontSize: '36px', fontWeight: 900, }}>Donate</div>
            
                    <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }}/>
            
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
                        <div><span style={{ color: '#e57676', }}>Note:</span> You will not receive any additional privileges for donating to us.</div>
                        <img src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/photos/qr_promptpay.webp`} loading="lazy" style={{ borderRadius: 10, width: '50%', }} />
                    </div>
                </div>
            </div>
        </div>
    );
}