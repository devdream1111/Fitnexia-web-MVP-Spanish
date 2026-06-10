'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  Building,
  Calendar,
  ChevronDown,
  CreditCard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Star,
  Sun,
  UserCircle,
  Users,
  X,
} from 'lucide-react';

import { Logo } from './Logo';
import { ADMIN_LABELS, DROPDOWN_LABELS, ROLE_TITLES, TAB_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { useNotifications } from '@/contexts/notifications-context';

type NavItem = { href: string; label: string; icon: React.ReactNode };

const ADMIN_NAV: NavItem[] = [
  { href: '/admin/dashboard', label: TAB_LABELS.admin.dashboard, icon: <BarChart3 size={18} /> },
  { href: '/admin/users', label: TAB_LABELS.admin.users, icon: <Users size={18} /> },
  { href: '/admin/classes', label: TAB_LABELS.admin.classes, icon: <BookOpen size={18} /> },
  { href: '/admin/bookings', label: TAB_LABELS.admin.bookings, icon: <Calendar size={18} /> },
  { href: '/admin/reviews', label: TAB_LABELS.admin.reviews, icon: <Star size={18} /> },
  { href: '/admin/institutions', label: TAB_LABELS.admin.institutions, icon: <Building size={18} /> },
  { href: '/admin/payments', label: TAB_LABELS.admin.payments, icon: <CreditCard size={18} /> },
];

function SidebarContent({
  pathname,
  unreadCount,
  isDark,
  user,
  profileLink,
  dropdownOpen,
  dropdownRef,
  onToggleDropdown,
  onCloseMobile,
  onToggleTheme,
  onLogout,
}: {
  pathname: string;
  unreadCount: number;
  isDark: boolean;
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  profileLink: string;
  dropdownOpen: boolean;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onToggleDropdown: () => void;
  onCloseMobile: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Logo href="/" size="sm" className="!mx-0" />
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--fn-text-muted)] transition hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)] md:hidden"
          onClick={onCloseMobile}
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>

      <p className="mt-4 text-[0.6875rem] font-bold uppercase tracking-wider text-[var(--fn-text-muted)]">
        {ADMIN_LABELS.login.title}
      </p>

      <nav className="mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto" aria-label="Administración">
        {ADMIN_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary-text)]'
                  : 'text-[var(--fn-text-muted)] hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex shrink-0 flex-col gap-1 border-t border-[var(--fn-border)] pt-4">
        <Link
          href="/admin/notifications"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--fn-text-muted)] transition hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]"
        >
          <Bell size={18} className="shrink-0" />
          <span className="truncate">Notificaciones</span>
          {unreadCount > 0 ? (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--fn-primary)] px-1 text-[0.6875rem] font-bold text-white">
              {unreadCount}
            </span>
          ) : null}
        </Link>

        <button
          type="button"
          onClick={onToggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--fn-text-muted)] transition hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]"
        >
          {isDark ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          <span className="truncate">{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={onToggleDropdown}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-[var(--fn-surface-muted)]"
          >
            {user.avatarUri ? (
              <img
                src={user.avatarUri}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full border-2 border-[var(--fn-border)] object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--fn-border)] bg-[var(--fn-primary-muted)] text-xs font-bold text-[var(--fn-primary)]">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </div>
            )}
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-semibold text-[var(--fn-text)]">
                {user.firstName} {user.lastName}
              </span>
              <span className="block truncate text-xs text-[var(--fn-text-muted)]">{ROLE_TITLES.admin}</span>
            </span>
            <ChevronDown size={16} className="shrink-0 text-[var(--fn-text-muted)]" />
          </button>

          {dropdownOpen ? (
            <div className="absolute bottom-full left-0 right-0 z-10 mb-2 overflow-hidden rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-1.5 shadow-lg">
              <Link
                href={profileLink}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--fn-text)] transition hover:bg-[var(--fn-surface-muted)]"
                onClick={onCloseMobile}
              >
                <UserCircle size={18} />
                {DROPDOWN_LABELS.myProfile}
              </Link>
              <Link
                href={`${profileLink}/notifications`}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--fn-text)] transition hover:bg-[var(--fn-surface-muted)]"
                onClick={onCloseMobile}
              >
                <Settings size={18} />
                {DROPDOWN_LABELS.settings}
              </Link>
              <div className="my-1 h-px bg-[var(--fn-border)]" />
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--fn-error)] transition hover:bg-red-500/10"
              >
                <LogOut size={18} />
                {DROPDOWN_LABELS.logOut}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useAppTheme();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const profileLink = '/admin/profile';

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    router.replace('/admin');
  };

  const sidebarProps = {
    pathname,
    unreadCount,
    isDark,
    user,
    profileLink,
    dropdownOpen,
    dropdownRef,
    onToggleDropdown: () => setDropdownOpen((open) => !open),
    onCloseMobile: () => {
      setDropdownOpen(false);
      setMobileOpen(false);
    },
    onToggleTheme: toggleDarkMode,
    onLogout: handleLogout,
  };

  return (
    <div className="min-h-screen bg-[var(--fn-bg)] md:flex">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 border-0 bg-slate-900/45 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-64">
        <div className="flex items-center gap-3 border-b border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] transition hover:bg-[var(--fn-border)] hover:text-[var(--fn-text)]"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <Logo href="/" size="sm" className="!mx-0" />
        </div>

        <main className="fn-layout-shell flex-1 py-5">{children}</main>
      </div>
    </div>
  );
}
