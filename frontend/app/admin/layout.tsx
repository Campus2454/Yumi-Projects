import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Yumi Bot Administrator Panel. For authorized personnel only.',
  openGraph: {
    title: 'Admin Panel | Yumi Bot',
    description: 'Yumi Bot Administrator Panel. For authorized personnel only.',
  },
  twitter: {
    title: 'Admin Panel | Yumi Bot',
    description: 'Yumi Bot Administrator Panel. For authorized personnel only.',
  }
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
