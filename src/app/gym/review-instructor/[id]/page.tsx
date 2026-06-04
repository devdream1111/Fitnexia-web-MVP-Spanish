'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useAuth } from '@/contexts/auth-context';
import { useReviews } from '@/contexts/reviews-context';
import { MOCK_INSTRUCTORS } from '@/data/mock';
import { getLinkedInstitutionId } from '@/utils/institution';

export default function ReviewInstructorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addStaffReview, canGymReviewInstructor } = useReviews();
  const instructor = MOCK_INSTRUCTORS.find((i) => i.id === id);
  const institutionId = getLinkedInstitutionId(user);
  const linkedIds = user?.institutionProfile?.instructorIds ?? [];
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const canReview = canGymReviewInstructor(institutionId, id ?? '', linkedIds);

  const submit = () => {
    addStaffReview({
      instructorId: id ?? '',
      institutionId,
      institutionName: user?.institutionProfile?.name ?? 'Gym',
      rating,
      comment,
    });
    alert('Staff review submitted (mock)');
    router.back();
  };

  if (!instructor) {
    return (
      <div>
        <PageHeader title="Review instructor" showBack />
        <p>Not found.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Review ${instructor.displayName}`} showBack />
      {!canReview ? (
        <p className="text-[var(--fn-text-muted)]">You already reviewed this instructor.</p>
      ) : (
        <>
          <div className="mb-4 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className="text-2xl">
                {n <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
          <textarea
            className="mb-4 w-full rounded-xl border border-[var(--fn-border)] p-4"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button title="Submit review" onClick={submit} />
        </>
      )}
    </div>
  );
}
