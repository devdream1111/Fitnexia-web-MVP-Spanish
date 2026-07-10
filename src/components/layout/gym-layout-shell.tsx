'use client';

import { usePathname } from 'next/navigation';

import { RoleShell } from '@/components/layout/role-shell';
import { isGymInstructorProfileRoute } from '@/utils/public-routes';

export function GymLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isGymInstructorProfileRoute(pathname)) {
    return <>{children}</>;
  }
  return <RoleShell>{children}</RoleShell>;
}
