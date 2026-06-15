import type { Money } from '@/types/api';

export const APP_LOCALE = 'es-UY';

export function formatMoney(m: { amount: number; currency: string }): string {
  const amount = new Intl.NumberFormat(APP_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(m.amount / 100);
  const symbol =
    m.currency === 'USD' || m.currency === 'ARS' || m.currency === 'UYU' ? '$' : m.currency;
  return `${symbol}${amount}`;
}

/** Parse API class startAt as a local calendar instant (handles date-only strings). */
export function parseClassStartAt(iso: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(iso);
}

export function isClassOnCalendarDay(iso: string, day: Date): boolean {
  const start = parseClassStartAt(iso);
  if (Number.isNaN(start.getTime())) return false;
  return (
    start.getFullYear() === day.getFullYear() &&
    start.getMonth() === day.getMonth() &&
    start.getDate() === day.getDate()
  );
}

export function formatClassDate(iso: string): string {
  const d = parseClassStartAt(iso);
  return d.toLocaleDateString(APP_LOCALE, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMoneyFromCents(cents: number, currency = 'UYU'): string {
  return formatMoney({ amount: cents, currency });
}
