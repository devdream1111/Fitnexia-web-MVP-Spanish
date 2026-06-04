'use client';

import { PageHeader } from '@/components/layout/page-header';
import { SCREEN_TITLES } from '@/constants/labels';

export default function SupportPage() {
  return (
    <div>
      <PageHeader title={SCREEN_TITLES.helpSupport} showBack />
      <p className="text-[var(--fn-text-muted)]">Support tickets — coming in a future release.</p>
    </div>
  );
}
