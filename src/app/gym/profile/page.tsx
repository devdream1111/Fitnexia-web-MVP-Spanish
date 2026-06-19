'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  BookOpen,
  MapPin,
  Image,
  Bell,
  Building,
  BarChart3,
  Wallet,
} from 'lucide-react';

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
  AUTH_LABELS,
  BADGE_LABELS,
  DROPDOWN_LABELS,
  PROFILE_MENU_LABELS,
  PROFILE_PAGE_LABELS,
  ADMIN_LABELS,
} from '@/constants/labels';

export default function GymProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showNotice } = useNoticeModal();
  const { classes } = useClasses();
  const institutionProfile = user?.institutionProfile;
  const institutionId = resolveInstitutionId(user);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(institutionProfile?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [address, setAddress] = useState(institutionProfile?.address ?? '');
  const [city, setCity] = useState(institutionProfile?.city ?? '');
  const [country, setCountry] = useState(() =>
    resolveCountryCode(institutionProfile?.country),
  );
  const [description, setDescription] = useState(institutionProfile?.description ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUri ?? null);
  const [gallery, setGallery] = useState<string[]>(institutionProfile?.gallery ?? []);

  useEffect(() => {
    if (!isEditing) {
      setName(user?.institutionProfile?.name ?? '');
      setEmail(user?.email ?? '');
      setAddress(user?.institutionProfile?.address ?? '');
      setCity(user?.institutionProfile?.city ?? '');
      setCountry(resolveCountryCode(user?.institutionProfile?.country));
      setDescription(user?.institutionProfile?.description ?? '');
      setAvatarUri(user?.avatarUri ?? null);
      setGallery(user?.institutionProfile?.gallery ?? []);
    }
  }, [user, isEditing]);

  const gymClasses = useMemo(
    () => classes.filter((c) => c.institution?.id === institutionId),
    [classes, institutionId],
  );
  const instructorCount = institutionProfile?.instructorIds.length ?? 0;

  const handleSave = async () => {
    try {
      await updateProfile({
        email,
        avatarUri,
        institutionProfile: { name, address, city, country, description, gallery },
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

  const handleCancel = () => {
    setName(institutionProfile?.name ?? '');
    setEmail(user?.email ?? '');
    setAddress(institutionProfile?.address ?? '');
    setCity(institutionProfile?.city ?? '');
    setCountry(resolveCountryCode(institutionProfile?.country));
    setDescription(institutionProfile?.description ?? '');
    setAvatarUri(user?.avatarUri ?? null);
    setGallery(institutionProfile?.gallery ?? []);
    setIsEditing(false);
  };

  const quickLinks = [
    { href: '/gym/dashboard', label: 'Panel de control', icon: BarChart3 },
    { href: '/gym/instructors', label: PROFILE_MENU_LABELS.instructors, icon: Users, count: instructorCount },
    { href: '/gym/classes', label: 'Clases grupales', icon: BookOpen, count: gymClasses.length },
    { href: '/gym/profile/payout-account', label: PROFILE_MENU_LABELS.payoutAccount, icon: Wallet },
    { href: '/gym/profile/plan', label: PROFILE_MENU_LABELS.planCommission, icon: Building },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={PROFILE_PAGE_LABELS.title} showBack />

      <div className="overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
        <ProfileHero
          gradientClass={PROFILE_GRADIENTS.institution}
          badgeLabel={
            institutionProfile?.verified
              ? BADGE_LABELS.verified
              : ADMIN_LABELS.verification.pending
          }
          badgeVariant={institutionProfile?.verified ? 'success' : 'warning'}
          name={institutionProfile?.name ?? 'Gimnasio'}
          email={user?.email ?? ''}
          avatarUri={isEditing ? avatarUri : user?.avatarUri}
          uploadRole="institution"
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onAvatarUpload={setAvatarUri}
        />
        <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
          <ProfileStatCard icon={Users} label="Instructores" value={instructorCount} accent="success" />
          <ProfileStatCard icon={BookOpen} label="Clases activas" value={gymClasses.length} />
          <ProfileStatCard
            icon={MapPin}
            label="Ubicación"
            value={city || '—'}
            accent="warning"
          />
        </div>
      </div>

      <ProfileEditFields visible={isEditing}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre del gimnasio" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={AUTH_LABELS.email} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} />
          <Select
            label="País"
            value={country}
            onChange={setCountry}
            options={[...COUNTRY_OPTIONS]}
            placeholder="Seleccionar país"
          />
        </div>
        <Textarea
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={12}
          placeholder="Presenta tu gimnasio: instalaciones, servicios, horarios y lo que os hace únicos…"
          className="min-h-[280px] resize-y text-base leading-relaxed"
        />
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

      <div
        className={toggleVisible(
          !isEditing,
          'rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6',
        )}
      >
        <h3 className="mb-2 text-lg font-bold">Sobre el gimnasio</h3>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--fn-text-secondary)]">
          {institutionProfile?.description || '—'}
        </p>
        <p
          className={toggleVisible(
            !!(institutionProfile?.address || institutionProfile?.city),
            'mt-3 flex items-center gap-2 text-sm text-[var(--fn-text-secondary)]',
          )}
        >
          <MapPin size={16} className="text-[var(--fn-primary)]" />
          {[institutionProfile?.address, institutionProfile?.city, getCountryLabel(institutionProfile?.country)]
            .filter(Boolean)
            .join(', ')}
        </p>
      </div>

      <div
        className={toggleVisible(
          !isEditing,
          'rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6',
        )}
      >
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
