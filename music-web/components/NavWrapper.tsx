'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavWrapper() {
  const path = usePathname();

  if(path.split('/')[1] === 'dashboardV2')return null;

  return <Navbar />;
}
