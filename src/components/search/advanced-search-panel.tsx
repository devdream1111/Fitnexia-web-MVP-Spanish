'use client';

import { SlidersHorizontal } from 'lucide-react';

import { SearchFilterDropdown } from '@/components/search/search-filter-dropdown';
import {
  CLASS_LANGUAGES,
  CLASS_LEVELS,
  ADVANCED_SEARCH_GENDERS,
  type AdvancedGenderFilter,
  type AdvancedLanguageFilter,
  type AdvancedLevelFilter,
} from '@/constants/fitnexia';
import { ADVANCED_SEARCH_LABELS } from '@/constants/labels';
import type { AdvancedSearchFilters } from '@/utils/advanced-search';

export function AdvancedSearchPanel({
  filters,
  onChange,
  expanded,
  onToggleExpanded,
}: {
  filters: AdvancedSearchFilters;
  onChange: (next: AdvancedSearchFilters) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const levelOptions = [
    { value: 'any', label: ADVANCED_SEARCH_LABELS.anyLevel },
    ...CLASS_LEVELS.map((l) => ({ value: l.id, label: l.label })),
  ];

  const languageOptions = [
    { value: 'any', label: ADVANCED_SEARCH_LABELS.anyLanguage },
    ...CLASS_LANGUAGES.map((l) => ({ value: l.id, label: l.label })),
  ];

  const genderOptions = [
    { value: 'any', label: ADVANCED_SEARCH_LABELS.anyGender },
    ...ADVANCED_SEARCH_GENDERS.map((g) => ({ value: g.id, label: g.label })),
  ];

  return (
    <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)]">
      <button
        type="button"
        onClick={onToggleExpanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--fn-surface-muted)]/60 md:px-5"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--fn-text)]">
          <SlidersHorizontal size={18} className="text-[var(--fn-primary)]" />
          {ADVANCED_SEARCH_LABELS.sectionTitle}
        </span>
        <span className="text-xs font-medium text-[var(--fn-primary)]">
          {expanded ? ADVANCED_SEARCH_LABELS.toggleHide : ADVANCED_SEARCH_LABELS.toggleShow}
        </span>
      </button>

      {expanded ? (
        <div className="grid gap-4 border-t border-[var(--fn-border)] px-4 py-4 md:grid-cols-3 md:px-5">
          <SearchFilterDropdown
            value={filters.level}
            onChange={(val) => onChange({ ...filters, level: val as AdvancedLevelFilter })}
            options={levelOptions}
            placeholder={ADVANCED_SEARCH_LABELS.level}
            ariaLabel={ADVANCED_SEARCH_LABELS.level}
          />
          <SearchFilterDropdown
            value={filters.language}
            onChange={(val) => onChange({ ...filters, language: val as AdvancedLanguageFilter })}
            options={languageOptions}
            placeholder={ADVANCED_SEARCH_LABELS.language}
            ariaLabel={ADVANCED_SEARCH_LABELS.language}
          />
          <SearchFilterDropdown
            value={filters.instructorGender}
            onChange={(val) =>
              onChange({ ...filters, instructorGender: val as AdvancedGenderFilter })
            }
            options={genderOptions}
            placeholder={ADVANCED_SEARCH_LABELS.instructorGender}
            ariaLabel={ADVANCED_SEARCH_LABELS.instructorGender}
          />
        </div>
      ) : null}
    </section>
  );
}
