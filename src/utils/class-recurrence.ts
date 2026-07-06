import { RECURRENCE_LABELS } from '@/constants/labels';
import { parseLocalDateOnly, timeStringToDate } from '@/utils/schedule';

/** Weeks of instances the backend generates per series horizon (see fitnexia-backend class-series.service). */
export const RECURRENCE_WEEKS_AHEAD = 8;

/** Hard cap to avoid excessive API calls on publish. */
export const RECURRENCE_MAX_INSTANCES = 52;

export function recurrenceWeekdayLabel(weekday: number): string {
  return RECURRENCE_LABELS.weekdayShort[weekday] ?? '?';
}

export function formatRecurrenceWeekdays(weekdays: number[]): string {
  return [...weekdays]
    .sort((a, b) => a - b)
    .map(recurrenceWeekdayLabel)
    .join(', ');
}

/**
 * Generate local calendar dates (YYYY-MM-DD) for a weekly recurrence.
 * Includes each selected weekday on or after seriesStartYmd for weeksAhead weeks.
 */
export function generateRecurringDates(
  seriesStartYmd: string,
  weekdays: number[],
  weeksAhead = RECURRENCE_WEEKS_AHEAD,
): string[] {
  if (!weekdays.length) return [];

  const sortedWeekdays = [...new Set(weekdays)].sort((a, b) => a - b);
  const seriesStart = parseLocalDateOnly(seriesStartYmd);
  seriesStart.setHours(0, 0, 0, 0);

  const end = new Date(seriesStart);
  end.setDate(end.getDate() + weeksAhead * 7);

  const dates: string[] = [];
  const cursor = new Date(seriesStart);

  while (cursor <= end && dates.length < RECURRENCE_MAX_INSTANCES) {
    if (sortedWeekdays.includes(cursor.getDay()) && cursor >= seriesStart) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const d = String(cursor.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function recurringStartAtFromDateAndTime(ymd: string, startTime: string): string {
  const date = parseLocalDateOnly(ymd);
  return timeStringToDate(startTime, date).toISOString();
}

export function classHasBookings(item: { capacity?: number; spotsLeft?: number }): boolean {
  if (item.capacity == null || item.spotsLeft == null) return false;
  return item.spotsLeft < item.capacity;
}

export function isClassInPast(startAt: string): boolean {
  return new Date(startAt).getTime() < Date.now();
}
