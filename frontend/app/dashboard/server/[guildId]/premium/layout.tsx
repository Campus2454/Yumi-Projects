import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Bot Premium | Server Dashboard',
    description: 'Yumi Bot subscription plans, features, and pricing table.',
    openGraph: {
        title: 'Bot Premium | Server Dashboard',
        description: 'Yumi Bot subscription plans, features, and pricing table.',
    },
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
