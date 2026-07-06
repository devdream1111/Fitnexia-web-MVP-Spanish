'use client';

import { QrCheckInPanel } from '@/components/mock-v2v3/qr-checkin-panel';
import { MockFeatureGate, MockPageShell } from '@/components/mock-v2v3/mock-feature-gate';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function GymCheckInPage() {
  const enabled = useFeature('qrAccessControl');

  return (
    <MockFeatureGate enabled={enabled} title={MOCK_V2V3_LABELS.qrCheckInTitle} backHref="/gym/members">
      <MockPageShell title={MOCK_V2V3_LABELS.qrCheckInTitle} backHref="/gym/members">
        <QrCheckInPanel />
      </MockPageShell>
    </MockFeatureGate>
  );
}
