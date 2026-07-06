'use client';

import { Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { BADGE_LABELS, GENERAL_LABELS } from '@/constants/labels';
import type { Review, StaffReview } from '@/types/api';

/** Fractional star row (e.g. 4.3 shows partial fill on the 5th star). */
export function StarRating({
  value,
  size = 16,
  className = '',
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const clamped = Math.min(5, Math.max(0, value));

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${clamped.toFixed(1)} de 5`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fillPercent = Math.min(100, Math.max(0, (clamped - index) * 100));
        return (
          <span
            key={index}
            className="relative inline-flex shrink-0"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              className="absolute text-amber-200/70 dark:text-amber-900/40"
              strokeWidth={1.5}
            />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
              <Star size={size} className="fill-amber-400 text-amber-400" strokeWidth={1.5} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function RatingSummary({
  averageRating,
  reviewCount,
  variant = 'default',
  inverse = false,
}: {
  averageRating: number;
  reviewCount: number;
  variant?: 'default' | 'compact';
  inverse?: boolean;
}) {
  const muted = inverse ? 'text-white/75' : 'text-[var(--fn-text-muted)]';
  const text = inverse ? 'text-white' : 'text-[var(--fn-text)]';

  if (reviewCount === 0) {
    return <p className={`text-sm ${muted}`}>Sin reseñas aún</p>;
  }

  if (variant === 'compact') {
    return (
      <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${text}`}>
        <span className="inline-flex items-center gap-1">
          <span className="text-base font-bold tabular-nums">{averageRating.toFixed(1)}</span>
          <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
        </span>
        <span className={`font-normal ${muted}`}>
          · {reviewCount} {reviewCount === 1 ? 'reseña' : GENERAL_LABELS.reviews.toLowerCase()}
        </span>
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <p className={`text-5xl font-extrabold leading-none tabular-nums ${text}`}>
        {averageRating.toFixed(1)}
      </p>
      <div>
        <StarRating value={averageRating} size={20} />
        <p className={`mt-1.5 text-sm ${muted}`}>
          {reviewCount} {reviewCount === 1 ? 'reseña' : GENERAL_LABELS.reviews.toLowerCase()}
        </p>
      </div>
    </div>
  );
}

function ratingDistribution(reviews: Review[]) {
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const pct = reviews.length > 0 ? count / reviews.length : 0;
    return { stars, count, pct };
  });
}

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <div className="grid max-w-sm gap-1.5">
      {ratingDistribution(reviews).map(({ stars, count, pct }) => (
        <div key={stars} className="grid grid-cols-[2rem_1fr_2rem] items-center gap-2 text-xs">
          <span className="font-medium text-[var(--fn-text-muted)]">{stars}</span>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--fn-surface-muted)]">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${Math.round(pct * 100)}%` }}
            />
          </div>
          <span className="text-right tabular-nums text-[var(--fn-text-muted)]">{count}</span>
        </div>
      ))}
    </div>
  );
}

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ReviewListItem({ review }: { review: Review }) {
  return (
    <article className="border-b border-[var(--fn-border)] py-5 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[var(--fn-text)]">{review.authorName}</p>
            {review.verified ? (
              <Badge label={BADGE_LABELS.verified} variant="success" size="sm" />
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-[var(--fn-text-muted)]">
            {formatReviewDate(review.createdAt)}
          </p>
        </div>
        <div
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-sm font-bold text-amber-800 dark:text-amber-200"
          aria-label={`${review.rating} de 5`}
        >
          {review.rating.toFixed(1)}
          <Star size={14} className="fill-amber-500 text-amber-500" />
        </div>
      </div>
      {review.comment?.trim() ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--fn-text-secondary)]">
          {review.comment.trim()}
        </p>
      ) : null}
    </article>
  );
}

export function StaffReviewListItem({ review }: { review: StaffReview }) {
  return (
    <article className="border-b border-[var(--fn-border)] py-4 last:border-b-0 last:pb-0">
      <p className="text-sm font-semibold text-[var(--fn-text)]">{review.institutionName}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-800 dark:text-amber-200">
          {review.rating.toFixed(1)}
          <Star size={14} className="fill-amber-500 text-amber-500" />
        </span>
        <span className="text-xs text-[var(--fn-text-muted)]">{formatReviewDate(review.createdAt)}</span>
      </div>
      {review.comment?.trim() ? (
        <p className="mt-2 text-sm text-[var(--fn-text-muted)]">{review.comment.trim()}</p>
      ) : null}
    </article>
  );
}

export function InstructorReviewsSection({
  title,
  averageRating,
  reviewCount,
  reviews,
  staffReviews = [],
  staffReviewsTitle,
  staffReviewsHint,
  reviewsEmpty,
  loading,
}: {
  title: string;
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
  staffReviews?: StaffReview[];
  staffReviewsTitle?: string;
  staffReviewsHint?: string;
  reviewsEmpty?: string;
  loading?: boolean;
}) {
  const displayAverage =
    reviewCount > 0 && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : averageRating;

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
      <div className="border-b border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 px-5 py-4 md:px-6">
        <h2 className="text-base font-bold text-[var(--fn-text)] md:text-lg">{title}</h2>
      </div>
      <div className="space-y-6 p-5 md:p-6">
        <RatingSummary averageRating={displayAverage} reviewCount={reviewCount || reviews.length} />

        {loading ? (
          <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
        ) : reviews.length > 0 ? (
          <>
            <RatingDistribution reviews={reviews} />
            <div>{reviews.map((review) => <ReviewListItem key={review.id} review={review} />)}</div>
          </>
        ) : (
          <p className="text-sm italic text-[var(--fn-text-muted)]">
            {reviewsEmpty ?? 'Sin reseñas públicas aún.'}
          </p>
        )}

        {staffReviews.length > 0 && staffReviewsTitle ? (
          <div className="border-t border-[var(--fn-border)] pt-6">
            <h3 className="font-bold text-[var(--fn-text)]">{staffReviewsTitle}</h3>
            {staffReviewsHint ? (
              <p className="mt-1 text-sm text-[var(--fn-text-muted)]">{staffReviewsHint}</p>
            ) : null}
            <div className="mt-4">
              {staffReviews.map((review) => (
                <StaffReviewListItem key={review.id} review={review} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
