import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your Discord servers, configure plugins, and track statistics with Yumi Bot Dashboard.',
  openGraph: {
    title: 'Dashboard | Yumi Bot',
    description: 'Manage your Discord servers, configure plugins, and track statistics with Yumi Bot Dashboard.',
  },
  twitter: {
    title: 'Dashboard | Yumi Bot',
    description: 'Manage your Discord servers, configure plugins, and track statistics with Yumi Bot Dashboard.',
  }
};

export default function UserOverviewLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
