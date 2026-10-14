'use client';
import { useContext, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { GuildContext, MapGuildsContext, ErrorPopupContext } from "@/src/utils/contexts/Contexts";
import { useFetchGuilds } from "@/src/utils/hooks/useFetchGuilds";
import { BackgroundFixed, DashPage, DashPanel } from "@/src/utils/styles";
import { FullLayoutSkeleton } from "@/src/components/DashboardSkeleton";
import Link from "next/link";

export default function ServerLayoutClient({ children }: { children: React.ReactNode }) {
    const { guild, updateGuild } = useContext(GuildContext);
    const { loadingGuilds, errorGuilds, guilds } = useContext(MapGuildsContext);
    const { updateErrorPopup: setErrorPopup } = useContext(ErrorPopupContext);
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const fetchGuilds = useFetchGuilds();
    const guildId = params?.guildId as string;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    useEffect(() => {
        if (!guildId) return;
        if (!guild || guild.id !== guildId) {
            fetchGuilds();
            if (loadingGuilds && !errorGuilds) return;
            if (guilds && guilds.length > 0) {
                const g = guilds.find((x) => x.id === guildId);
                if (!g) {
                    setErrorPopup({ title: 'Loading Guild Error', message: 'No guilds found', show: true });
                    router.push(`/dashboard?to=server/${guildId}`);
                    return;
                }
                updateGuild(g);
            } else if (errorGuilds) {
                setErrorPopup({ title: 'Loading Guild Error', message: `${errorGuilds}`, show: true });
                router.push('/dashboard');
            }
        }
    }, [guildId, guild, guilds, loadingGuilds, errorGuilds]);

    // useEffect(() => {
    //     if (guild) {
    //         const page = pathname.split('/')[4] || 'Overview';
    //         const formattedPage = page.charAt(0).toUpperCase() + page.slice(1);
    //         document.title = `${formattedPage}・${guild.name}`;
    //     }
    // }, [pathname, guild]);

    if (guild && !guild.bot_here) {
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
