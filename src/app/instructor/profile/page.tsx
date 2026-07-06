'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Award,
  Briefcase,
  Circle,
  CircleCheck,
  Clock,
  LifeBuoy,
  LineChart,
  Star,
  Wallet,
} from 'lucide-react';
import type { Certification } from '@/types/api';

import { PageHeader } from '@/components/layout/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select } from '@/components/ui/select';
import {
  ProfileHero,
  ProfileStatCard,
  ProfileQuickLinks,
  ProfileNotificationsHub,
  ProfileEditFields,
  ProfilePasswordPanel,
  ProfileDetailsCard,
  ProfileDetailRow,
  ProfileStatsGrid,
  ProfileCardShell,
  PROFILE_GRADIENTS,
  PROFILE_PAGE_GAP,
  toggleVisible,
  type QuickLinkGroup,
} from '@/components/profile/profile-page-ui';
import { ProfileDangerZone } from '@/components/profile/profile-danger-zone';
import { InstructorReviewResponsesPanel } from '@/components/mock-v2v3/instructor-review-responses-panel';
import { InstructorReviewsSection } from '@/components/reviews/instructor-rating-display';
import { VerificationBanner } from '@/components/verification/verification-banner';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notifications-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useClasses } from '@/contexts/classes-context';
import { useReviews } from '@/contexts/reviews-context';
import {
  ALERT_LABELS,
  AUTH_LABELS,
  BADGE_LABELS,
  DISCIPLINE_LABELS,
  GENERAL_LABELS,
  PROFILE_MENU_LABELS,
  PROFILE_PAGE_LABELS,
  ROLE_TITLES,
  TAB_LABELS,
  MOCK_V2V3_LABELS,
  ADVANCED_SEARCH_LABELS,
} from '@/constants/labels';
import { INSTRUCTOR_GENDERS } from '@/constants/fitnexia';
import { disciplineSelectOptions, filterValidDisciplines } from '@/utils/disciplines';
import type { ImageUploadInput } from '@/utils/media';
import { useFeature } from '@/hooks/use-feature';
import { getProfileHeroBadge, resolveVerificationStatus } from '@/utils/verification';
import { apiGetInstructorMe } from '@/services/api';
import { instructorGenderLabel } from '@/utils/advanced-search';
import type { InstructorGender } from '@/types/api';

export default function InstructorProfilePage() {
  const { user, updateProfile } = useAuth();
  const { unreadCount } = useNotifications();
  const { showNotice } = useNoticeModal();
  const { getClassesByInstructor } = useClasses();
  const {
    getReviewsForInstructor,
    fetchInstructorReviews,
    getStaffReviewsForInstructor,
    fetchStaffReviews,
    loading: reviewsLoading,
  } = useReviews();
  const showProfileVerification = useFeature('profileVerification');
  const showAccountDeletion = useFeature('accountDeletion');
  const showAnalytics = useFeature('analyticsMetrics');
  const showPlatformSupport = useFeature('platformSupport');
  const profile = user?.instructorProfile;
  const verificationStatus = resolveVerificationStatus(profile);
  const heroBadge = getProfileHeroBadge(verificationStatus, ROLE_TITLES.instructor);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<ImageUploadInput>(user?.avatarUri ?? null);
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [hourlyRate, setHourlyRate] = useState(profile?.hourlyRate ?? '');
  const [disciplines, setDisciplines] = useState<string[]>(
    filterValidDisciplines(profile?.disciplines ?? []),
  );
  const [certifications, setCertifications] = useState<Certification[]>(profile?.certifications ?? []);
  const [availableNow, setAvailableNow] = useState(profile?.availableNow ?? false);
  const [gender, setGender] = useState<InstructorGender | ''>(profile?.gender ?? '');
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    if (!isEditing) {
      setDisplayName(user?.instructorProfile?.displayName ?? '');
      setEmail(user?.email ?? '');
      setAvatarUri(user?.avatarUri ?? null);
      setHourlyRate(user?.instructorProfile?.hourlyRate ?? '');
      setBio(user?.instructorProfile?.bio ?? '');
      setDisciplines(filterValidDisciplines(user?.instructorProfile?.disciplines ?? []));
      setCertifications(user?.instructorProfile?.certifications ?? []);
      setAvailableNow(user?.instructorProfile?.availableNow ?? false);
      setGender(user?.instructorProfile?.gender ?? '');
      setNewCertName('');
      setNewCertIssuer('');
      setNewCertYear('');
    }
  }, [user, isEditing]);

  const instructorId = user?.instructorId ?? '';

  useEffect(() => {
    if (!instructorId) return;
    let cancelled = false;

    apiGetInstructorMe()
      .then((data) => {
        if (!cancelled) {
          setAverageRating(data.averageRating);
          setReviewCount(data.reviewCount);
        }
      })
      .catch(() => {
        /* rating stats are optional on profile */
      });

    fetchInstructorReviews(instructorId);
    fetchStaffReviews(instructorId);

    return () => {
      cancelled = true;
    };
  }, [instructorId, fetchInstructorReviews, fetchStaffReviews]);

  const reviews = instructorId ? getReviewsForInstructor(instructorId) : [];
  const staffReviews = instructorId ? getStaffReviewsForInstructor(instructorId) : [];

  const myClasses = useMemo(() => getClassesByInstructor(instructorId), [getClassesByInstructor, instructorId]);
  const upcomingClasses = useMemo(
    () => myClasses.filter((c) => new Date(c.startAt) > new Date()).length,
    [myClasses],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        email,
        avatarUri,
        instructorProfile: {
          displayName,
          hourlyRate,
          bio,
          disciplines: filterValidDisciplines(disciplines),
          certifications,
          availableNow,
          gender: gender || undefined,
        },
      });
      setIsEditing(false);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: PROFILE_PAGE_LABELS.saved,
        variant: 'success',
      });
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: getAuthErrorMessage(error),
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(profile?.displayName ?? '');
    setEmail(user?.email ?? '');
    setAvatarUri(user?.avatarUri ?? null);
    setHourlyRate(profile?.hourlyRate ?? '');
    setBio(profile?.bio ?? '');
    setDisciplines(filterValidDisciplines(profile?.disciplines ?? []));
    setCertifications(profile?.certifications ?? []);
    setAvailableNow(profile?.availableNow ?? false);
    setGender(profile?.gender ?? '');
    setNewCertName('');
    setNewCertIssuer('');
    setNewCertYear('');
    setIsEditing(false);
  };

  const addCertification = () => {
    if (newCertName && newCertIssuer && newCertYear) {
      setCertifications([
        ...certifications,
        { name: newCertName, issuer: newCertIssuer, year: parseInt(newCertYear, 10) },
      ]);
      setNewCertName('');
      setNewCertIssuer('');
      setNewCertYear('');
    }
  };

  const quickLinkGroups: QuickLinkGroup[] = [
    {
      title: 'Clases',
      links: [
        { href: '/instructor/classes', label: 'Mis clases', icon: BookOpen, count: myClasses.length },
        { href: '/instructor/calendar', label: 'Calendario', icon: Calendar },
        { href: '/instructor/jobs', label: TAB_LABELS.instructor.jobs, icon: Briefcase },
      ],
    },
    {
      title: 'Finanzas',
      links: [
        { href: '/instructor/earnings', label: 'Ingresos', icon: DollarSign },
        { href: '/instructor/profile/payout-account', label: PROFILE_MENU_LABELS.payoutAccount, icon: Wallet },
        { href: '/instructor/profile/plan', label: PROFILE_MENU_LABELS.planCommission, icon: Star },
        { href: '/instructor/profile/availability', label: PROFILE_MENU_LABELS.scheduleAvailability, icon: Clock },
      ],
    },
    {
      title: 'Más',
      links: [
        ...(showAnalytics
          ? [{ href: '/instructor/analytics', label: MOCK_V2V3_LABELS.analyticsTitle, icon: LineChart }]
          : []),
        ...(showPlatformSupport
          ? [{ href: '/instructor/profile/support', label: PROFILE_MENU_LABELS.helpSupport, icon: LifeBuoy }]
          : []),
      ].filter(Boolean) as QuickLinkGroup['links'],
    },
  ].filter((group) => group.links.length > 0);

  return (
    <div className={PROFILE_PAGE_GAP}>
      <PageHeader title={PROFILE_PAGE_LABELS.title} showBack />

      {showProfileVerification ? (
        <VerificationBanner
          status={verificationStatus}
          verifyHref="/instructor/profile/verification"
        />
      ) : null}

      <ProfileCardShell>
        <ProfileHero
          gradientClass={PROFILE_GRADIENTS.instructor}
          badgeLabel={heroBadge?.label}
          badgeVariant={heroBadge?.variant}
          name={profile?.displayName ?? `${user?.firstName} ${user?.lastName}`}
          email={user?.email ?? ''}
          avatarUri={isEditing ? avatarUri : user?.avatarUri}
          uploadRole="instructor"
          isEditing={isEditing}
          saving={saving}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onAvatarUpload={setAvatarUri}
          onAvatarError={(message) =>
            showNotice({
              title: ALERT_LABELS.missingInfoTitle,
              message,
              variant: 'error',
            })
          }
        />
        <ProfileStatsGrid>
          <ProfileStatCard icon={BookOpen} label="Clases publicadas" value={myClasses.length} />
          <ProfileStatCard icon={Calendar} label="Próximas clases" value={upcomingClasses} accent="success" />
          <ProfileStatCard
            icon={Star}
            label={reviewCount > 0 ? `${reviewCount} ${GENERAL_LABELS.reviews.toLowerCase()}` : GENERAL_LABELS.reviews}
            value={reviewCount > 0 ? averageRating.toFixed(1) : '—'}
            accent="warning"
          />
          <ProfileStatCard
            icon={Award}
            label={PROFILE_PAGE_LABELS.certifications}
            value={profile?.certifications.length ?? 0}
          />
        </ProfileStatsGrid>
      </ProfileCardShell>

      <div
        className={[
          'flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 text-sm',
          profile?.availableNow
            ? 'border-[var(--fn-success)]/40 bg-[var(--fn-success-muted)]'
            : 'border-[var(--fn-border)] bg-[var(--fn-surface)]',
          toggleVisible(!isEditing),
        ].join(' ')}
      >
        <CircleCheck size={18} className={toggleVisible(!!profile?.availableNow, 'text-[var(--fn-success)]')} />
        <Circle size={18} className={toggleVisible(!profile?.availableNow, 'text-[var(--fn-text-muted)]')} />
        <span className="font-medium">
          {profile?.availableNow ? PROFILE_PAGE_LABELS.availableNow : PROFILE_PAGE_LABELS.notAvailable}
        </span>
        <span className={toggleVisible(!!profile?.availableNow)}>
          <Badge label={BADGE_LABELS.availableNow} variant="success" size="sm" />
        </span>
      </div>

      <ProfileEditFields visible={isEditing}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre profesional" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input label={AUTH_LABELS.email} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label={PROFILE_PAGE_LABELS.hourlyRate}
            type="number"
            min="0"
            step="0.01"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="25"
          />
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">{PROFILE_PAGE_LABELS.bio}</span>
          <textarea
            className="w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        <div className="mt-4">
          <MultiSelect
            label={PROFILE_MENU_LABELS.disciplines}
            value={disciplines}
            onChange={setDisciplines}
            options={disciplineSelectOptions()}
          />
        </div>
        <div className="mt-4">
          <Select
            label={ADVANCED_SEARCH_LABELS.instructorGender}
            value={gender}
            onChange={(value) => setGender(value as InstructorGender)}
            options={[
              { value: '', label: 'Sin especificar' },
              ...INSTRUCTOR_GENDERS.map((item) => ({ value: item.id, label: item.label })),
            ]}
          />
        </div>
        <div className="mt-6 space-y-4">
          <h4 className="text-base font-bold">{PROFILE_PAGE_LABELS.certifications}</h4>
          <div className="grid gap-3 md:grid-cols-3">
            <Input label="Certificación" value={newCertName} onChange={(e) => setNewCertName(e.target.value)} />
            <Input label="Emisor" value={newCertIssuer} onChange={(e) => setNewCertIssuer(e.target.value)} />
            <Input label="Año" type="number" value={newCertYear} onChange={(e) => setNewCertYear(e.target.value)} />
          </div>
          <Button variant="outline" onClick={addCertification}>
            Agregar
          </Button>
          {certifications.map((cert, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-xl bg-[var(--fn-surface-muted)] p-3">
              <span className="text-sm">
                <strong>{cert.name}</strong> · {cert.issuer} · {cert.year}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </div>
        <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--fn-border)] p-4">
          <input
            type="checkbox"
            checked={availableNow}
            onChange={(e) => setAvailableNow(e.target.checked)}
            className="h-5 w-5 rounded border-[var(--fn-border)]"
          />
          <span className="text-sm font-medium">
            {availableNow ? PROFILE_PAGE_LABELS.availableNow : PROFILE_PAGE_LABELS.notAvailable}
          </span>
        </label>
      </ProfileEditFields>

      <div className={toggleVisible(!isEditing)}>
        <ProfileDetailsCard title="Perfil profesional">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileDetailRow
              label={PROFILE_PAGE_LABELS.bio}
              value={profile?.bio?.trim() ? profile.bio : PROFILE_PAGE_LABELS.bioUnset}
              className="sm:col-span-2 lg:col-span-3"
            />
            <ProfileDetailRow
              label={PROFILE_PAGE_LABELS.hourlyRate}
              value={profile?.hourlyRate ? `${profile.hourlyRate} UYU` : PROFILE_PAGE_LABELS.hourlyRateUnset}
            />
            <ProfileDetailRow
              label={ADVANCED_SEARCH_LABELS.instructorGender}
              value={profile?.gender ? instructorGenderLabel(profile.gender) : GENERAL_LABELS.none}
            />
            <ProfileDetailRow
              label={PROFILE_MENU_LABELS.disciplines}
              value={
                profile?.disciplines.length
                  ? profile.disciplines
                      .map((d) => DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS] ?? d)
                      .join(' · ')
                  : GENERAL_LABELS.none
              }
            />
          </div>
          {profile?.certifications?.length ? (
            <ul className="mt-4 space-y-1.5 border-t border-[var(--fn-border)] pt-3">
              {profile.certifications.map((cert, idx) => (
                <li key={idx} className="text-sm text-[var(--fn-text-secondary)]">
                  <span className="font-semibold text-[var(--fn-text)]">{cert.name}</span>
                  <span className="text-[var(--fn-text-muted)]">
                    {' '}
                    · {cert.issuer} · {cert.year}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 border-t border-[var(--fn-border)] pt-3 text-xs text-[var(--fn-text-muted)]">
              {PROFILE_PAGE_LABELS.certifications}: {GENERAL_LABELS.none}
            </p>
          )}
        </ProfileDetailsCard>
      </div>

      {!isEditing ? (
        <InstructorReviewsSection
          title={GENERAL_LABELS.reviews}
          averageRating={averageRating}
          reviewCount={reviewCount}
          reviews={reviews}
          staffReviews={staffReviews}
          staffReviewsTitle="Reseñas del equipo"
          reviewsEmpty="Aún no hay reseñas de atletas."
          loading={reviewsLoading}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ProfileQuickLinks groups={quickLinkGroups} />
        <ProfileNotificationsHub
          inboxHref="/instructor/notifications"
          preferencesHref="/instructor/profile/notifications"
          unreadCount={unreadCount}
        />
      </div>

      <ProfilePasswordPanel />

      <InstructorReviewResponsesPanel />

      {showAccountDeletion && user?.email ? <ProfileDangerZone email={user.email} /> : null}
    </div>
  );
}
