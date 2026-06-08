'use client';

import { ClassCard } from '@/components/class-card';
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
    <div>
      <div className="mb-8">
        <p className="text-sm text-[var(--fn-text-muted)]">{user?.institutionProfile?.name ?? 'Gym'}</p>
        <h1 className="text-3xl font-extrabold md:text-4xl">{GYM_LABELS.dashboard.controlPanel}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label={GYM_LABELS.dashboard.bookingsToday} value={String(stats.todayBookings)} />
        <Stat label={GYM_LABELS.dashboard.revenue} value={formatRevenueCompact(stats.weekRevenueCents)} />
        <Stat label={GYM_LABELS.dashboard.occupancy} value={formatAttendanceRate(stats.occupancyRate)} />
      </div>

      <h2 className="mt-10 mb-4 text-lg font-bold md:text-xl">{GYM_LABELS.dashboard.upcomingClasses}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gymClasses.map((c) => (
          <ClassCard key={c.id} item={c} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--fn-surface)] p-6 shadow-sm">
      <p className="text-sm text-[var(--fn-text-muted)]">{label}</p>
      <p className="text-3xl font-extrabold mt-2">{value}</p>
    </div>
  );
}
