'use client';

import { RECURRENCE_LABELS } from '@/constants/labels';
import { recurrenceWeekdayLabel } from '@/utils/class-recurrence';

export interface RecurrenceFormState {
  enabled: boolean;
  weekdays: number[];
}

export function ClassRecurrenceFields({
  value,
  onChange,
}: {
  value: RecurrenceFormState;
  onChange: (next: RecurrenceFormState) => void;
}) {
  const toggleWeekday = (weekday: number) => {
    const has = value.weekdays.includes(weekday);
    const weekdays = has
      ? value.weekdays.filter((d) => d !== weekday)
      : [...value.weekdays, weekday].sort((a, b) => a - b);
    onChange({ ...value, weekdays });
  };

  return (
    <div className="space-y-4 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-[var(--fn-border)] text-[var(--fn-primary)] focus:ring-[var(--fn-primary-muted)]"
          checked={value.enabled}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
        />
        <span>
          <span className="block text-sm font-semibold text-[var(--fn-text)]">
            {RECURRENCE_LABELS.recurringToggle}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-[var(--fn-text-muted)]">
            {RECURRENCE_LABELS.recurringHint}
          </span>
        </span>
      </label>

      {value.enabled ? (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--fn-text)]">{RECURRENCE_LABELS.weekdays}</p>
          <div className="flex flex-wrap gap-2">
            {RECURRENCE_LABELS.weekdayShort.map((label, weekday) => {
              const active = value.weekdays.includes(weekday);
              return (
                <button
                  key={weekday}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleWeekday(weekday)}
                  className={`min-w-[3rem] rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? 'border-[var(--fn-primary)] bg-[var(--fn-primary-muted)] text-[var(--fn-primary-text)]'
                      : 'border-[var(--fn-border)] bg-[var(--fn-surface)] text-[var(--fn-text-muted)] hover:border-[var(--fn-primary)]/40'
                  }`}
                >
                  {recurrenceWeekdayLabel(weekday)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
