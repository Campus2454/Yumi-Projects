'use client';
import { useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserContext, ErrorPopupContext } from "@/src/utils/contexts/Contexts";
import { BackgroundFixed, DashPage, DashPanel } from "@/src/utils/styles";
import { FullLayoutSkeleton } from "@/src/components/DashboardSkeleton";

export default function UserLayoutClient({ children }: { children: React.ReactNode }) {
    const { user: profile, loadingUser, userError } = useContext(UserContext);
    const { updateErrorPopup: setErrorPopup } = useContext(ErrorPopupContext);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loadingUser && !profile) {
            const sub = pathname.split('/')[3] || '';
            const path = `/dashboard?to=user/${sub}`;
            if (userError) {
                setErrorPopup({ title: 'Loading User Error', message: `${userError}`, show: true });
            }
            router.push(path);
        }
    }, [profile, loadingUser, userError, pathname, router, setErrorPopup]);

    useEffect(() => {
        if (profile) {
            const page = pathname.split('/')[3] || 'Overview';
            const formattedPage = page.charAt(0).toUpperCase() + page.slice(1);
            document.title = `${formattedPage}・${profile.global_name || profile.username}`;
        }
    }, [pathname, profile]);

    if (loadingUser || !profile) {
        return (
            <div className="page" id="page">
                <BackgroundFixed id="background" />
                <div style={{ height: "100vh", width: "100%", padding: '40px 20px', boxSizing: 'border-box' }}>
                    <FullLayoutSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="page" id="page">
            <BackgroundFixed id="background" />
            <div style={{ marginTop: '60px' }} />
            <DashPage>
                <div>
                    <DashPanel id="panel" key={pathname}>
                        <div>
                            <div id="user" className="show">
                                {children}
                            </div>
                        </div>
                    </DashPanel>
                </div>
            </DashPage>
        </div>
    );
}
