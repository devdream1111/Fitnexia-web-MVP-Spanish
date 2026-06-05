'use client';

import { useAppTheme } from '@/contexts/theme-context';

export function DarkModeToggle() {
  const { isDark, toggleDarkMode } = useAppTheme();
  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="flex w-full items-center justify-between px-6 py-4 transition hover:bg-[var(--fn-surface-muted)]">
      <span className="font-medium text-[var(--fn-text)]">Dark mode</span>
      <span
        className={`relative h-7 w-12 rounded-full transition ${isDark ? 'bg-[var(--fn-primary)]' : 'bg-[var(--fn-border)]'}`}>
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${isDark ? 'left-5' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}
