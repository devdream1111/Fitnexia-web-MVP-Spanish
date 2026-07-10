'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Calendar,
  ClassDetailBookingPanel,
  ClassDetailFact,
  ClassDetailFactGrid,
  ClassDetailHeader,
  ClassDetailInstructorCard,
  ClassDetailPricePanel,
  ClassDetailReviews,
  ClassDetailSection,
  ClassDetailTitleBlock,
  Clock,
  DollarSign,
  Languages,
  MapPin,
  Signal,
  UserRound,
  Users,
} from '@/components/class-detail/class-detail-ui';
import { Badge } from '@/components/ui/badge';
import { RegularClassBadge } from '@/components/regular-class-badge';
import { useAuth } from '@/contexts/auth-context';
import { useBookings } from '@/contexts/bookings-context';
import { useClasses } from '@/contexts/classes-context';
import { useInstructors, instructorFromSummary } from '@/contexts/instructors-context';
import { useReviews } from '@/contexts/reviews-context';
import { apiGetClass, apiGetInstructor } from '@/services/api';
import { formatClassDate, formatMoney } from '@/utils/format';
import { hasAssignedInstructor } from '@/utils/class-instructor';
import {
  BUTTON_LABELS,
  CLASS_DETAIL_LABELS,
  GENERAL_LABELS,
  SCREEN_TITLES,
  classFormatBadgeLabel,
  classSpotsLabel,
  modalityBadgeLabel,
} from '@/constants/labels';
import { ClassLiveStreamPanel } from '@/components/live-stream/class-live-stream-panel';
import { useFeature } from '@/hooks/use-feature';
import {
  instructorGenderLabel,
  languageLabel,
  levelLabel,
} from '@/utils/advanced-search';
import { findActiveUserBooking } from '@/utils/user-bookings';
import { canCancelBooking, getRefundAmount, resolveCancellationPolicyHours } from '@/utils/booking';
import type { Class, Instructor } from '@/types/api';

export function ClassDetailView({
  classId,
  onClose,
  variant = 'page',
  autoFocusLive = false,
}: {
  classId: string;
  onClose?: () => void;
  variant?: 'page' | 'modal';
  autoFocusLive?: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { bookings, refreshBookings, cancelBooking, syncPayment } = useBookings();
  const { getClassById, fetchClassById } = useClasses();
  const { cacheInstructor } = useInstructors();
  const { getReviewsForInstructor, fetchInstructorReviews } = useReviews();
  const waitlistEnabled = useFeature('waitlist');
  const liveStreamingEnabled = useFeature('liveStreaming');
  const [cls, setCls] = useState<Class | undefined>(() => {
    const cached = getClassById(classId);
    return cached as Class | undefined;
  });
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(!cls);
  const [bookingActionLoading, setBookingActionLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const liveStreamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role === 'athlete') {
      void refreshBookings();
    }
  }, [refreshBookings, user?.role]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const classData =
        (await apiGetClass(classId).catch(() => null)) ??
        (await fetchClassById(classId)) ??
        getClassById(classId);
      if (cancelled) return;
      if (classData) {
        setCls(classData as Class);
        if (hasAssignedInstructor(classData)) {
          cacheInstructor(instructorFromSummary(classData.instructor!));
          const [inst] = await Promise.all([
            apiGetInstructor(classData.instructor!.id).catch(() => null),
            fetchInstructorReviews(classData.instructor!.id),
          ]);
          if (!cancelled && inst) {
            setInstructor(inst);
            cacheInstructor(inst);
          }
        } else {
          setInstructor(null);
        }
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [cacheInstructor, classId, fetchClassById, fetchInstructorReviews, getClassById]);

  const rawReviews =
    cls && hasAssignedInstructor(cls) ? getReviewsForInstructor(cls.instructor!.id) : [];
  const reviews = rawReviews;
  const isModal = variant === 'modal';
  const role = user?.role;
  const isAthleteView = !role || role === 'athlete';
  const isInstructorView = role === 'instructor';
  const isGymView = role === 'institution';
  const showBookingActions = isAthleteView;
  const displayInstructor =
    instructor ??
    (cls && hasAssignedInstructor(cls) ? instructorFromSummary(cls.instructor!) : null);
  const showInstructorSection =
    Boolean(cls) && hasAssignedInstructor(cls!) && Boolean(displayInstructor) && !isInstructorView;
  const cacheInstructorForProfile = () => {
    if (instructor) {
      cacheInstructor(instructor);
      return;
    }
    if (cls && hasAssignedInstructor(cls)) {
      cacheInstructor(instructorFromSummary(cls.instructor!));
    }
  };
  const showInstructorProfileLink = !isInstructorView;
  const showBookingSidebar = isAthleteView || isGymView;
  const showInstructorPriceSidebar = isInstructorView && isModal;
  const showPriceInFactGrid = !isModal || (!showBookingSidebar && !showInstructorPriceSidebar);

  const activeBooking = useMemo(() => {
    if (!cls || !user || user.role !== 'athlete') return undefined;
    return findActiveUserBooking(bookings, cls.id, user.id);
  }, [bookings, cls, user]);

  const showLiveStream = Boolean(cls) && liveStreamingEnabled && cls?.modality === 'online';

  useEffect(() => {
    if (!autoFocusLive || !showLiveStream || !liveStreamRef.current) return;
    const timer = window.setTimeout(() => {
      liveStreamRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [autoFocusLive, showLiveStream, cls?.id]);

  if (loading && !cls) {
    return (
      <div className={isModal ? 'p-5' : 'mx-auto max-w-5xl px-4 py-8'}>
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className={isModal ? 'min-w-0' : 'mx-auto max-w-5xl'}>
        <ClassDetailHeader title={SCREEN_TITLES.class} onClose={onClose} variant={variant} />
        <p className={`text-[var(--fn-text-muted)] ${isModal ? 'p-5' : 'px-4 py-8 sm:px-0'}`}>
          {SCREEN_TITLES.classNotFound}
        </p>
      </div>
    );
  }

  const full = cls.spotsLeft === 0;
  const existingBooking =
    activeBooking?.status === 'confirmed' || activeBooking?.status === 'pending_payment'
      ? { status: activeBooking.status }
      : undefined;
  const whereValue =
    cls.modality === 'online'
      ? CLASS_DETAIL_LABELS.onlineSessionLink
      : (cls.location?.label ?? CLASS_DETAIL_LABELS.locationTbd);
  const spotsValue = cls.capacity
    ? classSpotsLabel(cls.spotsLeft ?? 0, cls.capacity, { waitlistEnabled })
    : undefined;

  const instructorGender =
    displayInstructor?.gender ?? cls.instructor?.gender ?? undefined;

  const buildFactGrid = () => (
    <ClassDetailFactGrid>
      <ClassDetailFact icon={Calendar} label={CLASS_DETAIL_LABELS.when} value={formatClassDate(cls.startAt)} />
      <ClassDetailFact icon={Clock} label={CLASS_DETAIL_LABELS.duration} value={`${cls.durationMinutes} min`} />
      {showPriceInFactGrid ? (
        <ClassDetailFact icon={DollarSign} label={CLASS_DETAIL_LABELS.price} value={formatMoney(cls.price)} />
      ) : null}
      <ClassDetailFact icon={MapPin} label={CLASS_DETAIL_LABELS.where} value={whereValue} />
      {spotsValue ? (
        <ClassDetailFact icon={Users} label={CLASS_DETAIL_LABELS.spots} value={spotsValue} />
      ) : null}
      {cls.level ? (
        <ClassDetailFact icon={Signal} label={CLASS_DETAIL_LABELS.level} value={levelLabel(cls.level)} />
      ) : null}
      {cls.language ? (
        <ClassDetailFact icon={Languages} label={CLASS_DETAIL_LABELS.language} value={languageLabel(cls.language)} />
      ) : null}
      {instructorGender ? (
        <ClassDetailFact
          icon={UserRound}
          label={CLASS_DETAIL_LABELS.instructorGender}
          value={instructorGenderLabel(instructorGender)}
        />
      ) : null}
    </ClassDetailFactGrid>
  );

  const badges = [
    <RegularClassBadge key="regular" item={cls} size="default" />,
    <Badge key="mod" label={modalityBadgeLabel(cls.modality)} />,
    <Badge
      key="fmt"
      label={classFormatBadgeLabel(cls.classFormat)}
      variant={cls.classFormat === 'individual' ? 'warning' : 'default'}
    />,
    <Badge key="disc" label={cls.discipline} />,
    cls.level ? <Badge key="level" label={levelLabel(cls.level)} variant="success" /> : null,
    cls.language ? <Badge key="lang" label={languageLabel(cls.language)} /> : null,
  ].filter(Boolean);

  const goBook = () => {
    router.push(`/book/${cls.id}`);
  };
  const goWaitlist = () => {
    router.push(`/book/${cls.id}?waitlist=1`);
  };

  const handleCompletePayment = async () => {
    if (!activeBooking) return;
    if (activeBooking.checkoutUrl) {
      window.location.href = activeBooking.checkoutUrl;
      return;
    }
    setBookingActionLoading(true);
    try {
      const updated = await syncPayment(activeBooking.id);
      if (updated.checkoutUrl) window.location.href = updated.checkoutUrl;
    } finally {
      setBookingActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!activeBooking) return;
    setBookingActionLoading(true);
    try {
      await cancelBooking(activeBooking.id);
      setShowCancelConfirm(false);
      if (onClose) onClose();
      else router.push('/athlete/bookings');
    } finally {
      setBookingActionLoading(false);
    }
  };

  const cancellationPolicyHours = resolveCancellationPolicyHours(cls);
  const cancelRefundMessage = activeBooking
    ? canCancelBooking(cls.startAt, cancellationPolicyHours)
      ? GENERAL_LABELS.fullRefund.replace(
          '{amount}',
          formatMoney(getRefundAmount(activeBooking, cls.startAt, cancellationPolicyHours)),
        )
      : GENERAL_LABELS.lateCancellationNoRefund(cancellationPolicyHours)
    : '';

  const liveStreamPanel = showLiveStream ? (
    <div ref={liveStreamRef} id="class-live-stream">
      <ClassLiveStreamPanel classId={cls.id} user={user} autoJoin={autoFocusLive} />
    </div>
  ) : null;

  const descriptionSection =
    cls.description?.trim() ? (
      <ClassDetailSection title={CLASS_DETAIL_LABELS.description}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--fn-text-secondary)]">
          {cls.description.trim()}
        </p>
      </ClassDetailSection>
    ) : null;

  const bookingPanel = showBookingSidebar ? (
    <ClassDetailBookingPanel
      price={formatMoney(cls.price)}
      spotsLabel={spotsValue}
      full={full}
      waitlistEnabled={waitlistEnabled}
      bookLabel={BUTTON_LABELS.bookNow}
      waitlistLabel={BUTTON_LABELS.joinWaitlistShort}
      fullLabel={BUTTON_LABELS.classFull}
      onBook={goBook}
      onWaitlist={goWaitlist}
      compact={isModal}
      showActions={showBookingActions}
      existingBooking={existingBooking}
      completePaymentLabel={BUTTON_LABELS.completePayment}
      cancelBookingLabel={GENERAL_LABELS.cancel}
      onCompletePayment={() => void handleCompletePayment()}
      onCancelBooking={() => setShowCancelConfirm(true)}
      actionLoading={bookingActionLoading}
      showCancelConfirm={showCancelConfirm}
      cancelConfirmTitle={GENERAL_LABELS.cancelBooking}
      cancelConfirmMessage={cancelRefundMessage}
      confirmCancelLabel={GENERAL_LABELS.confirmCancel}
      keepBookingLabel={GENERAL_LABELS.keepBooking}
      onConfirmCancel={() => void handleCancelBooking()}
      onDismissCancel={() => setShowCancelConfirm(false)}
      cancellationPolicyNote={CLASS_DETAIL_LABELS.cancellationPolicy(cancellationPolicyHours)}
    />
  ) : null;

  const instructorPricePanel =
    showInstructorPriceSidebar ? (
      <ClassDetailPricePanel price={formatMoney(cls.price)} compact={isModal} />
    ) : null;

  const factGrid = buildFactGrid();

  if (isModal) {
    const sidebar = bookingPanel ?? instructorPricePanel;
    const hasSidebar = Boolean(sidebar);

    return (
      <div className="flex min-h-0 min-w-0 flex-col">
        <ClassDetailHeader title={cls.title} onClose={onClose} variant="modal" />
        <div className="min-w-0 overflow-x-hidden p-4 md:p-5">
          <div className="mb-4 flex flex-wrap gap-1.5">{badges}</div>
          <div
            className={`grid min-w-0 gap-5 ${
              hasSidebar ? 'lg:grid-cols-[minmax(0,1fr)_min(18rem,100%)]' : ''
            }`}
          >
            <div className="min-w-0 space-y-4">
              {factGrid}
              {liveStreamPanel}
              {descriptionSection}
              {showInstructorSection ? (
                <ClassDetailSection title={CLASS_DETAIL_LABELS.about}>
                  <ClassDetailInstructorCard
                    href={`/instructor/${displayInstructor!.id}`}
                    name={displayInstructor!.displayName}
                    verified={displayInstructor!.verified}
                    rating={displayInstructor!.averageRating}
                    viewProfileLabel={BUTTON_LABELS.viewProfile}
                    showProfileLink={showInstructorProfileLink}
                    replaceNavigation={Boolean(onClose)}
                    onProfileNavigate={cacheInstructorForProfile}
                  />
                </ClassDetailSection>
              ) : null}
              {reviews.length > 0 ? (
                <ClassDetailReviews title={GENERAL_LABELS.reviews} reviews={reviews} />
              ) : null}
            </div>
            {sidebar ? <div className="min-w-0">{sidebar}</div> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <ClassDetailHeader title={cls.title} onClose={onClose} variant="page" />
      <div className="px-4 pb-8 sm:px-0">
        <ClassDetailTitleBlock title={cls.title} badges={badges} />
        <div
          className={`mt-6 grid gap-8 ${
            showBookingSidebar ? 'lg:grid-cols-[minmax(0,1fr)_min(20rem,100%)]' : ''
          }`}
        >
          <div className="min-w-0 space-y-8">
            {factGrid}
            {liveStreamPanel}
            {descriptionSection}
            {showInstructorSection ? (
              <ClassDetailSection title={CLASS_DETAIL_LABELS.about}>
                <ClassDetailInstructorCard
                  href={`/instructor/${displayInstructor!.id}`}
                  name={displayInstructor!.displayName}
                  verified={displayInstructor!.verified}
                  rating={displayInstructor!.averageRating}
                  viewProfileLabel={BUTTON_LABELS.viewProfile}
                  showProfileLink={showInstructorProfileLink}
                  onProfileNavigate={cacheInstructorForProfile}
                />
              </ClassDetailSection>
            ) : null}
            {reviews.length > 0 ? (
              <ClassDetailReviews title={GENERAL_LABELS.reviews} reviews={reviews} />
            ) : null}
          </div>
          {showBookingSidebar && bookingPanel ? <div className="min-w-0">{bookingPanel}</div> : null}
        </div>
      </div>
    </div>
  );
}
