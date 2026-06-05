'use client';

import Link from 'next/link';
import { Circle, CircleCheck } from 'lucide-react';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { getLinkedInstructorId } from '@/utils/instructor';
import { isSameCalendarDay } from '@/utils/schedule';

export default function InstructorDashboardPage() {
  const { user, updateProfile } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const profile = user?.instructorProfile;
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

      <button
        type="button"
        onClick={() =>
          updateProfile({ instructorProfile: { availableNow: !profile?.availableNow } })
        }
        className={`mt-6 w-full rounded-xl border p-5 text-left transition hover:opacity-90 ${
          profile?.availableNow ? 'border-[var(--fn-success)] bg-[var(--fn-success-muted)]' : 'border-[var(--fn-border)]'
        }`}>
        <span className="flex items-center gap-2 font-semibold text-lg">
          {profile?.availableNow ? (
            <CircleCheck size={20} className="text-[var(--fn-success)]" />
          ) : (
            <Circle size={20} className="text-[var(--fn-text-muted)]" />
          )}
          {profile?.availableNow ? 'Available now' : 'Not available'}
        </span>
      </button>
      
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
