import { PageHeader } from "@/src/components/DashSections";
import { UserOverviewSkeleton } from "@/src/components/UserOverview";

export default function UserOverviewLoading() {
  return (
    <div>
      {/* <PageHeader title="User Info" /> */}
      <UserOverviewSkeleton />
    </div>
  );
}
