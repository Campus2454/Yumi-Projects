'use client';
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ServerMainRedirectPage() {
    const params = useParams();
    const router = useRouter();
    const guildId = params?.guildId as string;

    useEffect(() => {
        if (guildId) {
            router.replace(`/dashboard/server/${guildId}/overview`);
        }
    }, [guildId, router]);

    return null;
}
