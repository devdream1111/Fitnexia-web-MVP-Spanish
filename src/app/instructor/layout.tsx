import { InstructorLayoutShell } from '@/components/layout/instructor-layout-shell';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return <InstructorLayoutShell>{children}</InstructorLayoutShell>;
}
