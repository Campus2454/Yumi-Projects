import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support the development of Yumi Bot. Your contributions help keep the bot running 24/7.',
  openGraph: {
    title: 'Donate | Yumi Bot',
    description: 'Support the development of Yumi Bot. Your contributions help keep the bot running 24/7.',
  },
  twitter: {
    title: 'Donate | Yumi Bot',
    description: 'Support the development of Yumi Bot. Your contributions help keep the bot running 24/7.',
  }
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
