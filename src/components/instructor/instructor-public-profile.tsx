'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  Building2,
  Sparkles,
  Star,
  Target,
  UserRound,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { DASHBOARD_GRADIENTS } from '@/components/dashboard/dashboard-ui';
import {
  BADGE_LABELS,
  DISCIPLINE_LABELS,
  GENERAL_LABELS,
  INSTRUCTOR_LABELS,
} from '@/constants/labels';
import { formatMoney } from '@/utils/format';
import type { Certification, Instructor, Review, StaffReview } from '@/types/api';

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

function ProfileSection({
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
      <div className="flex items-center gap-3 border-b border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 px-5 py-4 md:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
          <Icon size={18} />
        </span>
        <h2 className="text-base font-bold text-[var(--fn-text)] md:text-lg">{title}</h2>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

function CertificationCard({ cert }: { cert: Certification }) {
  return (
    <article className="flex gap-4 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
        <Award size={20} />
      </span>
      <div className="min-w-0">
        <p className="font-bold text-[var(--fn-text)]">{cert.name}</p>
        <p className="mt-0.5 text-sm text-[var(--fn-text-muted)]">{cert.issuer}</p>
        <p className="mt-1 text-xs font-semibold text-[var(--fn-primary)]">{cert.year}</p>
      </div>
    </article>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-[var(--fn-text)]">{review.authorName}</p>
        {review.verified ? <Badge label={BADGE_LABELS.verified} variant="success" size="sm" /> : null}
      </div>
      <StarRow rating={review.rating} />
      {review.comment ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--fn-text-secondary)]">{review.comment}</p>
      ) : null}
      <p className="mt-3 text-xs text-[var(--fn-text-muted)]">
        {new Date(review.createdAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </article>
  );
}

export function InstructorPublicProfile({
  instructor,
  reviews,
  staffReviews,
  reviewsLoading,
}: {
  instructor: Instructor;
  reviews: Review[];
  staffReviews: StaffReview[];
  reviewsLoading?: boolean;
}) {
  const router = useRouter();
  const labels = INSTRUCTOR_LABELS.publicProfile;

  const disciplineList = instructor.disciplines.map(
    (d) => DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS] ?? d,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-2 text-sm font-semibold text-[var(--fn-text-secondary)] transition hover:border-[var(--fn-primary)]/40 hover:text-[var(--fn-text)]"
      >
        <ArrowLeft size={16} />
        {GENERAL_LABELS.back}
      </button>

      <section
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${DASHBOARD_GRADIENTS.instructor} px-6 py-8 md:px-10 md:py-10`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
        </div>

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
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
                {labels.profileEyebrow}
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
                {instructor.hourlyRate ? (
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold backdrop-blur-sm">
                    {labels.from} {formatMoney(instructor.hourlyRate)}/hr
                  </span>
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
            <span className="relative flex h-2.5 w-2.5">
              {instructor.availableNow ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              ) : null}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  instructor.availableNow ? 'bg-emerald-300' : 'bg-white/50'
                }`}
              />
            </span>
            <Zap size={16} className={instructor.availableNow ? 'text-emerald-200' : 'text-white/60'} />
            {instructor.availableNow ? labels.availableNow : labels.notAvailableNow}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(22rem,100%)]">
        <div className="space-y-6">
          <ProfileSection title={labels.bio} icon={Sparkles}>
            {instructor.bio?.trim() ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--fn-text-secondary)] md:text-base">
                {instructor.bio.trim()}
              </p>
            ) : (
              <p className="text-sm italic text-[var(--fn-text-muted)]">{labels.bioEmpty}</p>
            )}
          </ProfileSection>

          <ProfileSection title={labels.expertise} icon={Target}>
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
              <p className="text-sm italic text-[var(--fn-text-muted)]">{labels.expertiseEmpty}</p>
            )}
          </ProfileSection>

          <ProfileSection title={labels.certifications} icon={Award}>
            {instructor.certifications && instructor.certifications.length > 0 ? (
              <div className="space-y-3">
                {instructor.certifications.map((cert, index) => (
                  <CertificationCard key={`${cert.name}-${cert.year}-${index}`} cert={cert} />
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-[var(--fn-text-muted)]">{labels.certificationsEmpty}</p>
            )}
          </ProfileSection>
        </div>

        <div className="space-y-6">
          <ProfileSection title={`${GENERAL_LABELS.reviews} (${reviews.length})`} icon={Star}>
            {reviewsLoading ? (
              <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-[var(--fn-text-muted)]">{labels.reviewsEmpty}</p>
            )}
          </ProfileSection>

          {staffReviews.length > 0 ? (
            <ProfileSection title={labels.staffReviews} icon={Building2}>
              <p className="mb-4 text-sm text-[var(--fn-text-muted)]">{labels.staffReviewsHint}</p>
              <div className="space-y-4">
                {staffReviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--fn-text)]">
                      <Building2 size={15} className="text-violet-600" />
                      {review.institutionName}
                    </div>
                    <StarRow rating={review.rating} size={14} />
                    {review.comment ? (
                      <p className="mt-2 text-sm text-[var(--fn-text-muted)]">{review.comment}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </ProfileSection>
          ) : null}
        </div>
      </div>
    </div>
  );
}
