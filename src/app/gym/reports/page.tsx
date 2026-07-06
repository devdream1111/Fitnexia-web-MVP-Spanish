'use client';

import {
  GymAdvancedReportsPanel,
  GymBasicReportsPanel,
} from '@/components/mock-v2v3/gym-plan-panels';
import { MockFeatureGate, MockPageShell } from '@/components/mock-v2v3/mock-feature-gate';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function GymReportsPage() {
  const basic = useFeature('gymReportsBasic');
  const advanced = useFeature('gymReportsAdvanced');
  const enabled = basic || advanced;

  return (
    <MockFeatureGate
      enabled={enabled}
      title={advanced ? MOCK_V2V3_LABELS.gymReportsAdvancedTitle : MOCK_V2V3_LABELS.gymReportsBasicTitle}
      backHref="/gym/dashboard"
    >
      <MockPageShell
        title={advanced ? MOCK_V2V3_LABELS.gymReportsAdvancedTitle : MOCK_V2V3_LABELS.gymReportsBasicTitle}
        backHref="/gym/dashboard"
      >
        {advanced ? <GymAdvancedReportsPanel /> : basic ? <GymBasicReportsPanel /> : null}
      </MockPageShell>
    </MockFeatureGate>
  );
}
