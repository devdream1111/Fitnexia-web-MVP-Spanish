'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { getBookingById } from '@/data/mock';
import { useClasses } from '@/contexts/classes-context';
import { useReviews } from '@/contexts/reviews-context';
import { useAuth } from '@/contexts/auth-context';
import { GENERAL_LABELS } from '@/constants/labels';

export default function ReviewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { getClassById } = useClasses();
  const { addReview } = useReviews();
  const { user } = useAuth();
  const booking = getBookingById(bookingId ?? '');
  const cls = booking ? getClassById(booking.classId) : undefined;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    if (!booking || !cls || !user) return;
    
    setSubmitting(true);
    addReview({
      classId: cls.id,
      instructorId: cls.instructor.id,
      userId: user.id,
      authorName: `${user.firstName} ${user.lastName}`,
      rating,
      comment: comment || undefined,
      response: null,
    });
    
    setTimeout(() => {
      setSubmitting(false);
      alert(GENERAL_LABELS.reviewSubmittedAlert);
      router.push('/athlete/bookings');
    }, 500);
  };

  if (!booking || !cls) {
    return (
      <div className="fn-layout-narrow px-6 py-12">
        <PageHeader title={GENERAL_LABELS.review} showBack />
        <p>{GENERAL_LABELS.bookingNotFound}</p>
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
            className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${n <= rating ? 'opacity-100 text-yellow-500' : 'opacity-30'}`}>
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
      <Button title={GENERAL_LABELS.submitReview} onClick={submit} loading={submitting} />
    </div>
  );
}
