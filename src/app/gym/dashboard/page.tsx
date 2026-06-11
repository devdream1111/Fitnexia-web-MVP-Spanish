'use client';

import { CalendarCheck, DollarSign, Users } from 'lucide-react';

import { ClassCard } from '@/components/class-card';
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
import { computeGymDashboardStats, resolveInstitutionId } from '@/utils/gym-classes';
import { formatAttendanceRate, formatRevenueCompact } from '@/utils/gym-metrics';
import { GYM_LABELS } from '@/constants/labels';

export default function GymDashboardPage() {
  const { user } = useAuth();
  const { classes } = useClasses();
  const institutionId = resolveInstitutionId(user);
  const stats = computeGymDashboardStats(institutionId, classes);
  const gymClasses = classes.filter((c) => c.institution?.id === institutionId).slice(0, 4);

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
