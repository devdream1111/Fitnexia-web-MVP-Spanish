'use client';

import { CourtBookingsList } from '@/components/mock-v2v3/courts-ui';
import { MockFeatureGate, MockPageShell } from '@/components/mock-v2v3/mock-feature-gate';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth-context';
import { useFeature } from '@/hooks/use-feature';

export default function AthleteCourtBookingsPage() {
  const enabled = useFeature('courtBooking');
  const { user } = useAuth();

  return (
    <MockFeatureGate enabled={enabled} title={MOCK_V2V3_LABELS.courtsMyBookings} backHref="/athlete/bookings">
      <MockPageShell title={MOCK_V2V3_LABELS.courtsMyBookings} backHref="/athlete/bookings">
        <CourtBookingsList userId={user?.id ?? 'me'} />
      </MockPageShell>
    </MockFeatureGate>
  );
}
