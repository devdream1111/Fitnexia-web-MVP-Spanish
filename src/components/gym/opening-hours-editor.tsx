'use client';

import { Clock, Moon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import type { OpeningHours, OpeningHoursDayKey } from '@/types/api';
import {
  OPENING_HOURS_DAY_KEYS,
  OPENING_HOURS_DAY_LABELS,
} from '@/utils/opening-hours';

export function OpeningHoursEditor({
  value,
  onChange,
}: {
  value: OpeningHours;
  onChange: (next: OpeningHours) => void;
}) {
  const updateDay = (key: OpeningHoursDayKey, patch: Partial<OpeningHours[OpeningHoursDayKey]>) => {
    const current = value[key] ?? { open: '09:00', close: '18:00' };
    onChange({ ...value, [key]: { ...current, ...patch } });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {OPENING_HOURS_DAY_KEYS.map((key) => {
        const day = value[key];
        const closed = day?.closed === true;
        return (
          <div
            key={key}
            className={[
              'flex flex-col gap-3 rounded-2xl border p-4 transition',
              closed
                ? 'border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 opacity-80'
                : 'border-[var(--fn-primary)]/15 bg-gradient-to-br from-[var(--fn-primary-muted)]/30 to-transparent shadow-sm',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-extrabold text-[var(--fn-text)]">
                {OPENING_HOURS_DAY_LABELS[key]}
              </span>
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--fn-border)] bg-[var(--fn-surface)] px-3 py-1 text-xs font-semibold text-[var(--fn-text-muted)]">
                <input
                  type="checkbox"
                  checked={closed}
                  onChange={(e) =>
                    updateDay(
                      key,
                      e.target.checked
                        ? { closed: true }
                        : { closed: false, open: '09:00', close: '18:00' },
                    )
                  }
                  className="rounded border-[var(--fn-border)]"
                />
                <Moon size={12} />
                Cerrado
              </label>
            </div>
            {!closed ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Apertura"
                  type="time"
                  value={day?.open ?? '09:00'}
                  onChange={(e) => updateDay(key, { open: e.target.value, closed: false })}
                />
                <Input
                  label="Cierre"
                  type="time"
                  value={day?.close ?? '18:00'}
                  onChange={(e) => updateDay(key, { close: e.target.value, closed: false })}
                />
              </div>
            ) : (
              <p className="flex items-center gap-2 text-xs text-[var(--fn-text-muted)]">
                <Clock size={12} />
                Sin atención este día
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
