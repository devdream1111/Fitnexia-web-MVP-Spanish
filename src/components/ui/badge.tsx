type Variant = 'default' | 'success' | 'warning';
type Size = 'sm' | 'default';

const variants: Record<Variant, string> = {
  default: 'bg-[var(--fn-surface-muted)] text-[var(--fn-text-secondary)]',
  success: 'bg-[var(--fn-success-muted)] text-[var(--fn-success)]',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
};

const sizes: Record<Size, string> = {
  sm: 'px-2 py-0 text-[10px]',
  default: 'px-2.5 py-0.5 text-xs',
};

export function Badge({ label, variant = 'default', size = 'default' }: { label: string; variant?: Variant; size?: Size }) {
  return (
    <span className={`inline-flex rounded-full font-semibold ${variants[variant]} ${sizes[size]}`}>
      {label}
    </span>
  );
}
