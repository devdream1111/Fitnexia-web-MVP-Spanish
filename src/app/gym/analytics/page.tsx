'use client';

import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { AnalyticsMetricsPanel } from '@/components/mock-v2v3/analytics-metrics-panel';
import { Button } from '@/components/ui/button';
import { GYM_LABELS, MOCK_V2V3_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function GymAnalyticsPage() {
  const enabled = useFeature('analyticsMetrics');

  if (!enabled) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title={SCREEN_TITLES.analytics} showBack backHref="/gym/dashboard" />
        <p className="text-[var(--fn-text-muted)]">{GYM_LABELS.dashboard.controlPanel}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={MOCK_V2V3_LABELS.analyticsTitle}
        showBack
        backHref="/gym/dashboard"
        action={
          <Link href="/gym/dashboard">
            <Button title="Panel" variant="outline" size="sm" />
          </Link>
        }
      />
      <AnalyticsMetricsPanel />
    </div>
  );
}
