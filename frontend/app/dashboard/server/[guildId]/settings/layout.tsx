import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Server Settings | Server Dashboard',
    description: 'Configure bot language and command prefix.',
    openGraph: {
        title: 'Server Settings | Server Dashboard',
        description: 'Configure bot language and command prefix.',
    },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
