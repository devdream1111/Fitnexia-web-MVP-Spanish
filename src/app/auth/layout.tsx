'use client';

import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { useAppTheme } from '@/contexts/theme-context';

import { Logo } from '@/components/layout/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isDark, toggleDarkMode } = useAppTheme();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[var(--fn-border)] bg-[var(--fn-surface)]">
        <div className="fn-layout-shell flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] transition hover:bg-[var(--fn-border)]"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
