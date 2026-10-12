'use client';
import Link, { LinkProps } from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useDashboardStore } from '../utils/zustand';

type Props = LinkProps & {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export default function AppLink({ children, href, ...props }: Props) {
  const pathname = usePathname();
  // const searchParams = useSearchParams();

  const setProgress = useDashboardStore((s) => s.setLoadingProgress);
  const setMaxProgress = useDashboardStore((s) => s.setLoadingMaxProgress);

  const cleanPath = (p: string) => p.split('?')[0].split('#')[0];

  // 🔥 logic ใหม่
  // const buildHref = () => {
  //   if (typeof href !== 'string') return href;

  //   // 👉 ถ้ามี query อยู่แล้ว → ใช้อันนั้นเลย
  //   if (href.includes('?')) return href;

  //   const current = searchParams.toString();
  //   return current ? `${href}?${current}` : href;
  // };

  // const finalHref = buildHref();
  const finalHref = href;

  const target = cleanPath(typeof finalHref === 'string' ? finalHref : finalHref.toString());
  const currentPath = cleanPath(pathname);

  const isSameRoute = target.replace(/\/$/, '') === currentPath.replace(/\/$/, '');

  return (
    <Link
      href={finalHref}
      {...props}
      onClick={(e) => {
        if (isSameRoute) {
          setProgress(100);
        } else {
          setProgress(1);
          setMaxProgress(30);
        }

        props.onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}