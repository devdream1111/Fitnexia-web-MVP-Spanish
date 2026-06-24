'use client';

import { Input } from '@/components/ui/input';
import { INSTRUCTOR_LABELS } from '@/constants/labels';

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function ClassLocationField({ value, onChange, disabled = false }: Props) {
  return (
    <div>
      <Input
        label={INSTRUCTOR_LABELS.classForm.location}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={INSTRUCTOR_LABELS.classForm.locationPlaceholder}
        disabled={disabled}
      />
      <p className="-mt-2 text-xs text-[var(--fn-text-muted)]">
        {INSTRUCTOR_LABELS.classForm.locationHint}
      </p>
    </div>
  );
}
