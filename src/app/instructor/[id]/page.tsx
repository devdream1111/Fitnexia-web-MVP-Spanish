'use client';

import { useParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { BADGE_LABELS } from '@/constants/labels';
import { formatMoney, getInstructorById } from '@/data/mock';

export default function InstructorPublicPage() {
  const { id } = useParams<{ id: string }>();
  const instructor = getInstructorById(id ?? '');

  if (!instructor) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <PageHeader title="Instructor" showBack />
        <p>Not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <PageHeader title={instructor.displayName} showBack />
      <div className="flex items-center gap-4">
        <span className="text-5xl">🎾</span>
        <div>
          {instructor.verified ? <Badge label={BADGE_LABELS.verified} /> : null}
          <p className="text-sm text-[var(--fn-text-muted)]">
            ★ {instructor.averageRating} ({instructor.reviewCount} reviews)
          </p>
        </div>
      </div>
      {instructor.bio ? <p className="mt-6 text-[var(--fn-text-secondary)]">{instructor.bio}</p> : null}
      <p className="mt-4 text-sm">
        <strong>Disciplines:</strong> {instructor.disciplines.join(', ')}
      </p>
      {instructor.hourlyRate ? (
        <p className="mt-2 text-lg font-bold text-[var(--fn-primary)]">
          From {formatMoney(instructor.hourlyRate)}/hr
        </p>
      ) : null}
    </div>
  );
}
