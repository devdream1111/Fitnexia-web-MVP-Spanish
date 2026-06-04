'use client';

import { useMemo, useState } from 'react';

import { ClassCard } from '@/components/class-card';
import { FilterChip } from '@/components/ui/filter-chip';
import {
  DISCIPLINES,
  MOCK_LOCATION_AREAS,
  PRICE_RANGES,
  SCHEDULE_FILTERS,
  type ScheduleFilter,
} from '@/constants/fitnexia';
import { MODALITY_LABELS } from '@/constants/labels';
import { useClasses } from '@/contexts/classes-context';
import { filterClasses, sortClassesByDate } from '@/utils/class-filters';
import type { Modality } from '@/types/api';

export default function SearchPage() {
  const { classes } = useClasses();
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [modality, setModality] = useState<Modality | null>(null);
  const [location, setLocation] = useState('');
  const [schedule, setSchedule] = useState<ScheduleFilter>('any');
  const [priceRangeId, setPriceRangeId] = useState('any');
  const [showFilters, setShowFilters] = useState(true);

  const priceRange = PRICE_RANGES.find((p) => p.id === priceRangeId) ?? PRICE_RANGES[0];

  const results = useMemo(() => {
    const filtered = filterClasses(classes, {
      query,
      discipline,
      modality,
      location,
      schedule,
      priceMin: priceRange.min === 0 ? null : priceRange.min,
      priceMax: Number.isFinite(priceRange.max) ? priceRange.max : null,
    });
    return sortClassesByDate(filtered);
  }, [classes, query, discipline, modality, location, schedule, priceRange]);

  return (
    <div>
      <h1 className="mb-4 text-3xl font-extrabold">Search</h1>
      <input
        className="mb-4 w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3"
        placeholder="Class, instructor, or gym..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="mb-4 text-sm font-semibold text-[var(--fn-primary)]">
        {showFilters ? 'Hide filters' : 'Show filters'}
      </button>

      {showFilters ? (
        <div className="mb-6 space-y-4">
          <input
            className="w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-2 text-sm"
            placeholder="City, neighborhood, or venue..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="flex flex-wrap gap-1">
            {MOCK_LOCATION_AREAS.map((area) => (
              <FilterChip key={area} label={area} active={location === area} onPress={() => setLocation(area)} />
            ))}
          </div>
          <p className="text-sm font-semibold">Discipline</p>
          <div className="flex flex-wrap">
            <FilterChip label="All" active={!discipline} onPress={() => setDiscipline(null)} />
            {DISCIPLINES.map((d) => (
              <FilterChip key={d} label={d} active={discipline === d} onPress={() => setDiscipline(d)} />
            ))}
          </div>
          <p className="text-sm font-semibold">Modality</p>
          <div className="flex flex-wrap">
            <FilterChip label="All" active={!modality} onPress={() => setModality(null)} />
            <FilterChip
              label={MODALITY_LABELS.inPerson}
              active={modality === 'in_person'}
              onPress={() => setModality('in_person')}
            />
            <FilterChip
              label={MODALITY_LABELS.online}
              active={modality === 'online'}
              onPress={() => setModality('online')}
            />
          </div>
          <p className="text-sm font-semibold">Schedule</p>
          <div className="flex flex-wrap">
            {SCHEDULE_FILTERS.map((s) => (
              <FilterChip
                key={s.id}
                label={s.label}
                active={schedule === s.id}
                onPress={() => setSchedule(s.id)}
              />
            ))}
          </div>
          <p className="text-sm font-semibold">Price</p>
          <div className="flex flex-wrap">
            {PRICE_RANGES.map((p) => (
              <FilterChip
                key={p.id}
                label={p.label}
                active={priceRangeId === p.id}
                onPress={() => setPriceRangeId(p.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <p className="mb-3 text-sm text-[var(--fn-text-muted)]">{results.length} classes</p>
      {results.map((c) => (
        <ClassCard key={c.id} item={c} />
      ))}
    </div>
  );
}
