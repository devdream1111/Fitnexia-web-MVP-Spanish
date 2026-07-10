'use client';

import { useRouter } from 'next/navigation';

import { InstructorProfileExperience } from '@/components/profile/instructor-profile-experience';
import type { Instructor, Review, StaffReview } from '@/types/api';

export function InstructorPublicProfile({
  instructor,
  reviews,
  staffReviews,
  reviewsLoading,
}: {
  instructor: Instructor;
  reviews: Review[];
  staffReviews: StaffReview[];
  reviewsLoading?: boolean;
}) {
  const router = useRouter();

  return (
    <InstructorProfileExperience
      variant="public"
      instructor={instructor}
      reviews={reviews}
      staffReviews={staffReviews}
      reviewsLoading={reviewsLoading}
      onBack={() => router.back()}
    />
  );
}
