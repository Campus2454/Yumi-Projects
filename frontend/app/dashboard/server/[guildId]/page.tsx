'use client';
import { FullLayoutSkeleton } from "@/src/components/DashboardSkeleton";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ServerIndexPage() {
    const params = useParams();
    const router = useRouter();
    const guildId = params?.guildId as string;

    useEffect(() => {
        if (guildId) {
            router.replace(`/dashboard/server/${guildId}/overview`);
        }
    }, [guildId, router]);

    return <FullLayoutSkeleton />;
}
