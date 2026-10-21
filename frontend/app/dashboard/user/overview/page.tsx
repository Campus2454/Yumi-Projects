'use client';
import { useContext } from "react";
import { UserContext } from "@/src/utils/contexts/Contexts";
import { useGuildList } from "@/src/utils/hooks/useGuildData";
import {
  UserOverviewContainer,
  UserProfileHero,
  UserStatsGrid,
  UserQuickActions,
  UserManagedServersHub,
  UserOverviewSkeleton,
} from "@/src/components/UserOverviewSections";

export default function UserOverviewPage() {
  const { user: profile, loadingUser } = useContext(UserContext);
  const { guilds, loadingGuilds } = useGuildList();

  if (loadingUser && !profile) {
    return <UserOverviewSkeleton />;
  }

  return (
    <UserOverviewContainer>
      <UserProfileHero profile={profile} />
      <UserStatsGrid
        profile={profile}
        guildCount={guilds?.length || 0}
        loading={loadingGuilds}
      />
      <UserQuickActions />
      <UserManagedServersHub guilds={guilds} loading={loadingGuilds} />
    </UserOverviewContainer>
  );
}
