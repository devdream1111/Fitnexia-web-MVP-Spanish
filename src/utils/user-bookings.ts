import type { BookingRecord } from '@/services/api';

const ACTIVE_BOOKING_STATUSES = ['confirmed', 'pending_payment'] as const;

export function isActiveBookingStatus(status: string): boolean {
  return ACTIVE_BOOKING_STATUSES.includes(status as (typeof ACTIVE_BOOKING_STATUSES)[number]);
}

/** Active booking for the current athlete on a class, if any. */
export function findActiveUserBooking(
  bookings: BookingRecord[],
  classId: string,
  userId: string,
): BookingRecord | undefined {
  return bookings.find(
    (booking) =>
      booking.classId === classId &&
      (booking.userId === userId || booking.userId === 'me') &&
      isActiveBookingStatus(booking.status),
  );
}
