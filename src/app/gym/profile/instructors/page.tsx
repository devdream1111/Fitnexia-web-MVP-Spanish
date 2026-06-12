'use client';

import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PROFILE_MENU_LABELS, GYM_LABELS } from '@/constants/labels';

export default function GymProfileInstructorsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <PageHeader title={PROFILE_MENU_LABELS.instructors} showBack />
      <p className="text-sm text-[var(--fn-text-muted)]">{GYM_LABELS.instructors.rosterSubtitle}</p>
      <Link href="/gym/instructors">
        <Button title={GYM_LABELS.instructors.rosterTitle} className="w-full" />
      </Link>
    </div>
  );
}
