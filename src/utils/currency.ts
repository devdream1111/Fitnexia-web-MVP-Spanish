import { DEFAULT_CURRENCY, USD_TO_UYU_RATE } from '@/constants/fitnexia';

/** Convert a USD major-unit amount (e.g. 25) to UYU major units at the reference rate. */
export function usdToUyu(usd: number): number {
  return Math.round(usd * USD_TO_UYU_RATE);
}

/** Convert USD cents (minor units) to UYU cents at the reference rate. */
export function usdCentsToUyuCents(usdCents: number): number {
  return Math.round((usdCents / 100) * USD_TO_UYU_RATE * 100);
}

export function isUyuCurrency(currency?: string | null): boolean {
  return (currency ?? DEFAULT_CURRENCY).toUpperCase() === DEFAULT_CURRENCY;
}
