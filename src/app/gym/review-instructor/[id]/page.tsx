'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Star, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useReviews } from '@/contexts/reviews-context';
import {
  apiGetInstructor,
  apiGetStaffReviewEligibility,
  type StaffReviewEligibility,
} from '@/services/api';
import { getLinkedInstitutionId } from '@/utils/institution';
import {
  ALERT_LABELS,
  BADGE_LABELS,
  GYM_LABELS,
  SCREEN_TITLES,
} from '@/constants/labels';
import { ApiClientError } from '@/services/api-client';
import type { Instructor } from '@/types/api';

export default function ReviewInstructorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addStaffReview } = useReviews();
  const { showNotice } = useNoticeModal();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [eligibility, setEligibility] = useState<StaffReviewEligibility | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const institutionId = getLinkedInstitutionId(user);

  useEffect(() => {
    if (!id) return;
    apiGetInstructor(id).then(setInstructor).catch(() => setInstructor(null));
    apiGetStaffReviewEligibility(id).then(setEligibility).catch(() => setEligibility(null));
  }, [id]);

  const submit = async () => {
    if (!id || !user?.institutionProfile || !eligibility?.canLeaveReview) return;
    setSubmitting(true);
    try {
      await addStaffReview({
        instructorId: id,
        institutionId,
        institutionName: user.institutionProfile.name,
        rating,
        comment: comment.trim() || undefined,
      });
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: GYM_LABELS.staffReview.success,
        variant: 'success',
      });
      router.push('/gym/instructors');
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo publicar la reseña',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!instructor) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <PageHeader title={GYM_LABELS.staffReview.title} showBack />
        <p className="text-[var(--fn-text-muted)]">{SCREEN_TITLES.classNotFound}</p>
      </div>
    );
  }

  const canReview = eligibility?.canLeaveReview ?? false;
  const existing = eligibility?.existingReview;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <PageHeader title={GYM_LABELS.staffReview.title} showBack />

      <section className="overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-lg">
        <div className="bg-gradient-to-br from-violet-600/15 via-[var(--fn-primary-muted)]/40 to-transparent px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--fn-primary-muted)] text-xl font-black text-[var(--fn-primary)]">
              {instructor.displayName.slice(0, 2).toUpperCase() || <UserRound size={28} />}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--fn-text)]">{instructor.displayName}</h2>
              <p className="mt-1 text-sm text-[var(--fn-text-muted)]">{GYM_LABELS.staffReview.subtitle}</p>
              {instructor.verified ? (
                <span className="mt-2 inline-block">
                  <Badge label={BADGE_LABELS.verified} variant="success" size="sm" />
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {!canReview && !existing ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-[var(--fn-text-secondary)]">
              <p className="font-semibold text-[var(--fn-text)]">{GYM_LABELS.staffReview.notEligible}</p>
              {!eligibility?.linked ? (
                <p className="mt-1">{GYM_LABELS.staffReview.needLinked}</p>
              ) : !eligibility?.hasCompletedClass ? (
                <p className="mt-1">{GYM_LABELS.staffReview.needCompletedClass}</p>
              ) : null}
            </div>
          ) : null}

          {existing ? (
            <div className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 p-5">
              <p className="font-semibold text-[var(--fn-text)]">{GYM_LABELS.staffReview.alreadyReviewed}</p>
              <div className="mt-3 flex items-center gap-1 text-2xl text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={22} className={i < existing.rating ? 'fill-current' : 'opacity-30'} />
                ))}
              </div>
              {existing.comment ? (
                <p className="mt-3 text-sm leading-relaxed text-[var(--fn-text-muted)]">{existing.comment}</p>
              ) : null}
            </div>
          ) : canReview ? (
            <>
              <div>
                <p className="mb-3 text-sm font-semibold text-[var(--fn-text)]">
                  {GYM_LABELS.staffReview.ratingLabel}
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className="rounded-xl border border-[var(--fn-border)] px-3 py-2 transition hover:border-[var(--fn-primary)]"
                      aria-label={`${n} estrellas`}
                    >
                      <Star
                        size={28}
                        className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-[var(--fn-border)]'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--fn-text)]">
                  {GYM_LABELS.staffReview.commentLabel}
                </span>
                <textarea
                  className="w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 text-sm leading-relaxed outline-none transition focus:border-[var(--fn-primary)]"
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={GYM_LABELS.staffReview.commentPlaceholder}
                />
              </label>

              <Button
                title={GYM_LABELS.staffReview.submit}
                className="w-full"
                loading={submitting}
                onClick={submit}
              />
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
