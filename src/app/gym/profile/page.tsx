'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { OpeningHoursEditor } from '@/components/gym/opening-hours-editor';
import { PageHeader } from '@/components/layout/page-header';
import { PhotoGallery } from '@/components/profile/PhotoGallery';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  ProfileHero,
  ProfileStatCard,
  ProfileQuickLinks,
  ProfileNotificationsHub,
  ProfileEditFields,
  ProfilePasswordPanel,
  ProfileDetailsCard,
  ProfileStatsGrid,
  ProfileCardShell,
  PROFILE_GRADIENTS,
  PROFILE_PAGE_GAP,
  toggleVisible,
  type QuickLinkGroup,
} from '@/components/profile/profile-page-ui';
import { ProfileDangerZone } from '@/components/profile/profile-danger-zone';
import { VerificationBanner } from '@/components/verification/verification-banner';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notifications-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useClasses } from '@/contexts/classes-context';
import { resolveInstitutionId } from '@/utils/gym-classes';
import { COUNTRY_OPTIONS, getCountryLabel, resolveCountryCode } from '@/constants/countries';
import {
  ALERT_LABELS,
  INSTITUTION_PROFILE_LABELS,
  PROFILE_MENU_LABELS,
  PROFILE_PAGE_LABELS,
  MOCK_V2V3_LABELS,
} from '@/constants/labels';
import { formatOpeningHoursLine } from '@/utils/opening-hours';
import { institutionContactEmail } from '@/utils/institution-contact';
import type { OpeningHours } from '@/types/api';
import {
  Users,
  BookOpen,
  MapPin,
  Image,
  Building,
  BarChart3,
  Wallet,
  Briefcase,
  Clock,
  Phone,
  Mail,
  Globe,
  LifeBuoy,
  LineChart,
  Palette,
  QrCode,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { defaultOpeningHours } from '@/utils/opening-hours';
import type { ImageUploadInput } from '@/utils/media';
import { useFeature } from '@/hooks/use-feature';
import { getProfileHeroBadge, resolveVerificationStatus } from '@/utils/verification';

export default function GymProfilePage() {
  const { user, updateProfile } = useAuth();
  const { unreadCount } = useNotifications();
  const { showNotice } = useNoticeModal();
  const showProfileVerification = useFeature('profileVerification');
  const showAccountDeletion = useFeature('accountDeletion');
  const showGymReports = useFeature('gymReportsBasic') || useFeature('gymReportsAdvanced');
  const showStaffSchedules = useFeature('staffSchedules');
  const showAttendance = useFeature('attendanceTracking');
  const showBranding = useFeature('clubBranding');
  const showActivities = useFeature('activityManagement');
  const showOnboarding = useFeature('enterpriseOnboarding');
  const showIntegrations = useFeature('enterpriseIntegrations');
  const showQrCheckIn = useFeature('qrAccessControl');
  const { classes } = useClasses();
  const institutionProfile = user?.institutionProfile;
  const institutionId = resolveInstitutionId(user);
  const verificationStatus = resolveVerificationStatus(institutionProfile);
  const heroBadge = getProfileHeroBadge(verificationStatus);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(institutionProfile?.name ?? '');
  const [email, setEmail] = useState(() =>
    institutionContactEmail(user?.email, institutionProfile?.contactEmail),
  );
  const [address, setAddress] = useState(institutionProfile?.address ?? '');
  const [city, setCity] = useState(institutionProfile?.city ?? '');
  const [country, setCountry] = useState(() =>
    resolveCountryCode(institutionProfile?.country),
  );
  const [description, setDescription] = useState(institutionProfile?.description ?? '');
  const [contactPhone, setContactPhone] = useState(institutionProfile?.contactPhone ?? '');
  const [website, setWebsite] = useState(institutionProfile?.website ?? '');
  const [openingHours, setOpeningHours] = useState<OpeningHours>(
    institutionProfile?.openingHours ?? defaultOpeningHours(),
  );
  const [avatarUri, setAvatarUri] = useState<ImageUploadInput>(user?.avatarUri ?? null);
  const [gallery, setGallery] = useState<string[]>(institutionProfile?.gallery ?? []);

  const resetFields = useCallback(() => {
    const ip = user?.institutionProfile;
    setName(ip?.name ?? '');
    setEmail(institutionContactEmail(user?.email, ip?.contactEmail));
    setAddress(ip?.address ?? '');
    setCity(ip?.city ?? '');
    setCountry(resolveCountryCode(ip?.country));
    setDescription(ip?.description ?? '');
    setContactPhone(ip?.contactPhone ?? '');
    setWebsite(ip?.website ?? '');
    setOpeningHours(ip?.openingHours ?? defaultOpeningHours());
    setAvatarUri(user?.avatarUri ?? null);
    setGallery(ip?.gallery ?? []);
  }, [user]);

  useEffect(() => {
    if (!isEditing) resetFields();
  }, [user, isEditing, resetFields]);

  const gymClasses = classes.filter((c) => c.institution?.id === institutionId);
  const instructorCount = institutionProfile?.instructorIds.length ?? 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        email,
        avatarUri,
        institutionProfile: {
          name,
          address,
          city,
          country,
          description,
          gallery,
          contactPhone,
          contactEmail: email.trim(),
          website,
          openingHours,
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

  const quickLinkGroups: QuickLinkGroup[] = [
    {
      title: 'Operaciones',
      links: [
        { href: '/gym/dashboard', label: 'Panel de control', icon: BarChart3 },
        { href: '/gym/classes', label: 'Clases grupales', icon: BookOpen, count: gymClasses.length },
        { href: '/gym/instructors', label: PROFILE_MENU_LABELS.instructors, icon: Users, count: instructorCount },
        { href: '/gym/jobs', label: 'Empleos', icon: Briefcase },
      ],
    },
    {
      title: 'Finanzas',
      links: [
        { href: '/gym/profile/payout-account', label: PROFILE_MENU_LABELS.payoutAccount, icon: Wallet },
        { href: '/gym/profile/plan', label: PROFILE_MENU_LABELS.planCommission, icon: Building },
        { href: '/gym/collections', label: MOCK_V2V3_LABELS.collectionsTitle, icon: DollarSign },
        ...(showGymReports
          ? [{ href: '/gym/reports', label: MOCK_V2V3_LABELS.gymReportsBasicTitle, icon: LineChart }]
          : []),
      ].filter(Boolean) as QuickLinkGroup['links'],
    },
    {
      title: 'Instalaciones',
      links: [
        { href: '/gym/courts', label: MOCK_V2V3_LABELS.courtsTitle, icon: MapPin },
        ...(showStaffSchedules
          ? [{ href: '/gym/staff/schedules', label: MOCK_V2V3_LABELS.staffSchedulesTitle, icon: Clock }]
          : []),
        ...(showAttendance
          ? [{ href: '/gym/attendance', label: MOCK_V2V3_LABELS.attendanceTitle, icon: Users }]
          : []),
        ...(showQrCheckIn ? [{ href: '/gym/check-in', label: MOCK_V2V3_LABELS.qrCheckInTitle, icon: QrCode }] : []),
      ].filter(Boolean) as QuickLinkGroup['links'],
    },
    {
      title: 'Más',
      links: [
        { href: '/gym/analytics', label: MOCK_V2V3_LABELS.analyticsTitle, icon: LineChart },
        { href: '/gym/profile/support', label: PROFILE_MENU_LABELS.helpSupport, icon: LifeBuoy },
        ...(showBranding
          ? [{ href: '/gym/profile/branding', label: MOCK_V2V3_LABELS.brandingTitle, icon: Palette }]
          : []),
        ...(showActivities
          ? [{ href: '/gym/activities', label: MOCK_V2V3_LABELS.activitiesTitle, icon: Sparkles }]
          : []),
        ...(showOnboarding
          ? [{ href: '/gym/onboarding', label: MOCK_V2V3_LABELS.enterpriseOnboardingTitle, icon: Building }]
          : []),
        ...(showIntegrations
          ? [{ href: '/gym/integrations', label: MOCK_V2V3_LABELS.enterpriseIntegrationsTitle, icon: Globe }]
          : []),
      ].filter(Boolean) as QuickLinkGroup['links'],
    },
  ].filter((group) => group.links.length > 0);

  return (
    <div className={PROFILE_PAGE_GAP}>
      <PageHeader title={PROFILE_PAGE_LABELS.title} showBack />

      {institutionId ? (
        <Link
          href={`/club/${institutionId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--fn-primary)] hover:opacity-80"
        >
          {INSTITUTION_PROFILE_LABELS.publicClubLink}
          <ExternalLink size={14} />
        </Link>
      ) : null}

      {showProfileVerification ? (
        <VerificationBanner
          status={verificationStatus}
          verifyHref="/gym/profile/verification"
        />
      ) : null}

      <ProfileCardShell>
        <ProfileHero
          gradientClass={PROFILE_GRADIENTS.institution}
          badgeLabel={heroBadge?.label}
          badgeVariant={heroBadge?.variant}
          name={institutionProfile?.name ?? 'Gimnasio'}
          email={institutionContactEmail(user?.email, institutionProfile?.contactEmail)}
          avatarUri={isEditing ? avatarUri : user?.avatarUri}
          uploadRole="institution"
          isEditing={isEditing}
          saving={saving}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={() => {
            resetFields();
            setIsEditing(false);
          }}
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
          <ProfileStatCard icon={Users} label="Instructores" value={instructorCount} accent="success" />
          <ProfileStatCard icon={BookOpen} label="Clases activas" value={gymClasses.length} />
          <ProfileStatCard icon={MapPin} label="Ubicación" value={city || '—'} accent="warning" />
        </ProfileStatsGrid>
      </ProfileCardShell>

      <ProfileEditFields visible={isEditing}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={INSTITUTION_PROFILE_LABELS.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label={INSTITUTION_PROFILE_LABELS.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label={INSTITUTION_PROFILE_LABELS.phone}
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
          <Input
            label={INSTITUTION_PROFILE_LABELS.website}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
          />
          <Input
            label={INSTITUTION_PROFILE_LABELS.address}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input
            label={INSTITUTION_PROFILE_LABELS.city}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Select
            label={INSTITUTION_PROFILE_LABELS.country}
            value={country}
            onChange={setCountry}
            options={[...COUNTRY_OPTIONS]}
            placeholder="Seleccionar país"
          />
        </div>
        <p className="-mt-2 text-xs text-[var(--fn-text-muted)]">{INSTITUTION_PROFILE_LABELS.emailHint}</p>
        <Textarea
          label={INSTITUTION_PROFILE_LABELS.description}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          placeholder="Presenta tu gimnasio/club: instalaciones, servicios y lo que os hace únicos…"
          className="min-h-[200px] resize-y text-base leading-relaxed"
        />
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-base font-bold">
            <Clock size={18} className="text-[var(--fn-primary)]" />
            {INSTITUTION_PROFILE_LABELS.openingHours}
          </h4>
          <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
        </div>
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-base font-bold">
            <Image size={18} className="text-[var(--fn-primary)]" />
            {PROFILE_PAGE_LABELS.photoGallery}
          </h4>
          <PhotoGallery
            images={gallery}
            editable
            compact
            onAddImage={(uri) => setGallery([...gallery, uri])}
            onRemoveImage={(idx) => setGallery(gallery.filter((_, i) => i !== idx))}
          />
        </div>
      </ProfileEditFields>

      <div className={toggleVisible(!isEditing)}>
        <ProfileDetailsCard title={INSTITUTION_PROFILE_LABELS.description}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--fn-text-secondary)]">
            {institutionProfile?.description || '—'}
          </p>
          <div className="mt-4 grid gap-3 border-t border-[var(--fn-border)] pt-3 sm:grid-cols-2">
            <p className="flex items-start gap-2 text-sm text-[var(--fn-text-secondary)]">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[var(--fn-primary)]" />
              <span>
                {[institutionProfile?.address, institutionProfile?.city, getCountryLabel(institutionProfile?.country)]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </span>
            </p>
            <p className="flex items-start gap-2 text-sm text-[var(--fn-text-secondary)]">
              <Phone size={15} className="mt-0.5 shrink-0 text-[var(--fn-primary)]" />
              <span>{institutionProfile?.contactPhone || '—'}</span>
            </p>
            <p className="flex items-start gap-2 text-sm text-[var(--fn-text-secondary)]">
              <Mail size={15} className="mt-0.5 shrink-0 text-[var(--fn-primary)]" />
              <span>{institutionContactEmail(user?.email, institutionProfile?.contactEmail) || '—'}</span>
            </p>
            <p className="flex items-start gap-2 text-sm text-[var(--fn-text-secondary)]">
              <Globe size={15} className="mt-0.5 shrink-0 text-[var(--fn-primary)]" />
              <span>{institutionProfile?.website || '—'}</span>
            </p>
          </div>
        </ProfileDetailsCard>
      </div>

      {!isEditing && institutionProfile?.openingHours ? (
        <ProfileDetailsCard title={INSTITUTION_PROFILE_LABELS.openingHours}>
          <ul className="grid gap-1 text-sm text-[var(--fn-text-secondary)] sm:grid-cols-2">
            {formatOpeningHoursLine(institutionProfile.openingHours).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </ProfileDetailsCard>
      ) : null}

      <div className={toggleVisible(!isEditing)}>
        <ProfileDetailsCard title={PROFILE_PAGE_LABELS.photoGallery}>
          <PhotoGallery images={institutionProfile?.gallery ?? []} editable={false} compact />
        </ProfileDetailsCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ProfileQuickLinks groups={quickLinkGroups} />
        <ProfileNotificationsHub
          inboxHref="/gym/notifications"
          preferencesHref="/gym/profile/notifications"
          unreadCount={unreadCount}
        />
      </div>

      <ProfilePasswordPanel />

      {showAccountDeletion && user?.email ? <ProfileDangerZone email={user.email} /> : null}
    </div>
  );
}
