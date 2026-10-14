'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullLayoutSkeleton } from "@/src/components/DashboardSkeleton";

export default function UserIndexPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/user/overview');
    }, [router]);

    return <FullLayoutSkeleton />;
}
