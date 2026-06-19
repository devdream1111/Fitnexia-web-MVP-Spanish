'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Building2,
  Sparkles,
  Star,
  Target,
  UserRound,
  Zap,
} from 'lucide-react';

import { ClassCard } from '@/components/class-card';
import { Badge } from '@/components/ui/badge';
import {
  BADGE_LABELS,
  DISCIPLINE_LABELS,
  GENERAL_LABELS,
  GYM_LABELS,
} from '@/constants/labels';
import type { ClassListItem, Instructor, Review, StaffReview } from '@/types/api';
import type { StaffRosterItem } from '@/services/api';

const labels = GYM_LABELS.instructors.detail;

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400" aria-label={`${rating} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-amber-200/60'}
        />
      ))}
    </span>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Target;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
      <div className="flex items-center gap-3 border-b border-[var(--fn-border)] bg-gradient-to-r from-[var(--fn-primary-muted)]/60 to-transparent px-5 py-4 md:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary)]/15 text-[var(--fn-primary)]">
          <Icon size={18} />
        </span>
        <h2 className="text-base font-bold text-[var(--fn-text)] md:text-lg">{title}</h2>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

function affiliationLabel(roster: StaffRosterItem | null) {
  if (!roster) return labels.affiliationNone;
  if (roster.staffStatus === 'linked') return labels.affiliationLinked;
  if (roster.staffStatus === 'pending') return labels.affiliationPending;
  return labels.affiliationNone;
}

export function GymInstructorDetail({
  instructor,
  roster,
  gymName,
  reviews,
  staffReviews,
  classes,
  reviewsLoading,
}: {
  instructor: Instructor;
  roster: StaffRosterItem | null;
  gymName: string;
  reviews: Review[];
  staffReviews: StaffReview[];
  classes: ClassListItem[];
  reviewsLoading?: boolean;
}) {
  const disciplineList = instructor.disciplines.map(
    (d) => DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS] ?? d,
  );

  const gymStaffReview = staffReviews.find((r) => r.institutionName === gymName) ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <Link
        href="/gym/instructors"
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-2 text-sm font-semibold text-[var(--fn-text-secondary)] transition hover:border-[var(--fn-primary)]/40 hover:text-[var(--fn-text)]"
      >
        <ArrowLeft size={16} />
        {labels.viewInDirectory}
      </Link>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-slate-900 px-6 py-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-sky-300/40 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-indigo-400/30 blur-2xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {instructor.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={instructor.photoUrl}
                alt=""
                className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-4 ring-white/30 shadow-xl md:h-32 md:w-32"
              />
            ) : (
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black text-white shadow-xl backdrop-blur-sm md:h-32 md:w-32">
                {initials(instructor.displayName) || <UserRound size={40} />}
              </div>
            )}
            <div className="min-w-0 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                Instructor · {gymName}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
                  {instructor.displayName}
                </h1>
                {instructor.verified ? (
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur-sm">
                    {BADGE_LABELS.verified}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
                  <Star size={15} className="fill-amber-300 text-amber-300" />
                  {instructor.averageRating.toFixed(1)}
                  <span className="font-normal text-white/80">
                    ({instructor.reviewCount} {GENERAL_LABELS.reviews})
                  </span>
                </span>
                {roster?.staffStatus === 'linked' ? (
                  <Badge label={GYM_LABELS.instructors.onStaff} variant="success" size="sm" />
                ) : null}
                {roster?.staffStatus === 'pending' ? (
                  <Badge label={GYM_LABELS.instructors.pending} variant="warning" size="sm" />
                ) : null}
              </div>
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2.5 rounded-full px-4 py-2 text-sm font-bold shadow-lg ${
              instructor.availableNow
                ? 'bg-emerald-400/25 text-white ring-1 ring-emerald-300/50'
                : 'bg-white/10 text-white/80 ring-1 ring-white/20'
            }`}
          >
            <Zap size={16} />
            {instructor.availableNow ? BADGE_LABELS.availableNow : 'No disponible ahora'}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(22rem,100%)]">
        <div className="space-y-6">
          <Section title={labels.affiliation} icon={Building2}>
            <p className="text-sm font-semibold text-[var(--fn-primary)]">{affiliationLabel(roster)}</p>
            {roster?.staffReview ? (
              <div className="mt-4 rounded-xl border border-[var(--fn-primary)]/20 bg-[var(--fn-primary-muted)]/40 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--fn-text-muted)]">
                  {labels.yourStaffReview}
                </p>
                <div className="mt-2">
                  <StarRow rating={roster.staffReview.rating} size={14} />
                </div>
              </div>
            ) : null}
          </Section>

          <Section title={labels.disciplines} icon={Target}>
            {disciplineList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {disciplineList.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-[var(--fn-primary)]/25 bg-[var(--fn-primary-muted)]/50 px-4 py-2 text-sm font-semibold text-[var(--fn-primary)]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-[var(--fn-text-muted)]">{GENERAL_LABELS.none}</p>
            )}
          </Section>

          {instructor.bio?.trim() ? (
            <Section title="Biografía" icon={Sparkles}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--fn-text-secondary)] md:text-base">
                {instructor.bio.trim()}
              </p>
            </Section>
          ) : null}

          {instructor.certifications && instructor.certifications.length > 0 ? (
            <Section title="Certificaciones" icon={Award}>
              <ul className="space-y-3">
                {instructor.certifications.map((cert, index) => (
                  <li
                    key={`${cert.name}-${index}`}
                    className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-4 py-3"
                  >
                    <p className="font-bold text-[var(--fn-text)]">{cert.name}</p>
                    <p className="text-sm text-[var(--fn-text-muted)]">
                      {cert.issuer} · {cert.year}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section title={labels.classesAtGym} icon={BookOpen}>
            {classes.length > 0 ? (
              <div className="grid gap-4">
                {classes.map((c) => (
                  <ClassCard key={c.id} item={c} />
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-[var(--fn-text-muted)]">{labels.noClasses}</p>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title={`${labels.athleteReviews} (${reviews.length})`} icon={Star}>
            {reviewsLoading ? (
              <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 p-4"
                  >
                    <p className="font-bold text-[var(--fn-text)]">{review.authorName}</p>
                    <div className="mt-2">
                      <StarRow rating={review.rating} size={14} />
                    </div>
                    {review.comment ? (
                      <p className="mt-2 text-sm text-[var(--fn-text-muted)]">{review.comment}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-[var(--fn-text-muted)]">Sin reseñas públicas aún.</p>
            )}
          </Section>

          {staffReviews.length > 0 ? (
            <Section title={labels.staffReviews} icon={Building2}>
              <div className="space-y-4">
                {staffReviews.map((review) => (
                  <article
                    key={review.id}
                    className={`rounded-xl border p-4 ${
                      review.institutionName === gymName
                        ? 'border-[var(--fn-primary)]/30 bg-[var(--fn-primary-muted)]/30'
                        : 'border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30'
                    }`}
                  >
                    <p className="text-sm font-semibold text-[var(--fn-text)]">{review.institutionName}</p>
                    <div className="mt-2">
                      <StarRow rating={review.rating} size={14} />
                    </div>
                    {review.comment ? (
                      <p className="mt-2 text-sm text-[var(--fn-text-muted)]">{review.comment}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </Section>
          ) : null}

          {gymStaffReview && !roster?.staffReview ? (
            <Section title={labels.yourStaffReview} icon={Star}>
              <StarRow rating={gymStaffReview.rating} size={14} />
              {gymStaffReview.comment ? (
                <p className="mt-2 text-sm text-[var(--fn-text-muted)]">{gymStaffReview.comment}</p>
              ) : null}
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
