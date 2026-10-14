'use client';
import { useContext } from "react";
import { UserContext } from "@/src/utils/contexts/Contexts";
import { DashPageServerGeneralInfo } from "@/src/utils/styles";
import { getAvatarURL } from "@/src/utils/getURL";

export default function UserOverviewPage() {
    const { user: profile } = useContext(UserContext);

    if (!profile) return null;

    return (
        <div>
            <div id='title'>User Info</div>

            <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px' }} />

            <DashPageServerGeneralInfo>
                <div id="name">Name : {profile.username}</div>
                {profile.avatar ? (
                    <div id="icon">
                        Icon : <a href={getAvatarURL(profile)} target="_blank" rel="noreferrer" style={{ color: '#8abbff' }}>{profile.avatar}</a>
                    </div>
                ) : null}
                <div id="id">Id : {profile.id}</div>
            </DashPageServerGeneralInfo>
        </div>
    );
}
