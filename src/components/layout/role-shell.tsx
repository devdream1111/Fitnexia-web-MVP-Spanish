'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { 
  Home, Search, Calendar, User, BarChart3, BookOpen, DollarSign, Users, LogOut, UserCircle, Settings, ChevronDown, Sun, Moon, Bell, IdCard, Briefcase
} from 'lucide-react';

import { Logo } from './Logo';
import { TAB_LABELS, DROPDOWN_LABELS, ROLE_TITLES } from '@/constants/labels';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { useNotifications } from '@/contexts/notifications-context';
import { useFeature } from '@/hooks/use-feature';
import type { UserRole } from '@/types/api';
import { resolveMediaUrl } from '@/utils/media';

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
  { href: '/instructor/jobs', label: TAB_LABELS.instructor.jobs, icon: <Briefcase size={18} /> },
  { href: '/instructor/earnings', label: TAB_LABELS.instructor.earnings, icon: <DollarSign size={18} /> },
];

const GYM_NAV_BASE: NavItem[] = [
  { href: '/gym/dashboard', label: TAB_LABELS.gym.dashboard, icon: <BarChart3 size={18} /> },
  { href: '/gym/instructors', label: TAB_LABELS.gym.staff, icon: <Users size={18} /> },
  { href: '/gym/jobs', label: TAB_LABELS.gym.jobs, icon: <Briefcase size={18} /> },
  { href: '/gym/classes', label: TAB_LABELS.gym.classes, icon: <BookOpen size={18} /> },
  { href: '/gym/earnings', label: TAB_LABELS.gym.earnings, icon: <DollarSign size={18} /> },
];

const GYM_NAV_MEMBERS: NavItem = {
  href: '/gym/members',
  label: TAB_LABELS.gym.members,
  icon: <IdCard size={18} />,
};

function buildGymNav(showMembers: boolean): NavItem[] {
  const items = [...GYM_NAV_BASE];
  if (showMembers) items.splice(2, 0, GYM_NAV_MEMBERS);
  return items;
}

function navForRole(
  role: UserRole,
  gymNav: NavItem[],
): NavItem[] {
  if (role === 'instructor') return INSTRUCTOR_NAV;
  if (role === 'institution') return gymNav;
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
  const { user, logout, isLoading } = useAuth();
  const { isDark, toggleDarkMode } = useAppTheme();
  const { unreadCount } = useNotifications();
  const showClubMembers = useFeature('clubMembers');
  const gymNav = buildGymNav(showClubMembers);
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

  useEffect(() => {
    if (!isLoading && !user) {
      const path = window.location.pathname;
      // Don't redirect if we're already on an auth page
      if (!path.startsWith('/auth/') && path !== '/onboarding') {
        router.replace('/auth/login');
      }
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return null;
  }

  if (!user) return null;

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.replace('/auth/login');
  };

  const nav = navForRole(user.role, gymNav);
  const profileLink = getProfileLink(user.role);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header (desktop & mobile) */}
      <header className="sticky top-0 z-50 border-b border-[var(--fn-border)] bg-[var(--fn-surface)]">
        <div className="fn-layout-shell flex h-14 min-w-0 items-center justify-between gap-2 sm:h-16 sm:gap-3">
          <Link href="/" className="flex min-w-0 shrink items-center">
            <Logo size="sm" className="md:hidden" />
            <Logo size="md" className="hidden md:block lg:ml-[-31px]" />
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
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {/* Notifications */}
            <Link
              href={getNotificationsLink(user.role)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] transition hover:bg-[var(--fn-border)]"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--fn-primary)] text-[var(--fn-primary-text)] text-xs font-semibold" style={{color:"white"}}>
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
              className="flex items-center gap-1 rounded-xl px-1 py-1 hover:bg-[var(--fn-surface-muted)] transition sm:gap-2 sm:px-2"
            >
                {user.avatarUri ? (
                  <img
                    src={resolveMediaUrl(user.avatarUri) ?? user.avatarUri}
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
                  <p className="text-xs text-[var(--fn-text-muted)]">{ROLE_TITLES[user.role as keyof typeof ROLE_TITLES]}</p>
                </div>
                <ChevronDown size={16} className="hidden text-[var(--fn-text-muted)] sm:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-2">
                  <Link
                    href={profileLink}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--fn-text)] hover:bg-[var(--fn-surface-muted)] transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserCircle size={18} />
                    {DROPDOWN_LABELS.myProfile}
                  </Link>
                  <Link
                    href={`${profileLink}/notifications`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--fn-text)] hover:bg-[var(--fn-surface-muted)] transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={18} />
                    {DROPDOWN_LABELS.settings}
                  </Link>
                  <div className="my-1 h-px bg-[var(--fn-border)]" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--fn-error)] hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <LogOut size={18} />
                    {DROPDOWN_LABELS.logOut}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="fn-layout-shell flex-1 py-5 pb-24 md:pb-5">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fn-mobile-tabbar fixed bottom-0 left-0 right-0 border-t border-[var(--fn-border)] bg-[var(--fn-surface)] md:hidden">
        <div className="flex w-full min-w-0">
        {[...nav, { href: profileLink, label: DROPDOWN_LABELS.myProfile, icon: <User size={18} /> }].map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`fn-mobile-tabbar-item flex min-w-0 flex-1 flex-col items-center px-0.5 py-2 text-[10px] sm:text-xs ${
                active ? 'text-[var(--fn-primary)]' : 'text-[var(--fn-text-muted)]'
              }`}
            >
              {item.icon}
              <span className="fn-mobile-tabbar-label mt-0.5 max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
        </div>
      </nav>
    </div>
  );
}
