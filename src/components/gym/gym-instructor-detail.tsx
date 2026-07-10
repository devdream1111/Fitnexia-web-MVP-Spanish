'use client';

import { InstructorProfileExperience } from '@/components/profile/instructor-profile-experience';
import type { ClassListItem, Instructor, Review, StaffReview } from '@/types/api';
import type { StaffRosterItem } from '@/services/api';

export function GymInstructorDetail({
  instructor,
  roster,
  gymName,
  reviews,
  staffReviews,
  classes,
  reviewsLoading,
}: {
  instructor: Instructor;
  roster: StaffRosterItem | null;
  gymName: string;
  reviews: Review[];
  staffReviews: StaffReview[];
  classes: ClassListItem[];
  reviewsLoading?: boolean;
}) {
  const gymStaffReview = staffReviews.find((r) => r.institutionName === gymName) ?? null;

  return (
    <InstructorProfileExperience
      variant="gym"
      instructor={instructor}
      reviews={reviews}
      staffReviews={staffReviews}
      reviewsLoading={reviewsLoading}
      gymName={gymName}
      roster={roster}
      classes={classes}
      gymStaffReview={gymStaffReview}
      backHref="/gym/instructors"
    />
  );
}
