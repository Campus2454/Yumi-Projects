import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Logout | Dashboard',
    description: 'Log out of your account.',
    openGraph: {
        title: 'Logout | Dashboard',
        description: 'Log out of your account.',
    },
};

export default function UserLogoutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
