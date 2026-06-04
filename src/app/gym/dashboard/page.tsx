'use client';

import { ClassCard } from '@/components/class-card';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { computeGymDashboardStats, resolveInstitutionId } from '@/utils/gym-classes';
import { formatAttendanceRate, formatRevenueCompact } from '@/utils/gym-metrics';

export default function GymDashboardPage() {
  const { user } = useAuth();
  const { classes } = useClasses();
  const institutionId = resolveInstitutionId(user);
  const stats = computeGymDashboardStats(institutionId, classes);
  const gymClasses = classes.filter((c) => c.institution?.id === institutionId).slice(0, 3);

  return (
    <div>
      <p className="text-sm text-[var(--fn-text-muted)]">{user?.institutionProfile?.name ?? 'Gym'}</p>
      <h1 className="text-3xl font-extrabold">Control panel</h1>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Bookings today" value={String(stats.todayBookings)} />
        <Stat label="Revenue" value={formatRevenueCompact(stats.weekRevenueCents)} />
        <Stat label="Occupancy" value={formatAttendanceRate(stats.occupancyRate)} />
      </div>
      <h2 className="mt-8 mb-3 text-lg font-bold">Upcoming classes</h2>
      {gymClasses.map((c) => (
        <ClassCard key={c.id} item={c} compact />
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--fn-surface)] p-3">
      <p className="text-xs text-[var(--fn-text-muted)]">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );
}
