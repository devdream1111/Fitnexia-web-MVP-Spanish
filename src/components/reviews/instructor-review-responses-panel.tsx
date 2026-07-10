'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useReviews } from '@/contexts/reviews-context';
import { useFeature } from '@/hooks/use-feature';
import { ApiClientError } from '@/services/api-client';
import { ALERT_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { getLinkedInstructorId } from '@/utils/instructor';

/** F-29 — instructor public replies to athlete reviews. */
export function InstructorReviewResponsesPanel() {
  const enabled = useFeature('reviewResponses');
  const { user } = useAuth();
  const { getReviewsForInstructor, respondToReview } = useReviews();
  const { showNotice } = useNoticeModal();
  const instructorId = getLinkedInstructorId(user);
  const reviews = instructorId ? getReviewsForInstructor(instructorId) : [];
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  if (!enabled || reviews.length === 0) return null;

  const save = async (reviewId: string) => {
    const text = drafts[reviewId]?.trim();
    if (!text || !instructorId) return;
    setSavingId(reviewId);
    try {
      await respondToReview(instructorId, reviewId, text);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: MOCK_V2V3_LABELS.replySaved,
        variant: 'success',
      });
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message:
          error instanceof ApiClientError ? error.message : 'No se pudo publicar la respuesta',
        variant: 'error',
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <MessageSquare size={18} className="text-[var(--fn-primary)]" />
        <h3 className="m-0 text-sm font-bold text-[var(--fn-text)]">
          {MOCK_V2V3_LABELS.replyToReview}
        </h3>
      </div>
      <ul className="m-0 list-none space-y-3 p-0">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-lg border border-[var(--fn-border)] p-3">
            <p className="m-0 text-sm font-semibold text-[var(--fn-text)]">{review.authorName}</p>
            {review.comment ? (
              <p className="mt-1 m-0 text-sm text-[var(--fn-text-muted)]">{review.comment}</p>
            ) : null}
            {review.response ? (
              <p className="mt-3 m-0 rounded-lg bg-[color-mix(in_srgb,var(--fn-primary-muted)_50%,var(--fn-surface))] px-3 py-2 text-sm text-[var(--fn-text-secondary)]">
                <span className="font-semibold text-[var(--fn-text)]">
                  {MOCK_V2V3_LABELS.reviewResponse}:{' '}
                </span>
                {review.response}
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                <Textarea
                  label={MOCK_V2V3_LABELS.replyToReview}
                  value={drafts[review.id] ?? ''}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))
                  }
                  rows={2}
                  placeholder={MOCK_V2V3_LABELS.replyPlaceholder}
                />
                <Button
                  title="Publicar respuesta"
                  size="sm"
                  loading={savingId === review.id}
                  onClick={() => void save(review.id)}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
