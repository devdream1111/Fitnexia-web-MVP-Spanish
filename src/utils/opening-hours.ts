import type { OpeningHours, OpeningHoursDayKey } from '@/types/api';

export const OPENING_HOURS_DAY_KEYS: OpeningHoursDayKey[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

export const OPENING_HOURS_DAY_LABELS: Record<OpeningHoursDayKey, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
};

export function defaultOpeningHours(): OpeningHours {
  const hours: OpeningHours = {};
  for (const key of OPENING_HOURS_DAY_KEYS) {
    hours[key] = { open: '09:00', close: '18:00' };
  }
  hours.sun = { closed: true };
  return hours;
}

export function normalizeOpeningHours(raw: unknown): OpeningHours {
  if (!raw || typeof raw !== 'object') return defaultOpeningHours();
  const out: OpeningHours = {};
  for (const key of OPENING_HOURS_DAY_KEYS) {
    const day = (raw as Record<string, unknown>)[key];
    if (!day || typeof day !== 'object') continue;
    const d = day as Record<string, unknown>;
    if (d.closed === true) {
      out[key] = { closed: true };
    } else if (typeof d.open === 'string' && typeof d.close === 'string') {
      out[key] = { open: d.open, close: d.close };
    }
  }
  return Object.keys(out).length > 0 ? out : defaultOpeningHours();
}

export function formatOpeningHoursLine(hours: OpeningHours): string[] {
  return OPENING_HOURS_DAY_KEYS.map((key) => {
    const day = hours[key];
    const label = OPENING_HOURS_DAY_LABELS[key];
    if (!day || day.closed) return `${label}: Cerrado`;
    return `${label}: ${day.open ?? '—'} – ${day.close ?? '—'}`;
  });
}

export function jobRoleLabel(role: string): string {
  if (role === 'trainer') return 'Entrenador/a';
  if (role === 'staff') return 'Staff';
  return 'Instructor/a';
}

export function jobStatusLabel(status: string): string {
  if (status === 'draft') return 'Borrador';
  if (status === 'closed') return 'Cerrada';
  return 'Abierta';
}
