'use client';

import Link from 'next/link';
import { BookOpen, CalendarCheck, DollarSign } from 'lucide-react';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import {
  DashboardClassGrid,
  DashboardHero,
  DashboardPage,
  DashboardSection,
  DashboardStatCard,
  DASHBOARD_GRADIENTS,
} from '@/components/dashboard/dashboard-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { getLinkedInstructorId } from '@/utils/instructor';
import { isSameCalendarDay } from '@/utils/schedule';
import { INSTRUCTOR_LABELS } from '@/constants/labels';

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const instructorId = getLinkedInstructorId(user);
  const allClasses = getClassesByInstructor(instructorId);
  const today = new Date();
  const todayClasses = allClasses.filter((c) => isSameCalendarDay(new Date(c.startAt), today));

  return (
    <DashboardPage>
      <DashboardHero
        gradient={DASHBOARD_GRADIENTS.instructor}
        eyebrow={`${INSTRUCTOR_LABELS.dashboard.hi} ${user?.firstName}!`}
        title={INSTRUCTOR_LABELS.dashboard.todayOverview}
      >
        <Link href="/instructor/create-class">
          <Button title={INSTRUCTOR_LABELS.dashboard.newClass} className="shadow-lg shadow-black/20" />
        </Link>
      </DashboardHero>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatCard
          label={INSTRUCTOR_LABELS.dashboard.bookings}
          value="3"
          icon={CalendarCheck}
          accent="primary"
        />
        <DashboardStatCard
          label={INSTRUCTOR_LABELS.dashboard.revenue}
          value="$127"
          icon={DollarSign}
          accent="emerald"
        />
        <DashboardStatCard
          label={INSTRUCTOR_LABELS.dashboard.classes}
          value={String(todayClasses.length)}
          icon={BookOpen}
          accent="violet"
        />
      </div>

      <DashboardSection title={INSTRUCTOR_LABELS.dashboard.todayClasses}>
        <DashboardClassGrid>
          {todayClasses.map((c) => (
            <ClassCard key={c.id} item={c} />
          ))}
        </DashboardClassGrid>
      </DashboardSection>
    </DashboardPage>
  );
}
