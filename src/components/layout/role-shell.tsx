'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { TAB_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth-context';
import type { UserRole } from '@/types/api';

type NavItem = { href: string; label: string; icon: string };

const ATHLETE_NAV: NavItem[] = [
  { href: '/athlete/home', label: TAB_LABELS.athlete.home, icon: '🏠' },
  { href: '/athlete/search', label: TAB_LABELS.athlete.search, icon: '🔍' },
  { href: '/athlete/bookings', label: TAB_LABELS.athlete.bookings, icon: '📅' },
  { href: '/athlete/profile', label: TAB_LABELS.athlete.profile, icon: '👤' },
];

const INSTRUCTOR_NAV: NavItem[] = [
  { href: '/instructor/dashboard', label: TAB_LABELS.instructor.dashboard, icon: '📊' },
  { href: '/instructor/classes', label: TAB_LABELS.instructor.classes, icon: '📚' },
  { href: '/instructor/calendar', label: TAB_LABELS.instructor.calendar, icon: '🗓️' },
  { href: '/instructor/earnings', label: TAB_LABELS.instructor.earnings, icon: '💰' },
  { href: '/instructor/profile', label: TAB_LABELS.instructor.profile, icon: '👤' },
];

const GYM_NAV: NavItem[] = [
  { href: '/gym/dashboard', label: TAB_LABELS.gym.dashboard, icon: '📊' },
  { href: '/gym/instructors', label: TAB_LABELS.gym.staff, icon: '👥' },
  { href: '/gym/classes', label: TAB_LABELS.gym.classes, icon: '📚' },
  { href: '/gym/metrics', label: TAB_LABELS.gym.metrics, icon: '📈' },
  { href: '/gym/profile', label: TAB_LABELS.gym.profile, icon: '🏢' },
];

function navForRole(role: UserRole): NavItem[] {
  if (role === 'instructor') return INSTRUCTOR_NAV;
  if (role === 'institution') return GYM_NAV;
  return ATHLETE_NAV;
}

export function RoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  if (!user) return <>{children}</>;

  const nav = navForRole(user.role);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl">
      <aside className="hidden w-56 shrink-0 border-r border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 md:flex md:flex-col">
        <Link href="/" className="mb-8 text-xl font-extrabold text-[var(--fn-primary)]">
          Fitnexia
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary-text)]'
                    : 'text-[var(--fn-text-muted)] hover:bg-[var(--fn-surface-muted)]'
                }`}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">{children}</main>
        <nav className="fixed bottom-0 left-0 right-0 flex border-t border-[var(--fn-border)] bg-[var(--fn-surface)] md:hidden">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center py-2 text-xs ${
                  active ? 'text-[var(--fn-primary)]' : 'text-[var(--fn-text-muted)]'
                }`}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
