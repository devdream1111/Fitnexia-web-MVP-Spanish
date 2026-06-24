import type { WeeklyDaySchedule, WeeklySchedule } from '@/types/api';
import { parseClassStartAt } from '@/utils/format';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function weekdayLabel(weekday: number): string {
  return WEEKDAY_LABELS[weekday] ?? '?';
}

export function defaultWeeklySchedule(): WeeklySchedule {
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    enabled: weekday >= 1 && weekday <= 5,
    startTime: '09:00',
    endTime: '17:00',
  }));
}

export function parseTimeString(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(':').map((part) => parseInt(part, 10));
  return { hours: h || 0, minutes: m || 0 };
}

export function formatTimeString(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function timeStringToDate(time: string, base = new Date()): Date {
  const { hours, minutes } = parseTimeString(time);
  const d = new Date(base);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function dateToTimeString(date: Date): string {
  return formatTimeString(date.getHours(), date.getMinutes());
}

export function combineDateAndTime(date: Date, time: Date): Date {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
}

/** Parse YYYY-MM-DD from <input type="date"> as local midnight (not UTC). */
export function parseLocalDateOnly(ymd: string): Date {
  const [year, month, day] = ymd.split('-').map(Number);
  if (!year || !month || !day) {
    throw new Error('Invalid date');
  }
  return new Date(year, month - 1, day);
}

/** Format a Date for <input type="date"> in the user's local timezone. */
export function formatLocalDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Build API startAt from form date + time fields. */
export function classStartAtFromForm(startDate: string, startTime: string): string {
  const date = parseLocalDateOnly(startDate);
  return timeStringToDate(startTime, date).toISOString();
}

/** Split API startAt into form fields (local calendar date + HH:MM). */
export function splitClassStartForForm(startAt: string): { date: string; time: string } {
  const local = parseClassStartAt(startAt);
  return {
    date: formatLocalDateInput(local),
    time: dateToTimeString(local),
  };
}

export function formatScheduleDay(day: WeeklyDaySchedule): string {
  if (!day.enabled) return 'Off';
  return `${day.startTime} – ${day.endTime}`;
}

export function formatWeeklyScheduleSummary(schedule: WeeklySchedule): string {
  const active = schedule.filter((d) => d.enabled);
  if (active.length === 0) return 'No hours set';
  if (active.length === 7 && active.every((d) => d.startTime === active[0].startTime && d.endTime === active[0].endTime)) {
    return `Daily ${active[0].startTime}–${active[0].endTime}`;
  }
  const weekdays = active.filter((d) => d.weekday >= 1 && d.weekday <= 5);
  if (weekdays.length === 5 && active.length === 5) {
    return `Mon–Fri ${weekdays[0].startTime}–${weekdays[0].endTime}`;
  }
  return `${active.length} days/week`;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function defaultClassStart(): { date: Date; time: Date } {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  const time = new Date();
  time.setHours(9, 0, 0, 0);
  return { date, time };
}
