import { Providers } from '../src/components/Providers';
import './globals.css';
import StyledComponentsRegistry from './StyledComponentsRegistry';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Yumi - Discord Bot',
    template: '%s | Yumi Bot'
  },
  description: 'Yumi Bot - The ultimate Discord bot for managing your server with various features.',
  keywords: ['Yumi Bot', 'Yumi Discord Bot', 'Discord Bot', 'Bot Yumi', 'Discord management bot'],
  openGraph: {
    type: 'website',
    title: 'Yumi Bot - Discord Bot',
    description: 'Yumi Bot helps you manage your Discord server with ease and efficiency. Learn more and get started with Yumi today!',
    images: ['https://assets.yumistack.net/photos/logo/yumi/banner_yumi_02.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yumi Bot - Discord Bot',
    description: 'Yumi Bot helps you manage your Discord server with ease and efficiency. Learn more and get started with Yumi today!',
    images: ['https://assets.yumistack.net/photos/logo/yumi/banner_yumi_02.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://assets.yumistack.net/photos/logo/yumi/logo_yumi_text2.png" />
        <link href='https://fonts.googleapis.com/css?family=Kanit' rel='stylesheet' />
      </head>
      <body>
        <StyledComponentsRegistry>
          <Providers>
            {children}
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
