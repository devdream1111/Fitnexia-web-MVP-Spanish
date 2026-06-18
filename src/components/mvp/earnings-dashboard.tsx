'use client';

import { useEffect, useState } from 'react';
import { Download, TrendingUp, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DashboardHero,
  DashboardPage,
  DashboardSection,
  DASHBOARD_GRADIENTS,
} from '@/components/dashboard/dashboard-ui';
import {
  apiDownloadPayoutsCsv,
  apiGetPayoutSummary,
  apiListPayouts,
  type PayoutRecord,
  type PayoutSummary,
} from '@/services/api';
import { downloadBlobAsFile } from '@/utils/download-file';
import { formatMoneyFromCents } from '@/utils/format';
import { GENERAL_LABELS, INSTRUCTOR_LABELS } from '@/constants/labels';

export function EarningsDashboard({
  eyebrow,
  title,
  gradient = DASHBOARD_GRADIENTS.instructor,
}: {
  eyebrow: string;
  title: string;
  gradient?: string;
}) {
  const [weekSummary, setWeekSummary] = useState<PayoutSummary | null>(null);
  const [monthSummary, setMonthSummary] = useState<PayoutSummary | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [week, month, list] = await Promise.all([
          apiGetPayoutSummary('week'),
          apiGetPayoutSummary('month'),
          apiListPayouts({ limit: 20 }),
        ]);
        if (!cancelled) {
          setWeekSummary(week);
          setMonthSummary(month);
          setPayouts(list.data);
        }
      } catch {
        if (!cancelled) {
          setWeekSummary(null);
          setMonthSummary(null);
          setPayouts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setExportError('');
    setExporting(true);
    try {
      const blob = await apiDownloadPayoutsCsv();
      downloadBlobAsFile(blob, 'fitnexia-payouts.csv');
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'No se pudo exportar');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardPage>
      <DashboardHero gradient={gradient} eyebrow={eyebrow} title={title}>
        <div className="flex flex-col items-end gap-2">
          <Button
            title="Exportar CSV"
            variant="secondary"
            className="!bg-white/15 !text-white hover:!bg-white/25"
            loading={exporting}
            onClick={handleExport}
          >
            <Download size={16} className="mr-2" />
            Exportar CSV
          </Button>
          {exportError ? (
            <p className="max-w-xs text-right text-sm text-red-200" role="alert">
              {exportError}
            </p>
          ) : null}
        </div>
      </DashboardHero>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
            <TrendingUp size={20} />
          </div>
          <p className="text-sm text-[var(--fn-text-muted)]">{INSTRUCTOR_LABELS.earnings.thisWeek}</p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--fn-primary)]">
            {weekSummary ? formatMoneyFromCents(weekSummary.net, weekSummary.currency) : '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600">
            <Wallet size={20} />
          </div>
          <p className="text-sm text-[var(--fn-text-muted)]">
            {INSTRUCTOR_LABELS.earnings.thisMonth ?? 'Este mes'}
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--fn-text)]">
            {monthSummary ? formatMoneyFromCents(monthSummary.net, monthSummary.currency) : '—'}
          </p>
        </div>
        {monthSummary ? (
          <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 p-6 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">
              Comisión ({monthSummary.plan})
            </p>
            <p className="mt-2 text-lg font-bold">{monthSummary.commissionRate}%</p>
            <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
              Bruto {formatMoneyFromCents(monthSummary.gross, monthSummary.currency)} · Neto{' '}
              {formatMoneyFromCents(monthSummary.net, monthSummary.currency)}
            </p>
          </div>
        ) : null}
      </div>

      <DashboardSection title="Historial de liquidaciones">
        {loading ? (
          <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
        ) : payouts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--fn-border)] px-6 py-10 text-center text-[var(--fn-text-muted)]">
            Aún no hay liquidaciones registradas.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--fn-border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--fn-surface-muted)] text-xs uppercase tracking-wide text-[var(--fn-text-muted)]">
                <tr>
                  <th className="px-4 py-3">Clase</th>
                  <th className="px-4 py-3">Importe</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-t border-[var(--fn-border)]">
                    <td className="px-4 py-3 font-medium">{p.classTitle}</td>
                    <td className="px-4 py-3 text-[var(--fn-primary)]">
                      {formatMoneyFromCents(p.amount.amount, p.amount.currency)}
                    </td>
                    <td className="px-4 py-3 capitalize text-[var(--fn-text-muted)]">{p.status}</td>
                    <td className="px-4 py-3 text-[var(--fn-text-muted)]">
                      {new Date(p.createdAt).toLocaleDateString('es-UY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>
    </DashboardPage>
  );
}
