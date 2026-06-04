'use client';

import { useAppTheme } from '@/contexts/theme-context';

export function DarkModeToggle() {
  const { isDark, toggleDarkMode } = useAppTheme();
  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="mb-4 flex w-full items-center justify-between rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3.5">
      <span className="font-medium">Dark mode</span>
      <span
        className={`relative h-7 w-12 rounded-full transition ${isDark ? 'bg-[var(--fn-primary)]' : 'bg-[var(--fn-border)]'}`}>
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${isDark ? 'left-5' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}
