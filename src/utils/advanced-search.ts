import {
  CLASS_LANGUAGES,
  CLASS_LEVELS,
  INSTRUCTOR_GENDERS,
  type AdvancedGenderFilter,
  type AdvancedLanguageFilter,
  type AdvancedLevelFilter,
} from '@/constants/fitnexia';
import type { ClassSearchParams } from '@/services/api';
import type { ClassLevel, ClassListItem, InstructorGender } from '@/types/api';

export interface AdvancedSearchFilters {
  level: AdvancedLevelFilter;
  language: AdvancedLanguageFilter;
  instructorGender: AdvancedGenderFilter;
}

export const DEFAULT_ADVANCED_SEARCH_FILTERS: AdvancedSearchFilters = {
  level: 'any',
  language: 'any',
  instructorGender: 'any',
};

export function advancedFiltersActive(filters: AdvancedSearchFilters): boolean {
  return filters.level !== 'any' || filters.language !== 'any' || filters.instructorGender !== 'any';
}

/** Map UI advanced filters to `GET /classes/search` query params. */
export function advancedFiltersToApiParams(
  filters: AdvancedSearchFilters,
): Pick<ClassSearchParams, 'level' | 'language' | 'instructorGender'> {
  const params: Pick<ClassSearchParams, 'level' | 'language' | 'instructorGender'> = {};
  if (filters.level !== 'any') params.level = filters.level;
  if (filters.language !== 'any') params.language = filters.language;
  if (filters.instructorGender !== 'any') params.instructorGender = filters.instructorGender;
  return params;
}

function normalizeLanguage(value: string): string {
  const v = value.trim().toLowerCase();
  if (v === 'español' || v === 'spanish' || v === 'es') return 'es';
  if (v === 'inglés' || v === 'english' || v === 'en') return 'en';
  if (v === 'portugués' || v === 'portuguese' || v === 'pt') return 'pt';
  return v;
}

function classLanguageCode(item: ClassListItem): string | null {
  if (!item.language?.trim()) return null;
  return normalizeLanguage(item.language);
}

export function matchesAdvancedSearch(
  item: ClassListItem,
  filters: AdvancedSearchFilters,
): boolean {
  if (filters.level !== 'any') {
    if (!item.level || item.level !== filters.level) return false;
  }

  if (filters.language !== 'any') {
    const code = classLanguageCode(item);
    if (!code || code !== filters.language) return false;
  }

  if (filters.instructorGender !== 'any') {
    const gender = item.instructor?.gender;
    if (!gender || gender !== filters.instructorGender) return false;
  }

  return true;
}

export function levelLabel(level: ClassLevel): string {
  return CLASS_LEVELS.find((l) => l.id === level)?.label ?? level;
}

export function languageLabel(code: string): string {
  const normalized = normalizeLanguage(code);
  return CLASS_LANGUAGES.find((l) => l.id === normalized)?.label ?? code;
}

export function instructorGenderLabel(gender: InstructorGender): string {
  return INSTRUCTOR_GENDERS.find((g) => g.id === gender)?.label ?? gender;
}
