'use client';

import { useCallback, useEffect, useState } from 'react';

import { AnalyticsMetricsView } from '@/components/analytics/analytics-metrics-view';
import { Button } from '@/components/ui/button';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { apiGetInstitutionMetrics, apiGetInstructorMetrics } from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type { MetricsPeriod } from '@/types/api';
import {
  isAnalyticsEmpty,
  toAnalyticsViewModel,
  type AnalyticsScope,
  type AnalyticsViewModel,
} from '@/utils/analytics';

const PERIODS: { id: MetricsPeriod; label: string }[] = [
  { id: 'day', label: MOCK_V2V3_LABELS.analyticsPeriodDay },
  { id: 'week', label: MOCK_V2V3_LABELS.analyticsPeriodWeek },
  { id: 'month', label: MOCK_V2V3_LABELS.analyticsPeriodMonth },
];

export function AnalyticsMetricsPanel({ scope }: { scope: AnalyticsScope }) {
  const [period, setPeriod] = useState<MetricsPeriod>('week');
  const [data, setData] = useState<AnalyticsViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const metrics =
        scope === 'institution'
          ? await apiGetInstitutionMetrics(period)
          : await apiGetInstructorMetrics(period);
      setData(toAnalyticsViewModel(metrics));
    } catch (err) {
      setData(null);
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : MOCK_V2V3_LABELS.analyticsLoadError,
      );
    } finally {
      setLoading(false);
    }
  }, [period, scope]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-lg font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.analyticsTitle}</h2>
        <div className="flex rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 p-1">
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                period === item.id
                  ? 'bg-[var(--fn-surface)] text-[var(--fn-primary-text)] shadow-sm'
                  : 'text-[var(--fn-text-muted)] hover:text-[var(--fn-text)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="rounded-2xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 px-6 py-10 text-center text-sm text-[var(--fn-text-muted)]">
          {MOCK_V2V3_LABELS.analyticsLoading}
        </p>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
          <p className="m-0 text-sm text-[var(--fn-error)]">{error}</p>
          <div className="mt-3">
            <Button title="Reintentar" size="sm" variant="outline" onClick={() => void load()} />
          </div>
        </div>
      ) : null}

      {!loading && !error && data ? (
        isAnalyticsEmpty(data) ? (
          <p className="rounded-2xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 px-6 py-10 text-center text-sm text-[var(--fn-text-muted)]">
            {MOCK_V2V3_LABELS.analyticsEmpty}
          </p>
        ) : (
          <AnalyticsMetricsView
            data={data}
            showRetention={scope === 'institution'}
            showInstructors={scope === 'institution'}
          />
        )
      ) : null}
    </div>
  );
}
