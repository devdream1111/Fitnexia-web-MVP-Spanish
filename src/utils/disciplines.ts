import { DISCIPLINES } from '@/constants/fitnexia';
import { DISCIPLINE_LABELS } from '@/constants/labels';

const DISCIPLINE_SET = new Set<string>(DISCIPLINES);

export function isValidDiscipline(value: string): boolean {
  return DISCIPLINE_SET.has(value);
}

export function disciplineLabel(value: string): string {
  return DISCIPLINE_LABELS[value as keyof typeof DISCIPLINE_LABELS] ?? value;
}

export function disciplineSelectOptions(): { value: string; label: string }[] {
  return DISCIPLINES.map((d) => ({
    value: d,
    label: disciplineLabel(d),
  }));
}

export function filterValidDisciplines(values: string[]): string[] {
  return values.filter(isValidDiscipline);
}

export function coerceDiscipline(
  value: string | null | undefined,
  fallback: string = DISCIPLINES[0],
): string {
  if (value && isValidDiscipline(value)) return value;
  return fallback;
}
