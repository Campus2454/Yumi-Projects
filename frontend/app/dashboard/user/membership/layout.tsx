import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Membership | Dashboard',
    description: 'User membership status and subscriptions.',
    openGraph: {
        title: 'Membership | Dashboard',
        description: 'User membership status and subscriptions.',
    },
};

export default function UserMembershipLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
