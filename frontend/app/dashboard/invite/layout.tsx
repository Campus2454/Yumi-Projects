import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invite Bot | Dashboard',
    description: 'Invite Yumi Bot to your Discord server.',
    openGraph: {
        title: 'Invite Bot | Dashboard',
        description: 'Invite Yumi Bot to your Discord server.',
    },
};

export default function InviteLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
