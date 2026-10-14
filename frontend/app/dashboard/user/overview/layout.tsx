import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'User Info | Dashboard',
    description: 'View Discord username, avatar, and ID details.',
    openGraph: {
        title: 'User Info | Dashboard',
        description: 'View Discord username, avatar, and ID details.',
    },
};

export default function UserOverviewLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
