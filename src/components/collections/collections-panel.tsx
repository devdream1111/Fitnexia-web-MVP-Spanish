'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { GENERAL_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { apiGetClubCollectionsPanel } from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { formatMoney } from '@/utils/format';
import { formatAttendanceRate } from '@/utils/gym-metrics';
import {
  emptyCollectionsPanel,
  toCollectionsPanelViewModel,
  type CollectionsPanelViewModel,
} from '@/utils/collections';

export function CollectionsPanel() {
  const [data, setData] = useState<CollectionsPanelViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const panel = await apiGetClubCollectionsPanel();
      setData(toCollectionsPanelViewModel(panel));
    } catch (err) {
      setData(null);
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudo cargar el panel de cobranzas',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 px-6 py-10 text-center text-sm text-[var(--fn-text-muted)]">
        {GENERAL_LABELS.loading}
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 text-center">
        <p className="m-0 text-sm text-[var(--fn-error)]">{error}</p>
        <Button title="Reintentar" variant="outline" size="sm" onClick={() => void load()} />
      </div>
    );
  }

  const view = data ?? emptyCollectionsPanel();
  const trend = view.dailyTrend.slice(-14);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={MOCK_V2V3_LABELS.collectionsMonthlyRevenue}
          value={formatMoney(view.monthlyRevenue)}
        />
        <Stat
          label={MOCK_V2V3_LABELS.collectionsRate}
          value={formatAttendanceRate(view.collectionRate)}
        />
        <Stat
          label={MOCK_V2V3_LABELS.collectionsUpToDate}
          value={String(view.summary.current)}
          accent="success"
        />
        <Stat
          label={MOCK_V2V3_LABELS.collectionsOverdue}
          value={String(view.summary.overdue)}
          accent="danger"
        />
      </div>

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="m-0 font-bold text-[var(--fn-text)]">Resumen de socios</h3>
          <Link
            href="/gym/members"
            className="text-sm font-semibold text-[var(--fn-primary-text)] hover:underline"
          >
            Ver socios
          </Link>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <p className="m-0">
            <span className="text-[var(--fn-text-muted)]">Total socios</span>
            <span className="mt-1 block text-xl font-bold text-[var(--fn-text)]">
              {view.summary.total}
            </span>
          </p>
          <p className="m-0">
            <span className="text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.collectionsPending}</span>
            <span className="mt-1 block text-xl font-bold text-[var(--fn-text)]">
              {view.summary.pending}
            </span>
          </p>
          <p className="m-0">
            <span className="text-[var(--fn-text-muted)]">Esperado del mes</span>
            <span className="mt-1 block text-xl font-bold text-[var(--fn-text)]">
              {formatMoney(view.expectedRevenue)}
            </span>
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
        <h3 className="mb-4 m-0 font-bold text-[var(--fn-text)]">Cobros (últimos 14 días)</h3>
        {trend.length === 0 ? (
          <p className="m-0 text-sm text-[var(--fn-text-muted)]">
            Todavía no hay cobros registrados en los últimos 30 días.
          </p>
        ) : (
          <div className="flex h-36 items-end gap-2 overflow-x-auto">
            {trend.map((point) => (
              <div key={point.date} className="flex min-w-[2.25rem] flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-[var(--fn-primary)]/80"
                  style={{ height: `${Math.max(16, point.rate * 120)}px` }}
                  title={formatMoney({
                    amount: point.revenueCents,
                    currency: view.monthlyRevenue.currency,
                  })}
                />
                <span className="text-[10px] font-medium text-[var(--fn-text-muted)]">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        )}
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
      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">
        {label}
      </p>
      <p className={`mt-1 m-0 text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}
