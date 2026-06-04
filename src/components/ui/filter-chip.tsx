'use client';

export function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`mr-2 shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? 'bg-[var(--fn-primary)] text-white'
          : 'bg-[var(--fn-surface)] text-[var(--fn-text-muted)] border border-[var(--fn-border)]'
      }`}>
      {label}
    </button>
  );
}
