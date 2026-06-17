import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import { isUyuCurrency, usdCentsToUyuCents } from '@/utils/currency';
import type { Money } from '@/types/api';

export const APP_LOCALE = 'es-UY';

function formatAmountMajorUnits(amountMajor: number, currency: string): string {
  const formatted = new Intl.NumberFormat(APP_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountMajor);

  if (isUyuCurrency(currency)) {
    return `${formatted} UYU`;
  }

  return new Intl.NumberFormat(APP_LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountMajor);
}

export function formatMoney(m: Pick<Money, 'amount' | 'currency'>): string {
  const currency = (m.currency || DEFAULT_CURRENCY).toUpperCase();
  let amountCents = m.amount;

  if (currency === 'USD') {
    return formatAmountMajorUnits(usdCentsToUyuCents(amountCents) / 100, DEFAULT_CURRENCY);
  }

  return formatAmountMajorUnits(amountCents / 100, currency);
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

export function formatMoneyFromCents(
  cents: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  return formatMoney({ amount: cents, currency });
}

export function formatCompactUyu(cents: number): string {
  if (cents >= 100000) {
    return `${(cents / 100000).toFixed(1)}k UYU`;
  }
  return formatMoneyFromCents(cents, DEFAULT_CURRENCY);
}
