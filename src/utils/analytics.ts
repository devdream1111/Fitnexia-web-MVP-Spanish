import type {
  InstitutionMetrics,
  InstructorMetrics,
  MetricsDailyPoint,
  MetricsPeriod,
} from '@/types/api';

const WEEKDAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

export type AnalyticsScope = 'institution' | 'instructor';

export type AnalyticsViewModel = {
  bookings: number;
  revenueCents: number;
  currency: string;
  occupancyRate: number;
  retentionRate?: number;
  daily: { label: string; bookings: number; revenueCents: number }[];
  topClasses: { title: string; occupancyRate: number; bookings: number; revenueCents: number }[];
  topInstructors?: { name: string; bookings: number; revenueCents: number }[];
};

export function formatDailyLabel(dateIso: string): string {
  const date = new Date(`${dateIso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateIso;
  return WEEKDAY_SHORT[date.getDay()] ?? dateIso.slice(5);
}

export function fillDailySeries(
  daily: MetricsDailyPoint[],
  period: MetricsPeriod,
): { label: string; bookings: number; revenueCents: number }[] {
  if (period === 'day') {
    const point = daily[0];
    return [
      {
        label: point ? formatDailyLabel(point.date) : 'Hoy',
        bookings: point?.bookings ?? 0,
        revenueCents: point?.revenueCents ?? 0,
      },
    ];
  }

  const days = period === 'month' ? 30 : 7;
  const byDate = new Map(daily.map((d) => [d.date, d]));
  const series: { label: string; bookings: number; revenueCents: number }[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const point = byDate.get(key);
    series.push({
      label: period === 'month' ? String(date.getDate()) : WEEKDAY_SHORT[date.getDay()],
      bookings: point?.bookings ?? 0,
      revenueCents: point?.revenueCents ?? 0,
    });
  }

  return series;
}

export function toAnalyticsViewModel(
  metrics: InstitutionMetrics | InstructorMetrics,
): AnalyticsViewModel {
  const institution = 'retentionRate' in metrics ? (metrics as InstitutionMetrics) : null;
  const dailySource = metrics.daily ?? [];
  return {
    bookings: metrics.bookings,
    revenueCents: metrics.revenue.amount,
    currency: metrics.revenue.currency,
    occupancyRate: metrics.occupancyRate,
    retentionRate: institution?.retentionRate,
    // Institution API returns daily; instructor API currently does not — skip empty charts.
    daily: dailySource.length > 0 ? fillDailySeries(dailySource, metrics.period) : [],
    topClasses: metrics.topClasses.map((c) => ({
      title: c.title,
      occupancyRate: c.occupancyRate,
      bookings: c.bookings,
      revenueCents: c.revenueCents,
    })),
    topInstructors: institution?.topInstructors,
  };
}

export function isAnalyticsEmpty(view: AnalyticsViewModel): boolean {
  return (
    view.bookings === 0 &&
    view.revenueCents === 0 &&
    view.topClasses.length === 0 &&
    view.daily.every((d) => d.bookings === 0)
  );
}
