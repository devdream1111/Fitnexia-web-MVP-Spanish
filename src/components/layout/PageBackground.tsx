'use client';

import { usePathname } from 'next/navigation';
import { PAGE_BACKGROUNDS } from '@/constants/backgrounds';
import { useAppTheme } from '@/contexts/theme-context';
import { Footer } from './Footer';

export function PageBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isDark } = useAppTheme();
  const isAuthRoute = pathname.startsWith('/auth');
  const isLegalRoute = pathname.startsWith('/legal');
  const isCheckoutRoute = pathname.startsWith('/book');
  const isLanding = pathname === '/';
  const showPageBackground =
    !isAuthRoute && !isLanding && !isLegalRoute && !isCheckoutRoute;
  const showFooter = !isAuthRoute && !isLegalRoute && !isCheckoutRoute;

  return (
    <div className="relative flex min-h-screen flex-col">
      {showPageBackground ? (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-fixed opacity-10"
          style={{ backgroundImage: `url(${isDark ? PAGE_BACKGROUNDS.dark : PAGE_BACKGROUNDS.light})` }}
        />
      ) : null}
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
