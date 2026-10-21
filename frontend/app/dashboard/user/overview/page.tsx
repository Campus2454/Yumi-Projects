'use client';
import { useContext } from "react";
import { UserContext } from "@/src/utils/contexts/Contexts";
import { PageHeader, UserInfoRows } from "@/src/components/DashSections";
import { getAvatarURL } from "@/src/utils/getURL";

export default function UserOverviewPage() {
    const { user: profile } = useContext(UserContext);

    return (
        <div>
            <PageHeader title="User Info" />
            <UserInfoRows
                profile={profile}
                avatarLink={profile && <a href={getAvatarURL(profile)} target="_blank" rel="noreferrer" style={{ color: '#8abbff' }}>{profile.avatar}</a>}
            />
        </div>
    );
}
