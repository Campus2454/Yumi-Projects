import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Welcome & Goodbye | Server Dashboard',
    description: 'Configure automated welcome and goodbye messages, embeds, and channel notifications.',
    openGraph: {
        title: 'Welcome & Goodbye | Server Dashboard',
        description: 'Configure automated welcome and goodbye messages, embeds, and channel notifications.',
    },
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
