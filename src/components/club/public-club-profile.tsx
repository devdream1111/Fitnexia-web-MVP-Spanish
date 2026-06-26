'use client';

import { Clock, Globe, Mail, MapPin, Phone, Sparkles, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { PUBLIC_CLUB_LABELS, INSTITUTION_PROFILE_LABELS } from '@/constants/labels';
import { getCountryLabel } from '@/constants/countries';
import type { Institution } from '@/types/api';
import {
  formatOpeningHoursLine,
  OPENING_HOURS_DAY_KEYS,
} from '@/utils/opening-hours';

function formatAddress(institution: Institution): string {
  const location = institution.location;
  return [location?.address, location?.city, getCountryLabel(location?.country)].filter(Boolean).join(', ');
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <div className="flex items-start gap-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 p-4 transition hover:border-[var(--fn-primary)]/30">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--fn-text-muted)]">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-[var(--fn-text)]">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:opacity-90">
        {body}
      </a>
    );
  }
  return body;
}

export function PublicClubProfile({ institution }: { institution: Institution }) {
  const hours = institution.openingHours;
  const todayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()] as string;
  const addressLine = formatAddress(institution);
  const hasHours = hours && Object.keys(hours).length > 0;

  const contactItems = [
    {
      key: 'address',
      icon: MapPin,
      label: INSTITUTION_PROFILE_LABELS.address,
      value: addressLine,
      href: undefined as string | undefined,
    },
    {
      key: 'phone',
      icon: Phone,
      label: INSTITUTION_PROFILE_LABELS.phone,
      value: institution.contactPhone ?? '',
      href: institution.contactPhone ? `tel:${institution.contactPhone}` : undefined,
    },
    {
      key: 'email',
      icon: Mail,
      label: INSTITUTION_PROFILE_LABELS.email,
      value: institution.contactEmail ?? '',
      href: institution.contactEmail ? `mailto:${institution.contactEmail}` : undefined,
    },
    {
      key: 'website',
      icon: Globe,
      label: INSTITUTION_PROFILE_LABELS.website,
      value: institution.website ? institution.website.replace(/^https?:\/\//, '') : '',
      href: institution.website,
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <header className="overflow-hidden rounded-[2rem] border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-xl">
        <div className="relative bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-900 px-6 py-8 md:px-10 md:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),_transparent_55%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            {institution.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={institution.logoUrl}
                alt=""
                className="h-28 w-28 shrink-0 rounded-3xl border-4 border-white/25 object-cover shadow-2xl md:h-32 md:w-32"
              />
            ) : (
              <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border-2 border-white/25 bg-white/10 text-4xl font-black text-white backdrop-blur md:h-32 md:w-32">
                {institution.name.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-white/65">
                <Sparkles size={12} />
                {PUBLIC_CLUB_LABELS.eyebrow}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{institution.name}</h1>
                {institution.verified ? <Badge label="Verificado" variant="success" size="sm" /> : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-[1.75rem] border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-extrabold text-[var(--fn-text)]">{PUBLIC_CLUB_LABELS.description}</h2>
        <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-[var(--fn-text-secondary)]">
          {institution.description?.trim() || PUBLIC_CLUB_LABELS.notAvailable}
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 shadow-sm md:p-8">
        <h2 className="mb-5 text-lg font-extrabold text-[var(--fn-text)]">{PUBLIC_CLUB_LABELS.contact}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {contactItems.map((item) => (
            <ContactItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              value={item.value.trim() || PUBLIC_CLUB_LABELS.notAvailable}
              href={item.value.trim() ? item.href : undefined}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 shadow-sm md:p-8">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-[var(--fn-text)]">
          <Clock size={20} className="text-[var(--fn-primary)]" />
          {PUBLIC_CLUB_LABELS.openingHours}
        </h2>
        {hasHours ? (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {formatOpeningHoursLine(hours).map((line, i) => {
              const dayKey = OPENING_HOURS_DAY_KEYS[i];
              const isToday = dayKey === todayKey;
              return (
                <li
                  key={line}
                  className={[
                    'rounded-xl px-4 py-3 text-sm',
                    isToday
                      ? 'bg-[var(--fn-primary-muted)] font-bold text-[var(--fn-primary)] ring-1 ring-[var(--fn-primary)]/25'
                      : 'bg-[var(--fn-surface-muted)]/60 text-[var(--fn-text-secondary)]',
                  ].join(' ')}
                >
                  {line}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-[var(--fn-text-muted)]">{PUBLIC_CLUB_LABELS.notAvailable}</p>
        )}
      </section>

      {institution.instructors && institution.instructors.length > 0 ? (
        <section className="rounded-[1.75rem] border border-[var(--fn-border)] bg-gradient-to-br from-[var(--fn-surface)] to-[var(--fn-primary-muted)]/25 p-6 shadow-sm md:p-8">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-[var(--fn-text)]">
            <Users size={20} className="text-[var(--fn-primary)]" />
            {PUBLIC_CLUB_LABELS.team}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {institution.instructors.map((i) => (
              <li
                key={i.id}
                className="rounded-full border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-2 text-sm font-bold text-[var(--fn-text)] shadow-sm"
              >
                {i.displayName}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
