'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useClasses } from '@/contexts/classes-context';
import { formatClassDate, formatMoney, getInstructorById } from '@/data/mock';
import {
  BADGE_LABELS,
  BUTTON_LABELS,
  CLASS_DETAIL_LABELS,
  SCREEN_TITLES,
  classSpotsLabel,
  modalityBadgeLabel,
} from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getClassById } = useClasses();
  const waitlistEnabled = useFeature('waitlist');
  const cls = getClassById(id ?? '');
  const instructor = cls ? getInstructorById(cls.instructor.id) : undefined;

  if (!cls) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <PageHeader title={SCREEN_TITLES.class} showBack />
        <p>{SCREEN_TITLES.classNotFound}</p>
      </div>
    );
  }

  const full = cls.spotsLeft === 0;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <PageHeader title={SCREEN_TITLES.classDetails} showBack />
      <h2 className="text-3xl font-extrabold">{cls.title}</h2>
      <div className="mt-2 flex gap-2">
        <Badge label={cls.discipline} />
        <Badge label={modalityBadgeLabel(cls.modality)} variant="success" />
      </div>

      <div className="mt-6 space-y-3 rounded-2xl bg-[var(--fn-surface)] p-4">
        <Row label={CLASS_DETAIL_LABELS.when} value={formatClassDate(cls.startAt)} />
        <Row label={CLASS_DETAIL_LABELS.duration} value={`${cls.durationMinutes} min`} />
        <Row
          label={CLASS_DETAIL_LABELS.where}
          value={
            cls.modality === 'online'
              ? CLASS_DETAIL_LABELS.onlineSessionLink
              : (cls.location?.label ?? CLASS_DETAIL_LABELS.locationTbd)
          }
        />
        <Row label={CLASS_DETAIL_LABELS.price} value={formatMoney(cls.price)} />
        {cls.capacity ? (
          <Row
            label={CLASS_DETAIL_LABELS.spots}
            value={classSpotsLabel(cls.spotsLeft ?? 0, cls.capacity, { waitlistEnabled })}
          />
        ) : null}
      </div>

      <Link
        href={`/instructor/${cls.instructor.id}`}
        className="mt-4 flex items-center gap-4 rounded-2xl bg-[var(--fn-surface)] p-4">
        <span className="text-3xl">🎾</span>
        <div className="flex-1">
          <p className="font-bold">{cls.instructor.displayName}</p>
          {instructor?.verified ? <Badge label={BADGE_LABELS.verified} /> : null}
          {instructor?.averageRating ? <p className="text-sm">★ {instructor.averageRating.toFixed(1)}</p> : null}
        </div>
        <span className="text-sm text-[var(--fn-primary)]">{BUTTON_LABELS.viewProfile}</span>
      </Link>

      <h3 className="mt-6 font-bold">{CLASS_DETAIL_LABELS.about}</h3>
      <p className="text-[var(--fn-text-muted)]">
        Join {cls.instructor.displayName} for an engaging {cls.discipline.toLowerCase()} session.
      </p>

      <div className="mt-8">
        {full ? (
          waitlistEnabled ? (
            <Button
              title={BUTTON_LABELS.joinWaitlist}
              variant="secondary"
              onClick={() => router.push(`/book/${cls.id}?waitlist=1`)}
            />
          ) : (
            <Button title={BUTTON_LABELS.classFull} disabled />
          )
        ) : (
          <Button title={BUTTON_LABELS.bookNow} onClick={() => router.push(`/book/${cls.id}`)} />
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--fn-text-muted)]">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
