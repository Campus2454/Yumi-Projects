'use client';
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GuildContext, ErrorPopupContext } from "@/src/utils/contexts/Contexts";
import { DashPageServerFunctionSend } from "@/src/utils/styles";
import { TbPlus } from "react-icons/tb";

export default function ServerSendPage() {
    const { guild } = useContext(GuildContext);
    const { updateErrorPopup: setErrorPopup } = useContext(ErrorPopupContext);
    const router = useRouter();

    const ip = process.env.NEXT_PUBLIC_API_IP || "148.113.174.253";

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hostname !== ip) {
            router.push(`/dashboard/server/${guild?.id || '0'}/overview`);
            setErrorPopup({
                title: 'Sorry!',
                message: 'This function is currently unavailable.',
                show: true,
            });
        }
    }, []);

    return (
        <div>
            <div id='title'>Embeds</div>

            <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px' }} />

            <DashPageServerFunctionSend>
                <div id="new"><TbPlus />Create a new embed</div>
            </DashPageServerFunctionSend>
        </div>
    );
}
