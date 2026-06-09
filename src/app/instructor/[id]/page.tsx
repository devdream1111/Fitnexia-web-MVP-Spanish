'use client';

import { useParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { BADGE_LABELS, INSTRUCTOR_LABELS, GENERAL_LABELS } from '@/constants/labels';
import { formatMoney, getInstructorById } from '@/data/mock';
import { useReviews } from '@/contexts/reviews-context';

export default function InstructorPublicPage() {
  const { id } = useParams<{ id: string }>();
  const instructor = getInstructorById(id ?? '');
  const { getReviewsForInstructor } = useReviews();
  const reviews = instructor ? getReviewsForInstructor(instructor.id) : [];

  if (!instructor) {
    return (
      <div className="fn-layout-content px-6 py-12">
        <PageHeader title={INSTRUCTOR_LABELS.publicProfile.instructor} showBack />
        <p>{INSTRUCTOR_LABELS.publicProfile.notFound}</p>
      </div>
    );
  }

  return (
    <div className="fn-layout-content px-6 py-12">
      <PageHeader title={instructor.displayName} showBack />
      <div className="flex items-center gap-4">
        <span className="text-5xl">🎾</span>
        <div>
          {instructor.verified ? <Badge label={BADGE_LABELS.verified} /> : null}
          <p className="text-sm text-[var(--fn-text-muted)]">
            ★ {instructor.averageRating} ({instructor.reviewCount} {GENERAL_LABELS.reviews})
          </p>
        </div>
      </div>
      {instructor.bio ? <p className="mt-6 text-[var(--fn-text-secondary)]">{instructor.bio}</p> : null}
      <p className="mt-4 text-sm">
        <strong>{INSTRUCTOR_LABELS.publicProfile.disciplines}</strong> {instructor.disciplines.join(', ')}
      </p>
      {instructor.hourlyRate ? (
        <p className="mt-2 text-lg font-bold text-[var(--fn-primary)]">
          {INSTRUCTOR_LABELS.publicProfile.from} {formatMoney(instructor.hourlyRate)}/hr
        </p>
      ) : null}

      {reviews.length > 0 ? (
        <div className="mt-12">
          <h3 className="mb-6 text-xl font-bold">{GENERAL_LABELS.reviews} ({reviews.length})</h3>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold">{review.authorName}</p>
                  {review.verified && <Badge label={BADGE_LABELS.verified} variant="success" size="sm" />}
                </div>
                <div className="text-lg mb-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                {review.comment && <p className="text-[var(--fn-text-muted)]">{review.comment}</p>}
                <p className="text-xs text-[var(--fn-text-muted)] mt-3">
                  {new Date(review.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
