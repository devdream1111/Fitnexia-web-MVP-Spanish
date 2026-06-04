type Variant = 'default' | 'success' | 'warning';

const variants: Record<Variant, string> = {
  default: 'bg-[var(--fn-surface-muted)] text-[var(--fn-text-secondary)]',
  success: 'bg-[var(--fn-success-muted)] text-[var(--fn-success)]',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
};

export function Badge({ label, variant = 'default' }: { label: string; variant?: Variant }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]}`}>
      {label}
    </span>
  );
}
