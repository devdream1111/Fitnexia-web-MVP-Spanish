'use client';

import type { ReactNode } from 'react';
import { MapPin, Search as SearchIcon, Sparkles, X } from 'lucide-react';

import { GENERAL_LABELS } from '@/constants/labels';

type AthleteSearchBarProps = {
  query: string;
  location: string;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  queryPlaceholder?: string;
  locationPlaceholder?: string;
};

function FieldShell({
  icon,
  label,
  focusedAccent,
  children,
  trailing,
}: {
  icon: ReactNode;
  label: string;
  focusedAccent: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <label className="fn-athlete-search-field group/field relative flex min-w-0 flex-1 cursor-text items-stretch gap-3 px-3.5 py-3 transition duration-300 md:px-4 md:py-3.5">
      <span
        className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 transition duration-300 group-focus-within/field:scale-105 group-focus-within/field:shadow-[0_10px_24px_-12px_color-mix(in_srgb,var(--fn-primary)_55%,transparent)] ${focusedAccent}`}
      >
        {icon}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="mb-0.5 block text-[0.625rem] font-bold uppercase tracking-[0.16em] text-[var(--fn-text-muted)] transition group-focus-within/field:text-[var(--fn-primary-text)]">
          {label}
        </span>
        {children}
      </span>
      {trailing}
    </label>
  );
}

export function AthleteSearchBar({
  query,
  location,
  onQueryChange,
  onLocationChange,
  queryPlaceholder = GENERAL_LABELS.classInstructorGym,
  locationPlaceholder = GENERAL_LABELS.cityNeighborhoodVenue,
}: AthleteSearchBarProps) {
  return (
    <div className="fn-athlete-search-bar relative overflow-hidden rounded-[1.75rem] border border-[color-mix(in_srgb,var(--fn-primary)_22%,var(--fn-border))] bg-gradient-to-br from-[var(--fn-surface)] via-[color-mix(in_srgb,var(--fn-primary-muted)_28%,var(--fn-surface))] to-[var(--fn-surface)] p-[1px] shadow-[0_16px_40px_-28px_color-mix(in_srgb,var(--fn-primary)_55%,transparent)]">
      <div
        className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full bg-[var(--fn-primary)]/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-8 bottom-0 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-[calc(1.75rem-1px)] bg-[color-mix(in_srgb,var(--fn-surface)_92%,transparent)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--fn-border)]/70 px-4 py-2.5 md:px-5">
          <p className="m-0 inline-flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--fn-primary-text)]">
            <Sparkles size={13} strokeWidth={2.5} className="text-[var(--fn-primary)]" />
            {GENERAL_LABELS.athleteSearchBarEyebrow}
          </p>
          <span className="hidden text-[0.6875rem] font-medium text-[var(--fn-text-muted)] sm:inline">
            {GENERAL_LABELS.athleteSearchBarHint}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-stretch">
          <FieldShell
            label={GENERAL_LABELS.athleteSearchQueryLabel}
            focusedAccent="bg-[var(--fn-primary-muted)] text-[var(--fn-primary)] ring-[color-mix(in_srgb,var(--fn-primary)_30%,transparent)] group-focus-within/field:bg-[var(--fn-primary)] group-focus-within/field:text-white group-focus-within/field:ring-[var(--fn-primary)]"
            icon={<SearchIcon size={18} strokeWidth={2.35} className="transition duration-300" />}
            trailing={
              query ? (
                <button
                  type="button"
                  onClick={() => onQueryChange('')}
                  aria-label="Limpiar búsqueda"
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-xl text-[var(--fn-text-muted)] transition hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)] active:scale-95"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              ) : null
            }
          >
            <input
              className="fn-athlete-search-input w-full border-0 bg-transparent p-0 text-[0.95rem] font-semibold tracking-tight text-[var(--fn-text)] outline-none placeholder:font-medium placeholder:text-[var(--fn-text-muted)] md:text-base"
              placeholder={queryPlaceholder}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              autoComplete="off"
              enterKeyHint="search"
            />
          </FieldShell>

          <div
            className="mx-4 hidden w-px self-stretch bg-gradient-to-b from-transparent via-[var(--fn-border)] to-transparent md:block"
            aria-hidden="true"
          />
          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[var(--fn-border)] to-transparent md:hidden" aria-hidden="true" />

          <FieldShell
            label={GENERAL_LABELS.athleteSearchLocationLabel}
            focusedAccent="bg-cyan-500/15 text-cyan-700 ring-cyan-500/25 group-focus-within/field:bg-cyan-600 group-focus-within/field:text-white group-focus-within/field:ring-cyan-600 dark:text-cyan-300"
            icon={<MapPin size={18} strokeWidth={2.35} className="transition duration-300" />}
          >
            <input
              className="fn-athlete-search-input w-full border-0 bg-transparent p-0 text-[0.95rem] font-semibold tracking-tight text-[var(--fn-text)] outline-none placeholder:font-medium placeholder:text-[var(--fn-text-muted)] md:text-base"
              placeholder={locationPlaceholder}
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              autoComplete="address-level2"
            />
          </FieldShell>
        </div>
      </div>
    </div>
  );
}
