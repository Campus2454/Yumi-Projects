import { PageHeader, SettingsFields } from "@/src/components/DashSections";

export default function SettingsLoading() {
    return (
        <div>
            <PageHeader title="Server Settings" />
            <SettingsFields />
        </div>
    );
}
