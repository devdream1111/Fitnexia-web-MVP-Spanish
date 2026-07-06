'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import type { MockWeeklyScheduleDay } from '@/services/mock/availability.mock';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';

export function WeeklyScheduleEditor({
  initialSchedule,
  onSave,
  saving,
}: {
  initialSchedule: MockWeeklyScheduleDay[];
  onSave: (schedule: MockWeeklyScheduleDay[]) => void | Promise<void>;
  saving?: boolean;
}) {
  const [schedule, setSchedule] = useState(initialSchedule);

  const updateDay = (weekday: number, patch: Partial<MockWeeklyScheduleDay>) => {
    setSchedule((prev) =>
      prev.map((day) => (day.weekday === weekday ? { ...day, ...patch } : day)),
    );
  };

  return (
    <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.weeklyScheduleTitle}</h2>
        <MockDataBadge />
      </div>
      <div className="space-y-4">
        {schedule.map((day) => (
          <div
            key={day.weekday}
            className="grid gap-3 rounded-xl border border-[var(--fn-border)] p-4 sm:grid-cols-[auto_1fr_1fr_1fr]"
          >
            <label className="flex items-center gap-2 sm:col-span-1">
              <input
                type="checkbox"
                checked={day.enabled}
                onChange={(e) => updateDay(day.weekday, { enabled: e.target.checked })}
                className="h-4 w-4 rounded border-[var(--fn-border)]"
              />
              <span className="w-10 text-sm font-semibold text-[var(--fn-text)]">
                {MOCK_V2V3_LABELS.weekdayNames[day.weekday]}
              </span>
            </label>
            <Input
              label="Desde"
              type="time"
              value={day.startTime}
              disabled={!day.enabled}
              onChange={(e) => updateDay(day.weekday, { startTime: e.target.value })}
            />
            <Input
              label="Hasta"
              type="time"
              value={day.endTime}
              disabled={!day.enabled}
              onChange={(e) => updateDay(day.weekday, { endTime: e.target.value })}
            />
          </div>
        ))}
      </div>
      <Button
        title={MOCK_V2V3_LABELS.weeklyScheduleSave}
        className="mt-5"
        loading={saving}
        onClick={() => void onSave(schedule)}
      />
    </section>
  );
}
