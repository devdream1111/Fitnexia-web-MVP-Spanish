'use client';

import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { AnalyticsMetricsPanel } from '@/components/mock-v2v3/analytics-metrics-panel';
import { Button } from '@/components/ui/button';
import { INSTRUCTOR_LABELS, MOCK_V2V3_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function InstructorAnalyticsPage() {
  const enabled = useFeature('analyticsMetrics');

  if (!enabled) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title={SCREEN_TITLES.analytics} showBack backHref="/instructor/dashboard" />
      </div>
    );
  }

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
      <AnalyticsMetricsPanel />
    </div>
  );
}
