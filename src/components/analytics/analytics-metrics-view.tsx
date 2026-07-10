'use client';

import { formatAttendanceRate, formatRevenueCompact } from '@/utils/gym-metrics';
import type { AnalyticsViewModel } from '@/utils/analytics';
import { MOCK_V2V3_LABELS } from '@/constants/labels';

export function AnalyticsMetricsView({
  data,
  showRetention = false,
  showInstructors = false,
}: {
  data: AnalyticsViewModel;
  showRetention?: boolean;
  showInstructors?: boolean;
}) {
  const maxDailyBookings = Math.max(1, ...data.daily.map((d) => d.bookings));

  return (
    <div className="space-y-6">
      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          showRetention ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}
      >
        <StatCard label={MOCK_V2V3_LABELS.analyticsBookings} value={String(data.bookings)} />
        <StatCard
          label={MOCK_V2V3_LABELS.analyticsRevenue}
          value={formatRevenueCompact(data.revenueCents, data.currency)}
        />
        <StatCard
          label={MOCK_V2V3_LABELS.analyticsOccupancy}
          value={formatAttendanceRate(data.occupancyRate)}
        />
        {showRetention && data.retentionRate != null ? (
          <StatCard
            label={MOCK_V2V3_LABELS.analyticsRetention}
            value={formatAttendanceRate(data.retentionRate)}
          />
        ) : null}
      </div>

      {data.daily.length > 0 ? (
        <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
          <h3 className="mb-4 font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.analyticsWeekly}</h3>
          <div className="flex h-40 items-end gap-1.5 sm:gap-2">
            {data.daily.map((day, index) => (
              <div key={`${day.label}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-[var(--fn-primary)]/80 transition-all"
                  style={{
                    height: `${Math.max(8, Math.round((day.bookings / maxDailyBookings) * 120))}px`,
                  }}
                  title={`${day.bookings} reservas · ${formatRevenueCompact(day.revenueCents, data.currency)}`}
                />
                <span className="text-[10px] font-medium text-[var(--fn-text-muted)]">{day.label}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
        <h3 className="mb-4 font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.analyticsTopClasses}</h3>
        {data.topClasses.length === 0 ? (
          <p className="m-0 text-sm text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.analyticsEmpty}</p>
        ) : (
          <ul className="space-y-3">
            {data.topClasses.map((item) => (
              <li key={item.title}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-[var(--fn-text)]">{item.title}</span>
                  <span className="shrink-0 text-[var(--fn-text-muted)]">
                    {formatAttendanceRate(item.occupancyRate)} · {item.bookings}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--fn-surface-muted)]">
                  <div
                    className="h-full rounded-full bg-[var(--fn-primary)]"
                    style={{ width: `${Math.round(Math.min(1, item.occupancyRate) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showInstructors && data.topInstructors && data.topInstructors.length > 0 ? (
        <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
          <h3 className="mb-4 font-bold text-[var(--fn-text)]">
            {MOCK_V2V3_LABELS.analyticsTopInstructors}
          </h3>
          <ul className="space-y-3">
            {data.topInstructors.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-xl bg-[var(--fn-surface-muted)]/50 px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-[var(--fn-text)]">{item.name}</span>
                <span className="text-[var(--fn-text-muted)]">
                  {item.bookings} · {formatRevenueCompact(item.revenueCents, data.currency)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[var(--fn-text)]">{value}</p>
    </div>
  );
}
