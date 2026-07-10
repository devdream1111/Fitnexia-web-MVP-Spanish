'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';

import { CourtPricingRulesPanel } from '@/components/courts/court-pricing-rules-panel';
import { CourtScheduleGrid } from '@/components/courts/court-schedule-grid';
import { CourtSettingsPanel } from '@/components/courts/court-settings-panel';
import { CourtsManager } from '@/components/courts/courts-manager';
import { InstitutionCourtReservations } from '@/components/courts/institution-court-reservations';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import type { Court } from '@/types/api';
import { localDateInputValue } from '@/utils/courts';

export default function GymCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [scheduleDate, setScheduleDate] = useState(localDateInputValue());
  const handleCourtsChange = useCallback((next: Court[]) => {
    setCourts(next);
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={MOCK_V2V3_LABELS.courtsTitle}
        showBack
        backHref="/gym/dashboard"
        action={
          <Link href="/gym/dashboard">
            <Button title="Panel" variant="outline" size="sm" />
          </Link>
        }
      />

      <CourtsManager onCourtsChange={handleCourtsChange} />
      <CourtSettingsPanel />
      <CourtPricingRulesPanel />

      {courts.length > 0 ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-lg font-bold text-[var(--fn-text)]">
            {MOCK_V2V3_LABELS.courtSchedule}
          </h2>
          <Input
            label="Fecha del calendario"
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            compact
            className="mb-0 w-auto min-w-[12rem]"
          />
        </div>
      ) : null}

      {courts.map((court) => (
        <CourtScheduleGrid
          key={court.id}
          court={court}
          date={scheduleDate}
          onDateChange={setScheduleDate}
        />
      ))}

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
        <h3 className="mb-3 m-0 font-bold text-[var(--fn-text)]">Reservas de canchas</h3>
        <InstitutionCourtReservations date={scheduleDate} />
      </section>
    </div>
  );
}
