'use client';

import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary: 'bg-[var(--fn-primary)] text-white border-transparent hover:opacity-90',
  secondary: 'bg-[var(--fn-text)] text-[var(--fn-surface)] border-transparent',
  outline: 'bg-transparent text-[var(--fn-primary)] border-[var(--fn-primary)] border-[1.5px]',
  ghost: 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary-text)] border-transparent',
  danger: 'bg-[var(--fn-error)] text-white border-transparent',
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
  loading?: boolean;
  children?: React.ReactNode;
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-50 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}>
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children || title
      )}
    </button>
  );
}
