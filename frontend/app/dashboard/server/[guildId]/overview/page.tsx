'use client';
import { useContext } from "react";
import { GuildContext } from "@/src/utils/contexts/Contexts";
import { DashPageServerOverview } from "@/src/utils/styles";
import { FaHashtag, FaUsers } from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import { OverviewSkeleton } from "@/src/components/DashboardSkeleton";
import { useParams } from "next/navigation";

export default function ServerOverviewPage() {
    const { guild } = useContext(GuildContext);
    const params = useParams();
    const guildId = params.guildId as string;

    if (!guild || guild.id !== guildId) return <OverviewSkeleton />;

    return (
        <div>
            <div id='title'>Overview</div>

            <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px' }} />

            <DashPageServerOverview>
                <div id='total_members' style={{ backgroundColor: 'rgba(137, 43, 226, 0.3)', borderColor: 'blueviolet' }}>
                    <div id="title">
                        <FaUsers id="icon" style={{ backgroundColor: '#bd24ff' }} />
                        <h1>Total Members</h1>
                    </div>
                    <div id="main">{guild.data.members?.length || 0}</div>
                    <div id="sub">
                        <h4>Bots: {guild.data.members?.filter(m => m.user.bot === true)?.length || 0}</h4>
                    </div>
                </div>
                <div id='channels' style={{ backgroundColor: 'rgba(43, 226, 61, 0.3)', borderColor: '#00fa00' }}>
                    <div id="title">
                        <FaHashtag id="icon" style={{ backgroundColor: '#0a7e18ff' }} />
                        <h1>Channels</h1>
                    </div>
                    <div id="sub">
                        <h4>Text channels: {guild.data.channels?.filter(c => c.type === 0).length || 0}</h4>
                        <h4>Voice channels: {guild.data.channels?.filter(c => c.type === 2).length || 0}</h4>
                    </div>
                </div>
                <div id='security' style={{ backgroundColor: 'rgba(226, 43, 147, 0.3)', borderColor: 'pink' }}>
                    <div id="title">
                        <FaShield id="icon" style={{ backgroundColor: '#ff24d3ff' }} />
                        <h1>Security</h1>
                    </div>
                    <div id="sub">
                        <h4>Status: disabled</h4>
                        <h4>Warnings Count: 0</h4>
                    </div>
                </div>
            </DashPageServerOverview>
        </div>
    );
}
