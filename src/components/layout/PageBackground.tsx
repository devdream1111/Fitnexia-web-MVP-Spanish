'use client';

import { usePathname } from 'next/navigation';
import { PAGE_BACKGROUNDS } from '@/constants/backgrounds';
import { useAppTheme } from '@/contexts/theme-context';
import { Footer } from './Footer';

export function PageBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isDark } = useAppTheme();
  const isAuthRoute = pathname.startsWith('/auth');
  const isLanding = pathname === '/';

  return (
    <div className="relative flex min-h-screen flex-col">
      {!isAuthRoute && !isLanding ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10"
          style={{ backgroundImage: `url(${isDark ? PAGE_BACKGROUNDS.dark : PAGE_BACKGROUNDS.light})` }}
        />
      ) : null}
      <div className="relative z-10 flex-1">{children}</div>
      {!isAuthRoute ? <Footer /> : null}
    </div>
  );
}
