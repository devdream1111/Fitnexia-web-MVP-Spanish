'use client';

import Link from 'next/link';
import { Clock, Globe, Mail, MapPin, Phone, Sparkles, Users } from 'lucide-react';

import { PublicProfileShell } from '@/components/layout/public-profile-shell';
import {
  ProfileExperienceBody,
  ProfileExperienceChip,
  ProfileExperienceContactCard,
  ProfileExperienceHero,
  ProfileExperienceInlineStats,
  ProfileExperienceOverviewCard,
  ProfileExperienceOverviewGrid,
  ProfileExperiencePage,
  ProfileExperiencePreviewText,
  ProfileExperienceSection,
} from '@/components/profile/profile-experience-ui';
import { Badge } from '@/components/ui/badge';
import { PUBLIC_CLUB_LABELS, INSTITUTION_PROFILE_LABELS } from '@/constants/labels';
import { getCountryLabel } from '@/constants/countries';
import type { Institution, OpeningHoursDayKey } from '@/types/api';
import {
  formatOpeningHoursLine,
  OPENING_HOURS_DAY_KEYS,
} from '@/utils/opening-hours';

function formatAddress(institution: Institution): string {
  const location = institution.location;
  return [location?.address, location?.city, getCountryLabel(location?.country)].filter(Boolean).join(', ');
}

function todayHoursLine(hours: Institution['openingHours'], todayKey: OpeningHoursDayKey): string | null {
  if (!hours) return null;
  const lines = formatOpeningHoursLine(hours);
  const index = OPENING_HOURS_DAY_KEYS.indexOf(todayKey);
  if (index < 0 || index >= lines.length) return null;
  return lines[index] ?? null;
}

export function PublicClubProfile({ institution }: { institution: Institution }) {
  const hours = institution.openingHours;
  const todayKey = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)[
    new Date().getDay()
  ] as OpeningHoursDayKey;
  const addressLine = formatAddress(institution);
  const hasHours = hours && Object.keys(hours).length > 0;
  const instructorCount = institution.instructors?.length ?? 0;
  const todayLine = hasHours ? todayHoursLine(hours, todayKey) : null;

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

  const primaryContacts = contactItems.filter((item) => item.key !== 'address' && item.value.trim());

  return (
    <PublicProfileShell backHref="/">
      <ProfileExperiencePage>
        <ProfileExperienceHero
          footer={
            <ProfileExperienceInlineStats
              stats={[
                { label: PUBLIC_CLUB_LABELS.team, value: instructorCount || '—', icon: Users },
                {
                  label: PUBLIC_CLUB_LABELS.openingHours,
                  value: todayLine ?? (hasHours ? PUBLIC_CLUB_LABELS.openToday : PUBLIC_CLUB_LABELS.notAvailable),
                  icon: Clock,
                },
                {
                  label: 'Estado',
                  value: institution.verified ? 'Verificado' : 'Público',
                  icon: Sparkles,
                },
                {
                  label: 'Contacto',
                  value: institution.contactPhone ? 'Disponible' : PUBLIC_CLUB_LABELS.notAvailable,
                  icon: Phone,
                },
              ]}
            />
          }
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              {institution.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={institution.logoUrl}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-2xl border-2 border-white/30 object-cover shadow-xl md:h-28 md:w-28"
                />
              ) : (
                <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-3xl font-black text-white backdrop-blur-sm md:h-28 md:w-28">
                  {institution.name.charAt(0)}
                </span>
              )}
              <div className="min-w-0 text-white">
                <p className="m-0 inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/75">
                  <Sparkles size={12} />
                  {PUBLIC_CLUB_LABELS.eyebrow}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h1 className="m-0 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl lg:text-[2.125rem]">
                    {institution.name}
                  </h1>
                  {institution.verified ? (
                    <Badge label="Verificado" variant="success" size="sm" />
                  ) : null}
                </div>
                {addressLine ? (
                  <p className="mt-2.5 m-0 flex items-start gap-2 text-sm text-white/85">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{addressLine}</span>
                  </p>
                ) : null}
              </div>
            </div>
            <p className="m-0 max-w-sm text-xs leading-relaxed text-white/75 lg:text-right">
              {PUBLIC_CLUB_LABELS.subtitle}
            </p>
          </div>
        </ProfileExperienceHero>

        <ProfileExperienceOverviewGrid>
          <ProfileExperienceOverviewCard title={PUBLIC_CLUB_LABELS.description} icon={Sparkles} index={0}>
            <ProfileExperiencePreviewText
              text={institution.description}
              empty={PUBLIC_CLUB_LABELS.notAvailable}
            />
          </ProfileExperienceOverviewCard>

          <ProfileExperienceOverviewCard title={PUBLIC_CLUB_LABELS.contact} icon={Phone} index={1}>
            {primaryContacts.length > 0 ? (
              <div className="space-y-2.5">
                {primaryContacts.map((item) => (
                  <p key={item.key} className="m-0 text-sm text-[var(--fn-text-secondary)]">
                    <span className="font-bold text-[var(--fn-text)]">{item.label}: </span>
                    {item.href ? (
                      <a href={item.href} className="text-[var(--fn-primary-text)] hover:underline">
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </p>
                ))}
              </div>
            ) : (
              <p className="m-0 text-sm italic text-[var(--fn-text-muted)]">{PUBLIC_CLUB_LABELS.notAvailable}</p>
            )}
          </ProfileExperienceOverviewCard>

          <ProfileExperienceOverviewCard title="Hoy" icon={Clock} index={2}>
            {todayLine ? (
              <p className="m-0 text-sm font-bold text-[var(--fn-primary-text)]">{todayLine}</p>
            ) : hasHours ? (
              <p className="m-0 text-sm text-[var(--fn-text-secondary)]">{PUBLIC_CLUB_LABELS.openToday}</p>
            ) : (
              <p className="m-0 text-sm italic text-[var(--fn-text-muted)]">{PUBLIC_CLUB_LABELS.notAvailable}</p>
            )}
            {instructorCount > 0 ? (
              <p className="mt-3 m-0 text-sm text-[var(--fn-text-secondary)]">
                <span className="font-bold text-[var(--fn-text)]">{PUBLIC_CLUB_LABELS.team}: </span>
                {instructorCount} {instructorCount === 1 ? 'instructor' : 'instructores'}
              </p>
            ) : null}
          </ProfileExperienceOverviewCard>
        </ProfileExperienceOverviewGrid>

        <ProfileExperienceBody
          main={
            <>
              <ProfileExperienceSection title={PUBLIC_CLUB_LABELS.contact} icon={MapPin} index={0} compact>
                <div className="grid gap-3 sm:grid-cols-2">
                  {contactItems.map((item) => (
                    <ProfileExperienceContactCard
                      key={item.key}
                      icon={item.icon}
                      label={item.label}
                      value={item.value.trim() || PUBLIC_CLUB_LABELS.notAvailable}
                      href={item.value.trim() ? item.href : undefined}
                    />
                  ))}
                </div>
              </ProfileExperienceSection>

              <ProfileExperienceSection title={PUBLIC_CLUB_LABELS.openingHours} icon={Clock} index={1} compact>
                {hasHours ? (
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {formatOpeningHoursLine(hours).map((line, i) => {
                      const dayKey = OPENING_HOURS_DAY_KEYS[i];
                      const isToday = dayKey === todayKey;
                      return (
                        <li
                          key={line}
                          className={[
                            'rounded-xl px-3 py-2 text-sm',
                            isToday
                              ? 'bg-[var(--fn-primary-muted)] font-bold text-[var(--fn-primary-text)] ring-1 ring-[color-mix(in_srgb,var(--fn-primary)_25%,transparent)]'
                              : 'bg-[var(--fn-surface-muted)]/70 text-[var(--fn-text-secondary)]',
                          ].join(' ')}
                        >
                          {line}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="m-0 text-sm text-[var(--fn-text-muted)]">{PUBLIC_CLUB_LABELS.notAvailable}</p>
                )}
              </ProfileExperienceSection>

              {instructorCount > 0 ? (
                <ProfileExperienceSection title={PUBLIC_CLUB_LABELS.team} icon={Users} index={2} compact>
                  <div className="flex flex-wrap gap-2">
                    {institution.instructors!.map((i) => (
                      <Link key={i.id} href={`/instructor/${i.id}`}>
                        <ProfileExperienceChip>{i.displayName}</ProfileExperienceChip>
                      </Link>
                    ))}
                  </div>
                </ProfileExperienceSection>
              ) : null}
            </>
          }
        />
      </ProfileExperiencePage>
    </PublicProfileShell>
  );
}
