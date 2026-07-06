'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Search as SearchIcon, MapPin, X } from 'lucide-react';

import { ClassCard } from '@/components/class-card';
import { AdvancedSearchPanel } from '@/components/search/advanced-search-panel';
import { SearchFilterDropdown } from '@/components/search/search-filter-dropdown';
import { FilterChip } from '@/components/ui/filter-chip';
import {
  CLASS_LANGUAGES,
  CLASS_LEVELS,
  ADVANCED_SEARCH_GENDERS,
  PRICE_RANGES,
  SCHEDULE_FILTERS,
  type ScheduleFilter,
} from '@/constants/fitnexia';
import { InstitutionClubCard } from '@/components/mock-v2v3/institution-club-card';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';
import {
  ADVANCED_SEARCH_LABELS,
  MODALITY_LABELS,
  modalityBadgeLabel,
  GENERAL_LABELS,
  VERIFICATION_LABELS,
  MOCK_V2V3_LABELS,
} from '@/constants/labels';
import { mockInstitutionsService } from '@/services/mock/institutions.mock';
import { disciplineLabel, disciplineSelectOptions } from '@/utils/disciplines';
import { useFeature } from '@/hooks/use-feature';
import { useClasses } from '@/contexts/classes-context';
import { apiGetClassMapMarkers, type MapMarker } from '@/services/api';
import {
  advancedFiltersActive,
  advancedFiltersToApiParams,
  DEFAULT_ADVANCED_SEARCH_FILTERS,
  type AdvancedSearchFilters,
} from '@/utils/advanced-search';
import { getAthleteTrainingLevel } from '@/utils/athlete-preferences';
import { filterClasses, sortClassesByDate } from '@/utils/class-filters';
import type { Modality } from '@/types/api';

const ClassMap = dynamic(() => import('@/components/map/Map').then((m) => m.ClassMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)] text-sm text-[var(--fn-text-muted)]">
      Cargando mapa…
    </div>
  ),
});

export default function SearchPage() {
  const { classes, searchClasses, loading } = useClasses();
  const geolocationEnabled = useFeature('geolocationMap');
  const advancedSearchEnabled = useFeature('advancedSearch');
  const institutionSearchEnabled = useFeature('institutionSearch');
  const [searchMode, setSearchMode] = useState<'classes' | 'clubs'>('classes');
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [modality, setModality] = useState<Modality | null>(null);
  const [location, setLocation] = useState('');
  const [schedule, setSchedule] = useState<ScheduleFilter>('any');
  const [priceRangeId, setPriceRangeId] = useState('any');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>(
    DEFAULT_ADVANCED_SEARCH_FILTERS,
  );
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  useEffect(() => {
    const savedLevel = getAthleteTrainingLevel();
    if (savedLevel) {
      setAdvancedFilters((prev) =>
        prev.level === 'any' ? { ...prev, level: savedLevel } : prev,
      );
    }
  }, []);

  const priceRange = PRICE_RANGES.find((p) => p.id === priceRangeId) ?? PRICE_RANGES[0];

  useEffect(() => {
    const params = {
      q: query || undefined,
      discipline: discipline ?? undefined,
      modality: modality ?? undefined,
      priceMin: priceRange.min === 0 ? undefined : priceRange.min,
      priceMax: Number.isFinite(priceRange.max) ? priceRange.max : undefined,
      verifiedOnly: verifiedOnly || undefined,
      limit: 50,
      ...(advancedSearchEnabled ? advancedFiltersToApiParams(advancedFilters) : {}),
    };
    searchClasses(params);
    if (geolocationEnabled) {
      apiGetClassMapMarkers(params)
        .then((res) => setMapMarkers(res.data))
        .catch(() => setMapMarkers([]));
    }
  }, [
    query,
    discipline,
    modality,
    priceRange.min,
    priceRange.max,
    verifiedOnly,
    advancedSearchEnabled,
    advancedFilters,
    searchClasses,
    geolocationEnabled,
  ]);

  const clubResults = useMemo(() => {
    if (!institutionSearchEnabled || searchMode !== 'clubs') return [];
    return mockInstitutionsService.search(query || location);
  }, [institutionSearchEnabled, searchMode, query, location]);

  const results = useMemo(() => {
    const filtered = filterClasses(classes, {
      query: '',
      discipline: null,
      modality: null,
      location,
      schedule,
      priceMin: null,
      priceMax: null,
      advanced: DEFAULT_ADVANCED_SEARCH_FILTERS,
    });
    return sortClassesByDate(filtered);
  }, [classes, location, schedule]);

  const visibleMapMarkers = useMemo(() => {
    if (!location.trim() && schedule === 'any') {
      return mapMarkers;
    }
    const ids = new Set(results.map((c) => c.id));
    return mapMarkers.filter((m) => ids.has(m.id));
  }, [mapMarkers, results, location, schedule]);

  const clearFilters = () => {
    setQuery('');
    setDiscipline(null);
    setModality(null);
    setLocation('');
    setSchedule('any');
    setPriceRangeId('any');
    setVerifiedOnly(false);
    setAdvancedFilters(DEFAULT_ADVANCED_SEARCH_FILTERS);
    setAdvancedExpanded(false);
  };

  const activeFilters = useMemo(() => {
    const filters: { type: string; value: string; label: string }[] = [];
    if (discipline) {
      filters.push({
        type: 'discipline',
        value: discipline,
        label: disciplineLabel(discipline),
      });
    }
    if (modality) {
      filters.push({ type: 'modality', value: modality, label: modalityBadgeLabel(modality) });
    }
    if (location) filters.push({ type: 'location', value: location, label: location });
    if (schedule !== 'any') {
      const sched = SCHEDULE_FILTERS.find((s) => s.id === schedule);
      if (sched) filters.push({ type: 'schedule', value: schedule, label: sched.label });
    }
    if (priceRangeId !== 'any') {
      const price = PRICE_RANGES.find((p) => p.id === priceRangeId);
      if (price) filters.push({ type: 'price', value: priceRangeId, label: price.label });
    }
    if (verifiedOnly) {
      filters.push({ type: 'verified', value: 'true', label: VERIFICATION_LABELS.searchVerifiedOnly });
    }
    if (advancedSearchEnabled) {
      if (advancedFilters.level !== 'any') {
        const level = CLASS_LEVELS.find((l) => l.id === advancedFilters.level);
        if (level) {
          filters.push({
            type: 'level',
            value: advancedFilters.level,
            label: ADVANCED_SEARCH_LABELS.levelTag(level.label),
          });
        }
      }
      if (advancedFilters.language !== 'any') {
        const lang = CLASS_LANGUAGES.find((l) => l.id === advancedFilters.language);
        if (lang) {
          filters.push({
            type: 'language',
            value: advancedFilters.language,
            label: ADVANCED_SEARCH_LABELS.languageTag(lang.label),
          });
        }
      }
      if (advancedFilters.instructorGender !== 'any') {
        const gender = ADVANCED_SEARCH_GENDERS.find((g) => g.id === advancedFilters.instructorGender);
        if (gender) {
          filters.push({
            type: 'gender',
            value: advancedFilters.instructorGender,
            label: ADVANCED_SEARCH_LABELS.genderTag(gender.label),
          });
        }
      }
    }
    return filters;
  }, [
    discipline,
    modality,
    location,
    schedule,
    priceRangeId,
    verifiedOnly,
    advancedSearchEnabled,
    advancedFilters,
  ]);

  const removeFilter = (type: string) => {
    switch (type) {
      case 'discipline':
        setDiscipline(null);
        break;
      case 'modality':
        setModality(null);
        break;
      case 'location':
        setLocation('');
        break;
      case 'schedule':
        setSchedule('any');
        break;
      case 'price':
        setPriceRangeId('any');
        break;
      case 'verified':
        setVerifiedOnly(false);
        break;
      case 'level':
        setAdvancedFilters((prev) => ({ ...prev, level: 'any' }));
        break;
      case 'language':
        setAdvancedFilters((prev) => ({ ...prev, language: 'any' }));
        break;
      case 'gender':
        setAdvancedFilters((prev) => ({ ...prev, instructorGender: 'any' }));
        break;
    }
  };

  const disciplineOptions = [
    { value: '', label: GENERAL_LABELS.discipline },
    ...disciplineSelectOptions(),
  ];

  const modalityOptions = [
    { value: '', label: GENERAL_LABELS.modality },
    { value: 'in_person', label: MODALITY_LABELS.inPerson },
    { value: 'online', label: MODALITY_LABELS.online },
  ];

  const scheduleOptions = SCHEDULE_FILTERS.map((s) => ({ value: s.id, label: s.label }));
  const priceOptions = PRICE_RANGES.map((p) => ({ value: p.id, label: p.label }));

  const showAdvancedEmptyHint =
    advancedSearchEnabled &&
    advancedFiltersActive(advancedFilters) &&
    !loading &&
    results.length === 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">{GENERAL_LABELS.search}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--fn-text-muted)]" />
          <input
            className="w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 pl-12 text-sm transition focus:border-[var(--fn-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fn-primary-muted)]"
            placeholder={GENERAL_LABELS.classInstructorGym}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--fn-text-muted)] transition hover:text-[var(--fn-text)]"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--fn-text-muted)]" />
          <input
            className="w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 pl-12 text-sm transition focus:border-[var(--fn-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fn-primary-muted)]"
            placeholder={GENERAL_LABELS.cityNeighborhoodVenue}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      {institutionSearchEnabled ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSearchMode('classes')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              searchMode === 'classes'
                ? 'bg-[var(--fn-primary)] text-white'
                : 'bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)]'
            }`}
          >
            {MOCK_V2V3_LABELS.searchClassesTab}
          </button>
          <button
            type="button"
            onClick={() => setSearchMode('clubs')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              searchMode === 'clubs'
                ? 'bg-[var(--fn-primary)] text-white'
                : 'bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)]'
            }`}
          >
            {MOCK_V2V3_LABELS.searchClubsTab}
          </button>
          {searchMode === 'clubs' ? <MockDataBadge className="self-center" /> : null}
        </div>
      ) : null}

      {(searchMode === 'classes' || !institutionSearchEnabled) ? (
        <>
      <div className="relative z-10 grid gap-4 md:grid-cols-4">
        <SearchFilterDropdown
          value={discipline || ''}
          onChange={(val) => setDiscipline(val || null)}
          options={disciplineOptions}
          placeholder={GENERAL_LABELS.discipline}
        />
        <SearchFilterDropdown
          value={modality || ''}
          onChange={(val) => setModality((val as Modality) || null)}
          options={modalityOptions}
          placeholder={GENERAL_LABELS.modality}
        />
        <SearchFilterDropdown
          value={schedule}
          onChange={(val) => setSchedule(val as ScheduleFilter)}
          options={scheduleOptions}
          placeholder={GENERAL_LABELS.schedule}
        />
        <SearchFilterDropdown
          value={priceRangeId}
          onChange={setPriceRangeId}
          options={priceOptions}
          placeholder={GENERAL_LABELS.price}
        />
      </div>

      {advancedSearchEnabled ? (
        <AdvancedSearchPanel
          filters={advancedFilters}
          onChange={setAdvancedFilters}
          expanded={advancedExpanded}
          onToggleExpanded={() => setAdvancedExpanded((v) => !v)}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <FilterChip
          label={VERIFICATION_LABELS.searchVerifiedOnly}
          active={verifiedOnly}
          onPress={() => setVerifiedOnly((v) => !v)}
        />
      </div>

      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          {activeFilters.map((filter) => (
            <span
              key={`${filter.type}-${filter.value}`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--fn-surface-muted)] px-3 py-1 text-sm"
            >
              {filter.label}
              <button type="button" onClick={() => removeFilter(filter.type)} aria-label="Quitar filtro">
                <X size={14} />
              </button>
            </span>
          ))}
          <button type="button" onClick={clearFilters} className="text-sm font-medium text-[var(--fn-primary)]">
            {GENERAL_LABELS.clearFilters}
          </button>
        </div>
      ) : null}

      {geolocationEnabled ? <ClassMap markers={visibleMapMarkers} classes={results} /> : null}

      <div className="space-y-4">
        <p className="text-sm font-semibold text-[var(--fn-text-muted)]">
          {loading
            ? GENERAL_LABELS.loading
            : `${results.length} ${results.length === 1 ? GENERAL_LABELS.class : GENERAL_LABELS.classes}`}
        </p>

        {showAdvancedEmptyHint ? (
          <p className="rounded-xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-4 py-3 text-sm text-[var(--fn-text-muted)]">
            {ADVANCED_SEARCH_LABELS.emptyHint}
          </p>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <ClassCard key={c.id} item={c} />
          ))}
        </div>
      </div>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-[var(--fn-text-muted)]">
            {clubResults.length} {clubResults.length === 1 ? 'club' : 'clubes'}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {clubResults.map((club) => (
              <InstitutionClubCard key={club.id} club={club} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
