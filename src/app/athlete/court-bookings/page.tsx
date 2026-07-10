'use client';

import Link from 'next/link';

import { AthleteCourtReservations } from '@/components/courts/athlete-court-reservations';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { MOCK_V2V3_LABELS } from '@/constants/labels';

export default function AthleteCourtBookingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-4">
      <PageHeader
        title={MOCK_V2V3_LABELS.courtsMyBookings}
        showBack
        backHref="/athlete/bookings"
        action={
          <Link href="/athlete/courts">
            <Button title={MOCK_V2V3_LABELS.courtsBook} variant="outline" size="sm" />
          </Link>
        }
      />
      <AthleteCourtReservations />
    </div>
  );
}
