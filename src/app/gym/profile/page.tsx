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
  ProfileSettingsCard,
  ProfileEditFields,
  ProfilePasswordPanel,
  PROFILE_GRADIENTS,
  toggleVisible,
} from '@/components/profile/profile-page-ui';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useClasses } from '@/contexts/classes-context';
import { resolveInstitutionId } from '@/utils/gym-classes';
import { COUNTRY_OPTIONS, getCountryLabel, resolveCountryCode } from '@/constants/countries';
import {
  ALERT_LABELS,
  BADGE_LABELS,
  DROPDOWN_LABELS,
  INSTITUTION_PROFILE_LABELS,
  PROFILE_MENU_LABELS,
  PROFILE_PAGE_LABELS,
  PUBLIC_CLUB_LABELS,
} from '@/constants/labels';
import { formatOpeningHoursLine } from '@/utils/opening-hours';
import { institutionContactEmail } from '@/utils/institution-contact';
import type { OpeningHours } from '@/types/api';
import {
  Users,
  BookOpen,
  MapPin,
  Image,
  Bell,
  Building,
  BarChart3,
  Wallet,
  Briefcase,
  Clock,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import { defaultOpeningHours } from '@/utils/opening-hours';
import type { ImageUploadInput } from '@/utils/media';

export default function GymProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showNotice } = useNoticeModal();
  const { classes } = useClasses();
  const institutionProfile = user?.institutionProfile;
  const institutionId = resolveInstitutionId(user);

  const [isEditing, setIsEditing] = useState(false);
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
    }
  };

  const quickLinks = [
    { href: '/gym/dashboard', label: 'Panel de control', icon: BarChart3 },
    { href: '/gym/instructors', label: PROFILE_MENU_LABELS.instructors, icon: Users, count: instructorCount },
    { href: '/gym/jobs', label: 'Empleos', icon: Briefcase },
    { href: '/gym/classes', label: 'Clases grupales', icon: BookOpen, count: gymClasses.length },
    { href: '/gym/profile/payout-account', label: PROFILE_MENU_LABELS.payoutAccount, icon: Wallet },
    { href: '/gym/profile/plan', label: PROFILE_MENU_LABELS.planCommission, icon: Building },
  ];

  return (
    <div className="space-y-8">
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

      <div className="overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
        <ProfileHero
          gradientClass={PROFILE_GRADIENTS.institution}
          badgeLabel={
            institutionProfile?.verified ? BADGE_LABELS.verified : BADGE_LABELS.pending
          }
          badgeVariant={institutionProfile?.verified ? 'success' : 'warning'}
          name={institutionProfile?.name ?? 'Gimnasio'}
          email={institutionContactEmail(user?.email, institutionProfile?.contactEmail)}
          avatarUri={isEditing ? avatarUri : user?.avatarUri}
          uploadRole="institution"
          isEditing={isEditing}
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
        <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
          <ProfileStatCard icon={Users} label="Instructores" value={instructorCount} accent="success" />
          <ProfileStatCard icon={BookOpen} label="Clases activas" value={gymClasses.length} />
          <ProfileStatCard icon={MapPin} label="Ubicación" value={city || '—'} accent="warning" />
        </div>
      </div>

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
          placeholder="Presenta tu gimnasio y club: instalaciones, servicios y lo que os hace únicos…"
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

      <div className={toggleVisible(!isEditing, 'rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6')}>
        <h3 className="mb-2 text-lg font-bold">{INSTITUTION_PROFILE_LABELS.description}</h3>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--fn-text-secondary)]">
          {institutionProfile?.description || '—'}
        </p>
        <h3 className="mb-3 mt-6 text-lg font-bold">{PUBLIC_CLUB_LABELS.contact}</h3>
        <div className="space-y-3 text-sm text-[var(--fn-text-secondary)]">
          <p className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--fn-primary)]" />
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">
                {INSTITUTION_PROFILE_LABELS.address}
              </span>
              {[institutionProfile?.address, institutionProfile?.city, getCountryLabel(institutionProfile?.country)]
                .filter(Boolean)
                .join(', ') || '—'}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Phone size={16} className="mt-0.5 shrink-0 text-[var(--fn-primary)]" />
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">
                {INSTITUTION_PROFILE_LABELS.phone}
              </span>
              {institutionProfile?.contactPhone || '—'}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Mail size={16} className="mt-0.5 shrink-0 text-[var(--fn-primary)]" />
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">
                {INSTITUTION_PROFILE_LABELS.email}
              </span>
              {institutionContactEmail(user?.email, institutionProfile?.contactEmail) || '—'}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Globe size={16} className="mt-0.5 shrink-0 text-[var(--fn-primary)]" />
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">
                {INSTITUTION_PROFILE_LABELS.website}
              </span>
              {institutionProfile?.website || '—'}
            </span>
          </p>
        </div>
      </div>

      {!isEditing && institutionProfile?.openingHours ? (
        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Clock size={18} className="text-[var(--fn-primary)]" />
            {INSTITUTION_PROFILE_LABELS.openingHours}
          </h3>
          <ul className="space-y-1 text-sm text-[var(--fn-text-secondary)]">
            {formatOpeningHoursLine(institutionProfile.openingHours).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={toggleVisible(!isEditing, 'rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6')}>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <Image size={18} className="text-[var(--fn-primary)]" />
          {PROFILE_PAGE_LABELS.photoGallery}
        </h3>
        <PhotoGallery images={institutionProfile?.gallery ?? []} editable={false} compact />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileQuickLinks links={quickLinks} />
        <ProfileSettingsCard
          title={PROFILE_PAGE_LABELS.notificationsTitle}
          subtitle={PROFILE_PAGE_LABELS.notificationsSubtitle}
          href="/gym/profile/notifications"
          buttonLabel={DROPDOWN_LABELS.settings}
          icon={Bell}
        />
      </div>

      <ProfilePasswordPanel />
    </div>
  );
}
