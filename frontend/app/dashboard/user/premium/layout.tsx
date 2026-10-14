import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Manage Premium | Dashboard',
    description: 'Manage premium tier and billing.',
    openGraph: {
        title: 'Manage Premium | Dashboard',
        description: 'Manage premium tier and billing.',
    },
};

export default function UserPremiumLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
