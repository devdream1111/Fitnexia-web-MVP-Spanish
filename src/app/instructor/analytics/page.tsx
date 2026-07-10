'use client';

import Link from 'next/link';

import { AnalyticsMetricsPanel } from '@/components/analytics/analytics-metrics-panel';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { INSTRUCTOR_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';

export default function InstructorAnalyticsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={MOCK_V2V3_LABELS.analyticsTitle}
        showBack
        backHref="/instructor/dashboard"
        action={
          <Link href="/instructor/dashboard">
            <Button title={INSTRUCTOR_LABELS.dashboard.todayOverview} variant="outline" size="sm" />
          </Link>
        }
      />
      <AnalyticsMetricsPanel scope="instructor" />
    </div>
  );
}
