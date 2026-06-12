import type { Money } from '@/types/api';

export function formatMoney(m: { amount: number; currency: string }): string {
  const amount = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(m.amount / 100);
  const symbol =
    m.currency === 'USD' || m.currency === 'ARS' || m.currency === 'UYU' ? '$' : m.currency;
  return `${symbol}${amount}`;
}

export function formatClassDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', {
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
