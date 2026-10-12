import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Read the Privacy Policy for Yumi Bot. We care about your data privacy and security.',
  openGraph: {
    title: 'Privacy | Yumi Bot',
    description: 'Read the Privacy Policy for Yumi Bot. We care about your data privacy and security.',
  },
  twitter: {
    title: 'Privacy | Yumi Bot',
    description: 'Read the Privacy Policy for Yumi Bot. We care about your data privacy and security.',
  }
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
