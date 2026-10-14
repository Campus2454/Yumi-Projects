import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Connecting Bot... | Dashboard',
    description: 'Connecting Yumi Bot authorization to server.',
};

export default function InviteFallbackLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
