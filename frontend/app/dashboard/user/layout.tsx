import { Metadata } from 'next';
import UserLayoutClient from './UserLayoutClient';

export const metadata: Metadata = {
    title: 'User Settings | Dashboard',
    description: 'Manage Discord user profile, membership, and account settings.',
    openGraph: {
        title: 'User Settings | Dashboard',
        description: 'Manage Discord user profile, membership, and account settings.',
    },
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return <UserLayoutClient>{children}</UserLayoutClient>;
}
