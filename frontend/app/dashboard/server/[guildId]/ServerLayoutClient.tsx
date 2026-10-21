'use client';
import { useContext, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { GuildContext, ErrorPopupContext } from "@/src/utils/contexts/Contexts";
import { useGuildInfo } from "@/src/utils/hooks/useGuildData";
import { BackgroundFixed, DashPage, DashPanel } from "@/src/utils/styles";
import { FullLayoutSkeleton } from "@/src/components/DashboardSkeleton";
import Link from "next/link";

export default function ServerLayoutClient({ children }: { children: React.ReactNode }) {
    const { guild, updateGuild } = useContext(GuildContext);
    const { updateErrorPopup: setErrorPopup } = useContext(ErrorPopupContext);
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const guildId = params?.guildId as string;
    const { data: info, error } = useGuildInfo(guildId);

    useEffect(() => {
        if (info && info.id === guildId && guild?.id !== guildId) updateGuild(info);
    }, [info, guildId]);

    useEffect(() => {
        if (!error) return;
        // setErrorPopup({ title: 'Loading Guild Error', message: `${error}`, show: true });
        console.log('Loading Guild Error:', error);
        router.push(`/dashboard?to=server/${guildId}`);
    }, [error]);

    // useEffect(() => {
    //     if (guild) {
    //         const page = pathname.split('/')[4] || 'Overview';
    //         const formattedPage = page.charAt(0).toUpperCase() + page.slice(1);
    //         document.title = `${formattedPage}・${guild.name}`;
    //     }
    // }, [pathname, guild]);

    if (info && info.id === guildId && !info.bot_here) {
        router.push(`/dashboard/invite/${guildId}`);
        return <></>;
    }

    // if (!guild || guild.id !== guildId) {
    //     return (
    //         <div className="page" id="page">
    //             <BackgroundFixed id="background" />
    //             <div style={{ height: "100vh", width: "100%", padding: '40px 20px', boxSizing: 'border-box' }}>
    //                 <FullLayoutSkeleton />
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="page" id="page">
            <BackgroundFixed id="background" />
            <div style={{ marginTop: '60px' }} />
            <DashPage>
                <div>
                    <DashPanel id="panel" key={pathname}>
                        <div>
                            <div id="server" className="show">
                                {children}
                            </div>
                        </div>
                    </DashPanel>
                </div>
            </DashPage>
        </div>
    );
}
