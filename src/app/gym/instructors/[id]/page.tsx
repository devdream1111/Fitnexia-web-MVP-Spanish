'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { GymInstructorDetail } from '@/components/gym/gym-instructor-detail';
import { PublicProfileShell } from '@/components/layout/public-profile-shell';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useReviews } from '@/contexts/reviews-context';
import { GENERAL_LABELS, GYM_LABELS } from '@/constants/labels';
import { apiGetInstructor, apiGetStaffRoster } from '@/services/api';
import type { Instructor } from '@/types/api';
import { resolveInstitutionId } from '@/utils/gym-classes';

type FetchState = 'idle' | 'loading' | 'done' | 'error';

export default function GymInstructorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { classes } = useClasses();
  const {
    getReviewsForInstructor,
    fetchInstructorReviews,
    getStaffReviewsForInstructor,
    fetchStaffReviews,
    loading: reviewsLoading,
  } = useReviews();

  const institutionId = resolveInstitutionId(user);
  const gymName = user?.institutionProfile?.name ?? 'Tu gimnasio';

  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>('loading');
  const [rosterStatus, setRosterStatus] = useState<
    Awaited<ReturnType<typeof apiGetStaffRoster>>['data'][number] | null
  >(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setFetchState('loading');

    Promise.all([apiGetInstructor(id), apiGetStaffRoster()])
      .then(([instructorData, rosterRes]) => {
        if (cancelled) return;
        setInstructor(instructorData);
        setRosterStatus(rosterRes.data.find((r) => r.id === id) ?? null);
        setFetchState('done');
      })
      .catch(() => {
        if (!cancelled) setFetchState('error');
      });

    fetchInstructorReviews(id);
    fetchStaffReviews(id);

    return () => {
      cancelled = true;
    };
  }, [id, fetchInstructorReviews, fetchStaffReviews]);

  const instructorClasses = useMemo(() => {
    if (!id) return [];
    return classes
      .filter((c) => c.instructor?.id === id && c.institution?.id === institutionId)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [classes, id, institutionId]);

  const reviews = instructor ? getReviewsForInstructor(instructor.id) : [];
  const staffReviews = instructor ? getStaffReviewsForInstructor(instructor.id) : [];

  if (fetchState === 'loading' || fetchState === 'idle') {
    return (
      <PublicProfileShell backHref="/gym/instructors">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
        </div>
      </PublicProfileShell>
    );
  }

  if (!instructor || fetchState === 'error') {
    return (
      <PublicProfileShell backHref="/gym/instructors">
        <div className="mx-auto max-w-lg py-20 text-center">
          <p className="text-lg font-bold text-[var(--fn-text)]">{GYM_LABELS.instructors.detail.notFound}</p>
        </div>
      </PublicProfileShell>
    );
  }

  return (
    <GymInstructorDetail
      instructor={instructor}
      roster={rosterStatus}
      gymName={gymName}
      reviews={reviews}
      staffReviews={staffReviews}
      classes={instructorClasses}
      reviewsLoading={reviewsLoading}
    />
  );
}
