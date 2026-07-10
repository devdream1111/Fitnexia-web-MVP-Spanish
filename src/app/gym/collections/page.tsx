'use client';

import Link from 'next/link';

import { CollectionsPanel } from '@/components/collections/collections-panel';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { MOCK_V2V3_LABELS } from '@/constants/labels';

export default function GymCollectionsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={MOCK_V2V3_LABELS.collectionsTitle}
        showBack
        backHref="/gym/dashboard"
        action={
          <Link href="/gym/members">
            <Button title="Socios" variant="outline" size="sm" />
          </Link>
        }
      />
      <CollectionsPanel />
    </div>
  );
}
