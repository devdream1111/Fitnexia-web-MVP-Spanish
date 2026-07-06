import type { MockAnalyticsSnapshot } from '@/services/mock/seed';

import { readMockJson } from '@/services/mock/storage';

export interface MockAdvancedReports extends MockAnalyticsSnapshot {
  memberSegments: { label: string; count: number; pct: number }[];
  retentionRate: number;
  revenueProjectionCents: number;
  inactiveMembers: number;
  growthPct: number;
}

function seedBasic(): MockAnalyticsSnapshot & { inactiveMembers: number; growthPct: number } {
  return {
    bookings: 84,
    revenueCents: 6_240_000,
    attendanceRate: 0.76,
    bookingsChangePct: 0.08,
    revenueChangePct: 0.12,
    attendanceChangePct: 0.02,
    inactiveMembers: 24,
    growthPct: 0.05,
    daily: [
      { label: 'Lun', bookings: 10, revenueCents: 80000, attendancePct: 0.7 },
      { label: 'Mar', bookings: 12, revenueCents: 95000, attendancePct: 0.78 },
      { label: 'Mié', bookings: 8, revenueCents: 62000, attendancePct: 0.72 },
      { label: 'Jue', bookings: 14, revenueCents: 110000, attendancePct: 0.82 },
      { label: 'Vie', bookings: 16, revenueCents: 125000, attendancePct: 0.8 },
      { label: 'Sáb', bookings: 14, revenueCents: 98000, attendancePct: 0.75 },
      { label: 'Dom', bookings: 10, revenueCents: 72000, attendancePct: 0.68 },
    ],
    topClasses: [
      { title: 'Spinning', attendancePct: 0.9, bookings: 18 },
      { title: 'CrossFit', attendancePct: 0.85, bookings: 15 },
    ],
  };
}

function seedAdvanced(): MockAdvancedReports {
  const base = seedBasic();
  return {
    ...base,
    memberSegments: [
      { label: 'Activos semanales', count: 98, pct: 0.61 },
      { label: 'Ocasionales', count: 40, pct: 0.25 },
      { label: 'Inactivos 30d+', count: 24, pct: 0.14 },
    ],
    retentionRate: 0.82,
    revenueProjectionCents: 13_800_000,
  };
}

export const mockGymReportsService = {
  getBasic(): MockAnalyticsSnapshot & { inactiveMembers: number; growthPct: number } {
    return readMockJson('gym_reports_basic', seedBasic);
  },
  getAdvanced(): MockAdvancedReports {
    return readMockJson('gym_reports_advanced', seedAdvanced);
  },
};
