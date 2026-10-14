import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Upgrade Bot | Server Dashboard',
    description: 'Upgrade your Yumi Bot subscription.',
    openGraph: {
        title: 'Upgrade Bot | Server Dashboard',
        description: 'Upgrade your Yumi Bot subscription.',
    },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
