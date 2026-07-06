'use client';

import { CourtBookingFlow, CourtBookingsList } from '@/components/mock-v2v3/courts-ui';
import { MockFeatureGate, MockPageShell } from '@/components/mock-v2v3/mock-feature-gate';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth-context';
import { useFeature } from '@/hooks/use-feature';

export default function AthleteCourtsPage() {
  const enabled = useFeature('courtBooking');
  const { user } = useAuth();
  const userId = user?.id ?? 'me';
  const institutionId = 'mock-club-1';

  return (
    <MockFeatureGate enabled={enabled} title={MOCK_V2V3_LABELS.courtsBook} backHref="/athlete/search">
      <MockPageShell title={MOCK_V2V3_LABELS.courtsBook} backHref="/athlete/search">
        <CourtBookingFlow userId={userId} institutionId={institutionId} isMember />
      </MockPageShell>
    </MockFeatureGate>
  );
}
