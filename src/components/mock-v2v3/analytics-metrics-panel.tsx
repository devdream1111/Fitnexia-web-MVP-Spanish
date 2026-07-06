'use client';

import { mockAnalyticsService, type MockAnalyticsSnapshot } from '@/services/mock/analytics.mock';
import { formatAttendanceRate, formatGymChange, formatRevenueCompact } from '@/utils/gym-metrics';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';

export function AnalyticsMetricsPanel({ snapshot }: { snapshot?: MockAnalyticsSnapshot }) {
  const data = snapshot ?? mockAnalyticsService.getSnapshot();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.analyticsTitle}</h2>
        <MockDataBadge />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Reservas" value={String(data.bookings)} change={formatGymChange(data.bookingsChangePct)} />
        <StatCard
          label="Ingresos"
          value={formatRevenueCompact(data.revenueCents)}
          change={formatGymChange(data.revenueChangePct)}
        />
        <StatCard
          label="Ocupación"
          value={formatAttendanceRate(data.attendanceRate)}
          change={formatGymChange(data.attendanceChangePct)}
        />
      </div>

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
        <h3 className="mb-4 font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.analyticsWeekly}</h3>
        <div className="flex h-40 items-end gap-2">
          {data.daily.map((day) => (
            <div key={day.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-[var(--fn-primary)]/80 transition-all"
                style={{ height: `${Math.max(12, day.bookings * 8)}px` }}
                title={`${day.bookings} reservas`}
              />
              <span className="text-[10px] font-medium text-[var(--fn-text-muted)]">{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
        <h3 className="mb-4 font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.analyticsTopClasses}</h3>
        <ul className="space-y-3">
          {data.topClasses.map((item) => (
            <li key={item.title}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-[var(--fn-text)]">{item.title}</span>
                <span className="text-[var(--fn-text-muted)]">{formatAttendanceRate(item.attendancePct)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--fn-surface-muted)]">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.round(item.attendancePct * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[var(--fn-text)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--fn-text-muted)]">{change}</p>
    </div>
  );
}
