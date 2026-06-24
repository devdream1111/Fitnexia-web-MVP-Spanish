'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  apiCreateReview,
  apiCreateStaffReview,
  apiGetInstructorReviews,
  apiGetStaffReviews,
  type ApiReview,
  type StaffReviewRecord,
} from '@/services/api';
import type { Review, StaffReview } from '@/types/api';

interface ReviewsContextValue {
  reviewsByInstructor: Record<string, ApiReview[]>;
  staffReviewsByInstructor: Record<string, StaffReview[]>;
  loading: boolean;
  fetchInstructorReviews: (instructorId: string) => Promise<ApiReview[]>;
  fetchStaffReviews: (instructorId: string) => Promise<StaffReview[]>;
  getReviewsForClass: (classId: string, instructorId: string) => Review[];
  getReviewsForInstructor: (instructorId: string) => Review[];
  addReview: (body: { bookingId: string; rating: number; comment?: string }) => Promise<void>;
  getStaffReviewsForInstructor: (instructorId: string) => StaffReview[];
  addStaffReview: (body: {
    instructorId: string;
    institutionId: string;
    institutionName: string;
    rating: number;
    comment?: string;
  }) => Promise<void>;
  removeReview: (id: string) => void;
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

function mapApiReview(r: ApiReview, instructorId: string): Review {
  return {
    id: r.id,
    classId: '',
    instructorId,
    userId: '',
    rating: r.rating,
    comment: r.comment,
    authorName: r.authorName,
    createdAt: r.createdAt,
    verified: true,
  };
}

function mapStaffReview(r: StaffReviewRecord): StaffReview {
  return {
    id: r.id,
    instructorId: r.instructorId,
    institutionId: r.institutionId,
    institutionName: r.institutionName,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    verified: true,
  };
}

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviewsByInstructor, setReviewsByInstructor] = useState<Record<string, ApiReview[]>>({});
  const [staffReviewsByInstructor, setStaffReviewsByInstructor] = useState<
    Record<string, StaffReview[]>
  >({});
  const [loading, setLoading] = useState(false);

  const fetchInstructorReviews = useCallback(async (instructorId: string) => {
    setLoading(true);
    try {
      const { data } = await apiGetInstructorReviews(instructorId);
      setReviewsByInstructor((prev) => ({ ...prev, [instructorId]: data }));
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStaffReviews = useCallback(async (instructorId: string) => {
    setLoading(true);
    try {
      const { data } = await apiGetStaffReviews(instructorId);
      const mapped = data.map(mapStaffReview);
      setStaffReviewsByInstructor((prev) => ({ ...prev, [instructorId]: mapped }));
      return mapped;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReviewsForInstructor = useCallback(
    (instructorId: string) =>
      (reviewsByInstructor[instructorId] ?? []).map((r) => mapApiReview(r, instructorId)),
    [reviewsByInstructor],
  );

  const getReviewsForClass = useCallback(
    (_classId: string, instructorId: string) => getReviewsForInstructor(instructorId),
    [getReviewsForInstructor],
  );

  const getStaffReviewsForInstructor = useCallback(
    (instructorId: string) => staffReviewsByInstructor[instructorId] ?? [],
    [staffReviewsByInstructor],
  );

  const addReview = useCallback(
    async (body: { bookingId: string; rating: number; comment?: string }) => {
      await apiCreateReview(body);
    },
    [],
  );

  const addStaffReview = useCallback(
    async (body: {
      instructorId: string;
      institutionId: string;
      institutionName: string;
      rating: number;
      comment?: string;
    }) => {
      const created = await apiCreateStaffReview({
        instructorId: body.instructorId,
        rating: body.rating,
        comment: body.comment,
      });
      const mapped = mapStaffReview(created);
      setStaffReviewsByInstructor((prev) => ({
        ...prev,
        [body.instructorId]: [...(prev[body.instructorId] ?? []), mapped],
      }));
    },
    [],
  );

  const removeReview = useCallback((_id: string) => {
    // Admin-only moderation — no backend endpoint for athletes yet
  }, []);

  const value = useMemo(
    () => ({
      reviewsByInstructor,
      staffReviewsByInstructor,
      loading,
      fetchInstructorReviews,
      fetchStaffReviews,
      getReviewsForClass,
      getReviewsForInstructor,
      addReview,
      getStaffReviewsForInstructor,
      addStaffReview,
      removeReview,
    }),
    [
      reviewsByInstructor,
      staffReviewsByInstructor,
      loading,
      fetchInstructorReviews,
      fetchStaffReviews,
      getReviewsForClass,
      getReviewsForInstructor,
      addReview,
      getStaffReviewsForInstructor,
      addStaffReview,
      removeReview,
    ],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}
