'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { useClasses } from '@/contexts/classes-context';
import { MOCK_BOOKINGS } from '@/data/mock';
import { formatClassDate, formatMoney } from '@/utils/format';
import { hasAssignedInstructor } from '@/utils/class-instructor';
import {
  CLASS_DETAIL_LABELS,
  modalityBadgeLabel,
  SCREEN_TITLES,
  classSpotsLabel,
} from '@/constants/labels';

export default function AdminClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getClassById } = useClasses();
  const cls = getClassById(id ?? '');
  const classBookings = MOCK_BOOKINGS.filter((b) => b.classId === cls?.id);

  if (!cls) {
    return (
      <div className="space-y-6">
        <PageHeader title={SCREEN_TITLES.classDetails} showBack />
        <p>{SCREEN_TITLES.classNotFound}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={SCREEN_TITLES.classDetails} showBack />

      <div className="rounded-xl bg-[var(--fn-surface)] p-6">
        <h2 className="text-2xl font-extrabold">{cls.title}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge label={cls.discipline} />
          <Badge label={modalityBadgeLabel(cls.modality)} variant="success" />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[var(--fn-text-muted)]">{CLASS_DETAIL_LABELS.when}</dt>
            <dd className="font-medium">{formatClassDate(cls.startAt)}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--fn-text-muted)]">{CLASS_DETAIL_LABELS.duration}</dt>
            <dd className="font-medium">{cls.durationMinutes} min</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--fn-text-muted)]">{CLASS_DETAIL_LABELS.price}</dt>
            <dd className="font-medium">{formatMoney(cls.price)}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--fn-text-muted)]">{CLASS_DETAIL_LABELS.spots}</dt>
            <dd className="font-medium">
              {classSpotsLabel(cls.spotsLeft ?? cls.capacity ?? 0, cls.capacity ?? 0)}
            </dd>
          </div>
          {hasAssignedInstructor(cls) ? (
            <div>
              <dt className="text-sm text-[var(--fn-text-muted)]">Instructor</dt>
              <dd className="font-medium">
                <Link href={`/instructor/${cls.instructor!.id}`} className="text-[var(--fn-primary)]">
                  {cls.instructor!.displayName}
                </Link>
              </dd>
            </div>
          ) : null}
          {cls.institution && (
            <div>
              <dt className="text-sm text-[var(--fn-text-muted)]">Institución</dt>
              <dd className="font-medium">{cls.institution.name}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-xl bg-[var(--fn-surface)] p-6">
        <h3 className="mb-4 text-lg font-bold">Reservas ({classBookings.length})</h3>
        {classBookings.length === 0 ? (
          <p className="text-[var(--fn-text-muted)]">Sin reservas para esta clase</p>
        ) : (
          <div className="space-y-2">
            {classBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg border border-[var(--fn-border)] p-3"
              >
                <span className="text-sm font-medium">Reserva #{booking.id}</span>
                <div className="flex items-center gap-3">
                  <Badge label={booking.status} variant={booking.status === 'confirmed' ? 'success' : 'default'} />
                  <span className="font-semibold text-[var(--fn-primary)]">{formatMoney(booking.price)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
