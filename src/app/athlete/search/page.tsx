'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Search as SearchIcon, MapPin, X, ChevronDown } from 'lucide-react';

import { ClassCard } from '@/components/class-card';

const ClassMap = dynamic(() => import('@/components/map/Map').then((m) => m.ClassMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)] text-sm text-[var(--fn-text-muted)]">
      Cargando mapa…
    </div>
  ),
});
import { FilterChip } from '@/components/ui/filter-chip';
import {
  DISCIPLINES,
  MOCK_LOCATION_AREAS,
  PRICE_RANGES,
  SCHEDULE_FILTERS,
  type ScheduleFilter,
} from '@/constants/fitnexia';
import { MODALITY_LABELS, modalityBadgeLabel, GENERAL_LABELS, DISCIPLINE_LABELS } from '@/constants/labels';
import { useClasses } from '@/contexts/classes-context';
import { filterClasses, sortClassesByDate } from '@/utils/class-filters';
import type { Modality } from '@/types/api';

// Custom Dropdown Component
const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { value: string; label: string }[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 text-sm transition hover:border-[var(--fn-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fn-primary-muted)]"
      >
        <span className={selectedOption ? 'text-[var(--fn-text)]' : 'text-[var(--fn-text-muted)]'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-[var(--fn-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 z-20 mt-2 max-h-60 overflow-auto rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition ${
                  option.value === value
                    ? 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]'
                    : 'text-[var(--fn-text)] hover:bg-[var(--fn-surface-muted)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function SearchPage() {
  const { classes } = useClasses();
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [modality, setModality] = useState<Modality | null>(null);
  const [location, setLocation] = useState('');
  const [schedule, setSchedule] = useState<ScheduleFilter>('any');
  const [priceRangeId, setPriceRangeId] = useState('any');

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

  const clearFilters = () => {
    setQuery('');
    setDiscipline(null);
    setModality(null);
    setLocation('');
    setSchedule('any');
    setPriceRangeId('any');
  };

  const activeFilters = useMemo(() => {
    const filters = [];
    if (discipline) filters.push({ type: 'discipline', value: discipline, label: DISCIPLINE_LABELS[discipline as keyof typeof DISCIPLINE_LABELS] || discipline });
    if (modality) filters.push({ type: 'modality', value: modality, label: modalityBadgeLabel(modality) });
    if (location) filters.push({ type: 'location', value: location, label: location });
    if (schedule !== 'any') {
      const sched = SCHEDULE_FILTERS.find(s => s.id === schedule);
      if (sched) filters.push({ type: 'schedule', value: schedule, label: sched.label });
    }
    if (priceRangeId !== 'any') {
      const price = PRICE_RANGES.find(p => p.id === priceRangeId);
      if (price) filters.push({ type: 'price', value: priceRangeId, label: price.label });
    }
    return filters;
  }, [discipline, modality, location, schedule, priceRangeId]);

  const removeFilter = (type: string, value: any) => {
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
    }
  };

  // Prepare options for custom dropdowns
  const disciplineOptions = [
    { value: '', label: GENERAL_LABELS.discipline },
    ...DISCIPLINES.map(d => ({ value: d, label: DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS] || d })),
  ];
  
  const modalityOptions = [
    { value: '', label: GENERAL_LABELS.modality },
    { value: 'in_person', label: MODALITY_LABELS.inPerson },
    { value: 'online', label: MODALITY_LABELS.online },
  ];
  
  const scheduleOptions = SCHEDULE_FILTERS.map(s => ({ value: s.id, label: s.label }));
  
  const priceOptions = PRICE_RANGES.map(p => ({ value: p.id, label: p.label }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">{GENERAL_LABELS.search}</h1>

      {/* Search and Location Inputs */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--fn-text-muted)]" />
          <input
            className="w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 pl-12 text-sm transition focus:border-[var(--fn-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fn-primary-muted)]"
            placeholder={GENERAL_LABELS.classInstructorGym}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--fn-text-muted)] hover:text-[var(--fn-text)] transition"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--fn-text-muted)]" />
          <input
            className="w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 pl-12 text-sm transition focus:border-[var(--fn-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fn-primary-muted)]"
            placeholder={GENERAL_LABELS.cityNeighborhoodVenue}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          {location && (
            <button
              type="button"
              onClick={() => setLocation('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--fn-text-muted)] hover:text-[var(--fn-text)] transition"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Custom Dropdown Filters */}
      <div className="grid gap-4 md:grid-cols-4 relative z-10">
        <CustomDropdown
          value={discipline || ''}
          onChange={(val) => setDiscipline(val || null)}
          options={disciplineOptions}
          placeholder={GENERAL_LABELS.discipline}
        />
        
        <CustomDropdown
          value={modality || ''}
          onChange={(val) => setModality((val as Modality) || null)}
          options={modalityOptions}
          placeholder={GENERAL_LABELS.modality}
        />
        
        <CustomDropdown
          value={schedule}
          onChange={(val) => setSchedule(val as ScheduleFilter)}
          options={scheduleOptions}
          placeholder={GENERAL_LABELS.schedule}
        />
        
        <CustomDropdown
          value={priceRangeId}
          onChange={setPriceRangeId}
          options={priceOptions}
          placeholder={GENERAL_LABELS.price}
        />
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {activeFilters.map((filter) => (
            <span
              key={`${filter.type}-${filter.value}`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--fn-surface-muted)] px-3 py-1 text-sm text-[var(--fn-text)] transition hover:bg-[var(--fn-border)]"
            >
              {filter.label}
              <button
                type="button"
                onClick={() => removeFilter(filter.type, filter.value)}
                className="text-[var(--fn-text-muted)] hover:text-[var(--fn-text)] transition"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          <div className="h-6 w-px bg-[var(--fn-border)]" />
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-[var(--fn-primary)] hover:opacity-80 transition"
          >
            {GENERAL_LABELS.clearFilters}
          </button>
        </div>
      )}

      {/* Map */}
      <ClassMap classes={results} />

      {/* Results */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-[var(--fn-text-muted)]">
          {results.length} {results.length === 1 ? GENERAL_LABELS.class : GENERAL_LABELS.classes}
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <ClassCard key={c.id} item={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
