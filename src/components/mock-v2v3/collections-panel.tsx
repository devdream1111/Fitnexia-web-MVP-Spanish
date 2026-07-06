'use client';

import { mockCollectionsService } from '@/services/mock/collections.mock';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { formatMoneyFromCents } from '@/utils/format';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import { formatAttendanceRate } from '@/utils/gym-metrics';

export function CollectionsPanel() {
  const data = mockCollectionsService.getSnapshot();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={MOCK_V2V3_LABELS.collectionsMonthlyRevenue} value={formatMoneyFromCents(data.monthlyRevenueCents, DEFAULT_CURRENCY)} />
        <Stat label={MOCK_V2V3_LABELS.collectionsRate} value={formatAttendanceRate(data.collectionRate)} />
        <Stat label={MOCK_V2V3_LABELS.collectionsUpToDate} value={String(data.membersUpToDate)} accent="success" />
        <Stat label={MOCK_V2V3_LABELS.collectionsOverdue} value={String(data.membersOverdue)} accent="danger" />
      </div>

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
        <h3 className="mb-4 font-bold">Resumen de socios</h3>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <p>
            <span className="text-[var(--fn-text-muted)]">Total socios</span>
            <span className="mt-1 block text-xl font-bold">{data.totalMembers}</span>
          </p>
          <p>
            <span className="text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.collectionsPending}</span>
            <span className="mt-1 block text-xl font-bold">{data.membersPending}</span>
          </p>
          <p>
            <span className="text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.collectionsRate}</span>
            <span className="mt-1 block text-xl font-bold">{formatAttendanceRate(data.collectionRate)}</span>
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
        <h3 className="mb-4 font-bold">Tendencia mensual</h3>
        <div className="flex h-36 items-end gap-3">
          {data.monthlyTrend.map((m) => (
            <div key={m.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-emerald-500/80"
                style={{ height: `${Math.max(16, m.rate * 120)}px` }}
                title={formatMoneyFromCents(m.revenueCents, DEFAULT_CURRENCY)}
              />
              <span className="text-[10px] font-medium text-[var(--fn-text-muted)]">{m.month}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'success' | 'danger';
}) {
  const color =
    accent === 'success'
      ? 'text-emerald-600'
      : accent === 'danger'
        ? 'text-red-600'
        : 'text-[var(--fn-text)]';
  return (
    <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}
