'use client';

import Link from 'next/link';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { getLinkedInstructorId } from '@/utils/instructor';
import { INSTRUCTOR_LABELS } from '@/constants/labels';

export default function InstructorClassesPage() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const mine = getClassesByInstructor(getLinkedInstructorId(user));

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">{INSTRUCTOR_LABELS.classes.yourClasses}</h1>
        <Link href="/instructor/create-class">
          <Button title={INSTRUCTOR_LABELS.dashboard.newClass} size="sm" />
        </Link>
      </div>
      {mine.length === 0 ? (
        <p className="text-[var(--fn-text-muted)]">{INSTRUCTOR_LABELS.classes.noClassesYet} Crea tu primera clase.</p>
      ) : (
        mine.map((c) => (
          <ClassCard key={c.id} item={c} showEdit editHref={`/instructor/edit-class/${c.id}`} />
        ))
      )}
    </div>
  );
}
