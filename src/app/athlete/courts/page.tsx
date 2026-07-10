'use client';

import Link from 'next/link';

import { AthleteCourtBookingFlow } from '@/components/courts/athlete-court-booking-flow';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { MOCK_V2V3_LABELS } from '@/constants/labels';

export default function AthleteCourtsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-4">
      <PageHeader
        title={MOCK_V2V3_LABELS.courtsBook}
        showBack
        backHref="/athlete/search"
        action={
          <Link href="/athlete/court-bookings">
            <Button title={MOCK_V2V3_LABELS.courtsMyBookings} variant="outline" size="sm" />
          </Link>
        }
      />
      <AthleteCourtBookingFlow />
    </div>
  );
}
