'use client';

import Link from 'next/link';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { getLinkedInstructorId } from '@/utils/instructor';
import { isSameCalendarDay } from '@/utils/schedule';

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const instructorId = getLinkedInstructorId(user);
  const allClasses = getClassesByInstructor(instructorId);
  const today = new Date();
  const todayClasses = allClasses.filter((c) => isSameCalendarDay(new Date(c.startAt), today));

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--fn-text-muted)]">Hi, {user?.firstName}!</p>
          <h1 className="text-3xl font-extrabold md:text-4xl">Today&apos;s overview</h1>
        </div>
        <Link href="/create-class">
          <Button title="New class" />
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Bookings" value="3" />
        <Stat label="Revenue" value="$127" />
        <Stat label="Classes" value={String(todayClasses.length)} />
      </div>
      
      <h2 className="mt-10 mb-4 text-lg font-bold md:text-xl">Today&apos;s classes</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {todayClasses.map((c) => (
          <ClassCard key={c.id} item={c} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--fn-surface)] p-6 text-center shadow-sm">
      <p className="text-sm text-[var(--fn-text-muted)]">{label}</p>
      <p className="text-3xl font-extrabold mt-2">{value}</p>
    </div>
  );
}
