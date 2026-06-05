'use client';

import { Calendar } from '@/components/calendar/Calendar';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { getLinkedInstructorId } from '@/utils/instructor';

export default function InstructorCalendarPage() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const mine = getClassesByInstructor(getLinkedInstructorId(user));

  return (
    <Calendar classes={mine} />
  );
}
