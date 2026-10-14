import { Metadata } from 'next';
import ServerLayoutClient from './ServerLayoutClient';

export async function generateMetadata({ params }: { params: Promise<{ guildId: string }> }): Promise<Metadata> {
    const { guildId } = await params;
    return {
        title: `Server Dashboard`,
        description: `Manage Discord server ${guildId} with Yumi Bot`,
        openGraph: {
            title: `Server Dashboard | Yumi Bot`,
            description: `Manage Discord server ${guildId} with Yumi Bot`,
        },
    };
}

export default function ServerLayout({ children }: { children: React.ReactNode }) {
    return <ServerLayoutClient>{children}</ServerLayoutClient>;
}
