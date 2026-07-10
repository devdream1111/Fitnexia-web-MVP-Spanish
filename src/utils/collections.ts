import type { ClubCollectionsPanel, ClubMembersSummary, Money } from '@/types/api';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import { normalizeClubMembersSummary } from '@/utils/club-members';

export interface CollectionsPanelViewModel {
  summary: ClubMembersSummary;
  monthlyRevenue: Money;
  expectedRevenue: Money;
  collectionRate: number;
  paymentsCount: number;
  pendingPayments: number;
  failedPayments: number;
  dailyTrend: { date: string; label: string; revenueCents: number; rate: number }[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function parseMoney(value: unknown, fallbackCurrency: string = DEFAULT_CURRENCY): Money {
  const record = asRecord(value);
  if (record && typeof record.amount === 'number') {
    return {
      amount: record.amount,
      currency: String(record.currency ?? fallbackCurrency),
    };
  }
  return { amount: 0, currency: fallbackCurrency };
}

function dayLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
  });
}

/** Normalize `GET /institutions/me/members/collections` for the F-45 panel. */
export function toCollectionsPanelViewModel(payload: unknown): CollectionsPanelViewModel {
  const record = asRecord(payload) ?? {};
  const summaryRaw = asRecord(record.summary) ?? record;
  const month = asRecord(record.month) ?? {};
  const collected = parseMoney(month.collected);
  const expected = parseMoney(month.expected, collected.currency);
  const collectionRate =
    typeof month.collectionRate === 'number'
      ? month.collectionRate
      : expected.amount > 0
        ? collected.amount / expected.amount
        : 0;

  const summary = normalizeClubMembersSummary({
    ...summaryRaw,
    collectionRate,
  });

  const dailyRaw = Array.isArray(record.dailyCollections) ? record.dailyCollections : [];
  const maxCents = Math.max(
    1,
    ...dailyRaw.map((item) => {
      const row = asRecord(item);
      return Number(row?.collectedCents) || 0;
    }),
  );

  const dailyTrend = dailyRaw.map((item) => {
    const row = asRecord(item) ?? {};
    const date = String(row.date ?? '');
    const revenueCents = Number(row.collectedCents) || 0;
    return {
      date,
      label: dayLabel(date),
      revenueCents,
      rate: revenueCents / maxCents,
    };
  });

  return {
    summary,
    monthlyRevenue: collected,
    expectedRevenue: expected,
    collectionRate,
    paymentsCount: Number(month.paymentsCount) || 0,
    pendingPayments: Number(month.pendingCount) || 0,
    failedPayments: Number(month.failedCount) || 0,
    dailyTrend,
  };
}

export function emptyCollectionsPanel(): CollectionsPanelViewModel {
  return toCollectionsPanelViewModel({
    summary: { upToDate: 0, pending: 0, overdue: 0, total: 0 },
    month: {
      collected: { amount: 0, currency: DEFAULT_CURRENCY },
      expected: { amount: 0, currency: DEFAULT_CURRENCY },
      collectionRate: 0,
      paymentsCount: 0,
      pendingCount: 0,
      failedCount: 0,
    },
    dailyCollections: [],
  } satisfies ClubCollectionsPanel);
}
