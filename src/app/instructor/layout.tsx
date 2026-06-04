import { RoleShell } from '@/components/layout/role-shell';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell>{children}</RoleShell>;
}
