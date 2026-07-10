import { GymLayoutShell } from '@/components/layout/gym-layout-shell';

export default function GymLayout({ children }: { children: React.ReactNode }) {
  return <GymLayoutShell>{children}</GymLayoutShell>;
}
