import type { ClassListItem } from '@/types/api';

export type GymMetricsView = {
  bookings: number;
  revenueCents: number;
  attendanceRate: number;
  bookingsChangePct: number;
  revenueChangePct: number;
  attendanceChangePct: number;
  daily: { label: string; bookings: number; revenueCents: number; attendancePct: number }[];
  topClasses: { title: string; attendancePct: number; bookings: number }[];
};

export function formatGymChange(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${Math.round(pct * 100)}% vs last week`;
}

export function formatRevenueCompact(cents: number, currency = 'UYU'): string {
  if (cents >= 100000) {
    return `$${(cents / 100000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'UYU' ? 'USD' : currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function getGymMetrics(institutionId: string, classes: ClassListItem[]): GymMetricsView {
  const gymClasses = classes.filter((c) => c.institution?.id === institutionId);

  let totalCapacity = 0;
  let totalBooked = 0;
  let extraRevenue = 0;

  const topClasses = gymClasses.map((c) => {
    const capacity = c.capacity ?? 1;
    const spotsLeft = c.spotsLeft ?? capacity;
    const booked = Math.max(0, capacity - spotsLeft);
    totalCapacity += capacity;
    totalBooked += booked;
    extraRevenue += booked * c.price.amount;
    return {
      title: c.title,
      attendancePct: capacity > 0 ? booked / capacity : 0,
      bookings: booked,
    };
  });

  const liveAttendance = totalCapacity > 0 ? totalBooked / totalCapacity : 0;

  return {
    bookings: totalBooked,
    revenueCents: extraRevenue,
    attendanceRate: gymClasses.length > 0 ? liveAttendance : 0,
    bookingsChangePct: 0,
    revenueChangePct: 0,
    attendanceChangePct: 0,
    daily: [],
    topClasses: topClasses.sort((a, b) => b.attendancePct - a.attendancePct),
  };
}

export function formatAttendanceRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
