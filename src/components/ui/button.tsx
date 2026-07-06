'use client';

import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary:
    'bg-[var(--fn-primary)] text-white border-transparent hover:opacity-90 active:opacity-95',
  secondary:
    'bg-[var(--fn-text)] text-[var(--fn-surface)] border-transparent hover:opacity-90 active:opacity-95',
  outline:
    'bg-transparent text-[var(--fn-primary)] border-[var(--fn-primary)] border-[1.5px] hover:bg-[var(--fn-primary-muted)] active:bg-[var(--fn-primary-muted)]',
  ghost:
    'bg-[var(--fn-primary-muted)] text-[var(--fn-primary-text)] border-transparent hover:opacity-90 active:opacity-95',
  danger:
    'bg-[var(--fn-error)] text-white border-transparent hover:opacity-90 active:opacity-95',
};

const sizeClass: Record<Size, string> = {
  sm: 'min-h-9 px-4 py-2 text-sm',
  md: 'min-h-12 px-6 py-3 text-base',
  lg: 'min-h-14 px-8 py-3.5 text-[17px]',
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  title?: string;
  variant?: Variant;
  size?: Size;
  /** Inline spinner on the button; label stays in layout so width does not shrink. */
  loading?: boolean;
  children?: React.ReactNode;
}) {
  const isDisabled = disabled || loading;
  const label = children ?? title;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${sizeClass[size]} ${loading ? 'cursor-wait' : ''} ${className}`}
      {...rest}
    >
      <span
        className={`inline-flex items-center justify-center gap-2 ${loading ? 'invisible' : ''}`}
      >
        {label}
      </span>
      {loading ? (
        <span
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      ) : null}
    </button>
  );
}
