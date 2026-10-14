import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Embeds | Server Dashboard',
    description: 'Create and send Discord embeds and webhook messages.',
    openGraph: {
        title: 'Embeds | Server Dashboard',
        description: 'Create and send Discord embeds and webhook messages.',
    },
};

export default function SendLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
