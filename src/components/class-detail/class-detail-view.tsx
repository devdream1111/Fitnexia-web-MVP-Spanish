'use client';

import { useRouter } from 'next/navigation';

import {
  Calendar,
  ClassDetailBookingPanel,
  ClassDetailFact,
  ClassDetailFactGrid,
  ClassDetailHeader,
  ClassDetailInstructorCard,
  ClassDetailReviews,
  ClassDetailSection,
  ClassDetailTitleBlock,
  Clock,
  DollarSign,
  MapPin,
  Users,
} from '@/components/class-detail/class-detail-ui';
import { Badge } from '@/components/ui/badge';
import { useClasses } from '@/contexts/classes-context';
import { useReviews } from '@/contexts/reviews-context';
import { formatClassDate, formatMoney, getInstructorById } from '@/data/mock';
import {
  BUTTON_LABELS,
  CLASS_DETAIL_LABELS,
  GENERAL_LABELS,
  SCREEN_TITLES,
  classSpotsLabel,
  modalityBadgeLabel,
} from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export function ClassDetailView({
  classId,
  onClose,
  variant = 'page',
}: {
  classId: string;
  onClose?: () => void;
  variant?: 'page' | 'modal';
}) {
  const router = useRouter();
  const { getClassById } = useClasses();
  const { getReviewsForClass } = useReviews();
  const waitlistEnabled = useFeature('waitlist');
  const cls = getClassById(classId);
  const instructor = cls ? getInstructorById(cls.instructor.id) : undefined;
  const reviews = cls ? getReviewsForClass(cls.id) : [];

  const isModal = variant === 'modal';

  if (!cls) {
    return (
      <div className={isModal ? 'p-4' : 'mx-auto max-w-5xl'}>
        <ClassDetailHeader title={SCREEN_TITLES.class} onClose={onClose} />
        <p className={`text-[var(--fn-text-muted)] ${isModal ? 'py-6' : 'px-4 py-8 sm:px-0'}`}>
          {SCREEN_TITLES.classNotFound}
        </p>
      </div>
    );
  }

  const full = cls.spotsLeft === 0;
  const whereValue =
    cls.modality === 'online'
      ? CLASS_DETAIL_LABELS.onlineSessionLink
      : (cls.location?.label ?? CLASS_DETAIL_LABELS.locationTbd);
  const spotsValue = cls.capacity
    ? classSpotsLabel(cls.spotsLeft ?? 0, cls.capacity, { waitlistEnabled })
    : undefined;

  const goBook = () => router.push(`/book/${cls.id}`);
  const goWaitlist = () => router.push(`/book/${cls.id}?waitlist=1`);

  const bookingPanel = (
    <ClassDetailBookingPanel
      price={formatMoney(cls.price)}
      spotsLabel={spotsValue}
      full={full}
      waitlistEnabled={waitlistEnabled}
      bookLabel={BUTTON_LABELS.bookNow}
      waitlistLabel={BUTTON_LABELS.joinWaitlist}
      fullLabel={BUTTON_LABELS.classFull}
      onBook={goBook}
      onWaitlist={goWaitlist}
    />
  );

  return (
    <div className={isModal ? '' : 'mx-auto max-w-5xl pb-8'}>
      <ClassDetailHeader title={SCREEN_TITLES.classDetails} onClose={onClose} compact={isModal} />

      <div className={`space-y-6 ${isModal ? 'p-4 pt-2' : 'mt-6 space-y-8 px-4 sm:px-0'}`}>
        <ClassDetailTitleBlock
          title={cls.title}
          badges={
            <>
              <Badge label={cls.discipline} />
              <Badge label={modalityBadgeLabel(cls.modality)} variant="success" />
              {full ? <Badge label={CLASS_DETAIL_LABELS.full} variant="warning" /> : null}
            </>
          }
        />

        {isModal ? (
          <div className="space-y-6">
            <ClassDetailFactGrid>
              <ClassDetailFact icon={Calendar} label={CLASS_DETAIL_LABELS.when} value={formatClassDate(cls.startAt)} />
              <ClassDetailFact
                icon={Clock}
                label={CLASS_DETAIL_LABELS.duration}
                value={`${cls.durationMinutes} ${GENERAL_LABELS.min}`}
              />
              <ClassDetailFact icon={MapPin} label={CLASS_DETAIL_LABELS.where} value={whereValue} />
              <ClassDetailFact icon={DollarSign} label={CLASS_DETAIL_LABELS.price} value={formatMoney(cls.price)} />
              {spotsValue ? (
                <ClassDetailFact icon={Users} label={CLASS_DETAIL_LABELS.spots} value={spotsValue} />
              ) : null}
            </ClassDetailFactGrid>

            {bookingPanel}

            <ClassDetailInstructorCard
              href={`/instructor/${cls.instructor.id}`}
              name={cls.instructor.displayName}
              verified={instructor?.verified}
              rating={instructor?.averageRating}
              viewProfileLabel={BUTTON_LABELS.viewProfile}
            />

            <ClassDetailSection title={CLASS_DETAIL_LABELS.about}>
              <p className="text-sm leading-relaxed text-[var(--fn-text-muted)]">
                Únete a {cls.instructor.displayName} para una sesión atractiva de {cls.discipline.toLowerCase()}.
              </p>
            </ClassDetailSection>

            <ClassDetailReviews title={`${GENERAL_LABELS.reviews} (${reviews.length})`} reviews={reviews} />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_17rem] lg:items-start">
            <div className="space-y-8">
              <ClassDetailFactGrid>
                <ClassDetailFact icon={Calendar} label={CLASS_DETAIL_LABELS.when} value={formatClassDate(cls.startAt)} />
                <ClassDetailFact
                  icon={Clock}
                  label={CLASS_DETAIL_LABELS.duration}
                  value={`${cls.durationMinutes} ${GENERAL_LABELS.min}`}
                />
                <ClassDetailFact icon={MapPin} label={CLASS_DETAIL_LABELS.where} value={whereValue} />
                <ClassDetailFact icon={DollarSign} label={CLASS_DETAIL_LABELS.price} value={formatMoney(cls.price)} />
                {spotsValue ? (
                  <ClassDetailFact icon={Users} label={CLASS_DETAIL_LABELS.spots} value={spotsValue} />
                ) : null}
              </ClassDetailFactGrid>

              <div className="lg:hidden">{bookingPanel}</div>

              <ClassDetailInstructorCard
                href={`/instructor/${cls.instructor.id}`}
                name={cls.instructor.displayName}
                verified={instructor?.verified}
                rating={instructor?.averageRating}
                viewProfileLabel={BUTTON_LABELS.viewProfile}
              />

              <ClassDetailSection title={CLASS_DETAIL_LABELS.about}>
                <p className="text-sm leading-relaxed text-[var(--fn-text-muted)] sm:text-base">
                  Únete a {cls.instructor.displayName} para una sesión atractiva de {cls.discipline.toLowerCase()}.
                </p>
              </ClassDetailSection>

              <ClassDetailReviews title={`${GENERAL_LABELS.reviews} (${reviews.length})`} reviews={reviews} />
            </div>

            <div className="hidden lg:block">{bookingPanel}</div>
          </div>
        )}
      </div>
    </div>
  );
}
