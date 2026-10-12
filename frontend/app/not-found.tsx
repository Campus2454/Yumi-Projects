'use client';

import { BackgroundFixed, NotFoundImg, NotFoundText } from "../src/utils/styles";
import { usePathname } from "next/navigation";

const domain = process.env.NEXT_PUBLIC_HOSTNAME || 'yumistack.net';

export default function NotFound() {
    const pathname = usePathname();
    return (
        <div className="page">
            <BackgroundFixed id="background" style={{ backgroundImage: `url(https://assets.${domain}/photos/not-found/yumi/002.webp)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', filter: "brightness(0.7)", }} />


            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", margin: 0, overflowX: "hidden", textAlign: "center", }}>
                <NotFoundText style={{ top: "10%", position: "absolute", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <p style={{ fontSize: "100px", fontWeight: "bold", color: "#ff6e6eff", textShadow: "2px 2px 5px #000", margin: 0, }}>404</p>
                    <p style={{ fontSize: "25px", textShadow: "2px 2px 3px #000", margin: 0, display: "flex", flexDirection: "row", }}>Page not found:<span style={{ color: "#ffc6c6ff", marginLeft: 5, }}>{pathname}</span></p>
                </NotFoundText>
            </div>

        </div>
    );
}
