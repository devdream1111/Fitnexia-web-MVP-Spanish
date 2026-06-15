'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  CLASS_FORMAT_LABELS,
  DISCIPLINE_LABELS,
  MODALITY_LABELS,
  modalityBadgeLabel,
} from '@/constants/labels';
import { formatClassDate, formatMoney } from '@/utils/format';
import type { ClassFormat, Modality } from '@/types/api';

export function ClassFormShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10">{children}</div>;
}

export function ClassFormLayout({
  main,
  aside,
}: {
  main: ReactNode;
  aside: ReactNode;
}) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_min(20rem,100%)]">
      <div className="min-w-0 space-y-6">{main}</div>
      <aside className="min-w-0 lg:sticky lg:top-6">{aside}</aside>
    </div>
  );
}

export function ClassFormSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
      <div className="border-b border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-5 py-4 md:px-6">
        <div className="flex items-start gap-3">
          {Icon ? (
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
              <Icon size={20} />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[var(--fn-text)]">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-[var(--fn-text-muted)]">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-4 p-5 md:p-6">{children}</div>
    </section>
  );
}

export function ClassFormSegment<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[var(--fn-text)]">{label}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                'rounded-xl border px-4 py-3 text-left transition',
                active
                  ? 'border-[var(--fn-primary)] bg-[var(--fn-primary-muted)]/50 ring-1 ring-[var(--fn-primary)]/30'
                  : 'border-[var(--fn-border)] bg-[var(--fn-surface)] hover:border-[var(--fn-primary)]/40',
              ].join(' ')}
            >
              <span className="block text-sm font-semibold text-[var(--fn-text)]">{option.label}</span>
              {option.hint ? (
                <span className="mt-1 block text-xs leading-snug text-[var(--fn-text-muted)]">{option.hint}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ClassFormPreview({
  title,
  discipline,
  modality,
  classFormat,
  startAt,
  durationMinutes,
  priceAmount,
  capacity,
  instructorName,
}: {
  title: string;
  discipline: string;
  modality: Modality;
  classFormat: ClassFormat;
  startAt: string;
  durationMinutes: number;
  priceAmount: number;
  capacity: number;
  instructorName: string;
}) {
  const price = formatMoney({ amount: priceAmount, currency: 'UYU' });
  const disciplineLabel =
    DISCIPLINE_LABELS[discipline as keyof typeof DISCIPLINE_LABELS] ?? discipline;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-lg">
      <div className="border-b border-[var(--fn-border)] bg-gradient-to-br from-[var(--fn-primary)] via-[#1d4ed8] to-[#312e81] px-5 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/75">Vista previa</p>
        <h3 className="mt-2 line-clamp-2 text-xl font-extrabold leading-tight">
          {title.trim() || 'Nombre de la clase'}
        </h3>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge label={modalityBadgeLabel(modality)} />
          <Badge label={CLASS_FORMAT_LABELS[classFormat]} variant={classFormat === 'individual' ? 'warning' : 'default'} />
          <Badge label={disciplineLabel} />
        </div>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">Instructor</dt>
            <dd className="mt-1 font-medium text-[var(--fn-text)]">{instructorName || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">Cuándo</dt>
            <dd className="mt-1 font-medium text-[var(--fn-text)]">
              {startAt ? formatClassDate(startAt) : '—'}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">Duración</dt>
              <dd className="mt-1 font-medium text-[var(--fn-text)]">{durationMinutes} min</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">Capacidad</dt>
              <dd className="mt-1 font-medium text-[var(--fn-text)]">{capacity}</dd>
            </div>
          </div>
        </dl>
        <div className="rounded-xl bg-[var(--fn-surface-muted)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">Precio</p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--fn-primary)]">{price}</p>
        </div>
      </div>
    </div>
  );
}

export function classFormatModalityOptions() {
  return {
    modality: [
      { value: 'in_person' as Modality, label: MODALITY_LABELS.inPerson, hint: 'Clase presencial en un lugar físico.' },
      { value: 'online' as Modality, label: MODALITY_LABELS.online, hint: 'Sesión remota por videollamada.' },
    ],
    classFormat: [
      {
        value: 'group' as ClassFormat,
        label: CLASS_FORMAT_LABELS.group,
        hint: 'Varios participantes pueden reservar la misma sesión.',
      },
      {
        value: 'individual' as ClassFormat,
        label: CLASS_FORMAT_LABELS.individual,
        hint: 'Sesión privada para una sola persona.',
      },
    ],
  };
}
