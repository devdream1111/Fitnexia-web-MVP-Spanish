'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { InstructorPublicProfile } from '@/components/instructor/instructor-public-profile';
import { PageHeader } from '@/components/layout/page-header';
import { INSTRUCTOR_LABELS, GENERAL_LABELS } from '@/constants/labels';
import { useReviews } from '@/contexts/reviews-context';
import { apiGetInstructor } from '@/services/api';
import type { Instructor } from '@/types/api';

export default function InstructorPublicPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getReviewsForInstructor,
    fetchInstructorReviews,
    getStaffReviewsForInstructor,
    fetchStaffReviews,
    loading: reviewsLoading,
  } = useReviews();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    apiGetInstructor(id)
      .then((data) => {
        if (!cancelled) setInstructor(data);
      })
      .catch(() => {
        if (!cancelled) setInstructor(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    fetchInstructorReviews(id);
    fetchStaffReviews(id);
    return () => {
      cancelled = true;
    };
  }, [id, fetchInstructorReviews, fetchStaffReviews]);

  const reviews = instructor ? getReviewsForInstructor(instructor.id) : [];
  const staffReviews = instructor ? getStaffReviewsForInstructor(instructor.id) : [];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 py-4">
        <PageHeader title={INSTRUCTOR_LABELS.publicProfile.instructor} showBack />
        <p className="text-[var(--fn-text-muted)]">{INSTRUCTOR_LABELS.publicProfile.notFound}</p>
      </div>
    );
  }

  return (
    <InstructorPublicProfile
      instructor={instructor}
      reviews={reviews}
      staffReviews={staffReviews}
      reviewsLoading={reviewsLoading}
    />
  );
}
