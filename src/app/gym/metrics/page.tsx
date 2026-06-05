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
      
      <div className="mt-8 grid gap-6">
        <div className="rounded-2xl bg-[var(--fn-surface)] p-6">
          <p className="text-lg font-bold mb-4">Daily Bookings</p>
          <LineChart data={metrics.daily} dataKey="bookings" />
        </div>

        <div className="rounded-2xl bg-[var(--fn-surface)] p-6">
          <p className="text-lg font-bold mb-4">Daily Revenue</p>
          <BarChart data={metrics.daily} dataKey="revenueCents" />
        </div>

        <div className="rounded-2xl bg-[var(--fn-surface)] p-6">
          <p className="text-lg font-bold mb-4">Attendance Overview</p>
          <PieChart attendanceRate={metrics.attendanceRate} />
        </div>
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

function LineChart({ data, dataKey }: { data: any[], dataKey: string }) {
  const max = Math.max(...data.map(d => d[dataKey]));
  const width = 600;
  const height = 200;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;
  
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = height - padding - ((d[dataKey] / max) * chartHeight);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path
        d={`M ${points}`}
        fill="none"
        stroke="var(--fn-primary)"
        strokeWidth="3"
      />
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((d[dataKey] / max) * chartHeight);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="5"
            fill="var(--fn-primary)"
          />
        );
      })}
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        return (
          <text
            key={i}
            x={x}
            y={height - 10}
            textAnchor="middle"
            className="text-xs fill-[var(--fn-text-muted)]"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function BarChart({ data, dataKey }: { data: any[], dataKey: string }) {
  const max = Math.max(...data.map(d => d[dataKey]));
  const width = 600;
  const height = 200;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;
  const barWidth = chartWidth / data.length * 0.7;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {data.map((d, i) => {
        const x = padding + (i / data.length) * chartWidth + 10;
        const barHeight = (d[dataKey] / max) * chartHeight;
        const y = height - padding - barHeight;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill="var(--fn-primary)"
            opacity="0.8"
          />
        );
      })}
      {data.map((d, i) => {
        const x = padding + (i / data.length) * chartWidth + barWidth / 2 + 10;
        return (
          <text
            key={i}
            x={x}
            y={height - 10}
            textAnchor="middle"
            className="text-xs fill-[var(--fn-text-muted)]"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function PieChart({ attendanceRate }: { attendanceRate: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (attendanceRate / 100) * circumference;
  
  return (
    <div className="flex items-center justify-center">
      <svg width="200" height="200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--fn-border)"
          strokeWidth="20"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--fn-primary)"
          strokeWidth="20"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
        />
        <text
          x="100"
          y="105"
          textAnchor="middle"
          className="text-2xl font-extrabold fill-[var(--fn-text)]"
        >
          {attendanceRate}%
        </text>
      </svg>
    </div>
  );
}
