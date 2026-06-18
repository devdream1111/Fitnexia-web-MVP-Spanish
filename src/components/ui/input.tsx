'use client';

import { type InputHTMLAttributes } from 'react';

export function Input({
  label,
  compact = false,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; compact?: boolean }) {
  return (
    <label className={`${compact ? 'mb-0' : 'mb-4'} block w-full`}>
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-[var(--fn-text-secondary)]">
          {label}
        </span>
      ) : null}
      <input
        className={`w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 text-[var(--fn-text)] outline-none focus:border-[var(--fn-primary)] ${className}`}
        {...rest}
      />
    </label>
  );
}
