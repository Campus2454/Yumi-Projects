import { notFound } from 'next/navigation';
import { DashboardPage } from '../../components/DashboardPage';
import { Suspense } from 'react';

export function generateStaticParams() {
  return [
    { slug: 'home' },
    { slug: 'server' },
    { slug: 'search' },
  ];
}

export default async function Page({ params }: { params: Promise<{ slug: string }>; }) {
  const pageList = ['home','server','search'];
  const { slug } = await params;

  if(!pageList.includes(slug))return notFound();

  // return <DashboardPage />;
  return <Suspense><DashboardPage /></Suspense>;
}
