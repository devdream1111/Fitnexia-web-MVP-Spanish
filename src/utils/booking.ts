import type { Booking, Money } from '@/types/api';

export const DEFAULT_CANCELLATION_POLICY_HOURS = 24;

export function resolveCancellationPolicyHours(
  cls?: { cancellationPolicyHours?: number } | null,
): number {
  const hours = cls?.cancellationPolicyHours;
  return typeof hours === 'number' && Number.isFinite(hours) && hours >= 0
    ? hours
    : DEFAULT_CANCELLATION_POLICY_HOURS;
}

export function canCancelBooking(
  classStartAt: string,
  cancellationPolicyHours = DEFAULT_CANCELLATION_POLICY_HOURS,
): boolean {
  const classStart = new Date(classStartAt);
  const now = new Date();
  const hoursUntilClass = (classStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilClass >= cancellationPolicyHours;
}

export function getRefundAmount(
  booking: Booking,
  classStartAt: string,
  cancellationPolicyHours = DEFAULT_CANCELLATION_POLICY_HOURS,
): Money {
  if (canCancelBooking(classStartAt, cancellationPolicyHours)) {
    return booking.price;
  }
  return { amount: 0, currency: booking.price.currency };
}
