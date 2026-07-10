'use client';

import { usePathname } from 'next/navigation';

import { RoleShell } from '@/components/layout/role-shell';
import { isPublicInstructorProfileRoute } from '@/utils/public-routes';

export function InstructorLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isPublicInstructorProfileRoute(pathname)) {
    return <>{children}</>;
  }
  return <RoleShell>{children}</RoleShell>;
}
