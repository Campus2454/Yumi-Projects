import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify',
  description: 'Verify your Discord account or server to gain access to all features in Yumi Bot.',
  openGraph: {
    title: 'Verify | Yumi Bot',
    description: 'Verify your Discord account or server to gain access to all features in Yumi Bot.',
  },
  twitter: {
    title: 'Verify | Yumi Bot',
    description: 'Verify your Discord account or server to gain access to all features in Yumi Bot.',
  }
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
