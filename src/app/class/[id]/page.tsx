'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useClasses } from '@/contexts/classes-context';
import { useReviews } from '@/contexts/reviews-context';
import { formatClassDate, formatMoney, getInstructorById } from '@/data/mock';
import {
  BADGE_LABELS,
  BUTTON_LABELS,
  CLASS_DETAIL_LABELS,
  SCREEN_TITLES,
  classSpotsLabel,
  modalityBadgeLabel,
  GENERAL_LABELS,
} from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getClassById } = useClasses();
  const { getReviewsForClass } = useReviews();
  const waitlistEnabled = useFeature('waitlist');
  const cls = getClassById(id ?? '');
  const instructor = cls ? getInstructorById(cls.instructor.id) : undefined;
  const reviews = cls ? getReviewsForClass(cls.id) : [];

  if (!cls) {
    return (
      <div className="fn-layout-content px-6 py-12">
        <PageHeader title={SCREEN_TITLES.class} showBack />
        <p>{SCREEN_TITLES.classNotFound}</p>
      </div>
    );
  }

  const full = cls.spotsLeft === 0;

  return (
    <div className="fn-layout-content px-6 py-12">
      <PageHeader title={SCREEN_TITLES.classDetails} showBack />
      <h2 className="text-3xl font-extrabold">{cls.title}</h2>
      <div className="mt-2 flex gap-2">
        <Badge label={cls.discipline} />
        <Badge label={modalityBadgeLabel(cls.modality)} variant="success" />
      </div>

      <div className="mt-6 space-y-3 rounded-2xl bg-[var(--fn-surface)] p-4">
        <Row label={CLASS_DETAIL_LABELS.when} value={formatClassDate(cls.startAt)} />
        <Row label={CLASS_DETAIL_LABELS.duration} value={`${cls.durationMinutes} ${GENERAL_LABELS.min}`} />
        <Row
          label={CLASS_DETAIL_LABELS.where}
          value={
            cls.modality === 'online'
              ? CLASS_DETAIL_LABELS.onlineSessionLink
              : (cls.location?.label ?? CLASS_DETAIL_LABELS.locationTbd)
          }
        />
        <Row label={CLASS_DETAIL_LABELS.price} value={formatMoney(cls.price)} />
        {cls.capacity ? (
          <Row
            label={CLASS_DETAIL_LABELS.spots}
            value={classSpotsLabel(cls.spotsLeft ?? 0, cls.capacity, { waitlistEnabled })}
          />
        ) : null}
      </div>

      <Link
        href={`/instructor/${cls.instructor.id}`}
        className="mt-4 flex items-center gap-4 rounded-2xl bg-[var(--fn-surface)] p-4">
        <span className="text-3xl">🎾</span>
        <div className="flex-1">
          <p className="font-bold">{cls.instructor.displayName}</p>
          {instructor?.verified ? <Badge label={BADGE_LABELS.verified} /> : null}
          {instructor?.averageRating ? <p className="text-sm">★ {instructor.averageRating.toFixed(1)}</p> : null}
        </div>
        <span className="text-sm text-[var(--fn-primary)]">{BUTTON_LABELS.viewProfile}</span>
      </Link>

      <h3 className="mt-6 font-bold">{CLASS_DETAIL_LABELS.about}</h3>
      <p className="text-[var(--fn-text-muted)]">
        Únete a {cls.instructor.displayName} para una sesión atractiva de {cls.discipline.toLowerCase()}.
      </p>

      <div className="mt-8">
        {full ? (
          waitlistEnabled ? (
            <Button
              title={BUTTON_LABELS.joinWaitlist}
              variant="secondary"
              onClick={() => router.push(`/book/${cls.id}?waitlist=1`)}
            />
          ) : (
            <Button title={BUTTON_LABELS.classFull} disabled />
          )
        ) : (
          <Button title={BUTTON_LABELS.bookNow} onClick={() => router.push(`/book/${cls.id}`)} />
        )}
      </div>

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--fn-text-muted)]">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
