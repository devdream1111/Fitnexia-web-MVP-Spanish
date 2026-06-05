'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { 
  Home, Search, Calendar, User, BarChart3, BookOpen, DollarSign, Users, TrendingUp, LogOut, UserCircle, Settings, ChevronDown, Sun, Moon, Bell
} from 'lucide-react';

import { TAB_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { useNotifications } from '@/contexts/notifications-context';
import type { UserRole } from '@/types/api';

type NavItem = { href: string; label: string; icon: React.ReactNode };

const ATHLETE_NAV: NavItem[] = [
  { href: '/athlete/home', label: TAB_LABELS.athlete.home, icon: <Home size={18} /> },
  { href: '/athlete/search', label: TAB_LABELS.athlete.search, icon: <Search size={18} /> },
  { href: '/athlete/bookings', label: TAB_LABELS.athlete.bookings, icon: <Calendar size={18} /> },
];

const INSTRUCTOR_NAV: NavItem[] = [
  { href: '/instructor/dashboard', label: TAB_LABELS.instructor.dashboard, icon: <BarChart3 size={18} /> },
  { href: '/instructor/classes', label: TAB_LABELS.instructor.classes, icon: <BookOpen size={18} /> },
  { href: '/instructor/calendar', label: TAB_LABELS.instructor.calendar, icon: <Calendar size={18} /> },
  { href: '/instructor/earnings', label: TAB_LABELS.instructor.earnings, icon: <DollarSign size={18} /> },
];

const GYM_NAV: NavItem[] = [
  { href: '/gym/dashboard', label: TAB_LABELS.gym.dashboard, icon: <BarChart3 size={18} /> },
  { href: '/gym/instructors', label: TAB_LABELS.gym.staff, icon: <Users size={18} /> },
  { href: '/gym/classes', label: TAB_LABELS.gym.classes, icon: <BookOpen size={18} /> },
  { href: '/gym/metrics', label: TAB_LABELS.gym.metrics, icon: <TrendingUp size={18} /> },
];

function navForRole(role: UserRole): NavItem[] {
  if (role === 'instructor') return INSTRUCTOR_NAV;
  if (role === 'institution') return GYM_NAV;
  return ATHLETE_NAV;
}

function getProfileLink(role: UserRole): string {
  if (role === 'instructor') return '/instructor/profile';
  if (role === 'institution') return '/gym/profile';
  return '/athlete/profile';
}

function getNotificationsLink(role: UserRole): string {
  if (role === 'instructor') return '/instructor/notifications';
  if (role === 'institution') return '/gym/notifications';
  return '/athlete/notifications';
}

export function RoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useAppTheme();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return <>{children}</>;

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    router.replace('/auth/login');
  };

  const nav = navForRole(user.role);
  const profileLink = getProfileLink(user.role);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header (desktop & mobile) */}
      <header className="sticky top-0 z-50 border-b border-[var(--fn-border)] bg-[var(--fn-surface)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center">
            <img src="/fitnexia-logo.svg" alt="Fitnexia Logo" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary-text)]'
                      : 'text-[var(--fn-text-muted)] hover:bg-[var(--fn-surface-muted)]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Link
              href={getNotificationsLink(user.role)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] transition hover:bg-[var(--fn-border)]"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--fn-primary)] text-[var(--fn-primary-text)] text-xs font-semibold">
                  {unreadCount}
                </span>
              )}
            </Link>
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] transition hover:bg-[var(--fn-border)]"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Info with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-[var(--fn-surface-muted)] transition"
              >
                {user.avatarUri ? (
                  <img
                    src={user.avatarUri}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover border-2 border-[var(--fn-surface-muted)]"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fn-primary-muted)] border-2 border-[var(--fn-surface-muted)]">
                    <span className="text-sm font-semibold text-[var(--fn-primary)]">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-[var(--fn-text)]">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-[var(--fn-text-muted)]">{user.role}</p>
                </div>
                <ChevronDown size={16} className="text-[var(--fn-text-muted)]" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-2 shadow-lg">
                  <Link
                    href={profileLink}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--fn-text)] hover:bg-[var(--fn-surface-muted)] transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserCircle size={18} />
                    My Profile
                  </Link>
                  <Link
                    href={`${profileLink}/notifications`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--fn-text)] hover:bg-[var(--fn-surface-muted)] transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={18} />
                    Settings
                  </Link>
                  <div className="my-1 h-px bg-[var(--fn-border)]" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--fn-error)] hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <LogOut size={18} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation (add profile back here) */}
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-[var(--fn-border)] bg-[var(--fn-surface)] md:hidden">
        {[...nav, { href: profileLink, label: 'Profile', icon: <User size={18} /> }].map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center py-2 text-xs ${
                active ? 'text-[var(--fn-primary)]' : 'text-[var(--fn-text-muted)]'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
