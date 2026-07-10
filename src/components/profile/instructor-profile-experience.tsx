'use client';

import {
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
import { PublicProfileShell } from '@/components/layout/public-profile-shell';
import {
  ProfileExperienceAsideCard,
  ProfileExperienceAvailability,
  ProfileExperienceBody,
  ProfileExperienceCertCard,
  ProfileExperienceChip,
  ProfileExperienceHero,
  ProfileExperienceInlineStats,
  ProfileExperienceOverviewCard,
  ProfileExperienceOverviewGrid,
  ProfileExperiencePage,
  ProfileExperiencePreviewText,
  ProfileExperienceSection,
} from '@/components/profile/profile-experience-ui';
import { Badge } from '@/components/ui/badge';
import {
  InstructorReviewsSection,
  RatingSummary,
  StarRating,
} from '@/components/reviews/instructor-rating-display';
import {
  BADGE_LABELS,
  DISCIPLINE_LABELS,
  GENERAL_LABELS,
  GYM_LABELS,
  INSTRUCTOR_LABELS,
} from '@/constants/labels';
import { formatMoney } from '@/utils/format';
import type { Certification, ClassListItem, Instructor, Review, StaffReview } from '@/types/api';
import type { StaffRosterItem } from '@/services/api';

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function affiliationLabel(roster: StaffRosterItem | null) {
  const labels = GYM_LABELS.instructors.detail;
  if (!roster) return labels.affiliationNone;
  if (roster.staffStatus === 'linked') return labels.affiliationLinked;
  if (roster.staffStatus === 'pending') return labels.affiliationPending;
  return labels.affiliationNone;
}

type InstructorProfileExperienceProps = {
  instructor: Instructor;
  reviews: Review[];
  staffReviews: StaffReview[];
  reviewsLoading?: boolean;
  variant: 'public' | 'gym';
  onBack?: () => void;
  backHref?: string;
  backLabel?: string;
  gymName?: string;
  roster?: StaffRosterItem | null;
  classes?: ClassListItem[];
  gymStaffReview?: StaffReview | null;
};

export function InstructorProfileExperience({
  instructor,
  reviews,
  staffReviews,
  reviewsLoading,
  variant,
  onBack,
  backHref,
  backLabel,
  gymName,
  roster,
  classes = [],
  gymStaffReview,
}: InstructorProfileExperienceProps) {
  const publicLabels = INSTRUCTOR_LABELS.publicProfile;
  const gymLabels = GYM_LABELS.instructors.detail;
  const disciplineList = instructor.disciplines.map(
    (d) => DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS] ?? d,
  );
  const certCount = instructor.certifications?.length ?? 0;

  const heroEyebrow =
    variant === 'gym'
      ? `${GYM_LABELS.instructors.rosterTitle} · ${gymName ?? 'Club'}`
      : publicLabels.profileEyebrow;

  return (
    <PublicProfileShell
      onBack={onBack}
      backHref={backHref ?? (variant === 'gym' ? '/gym/instructors' : '/')}
      backLabel={backLabel ?? (variant === 'gym' ? gymLabels.viewInDirectory : GENERAL_LABELS.back)}
    >
      <ProfileExperiencePage>
        <ProfileExperienceHero
          footer={
            <ProfileExperienceInlineStats
              stats={[
                {
                  label: GENERAL_LABELS.reviews,
                  value: instructor.reviewCount > 0 ? instructor.averageRating.toFixed(1) : '—',
                  icon: Star,
                },
                {
                  label: variant === 'gym' ? gymLabels.disciplines : publicLabels.expertise,
                  value: disciplineList.length || '—',
                  icon: Target,
                },
                {
                  label: publicLabels.certifications,
                  value: certCount || '—',
                  icon: Award,
                },
                {
                  label: variant === 'gym' ? gymLabels.classesAtGym : 'Modalidad',
                  value: variant === 'gym' ? classes.length : instructor.availableNow ? 'Activo' : '—',
                  icon: variant === 'gym' ? BookOpen : Zap,
                },
              ]}
            />
          }
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              {instructor.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={instructor.photoUrl}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-4 ring-white/30 shadow-xl md:h-28 md:w-28"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black text-white shadow-xl backdrop-blur-sm md:h-28 md:w-28">
                  {initials(instructor.displayName) || <UserRound size={36} />}
                </div>
              )}
              <div className="min-w-0 text-white">
                <p className="m-0 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-white/75">
                  {heroEyebrow}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h1 className="m-0 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl lg:text-[2.125rem]">
                    {instructor.displayName}
                  </h1>
                  {instructor.verified ? (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[0.6875rem] font-bold backdrop-blur-sm">
                      {BADGE_LABELS.verified}
                    </span>
                  ) : null}
                  {variant === 'gym' && roster?.staffStatus === 'linked' ? (
                    <Badge label={GYM_LABELS.instructors.onStaff} variant="success" size="sm" />
                  ) : null}
                  {variant === 'gym' && roster?.staffStatus === 'pending' ? (
                    <Badge label={GYM_LABELS.instructors.pending} variant="warning" size="sm" />
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                    <RatingSummary
                      averageRating={instructor.averageRating}
                      reviewCount={instructor.reviewCount}
                      variant="compact"
                      inverse
                    />
                  </span>
                  {variant === 'public' && instructor.hourlyRate ? (
                    <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold backdrop-blur-sm">
                      {publicLabels.from} {formatMoney(instructor.hourlyRate)}/hr
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 lg:max-w-xs lg:items-end">
              <div
                className={`inline-flex w-full items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold lg:w-auto ${
                  instructor.availableNow
                    ? 'bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm'
                    : 'bg-white/10 text-white/85 ring-1 ring-white/20 backdrop-blur-sm'
                }`}
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  {instructor.availableNow ? (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-45" />
                  ) : null}
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      instructor.availableNow ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                </span>
                <Zap size={15} />
                {instructor.availableNow
                  ? variant === 'gym'
                    ? BADGE_LABELS.availableNow
                    : publicLabels.availableNow
                  : variant === 'gym'
                    ? 'No disponible ahora'
                    : publicLabels.notAvailableNow}
              </div>
              {variant === 'public' ? (
                <p className="m-0 text-xs leading-relaxed text-white/75 lg:text-right">{publicLabels.subtitle}</p>
              ) : variant === 'gym' ? (
                <p className="m-0 text-xs font-semibold text-white/80 lg:text-right">{affiliationLabel(roster ?? null)}</p>
              ) : null}
            </div>
          </div>
        </ProfileExperienceHero>

        <ProfileExperienceOverviewGrid>
          <ProfileExperienceOverviewCard title={variant === 'gym' ? 'Biografía' : publicLabels.bio} icon={Sparkles} index={0}>
            <ProfileExperiencePreviewText
              text={instructor.bio}
              empty={variant === 'gym' ? '—' : publicLabels.bioEmpty}
            />
          </ProfileExperienceOverviewCard>

          <ProfileExperienceOverviewCard
            title={variant === 'gym' ? gymLabels.disciplines : publicLabels.expertise}
            icon={Target}
            index={1}
          >
            {disciplineList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {disciplineList.slice(0, 8).map((label) => (
                  <ProfileExperienceChip key={label}>{label}</ProfileExperienceChip>
                ))}
                {disciplineList.length > 8 ? (
                  <span className="self-center text-xs font-semibold text-[var(--fn-text-muted)]">
                    +{disciplineList.length - 8}
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="m-0 text-sm italic text-[var(--fn-text-muted)]">
                {variant === 'gym' ? GENERAL_LABELS.none : publicLabels.expertiseEmpty}
              </p>
            )}
          </ProfileExperienceOverviewCard>

          <ProfileExperienceOverviewCard title="Información clave" icon={Zap} index={2}>
            <div className="space-y-3">
              <ProfileExperienceAvailability
                available={!!instructor.availableNow}
                availableLabel={publicLabels.availableNow}
                unavailableLabel={publicLabels.notAvailableNow}
              />
              {variant === 'public' && instructor.hourlyRate ? (
                <p className="m-0 text-sm text-[var(--fn-text-secondary)]">
                  <span className="font-bold text-[var(--fn-text)]">Tarifa: </span>
                  {formatMoney(instructor.hourlyRate)}/hr
                </p>
              ) : null}
              {variant === 'gym' ? (
                <>
                  <p className="m-0 text-sm text-[var(--fn-text-secondary)]">
                    <span className="font-bold text-[var(--fn-text)]">{gymLabels.affiliation}: </span>
                    {affiliationLabel(roster ?? null)}
                  </p>
                  <p className="m-0 text-sm text-[var(--fn-text-secondary)]">
                    <span className="font-bold text-[var(--fn-text)]">{gymLabels.classesAtGym}: </span>
                    {classes.length}
                  </p>
                </>
              ) : null}
              {certCount > 0 ? (
                <p className="m-0 text-sm text-[var(--fn-text-secondary)]">
                  <span className="font-bold text-[var(--fn-text)]">{publicLabels.certifications}: </span>
                  {certCount}
                </p>
              ) : null}
            </div>
          </ProfileExperienceOverviewCard>
        </ProfileExperienceOverviewGrid>

        <ProfileExperienceBody
          aside={
            variant === 'gym' ? (
              <>
                {roster?.staffReview ? (
                  <ProfileExperienceAsideCard title={gymLabels.yourStaffReview} icon={Building2}>
                    <StarRating value={roster.staffReview.rating} size={14} />
                  </ProfileExperienceAsideCard>
                ) : null}
                {gymStaffReview && !roster?.staffReview ? (
                  <ProfileExperienceAsideCard title={gymLabels.yourStaffReview} icon={Building2}>
                    <StarRating value={gymStaffReview.rating} size={14} />
                    {gymStaffReview.comment ? (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--fn-text-muted)]">
                        {gymStaffReview.comment}
                      </p>
                    ) : null}
                  </ProfileExperienceAsideCard>
                ) : null}
              </>
            ) : undefined
          }
          main={
            <>
              <ProfileExperienceSection
                title={variant === 'gym' ? 'Biografía' : publicLabels.bio}
                icon={Sparkles}
                index={0}
                compact
              >
                {instructor.bio?.trim() ? (
                  <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-[var(--fn-text-secondary)] md:text-base">
                    {instructor.bio.trim()}
                  </p>
                ) : (
                  <p className="m-0 text-sm italic text-[var(--fn-text-muted)]">
                    {variant === 'gym' ? '—' : publicLabels.bioEmpty}
                  </p>
                )}
              </ProfileExperienceSection>

              {certCount > 0 ? (
                <ProfileExperienceSection title={publicLabels.certifications} icon={Award} index={1} compact>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {instructor.certifications!.map((cert: Certification, index) => (
                      <ProfileExperienceCertCard
                        key={`${cert.name}-${cert.year}-${index}`}
                        name={cert.name}
                        issuer={cert.issuer}
                        year={cert.year}
                      />
                    ))}
                  </div>
                </ProfileExperienceSection>
              ) : null}

              {variant === 'gym' ? (
                <ProfileExperienceSection title={gymLabels.classesAtGym} icon={BookOpen} index={2} compact>
                  {classes.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {classes.map((c) => (
                        <ClassCard key={c.id} item={c} />
                      ))}
                    </div>
                  ) : (
                    <p className="m-0 text-sm italic text-[var(--fn-text-muted)]">{gymLabels.noClasses}</p>
                  )}
                </ProfileExperienceSection>
              ) : null}
            </>
          }
        />

        <div className="mt-8">
          <InstructorReviewsSection
            title={variant === 'gym' ? gymLabels.athleteReviews : GENERAL_LABELS.reviews}
            averageRating={instructor.averageRating}
            reviewCount={instructor.reviewCount}
            reviews={reviews}
            staffReviews={staffReviews}
            staffReviewsTitle={variant === 'gym' ? gymLabels.staffReviews : publicLabels.staffReviews}
            staffReviewsHint={variant === 'public' ? publicLabels.staffReviewsHint : undefined}
            reviewsEmpty={publicLabels.reviewsEmpty}
            loading={reviewsLoading}
          />
        </div>
      </ProfileExperiencePage>
    </PublicProfileShell>
  );
}
