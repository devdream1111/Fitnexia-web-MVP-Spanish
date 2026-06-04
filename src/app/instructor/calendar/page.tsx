'use client';

import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { formatClassDate } from '@/data/mock';
import { getLinkedInstructorId } from '@/utils/instructor';

export default function InstructorCalendarPage() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const mine = getClassesByInstructor(getLinkedInstructorId(user));

  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold">Calendar</h1>
      {mine.map((c) => (
        <div key={c.id} className="mb-3 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
          <p className="font-bold">{c.title}</p>
          <p className="text-sm text-[var(--fn-text-muted)]">{formatClassDate(c.startAt)}</p>
        </div>
      ))}
    </div>
  );
}
