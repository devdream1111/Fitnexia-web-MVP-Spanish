'use client';

interface ToggleButtonProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}

export function ToggleButton({ checked, onChange, label, disabled }: ToggleButtonProps) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface)] px-3 py-2 transition-all hover:bg-[var(--fn-surface-muted)] ${
        disabled ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      <span className="text-[var(--fn-text)] font-medium">{label}</span>
      <div
        role="switch"
        aria-checked={checked}
        className={`relative flex h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[var(--fn-primary)]' : 'bg-[var(--fn-border)]'
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}
