'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { BADGE_LABELS, GYM_LABELS, GENERAL_LABELS } from '@/constants/labels';
import { MOCK_INSTRUCTORS } from '@/data/mock';
import { resolveInstitutionId } from '@/utils/gym-classes';

export default function GymInstructorsPage() {
  const { user } = useAuth();
  const institutionId = resolveInstitutionId(user);
  const linkedIds = user?.institutionProfile?.instructorIds ?? [];
  const staff = MOCK_INSTRUCTORS.filter((i) => linkedIds.includes(i.id));

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h1 className="text-3xl font-extrabold">{GYM_LABELS.instructors.yourInstructors}</h1>
        <Link href="/gym/profile/invite-instructor" className="text-sm font-semibold text-[var(--fn-primary)]">
          {GYM_LABELS.instructors.inviteInstructor} +
        </Link>
      </div>
      {staff.map((i) => (
        <div
          key={i.id}
          className="mb-3 flex items-center justify-between rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
          <div>
            <p className="font-bold">{i.displayName}</p>
            <p className="text-sm text-[var(--fn-text-muted)]">{i.disciplines.join(', ')}</p>
            {i.verified ? <Badge label={BADGE_LABELS.verified} /> : null}
          </div>
          <Link href={`/gym/review-instructor/${i.id}`} className="text-sm text-[var(--fn-primary)]">
            {GENERAL_LABELS.reviews}
          </Link>
        </div>
      ))}
      <p className="mt-4 text-xs text-[var(--fn-text-muted)]">Institución: {institutionId}</p>
    </div>
  );
}
