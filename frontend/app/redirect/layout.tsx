import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirecting...',
  description: 'Please wait while we redirect you to your destination.',
  openGraph: {
    title: 'Redirecting... | Yumi Bot',
    description: 'Please wait while we redirect you to your destination.',
  },
  twitter: {
    title: 'Redirecting... | Yumi Bot',
    description: 'Please wait while we redirect you to your destination.',
  }
};

export default function RedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
