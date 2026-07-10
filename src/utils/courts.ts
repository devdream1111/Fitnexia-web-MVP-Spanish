import type {
  Court,
  CourtDayHours,
  CourtLocationType,
  CourtOperatingHours,
  CourtSportType,
  CourtSurface,
  CourtWeekdayKey,
} from '@/types/api';
import { MOCK_V2V3_LABELS } from '@/constants/labels';

export const COURT_WEEKDAY_KEYS: CourtWeekdayKey[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];

export const COURT_SPORT_TYPES: { id: CourtSportType; label: string }[] = [
  { id: 'padel', label: MOCK_V2V3_LABELS.courtTypes.padel },
  { id: 'tennis', label: MOCK_V2V3_LABELS.courtTypes.tennis },
  { id: 'football_5', label: MOCK_V2V3_LABELS.courtTypes.football_5 },
  { id: 'football_7', label: MOCK_V2V3_LABELS.courtTypes.football_7 },
  { id: 'football_11', label: MOCK_V2V3_LABELS.courtTypes.football_11 },
  { id: 'rugby', label: MOCK_V2V3_LABELS.courtTypes.rugby },
  { id: 'other', label: 'Otro' },
];

export const COURT_SURFACES: { id: CourtSurface; label: string }[] = [
  { id: 'synthetic', label: 'Sintético' },
  { id: 'grass', label: 'Césped' },
  { id: 'clay', label: 'Polvo de ladrillo' },
  { id: 'hard', label: 'Dura' },
  { id: 'other', label: 'Otra' },
];

export const COURT_LOCATION_TYPES: { id: CourtLocationType; label: string }[] = [
  { id: 'outdoor', label: 'Exterior' },
  { id: 'indoor', label: 'Interior' },
];

export function defaultOperatingHours(
  open = '08:00',
  close = '22:00',
): CourtOperatingHours {
  const hours: CourtOperatingHours = {};
  for (const key of COURT_WEEKDAY_KEYS) {
    hours[key] = { open, close };
  }
  return hours;
}

export function courtSportLabel(sportType: string): string {
  return (
    MOCK_V2V3_LABELS.courtTypes[sportType as keyof typeof MOCK_V2V3_LABELS.courtTypes] ??
    sportType
  );
}

export function courtSurfaceLabel(surface: string): string {
  return COURT_SURFACES.find((item) => item.id === surface)?.label ?? surface;
}

export function courtLocationLabel(locationType: string): string {
  return COURT_LOCATION_TYPES.find((item) => item.id === locationType)?.label ?? locationType;
}

export function summarizeOperatingHours(hours: CourtOperatingHours | undefined): string {
  if (!hours) return 'Sin horario';
  const openDays = COURT_WEEKDAY_KEYS.map((key) => hours[key]).filter(
    (day): day is CourtDayHours => Boolean(day) && !day?.closed && Boolean(day?.open && day?.close),
  );
  if (!openDays.length) return 'Cerrado';
  const first = openDays[0];
  const uniform = openDays.every((day) => day.open === first.open && day.close === first.close);
  if (uniform) return `${first.open}–${first.close}`;
  return `${openDays.length} días con horario`;
}

export function formatSlotTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function localDateInputValue(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isActiveCourt(court: Court): boolean {
  return court.active !== false;
}
