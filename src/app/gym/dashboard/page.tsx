'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarCheck, DollarSign, Users } from 'lucide-react';

import { ClassCard } from '@/components/class-card';
import {
  DashboardClassGrid,
  DashboardHero,
  DashboardPage,
  DashboardSection,
  DashboardStatCard,
  DASHBOARD_GRADIENTS,
} from '@/components/dashboard/dashboard-ui';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { apiGetClubMembersSummary } from '@/services/api';
import { useFeature } from '@/hooks/use-feature';
import { computeGymDashboardStats, resolveInstitutionId } from '@/utils/gym-classes';
import { formatAttendanceRate, formatRevenueCompact } from '@/utils/gym-metrics';
import { CLUB_LABELS, GYM_LABELS } from '@/constants/labels';
import { normalizeClubMembersSummary } from '@/utils/club-members';

export default function GymDashboardPage() {
  const { user } = useAuth();
  const { classes } = useClasses();
  const showDelinquency = useFeature('clubDelinquencyAlerts') && useFeature('clubMembers');
  const institutionId = resolveInstitutionId(user);
  const stats = computeGymDashboardStats(institutionId, classes);
  const gymClasses = classes.filter((c) => c.institution?.id === institutionId).slice(0, 4);
  const [memberSummary, setMemberSummary] = useState<ReturnType<typeof normalizeClubMembersSummary> | null>(null);

  useEffect(() => {
    if (!showDelinquency) return;
    apiGetClubMembersSummary()
      .then((res) => setMemberSummary(normalizeClubMembersSummary(res)))
      .catch(() => setMemberSummary(null));
  }, [showDelinquency]);

  return (
    <DashboardPage>
      <DashboardHero
        gradient={DASHBOARD_GRADIENTS.gym}
        eyebrow={user?.institutionProfile?.name ?? 'Gym'}
        title={GYM_LABELS.dashboard.controlPanel}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatCard
          label={GYM_LABELS.dashboard.bookingsToday}
          value={String(stats.todayBookings)}
          icon={CalendarCheck}
          accent="primary"
        />
        <DashboardStatCard
          label={GYM_LABELS.dashboard.revenue}
          value={formatRevenueCompact(stats.weekRevenueCents)}
          icon={DollarSign}
          accent="emerald"
        />
        <DashboardStatCard
          label={GYM_LABELS.dashboard.occupancy}
          value={formatAttendanceRate(stats.occupancyRate)}
          icon={Users}
          accent="violet"
        />
      </div>

      {showDelinquency && memberSummary && memberSummary.overdue > 0 ? (
        <section className="rounded-2xl border border-red-200 bg-red-50/80 p-5 dark:border-red-900/50 dark:bg-red-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h2 className="font-bold text-red-900 dark:text-red-100">
                  {CLUB_LABELS.members.summary.overdue}
                </h2>
                <p className="text-sm text-red-800/90 dark:text-red-200/90">
                  {memberSummary.overdue} socio{memberSummary.overdue === 1 ? '' : 's'} con cuota
                  vencida · {memberSummary.pending} pendiente
                  {memberSummary.pending === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <Link href="/gym/members?feeStatus=overdue">
              <Button title="Ver morosos" variant="outline" />
            </Link>
          </div>
        </section>
      ) : null}

      <DashboardSection title={GYM_LABELS.dashboard.upcomingClasses}>
        <DashboardClassGrid>
          {gymClasses.map((c) => (
            <ClassCard key={c.id} item={c} />
          ))}
        </DashboardClassGrid>
      </DashboardSection>
    </DashboardPage>
  );
}
