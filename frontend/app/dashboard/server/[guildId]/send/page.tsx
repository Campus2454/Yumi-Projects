'use client';
import { useContext, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GuildContext, ErrorPopupContext } from "@/src/utils/contexts/Contexts";
import { DashPageServerFunctionSend } from "@/src/utils/styles";
import { TbPlus } from "react-icons/tb";
import { PageHeader } from "@/src/components/DashSections";

export default function ServerSendPage() {
    const { guild } = useContext(GuildContext);
    const { updateErrorPopup: setErrorPopup } = useContext(ErrorPopupContext);
    const router = useRouter();
    const guildId = (useParams().guildId as string | undefined) || guild?.id;

    const ip = process.env.NEXT_PUBLIC_API_IP;

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hostname !== ip) {
            router.push(`/dashboard/server/${guildId}/overview`);
            setErrorPopup({
                title: 'Sorry!',
                message: 'This function is currently unavailable.',
                show: true,
            });
        }
    }, []);

    return (
        <div>
            <PageHeader title="Embeds" />

            <DashPageServerFunctionSend>
                <div id="new"><TbPlus />Create a new embed</div>
            </DashPageServerFunctionSend>
        </div>
    );
}
