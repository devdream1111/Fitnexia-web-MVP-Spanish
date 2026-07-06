'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookOpen, CalendarCheck, DollarSign } from 'lucide-react';

import { MOCK_V2V3_LABELS } from '@/constants/labels';

import { ClassCard } from '@/components/class-card';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
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
import { apiGetPayoutSummary } from '@/services/api';
import { getLinkedInstructorId } from '@/utils/instructor';
import { isSameCalendarDay } from '@/utils/schedule';
import { formatMoneyFromCents } from '@/utils/format';
import { INSTRUCTOR_LABELS } from '@/constants/labels';
import { VerificationBanner } from '@/components/verification/verification-banner';
import { useFeature } from '@/hooks/use-feature';
import { resolveVerificationStatus } from '@/utils/verification';

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const showProfileVerification = useFeature('profileVerification');
  const showAnalytics = useFeature('analyticsMetrics');
  const { getClassesByInstructor, refreshMyClasses } = useClasses();
  const instructorId = getLinkedInstructorId(user);
  const allClasses = getClassesByInstructor(instructorId);
  const today = new Date();
  const todayClasses = allClasses.filter((c) => isSameCalendarDay(new Date(c.startAt), today));
  const [weekNet, setWeekNet] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);

  useEffect(() => {
    refreshMyClasses();
  }, [refreshMyClasses]);

  useEffect(() => {
    apiGetPayoutSummary('week')
      .then((s) => {
        setWeekNet(s.net);
        setCurrency(s.currency);
      })
      .catch(() => setWeekNet(null));
  }, []);

  const totalBooked = allClasses.reduce((sum, c) => {
    const cap = c.capacity ?? 0;
    const left = c.spotsLeft ?? cap;
    return sum + Math.max(0, cap - left);
  }, 0);

  return (
    <DashboardPage>
      {showProfileVerification ? (
        <VerificationBanner
          status={resolveVerificationStatus(user?.instructorProfile)}
          verifyHref="/instructor/profile/verification"
        />
      ) : null}

      <DashboardHero
        gradient={DASHBOARD_GRADIENTS.instructor}
        eyebrow={`${INSTRUCTOR_LABELS.dashboard.hi} ${user?.firstName}!`}
        title={INSTRUCTOR_LABELS.dashboard.todayOverview}
      >
        <div className="flex flex-wrap gap-2">
          {showAnalytics ? (
            <Link href="/instructor/analytics">
              <Button
                title={MOCK_V2V3_LABELS.analyticsTitle}
                variant="outline"
                className="shadow-lg shadow-black/10"
              />
            </Link>
          ) : null}
          <Link href="/instructor/create-class">
            <Button title={INSTRUCTOR_LABELS.dashboard.newClass} className="shadow-lg shadow-black/20" />
          </Link>
        </div>
      </DashboardHero>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatCard
          label={INSTRUCTOR_LABELS.dashboard.bookings}
          value={String(totalBooked)}
          icon={CalendarCheck}
          accent="primary"
        />
        <DashboardStatCard
          label={INSTRUCTOR_LABELS.dashboard.revenue}
          value={weekNet != null ? formatMoneyFromCents(weekNet, currency) : '—'}
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
