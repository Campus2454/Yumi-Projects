'use client';
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { BackgroundFixed } from "@/src/utils/styles";
import { FullLayoutSkeleton } from "@/src/components/DashboardSkeleton";

function InviteFallbackContent() {
    const searchParamUrl = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const guildId = searchParamUrl.get('guild_id');
        const code = searchParamUrl.get('code');

        if (guildId && code) {
            router.push(`/dashboard/server/${guildId}/overview`);
        } else {
            router.push(`/dashboard`);
        }
    }, [searchParamUrl, router]);

    return (
        <div className="page" id="page">
            <BackgroundFixed id="background" />
            <div style={{ height: "100vh", width: "100%", padding: '40px 20px', boxSizing: 'border-box' }}>
                <FullLayoutSkeleton />
            </div>
        </div>
    );
}

export default function InviteFallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="page" id="page">
                    <BackgroundFixed id="background" />
                    <div style={{ height: "100vh", width: "100%", padding: '40px 20px', boxSizing: 'border-box' }}>
                        <FullLayoutSkeleton />
                    </div>
                </div>
            }
        >
            <InviteFallbackContent />
        </Suspense>
    );
}
