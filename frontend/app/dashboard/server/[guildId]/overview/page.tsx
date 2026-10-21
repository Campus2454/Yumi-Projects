'use client';
import { useGuildOverview } from "@/src/utils/hooks/useGuildData";
import { OverviewCards, PageHeader } from "@/src/components/DashSections";
import { useParams } from "next/navigation";

export default function ServerOverviewPage() {
    const guildId = useParams().guildId as string;
    const { data } = useGuildOverview(guildId);

    return (
        <div>
            <PageHeader title="Overview" />
            <OverviewCards data={data} />
        </div>
    );
}
