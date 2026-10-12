import Navbar from '@/components/Navbar';
import { Providers } from '@/components/Providers';
import { Kanit } from 'next/font/google';
import './globals.css';
import NavWrapper from '@/components/NavWrapper';
import StyledComponentsRegistry from './StyledComponentsRegistry';

const kanit = Kanit({ 
  subsets: ['thai', 'latin'], 
  weight: ['300', '400', '500', '600', '700'] 
});

export const metadata = {
  title: {
    default: 'Yumi Music',
    template: '%s | Yumi Music'
  },
  description: 'ระบบจัดการเพลงสำหรับคุณ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${kanit.className} min-h-screen relative flex flex-col`}>
        <StyledComponentsRegistry>
          
          {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" /> */}
          
          {/* คลุมทั้งแอปด้วย Providers */}
          <Providers>
            <NavWrapper />
            <main className="flex-1 w-full max-w-7xl mx-auto p-6 z-10">
              {children}
            </main>
          </Providers>

        </StyledComponentsRegistry>
      </body>
    </html>
  );
}