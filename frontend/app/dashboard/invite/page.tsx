'use client';
import { useContext } from "react";
import { GuildContext } from "@/src/utils/contexts/Contexts";
import { BackgroundFixed } from "@/src/utils/styles";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function InvitePage() {
    const { guild } = useContext(GuildContext);
    const params = useParams();
    const guildId = (params?.guildId as string) || guild?.id;
    const currentGuild = guild?.id === guildId ? guild : undefined;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return (
        <div className="page" id="page">
            <BackgroundFixed id="background" />
            <div style={{ height: "calc(100vh - 60px)", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <div id="page" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <div style={{ fontSize: '1.5rem' }}>This server does not have Yumi Bot.</div>
                        <br />
                        <div style={{ fontSize: '1.2rem' }}>Please invite Yumi Bot to this server.</div>
                        <br />
                        <Link
                            href={`https://discord.com/oauth2/authorize?client_id=1210178730836893719&scope=bot+applications.commands&guild_id=${currentGuild?.id || guildId || ''}&response_type=code&redirect_uri=${origin}/dashboard/invite_fallback`}
                            style={{ color: '#fff', textDecoration: 'none', backgroundColor: '#4d7cff', padding: '10px 10px', borderRadius: 5 }}
                        >
                            Invite Yumi Bot
                        </Link>
                        <span>or</span>
                        <Link
                            href={'/dashboard'}
                            style={{ color: '#fff', textDecoration: 'none', backgroundColor: '#ff3333', padding: '10px 40px', borderRadius: 5, marginTop: 10, cursor: 'pointer' }}
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
