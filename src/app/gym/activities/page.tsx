'use client';

import { ActivitiesPanel } from '@/components/mock-v2v3/gym-plan-panels';
import { MockFeatureGate, MockPageShell } from '@/components/mock-v2v3/mock-feature-gate';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth-context';
import { useFeature } from '@/hooks/use-feature';
import { resolveInstitutionId } from '@/utils/gym-classes';

export default function GymActivitiesPage() {
  const enabled = useFeature('activityManagement');
  const { user } = useAuth();
  const institutionId = resolveInstitutionId(user) || 'mock-gym';

  return (
    <MockFeatureGate enabled={enabled} title={MOCK_V2V3_LABELS.activitiesTitle} backHref="/gym/dashboard">
      <MockPageShell title={MOCK_V2V3_LABELS.activitiesTitle} backHref="/gym/dashboard">
        <ActivitiesPanel institutionId={institutionId} />
      </MockPageShell>
    </MockFeatureGate>
  );
}
