'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useClasses } from '@/contexts/classes-context';
import { useReviews } from '@/contexts/reviews-context';
import { useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { apiGetReviewEligibility } from '@/services/api';
import { formatClassDate } from '@/utils/format';
import { ALERT_LABELS, GENERAL_LABELS } from '@/constants/labels';
import type { ClassListItem } from '@/types/api';

export default function ReviewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { fetchClassById } = useClasses();
  const { addReview } = useReviews();
  const { user } = useAuth();
  const { showNotice } = useNoticeModal();
  const [cls, setCls] = useState<ClassListItem | null>(null);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) return;
    apiGetReviewEligibility(bookingId).then(async (result) => {
      setEligible(result.eligible);
      if (!result.eligible) return;
      const booking = await import('@/services/api').then((m) => m.apiGetBooking(bookingId));
      const classData = await fetchClassById(booking.classId);
      setCls(classData);
    }).catch(() => setEligible(false));
  }, [bookingId, fetchClassById]);

  const submit = async () => {
    if (!bookingId || !user) return;
    setSubmitting(true);
    setError('');
    try {
      await addReview({ bookingId, rating, comment: comment || undefined });
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: GENERAL_LABELS.reviewSubmittedAlert,
        variant: 'success',
      });
      router.push('/athlete/bookings');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (eligible === false) {
    return (
      <div className="fn-layout-narrow px-6 py-12">
        <PageHeader title={GENERAL_LABELS.review} showBack />
        <p>{GENERAL_LABELS.bookingNotFound}</p>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="fn-layout-narrow px-6 py-12">
        <PageHeader title={GENERAL_LABELS.leaveAReview} showBack />
        <p>{GENERAL_LABELS.loading}</p>
      </div>
    );
  }

  return (
    <div className="fn-layout-narrow px-6 py-12">
      <PageHeader title={GENERAL_LABELS.leaveAReview} showBack />
      <p className="font-bold">{cls.title}</p>
      <p className="mb-6 text-sm text-[var(--fn-text-muted)]">{cls.instructor.displayName}</p>
      <p className="mb-2 text-sm font-medium">{GENERAL_LABELS.rating}</p>
      <div className="mb-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${n <= rating ? 'opacity-100 text-yellow-500' : 'opacity-30'}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="mb-4 w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4"
        rows={4}
        placeholder={GENERAL_LABELS.shareYourExperience}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error ? <p className="mb-2 text-sm text-[var(--fn-error)]">{error}</p> : null}
      <Button title={GENERAL_LABELS.submitReview} onClick={submit} loading={submitting} />
    </div>
  );
}
