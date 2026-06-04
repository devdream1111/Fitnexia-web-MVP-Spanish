'use client';

import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { PROFILE_MENU_LABELS } from '@/constants/labels';

export default function GymProfileInstructorsPage() {
  return (
    <div>
      <PageHeader title={PROFILE_MENU_LABELS.instructors} showBack />
      <Link href="/gym/instructors" className="font-semibold text-[var(--fn-primary)]">
        Manage staff →
      </Link>
    </div>
  );
}
