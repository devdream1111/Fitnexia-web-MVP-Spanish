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
    <div className="flex items-start gap-2.5 rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 p-3 transition hover:border-[var(--fn-primary)]/30">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-[var(--fn-text)]">{value}</p>
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
    <div className="space-y-4 pb-6">
      <header className="overflow-hidden rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
        <div className="relative bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-900 px-4 py-5 sm:px-6">
          <div className="relative flex items-center gap-4">
            {institution.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={institution.logoUrl}
                alt=""
                className="h-20 w-20 shrink-0 rounded-xl border-2 border-white/25 object-cover shadow-lg sm:h-24 sm:w-24"
              />
            ) : (
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-2xl font-black text-white backdrop-blur sm:h-24 sm:w-24">
                {institution.name.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/65">
                <Sparkles size={11} />
                {PUBLIC_CLUB_LABELS.eyebrow}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{institution.name}</h1>
                {institution.verified ? <Badge label="Verificado" variant="success" size="sm" /> : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
        <h2 className="text-sm font-bold text-[var(--fn-text)]">{PUBLIC_CLUB_LABELS.description}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--fn-text-secondary)]">
          {institution.description?.trim() || PUBLIC_CLUB_LABELS.notAvailable}
        </p>
      </section>

      <section className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
        <h2 className="mb-3 text-sm font-bold text-[var(--fn-text)]">{PUBLIC_CLUB_LABELS.contact}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
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

      <section className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--fn-text)]">
          <Clock size={16} className="text-[var(--fn-primary)]" />
          {PUBLIC_CLUB_LABELS.openingHours}
        </h2>
        {hasHours ? (
          <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {formatOpeningHoursLine(hours).map((line, i) => {
              const dayKey = OPENING_HOURS_DAY_KEYS[i];
              const isToday = dayKey === todayKey;
              return (
                <li
                  key={line}
                  className={[
                    'rounded-lg px-3 py-2 text-xs',
                    isToday
                      ? 'bg-[var(--fn-primary-muted)] font-semibold text-[var(--fn-primary)] ring-1 ring-[var(--fn-primary)]/25'
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
        <section className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--fn-text)]">
            <Users size={16} className="text-[var(--fn-primary)]" />
            {PUBLIC_CLUB_LABELS.team}
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {institution.instructors.map((i) => (
              <li
                key={i.id}
                className="rounded-full border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 px-3 py-1 text-xs font-semibold text-[var(--fn-text)]"
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
