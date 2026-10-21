'use client';
import { useContext } from "react";
import { UserContext } from "@/src/utils/contexts/Contexts";
import { useGuildList } from "@/src/utils/hooks/useGuildData";
import { PageHeader } from "@/src/components/DashSections";
import { UserOverview, UserOverviewSkeleton } from "@/src/components/UserOverview";

export default function UserOverviewPage() {
  const { user: profile } = useContext(UserContext);
  const { guilds, loadingGuilds } = useGuildList();

  return (
    <div>
      <PageHeader title="User Info" />
      {profile ? (
        <UserOverview profile={profile} guilds={guilds} loadingGuilds={loadingGuilds} />
      ) : (
        <UserOverviewSkeleton />
      )}
    </div>
  );
}
