import { Metadata } from 'next';
import DashSidebar from './DashSidebar';
import UserLayoutClient from './user/UserLayoutClient';

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

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {

  return (
    <div className="dashboard-layout">
      <DashSidebar />
      
      {children}
    </div>
  );
}
