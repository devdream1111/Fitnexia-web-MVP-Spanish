'use client';

import { type TextareaHTMLAttributes } from 'react';

export function Textarea({
  label,
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="mb-4 block w-full">
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-[var(--fn-text-secondary)]">
          {label}
        </span>
      ) : null}
      <textarea
        className={`min-h-[120px] w-full resize-y rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 text-[var(--fn-text)] outline-none focus:border-[var(--fn-primary)] ${className}`}
        {...rest}
      />
    </label>
  );
}
