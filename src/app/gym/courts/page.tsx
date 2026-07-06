'use client';

import { useAuth } from '@/contexts/auth-context';
import {
  CourtsManager,
  CourtScheduleGrid,
  InstitutionCourtReservations,
} from '@/components/mock-v2v3/courts-ui';
import { MockFeatureGate, MockPageShell } from '@/components/mock-v2v3/mock-feature-gate';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import { mockCourtsService } from '@/services/mock/courts.mock';
import { resolveInstitutionId } from '@/utils/gym-classes';

export default function GymCourtsPage() {
  const enabled = useFeature('courtManagement');
  const { user } = useAuth();
  const institutionId = resolveInstitutionId(user) || 'mock-gym';
  const courts = mockCourtsService.listCourts(institutionId);

  return (
    <MockFeatureGate enabled={enabled} title={MOCK_V2V3_LABELS.courtsTitle} backHref="/gym/dashboard">
      <MockPageShell title={MOCK_V2V3_LABELS.courtsTitle} backHref="/gym/dashboard">
        <CourtsManager institutionId={institutionId} />
        {courts.map((court) => (
          <CourtScheduleGrid key={court.id} court={court} />
        ))}
        <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
          <h3 className="mb-3 font-bold">Reservas de canchas</h3>
          <InstitutionCourtReservations institutionId={institutionId} />
        </section>
      </MockPageShell>
    </MockFeatureGate>
  );
}
