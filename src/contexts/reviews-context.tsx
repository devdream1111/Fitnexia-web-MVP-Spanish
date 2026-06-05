'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { Review, StaffReview } from '@/types/api';
import { 
  addReview as addReviewMock,
  MOCK_REVIEWS 
} from '@/data/mock';

const INITIAL_STAFF_REVIEWS: StaffReview[] = [
  {
    id: 'sr-1',
    instructorId: 'inst-2',
    institutionId: 'gym-1',
    institutionName: 'FitHub Downtown',
    rating: 5,
    comment: 'Excellent group sessions. Always prepared and professional.',
    createdAt: '2026-05-15T10:00:00Z',
    verified: true,
  },
];

interface ReviewsContextValue {
  reviews: Review[];
  staffReviews: StaffReview[];
  getReviewsForClass: (classId: string) => Review[];
  getReviewsForInstructor: (instructorId: string) => Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'verified'>) => Review;
  getStaffReviewsForInstructor: (instructorId: string) => StaffReview[];
  getGymReviewForInstructor: (institutionId: string, instructorId: string) => StaffReview | undefined;
  canGymReviewInstructor: (
    institutionId: string,
    instructorId: string,
    linkedInstructorIds: string[],
  ) => boolean;
  addStaffReview: (review: Omit<StaffReview, 'id' | 'verified' | 'createdAt'>) => StaffReview;
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [staffReviews, setStaffReviews] = useState<StaffReview[]>(INITIAL_STAFF_REVIEWS);

  const getReviewsForClass = useCallback(
    (classId: string) => reviews.filter((r) => r.classId === classId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviews],
  );

  const getReviewsForInstructor = useCallback(
    (instructorId: string) => reviews.filter((r) => r.instructorId === instructorId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviews],
  );

  const addReview = useCallback(
    (input: Omit<Review, 'id' | 'createdAt' | 'verified'>) => {
      const created = addReviewMock(input);
      setReviews([...reviews, created]);
      return created;
    },
    [reviews],
  );

  const getStaffReviewsForInstructor = useCallback(
    (instructorId: string) =>
      staffReviews.filter((r) => r.instructorId === instructorId).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [staffReviews],
  );

  const getGymReviewForInstructor = useCallback(
    (institutionId: string, instructorId: string) =>
      staffReviews.find(
        (r) => r.institutionId === institutionId && r.instructorId === instructorId,
      ),
    [staffReviews],
  );

  const canGymReviewInstructor = useCallback(
    (institutionId: string, instructorId: string, linkedInstructorIds: string[]) => {
      if (!linkedInstructorIds.includes(instructorId)) return false;
      return !staffReviews.some(
        (r) => r.institutionId === institutionId && r.instructorId === instructorId,
      );
    },
    [staffReviews],
  );

  const addStaffReview = useCallback(
    (input: Omit<StaffReview, 'id' | 'verified' | 'createdAt'>) => {
      const created: StaffReview = {
        ...input,
        id: `sr-${Date.now()}`,
        verified: true,
        createdAt: new Date().toISOString(),
      };
      setStaffReviews((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  const value = useMemo(
    () => ({
      reviews,
      staffReviews,
      getReviewsForClass,
      getReviewsForInstructor,
      addReview,
      getStaffReviewsForInstructor,
      getGymReviewForInstructor,
      canGymReviewInstructor,
      addStaffReview,
    }),
    [
      reviews,
      staffReviews,
      getReviewsForClass,
      getReviewsForInstructor,
      addReview,
      getStaffReviewsForInstructor,
      getGymReviewForInstructor,
      canGymReviewInstructor,
      addStaffReview,
    ],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}
