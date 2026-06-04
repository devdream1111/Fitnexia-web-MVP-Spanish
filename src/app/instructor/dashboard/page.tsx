'use client';

import Link from 'next/link';

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
      <p className="text-sm text-[var(--fn-text-muted)]">Hi, {user?.firstName} 👋</p>
      <h1 className="text-3xl font-extrabold">Today&apos;s overview</h1>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Bookings" value="3" />
        <Stat label="Revenue" value="$127" />
        <Stat label="Classes" value={String(todayClasses.length)} />
      </div>
      <button
        type="button"
        onClick={() =>
          updateProfile({ instructorProfile: { availableNow: !profile?.availableNow } })
        }
        className={`mt-6 w-full rounded-xl border p-4 text-left ${
          profile?.availableNow ? 'border-[var(--fn-success)] bg-[var(--fn-success-muted)]' : 'border-[var(--fn-border)]'
        }`}>
        <span className="font-semibold">
          {profile?.availableNow ? '● Available now' : '○ Not available'}
        </span>
      </button>
      <div className="mt-8 flex justify-between">
        <h2 className="text-lg font-bold">Today&apos;s classes</h2>
        <Link href="/create-class">
          <Button title="New class" size="sm" />
        </Link>
      </div>
      {todayClasses.map((c) => (
        <ClassCard key={c.id} item={c} compact />
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--fn-surface)] p-3 text-center">
      <p className="text-xs text-[var(--fn-text-muted)]">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );
}
