'use client';

import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { getGymMetrics, formatAttendanceRate, formatGymChange, formatRevenueCompact } from '@/utils/gym-metrics';
import { getLinkedInstitutionId } from '@/utils/institution';

export default function GymMetricsPage() {
  const { user } = useAuth();
  const { classes } = useClasses();
  const metrics = getGymMetrics(getLinkedInstitutionId(user), classes);

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Metrics</h1>
      <p className="text-[var(--fn-text-muted)]">This week</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Bookings" value={String(metrics.bookings)} change={formatGymChange(metrics.bookingsChangePct)} />
        <MetricCard label="Revenue" value={formatRevenueCompact(metrics.revenueCents)} change={formatGymChange(metrics.revenueChangePct)} />
        <MetricCard label="Attendance" value={formatAttendanceRate(metrics.attendanceRate)} change={formatGymChange(metrics.attendanceChangePct)} />
      </div>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--fn-text-muted)]">
              <th className="p-2">Day</th>
              <th className="p-2">Bookings</th>
              <th className="p-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {metrics.daily.map((d) => (
              <tr key={d.label} className="border-t border-[var(--fn-border)]">
                <td className="p-2">{d.label}</td>
                <td className="p-2">{d.bookings}</td>
                <td className="p-2">{formatRevenueCompact(d.revenueCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="rounded-2xl bg-[var(--fn-surface)] p-4">
      <p className="text-sm text-[var(--fn-text-muted)]">{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-[var(--fn-success)]">{change}</p>
    </div>
  );
}
