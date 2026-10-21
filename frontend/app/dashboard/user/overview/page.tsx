'use client';
import { useContext } from "react";
import { UserContext } from "@/src/utils/contexts/Contexts";
import { useGuildList } from "@/src/utils/hooks/useGuildData";
import { PageHeader, UserOverview } from "@/src/components/DashSections";

export default function UserOverviewPage() {
  const { user: profile } = useContext(UserContext);
  const { guilds, loadingGuilds } = useGuildList();

  return (
    <div>
      {/* <PageHeader title="User Info" /> */}
      <UserOverview profile={profile} guilds={guilds} loadingGuilds={loadingGuilds} />
    </div>
  );
}
