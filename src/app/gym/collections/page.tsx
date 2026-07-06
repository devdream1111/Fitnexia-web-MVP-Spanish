'use client';

import { CollectionsPanel } from '@/components/mock-v2v3/collections-panel';
import { MockFeatureGate, MockPageShell } from '@/components/mock-v2v3/mock-feature-gate';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function GymCollectionsPage() {
  const enabled = useFeature('clubCollectionsPanel');
  return (
    <MockFeatureGate enabled={enabled} title={MOCK_V2V3_LABELS.collectionsTitle} backHref="/gym/dashboard">
      <MockPageShell title={MOCK_V2V3_LABELS.collectionsTitle} backHref="/gym/dashboard">
        <CollectionsPanel />
      </MockPageShell>
    </MockFeatureGate>
  );
}
