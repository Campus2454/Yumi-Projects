import { PageHeader, WelcomeCardSkeleton } from "@/src/components/DashSections";

export default function WelcomeLoading() {
    return (
        <div>
            <PageHeader title="Welcome & Goodbye" />
            <WelcomeCardSkeleton id="welcome" name="Welcome" />
            <WelcomeCardSkeleton id="goodbye" name="Goodbye" />
        </div>
    );
}
