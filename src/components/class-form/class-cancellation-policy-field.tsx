'use client';

import { Input } from '@/components/ui/input';
import { INSTRUCTOR_LABELS } from '@/constants/labels';

export function ClassCancellationPolicyField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Input
        label={INSTRUCTOR_LABELS.classForm.cancellationPolicyHours}
        type="number"
        min="0"
        max="168"
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-sm text-[var(--fn-text-muted)]">
        {INSTRUCTOR_LABELS.classForm.cancellationPolicyHint}
      </p>
    </div>
  );
}
