import type { Booking, Money } from '@/types/api';

export function canCancelBooking(
  classStartAt: string,
  cancellationPolicyHours = 24,
): boolean {
  const classStart = new Date(classStartAt);
  const now = new Date();
  const hoursUntilClass = (classStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilClass >= cancellationPolicyHours;
}

export function getRefundAmount(
  booking: Booking,
  classStartAt: string,
  cancellationPolicyHours = 24,
): Money {
  if (canCancelBooking(classStartAt, cancellationPolicyHours)) {
    return booking.price;
  }
  return { amount: 0, currency: booking.price.currency };
}
