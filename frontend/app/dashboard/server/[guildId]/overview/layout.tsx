import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Overview | Server Dashboard',
    description: 'Server statistics, member count, channel information, and security overview.',
    openGraph: {
        title: 'Overview | Server Dashboard',
        description: 'Server statistics, member count, channel information, and security overview.',
    },
};

export default function OverviewLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
