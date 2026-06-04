'use client';

import Link from 'next/link';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { getLinkedInstructorId } from '@/utils/instructor';

export default function InstructorClassesPage() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const mine = getClassesByInstructor(getLinkedInstructorId(user));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">My classes</h1>
        <Link href="/create-class">
          <Button title="New class" size="sm" />
        </Link>
      </div>
      {mine.length === 0 ? (
        <p className="text-[var(--fn-text-muted)]">No classes yet. Create your first class.</p>
      ) : (
        mine.map((c) => (
          <div key={c.id} className="mb-2">
            <ClassCard item={c} />
            <Link href={`/edit-class/${c.id}`} className="mt-2 inline-block">
              <Button title="Edit" size="sm" variant="outline" />
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
