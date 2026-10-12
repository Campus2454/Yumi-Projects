import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Yumi Bot handles and protects your data.',
  openGraph: {
    title: 'Privacy Policy | Yumi Bot',
    description: 'Learn how Yumi Bot handles and protects your data.',
  },
  twitter: {
    title: 'Privacy Policy | Yumi Bot',
    description: 'Learn how Yumi Bot handles and protects your data.',
  }
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
