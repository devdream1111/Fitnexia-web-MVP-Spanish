'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { InstructorPublicProfile } from '@/components/instructor/instructor-public-profile';
import { PageHeader } from '@/components/layout/page-header';
import { INSTRUCTOR_LABELS, GENERAL_LABELS } from '@/constants/labels';
import { useInstructors } from '@/contexts/instructors-context';
import { useReviews } from '@/contexts/reviews-context';
import { apiGetInstructor } from '@/services/api';
import type { Instructor } from '@/types/api';

type FetchState = 'idle' | 'loading' | 'done' | 'error';

export default function InstructorPublicPage() {
  const { id } = useParams<{ id: string }>();
  const { getCachedInstructor, cacheInstructor } = useInstructors();
  const {
    getReviewsForInstructor,
    fetchInstructorReviews,
    getStaffReviewsForInstructor,
    fetchStaffReviews,
    loading: reviewsLoading,
  } = useReviews();
  const [instructor, setInstructor] = useState<Instructor | null>(() =>
    id ? (getCachedInstructor(id) ?? null) : null,
  );
  const [fetchState, setFetchState] = useState<FetchState>(() => {
    if (!id) return 'idle';
    return getCachedInstructor(id) ? 'done' : 'loading';
  });

  // const [instructor, setInstructor] = useState<Instructor | null>(null);
  
  // const [fetchState, setFetchState] = useState<FetchState>('loading');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const cached = getCachedInstructor(id);
    if (cached) {
      setInstructor(cached);
      setFetchState('done');
    } else {
      setFetchState('loading');
    }

    apiGetInstructor(id)
      .then((data) => {
        if (!cancelled) {
          setInstructor(data);
          cacheInstructor(data);
          setFetchState('done');
        }
      })
      //  .catch(() => {
      //   setFetchState('error');
      // });
      .catch(() => {
        if (cancelled) return;
        if (getCachedInstructor(id) ?? cached) {
          setFetchState('done');
          return;
        }
        setFetchState('error');
      });

    fetchInstructorReviews(id);
    fetchStaffReviews(id);
    return () => {
      cancelled = true;
    };
  }, [id, cacheInstructor, fetchInstructorReviews, fetchStaffReviews, getCachedInstructor]);

  // useEffect(() => {
  //   if (!id) return;
  
  //   let cancelled = false;
  
  //   async function loadInstructor() {
  //     try {
  //       setFetchState('loading');
  
  //       const data = await apiGetInstructor(id);
  
  //       if (cancelled) return;
  
  //       setInstructor(data);
  //       cacheInstructor(data);
  //       setFetchState('done');
  
  //       fetchInstructorReviews(id);
  //       fetchStaffReviews(id);
  
  //     } catch (error) {
  //       if (cancelled) return;
  
  //       console.error('Failed to load instructor:', error);
  //       setFetchState('error');
  //     }
  //   }
  
  //   loadInstructor();
  
  //   return () => {
  //     cancelled = true;
  //   };
  
  // }, [
  //   id,
  //   cacheInstructor,
  //   fetchInstructorReviews,
  //   fetchStaffReviews
  // ]);

  const reviews = instructor ? getReviewsForInstructor(instructor.id) : [];
  const staffReviews = instructor ? getStaffReviewsForInstructor(instructor.id) : [];

  if (instructor) {
    return (
      <InstructorPublicProfile
        instructor={instructor}
        reviews={reviews}
        staffReviews={staffReviews}
        reviewsLoading={reviewsLoading}
      />
    );
  }

  if (fetchState === 'loading' || fetchState === 'idle') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 py-4">
      <PageHeader title={INSTRUCTOR_LABELS.publicProfile.instructor} showBack />
      <p className="text-[var(--fn-text-muted)]">{INSTRUCTOR_LABELS.publicProfile.notFound}</p>
    </div>
  );
}
