import { isSameCalendarDay } from '@/utils/schedule';

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

/** Flat grid: leading nulls + each day of the month (Sun-first week rows). */
export function buildMonthGrid(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = first.getDay();
  const cells: (Date | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function isToday(date: Date): boolean {
  return isSameCalendarDay(date, new Date());
}

export type ScheduleTab = 'upcoming' | 'past';

/** Class session is still in the future (by start time). */
export function isClassUpcoming(startAt: string, now = Date.now()): boolean {
  const t = new Date(startAt).getTime();
  return !Number.isNaN(t) && t > now;
}

/** Class session has already started (by start time). */
export function isClassPast(startAt: string, now = Date.now()): boolean {
  const t = new Date(startAt).getTime();
  return !Number.isNaN(t) && t <= now;
}

export function filterClassesByScheduleTab<T extends { startAt: string }>(
  classes: T[],
  tab: ScheduleTab,
  now = Date.now(),
): T[] {
  return classes.filter((c) => {
    if (!c?.startAt) return false;
    const upcoming = isClassUpcoming(c.startAt, now);
    return tab === 'upcoming' ? upcoming : !upcoming;
  });
}

const ACTIVE_UPCOMING_STATUSES = ['confirmed', 'pending_payment'] as const;
const PAST_TAB_STATUSES = ['completed', 'cancelled', 'refunded', 'no_show'] as const;

/** Athlete bookings list + calendar: same tab rules for status and class date. */
export function filterAthleteBookingsByTab<T extends { status: string }>(
  bookings: T[],
  tab: ScheduleTab,
  getStartAt: (booking: T) => string | undefined,
  now = Date.now(),
): T[] {
  return bookings.filter((booking) => {
    const startAt = getStartAt(booking);
    if (!startAt) return false;
    const upcoming = isClassUpcoming(startAt, now);
    if (tab === 'upcoming') {
      return upcoming && ACTIVE_UPCOMING_STATUSES.includes(booking.status as (typeof ACTIVE_UPCOMING_STATUSES)[number]);
    }
    return (
      !upcoming ||
      PAST_TAB_STATUSES.includes(booking.status as (typeof PAST_TAB_STATUSES)[number])
    );
  });
}
