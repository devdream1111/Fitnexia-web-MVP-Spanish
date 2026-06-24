'use client';

import { Clock, Globe, Mail, MapPin, Phone, Sparkles, Users } from 'lucide-react';

import { PhotoGallery } from '@/components/profile/PhotoGallery';
import { Badge } from '@/components/ui/badge';
import { getCountryLabel } from '@/constants/countries';
import type { Institution } from '@/types/api';
import { formatOpeningHoursLine, OPENING_HOURS_DAY_KEYS } from '@/utils/opening-hours';

function ContactRow({
  icon: Icon,
  children,
  href,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-3 text-sm text-[var(--fn-text-secondary)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
        <Icon size={16} />
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
  if (href) {
    return (
      <a href={href} className="block transition hover:text-[var(--fn-primary)]">
        {content}
      </a>
    );
  }
  return content;
}

export function PublicClubProfile({ institution }: { institution: Institution }) {
  const hours = institution.openingHours;
  const location = institution.location;
  const todayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()] as string;

  return (
    <div className="space-y-8 pb-12">
      <header className="relative overflow-hidden rounded-[2rem] border border-[var(--fn-border)] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-900" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_50%)]" />
        <div className="relative px-6 py-12 md:px-12 md:py-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-end">
            {institution.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={institution.logoUrl}
                alt=""
                className="h-24 w-24 rounded-3xl border-4 border-white/20 object-cover shadow-2xl md:h-28 md:w-28"
              />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-3xl font-black text-white backdrop-blur-md md:h-28 md:w-28">
                {institution.name.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-white/60">
                <Sparkles size={12} />
                Club Fitnexia
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">{institution.name}</h1>
                {institution.verified ? (
                  <Badge label="Verificado" variant="success" size="sm" />
                ) : null}
              </div>
              {institution.description ? (
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/85 md:text-lg">
                  {institution.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-2 space-y-4 rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[var(--fn-text)]">Contacto</h2>
          <div className="space-y-4">
            {(location?.address || location?.city) && (
              <ContactRow icon={MapPin}>
                {[location.address, location.city, getCountryLabel(location.country)]
                  .filter(Boolean)
                  .join(', ')}
              </ContactRow>
            )}
            {institution.contactPhone ? (
              <ContactRow icon={Phone} href={`tel:${institution.contactPhone}`}>
                {institution.contactPhone}
              </ContactRow>
            ) : null}
            {institution.contactEmail ? (
              <ContactRow icon={Mail} href={`mailto:${institution.contactEmail}`}>
                {institution.contactEmail}
              </ContactRow>
            ) : null}
            {institution.website ? (
              <ContactRow icon={Globe} href={institution.website}>
                {institution.website.replace(/^https?:\/\//, '')}
              </ContactRow>
            ) : null}
          </div>
        </section>

        {hours && Object.keys(hours).length > 0 ? (
          <section className="lg:col-span-3 rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-[var(--fn-text)]">
              <Clock size={20} className="text-[var(--fn-primary)]" />
              Horario de apertura
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {formatOpeningHoursLine(hours).map((line, i) => {
                const dayKey = OPENING_HOURS_DAY_KEYS[i];
                const isToday = dayKey === todayKey;
                return (
                  <li
                    key={line}
                    className={[
                      'rounded-xl px-4 py-3 text-sm',
                      isToday
                        ? 'bg-[var(--fn-primary-muted)] font-bold text-[var(--fn-primary)] ring-1 ring-[var(--fn-primary)]/20'
                        : 'bg-[var(--fn-surface-muted)]/50 text-[var(--fn-text-secondary)]',
                    ].join(' ')}
                  >
                    {line}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>

      {institution.gallery && institution.gallery.length > 0 ? (
        <section className="rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-extrabold text-[var(--fn-text)]">Galería</h2>
          <PhotoGallery images={institution.gallery} editable={false} compact />
        </section>
      ) : null}

      {institution.instructors && institution.instructors.length > 0 ? (
        <section className="rounded-3xl border border-[var(--fn-border)] bg-gradient-to-br from-[var(--fn-surface)] to-[var(--fn-primary-muted)]/20 p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-[var(--fn-text)]">
            <Users size={20} className="text-[var(--fn-primary)]" />
            Equipo
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
