'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Search,
  Heart,
  CreditCard,
  Bell,
  Dumbbell,
  Building2,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
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
import { useBookings } from '@/contexts/bookings-context';
import {
  ALERT_LABELS,
  AUTH_LABELS,
  DISCIPLINE_LABELS,
  DROPDOWN_LABELS,
  GENERAL_LABELS,
  PROFILE_MENU_LABELS,
  PROFILE_PAGE_LABELS,
  ROLE_TITLES,
  SCREEN_TITLES,
  TAB_LABELS,
} from '@/constants/labels';
import { disciplineSelectOptions, filterValidDisciplines } from '@/utils/disciplines';
import type { ImageUploadInput } from '@/utils/media';
import { useFeature } from '@/hooks/use-feature';

export default function AthleteProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showNotice } = useNoticeModal();
  const { bookings } = useBookings();
  const showPaymentMethods = useFeature('savedPaymentMethods');
  const showClubMembership = useFeature('clubMemberPortal');

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<ImageUploadInput>(user?.avatarUri ?? null);
  const [favoriteSports, setFavoriteSports] = useState<string[]>(
    filterValidDisciplines(user?.favoriteSports ?? []),
  );

  useEffect(() => {
    if (!isEditing) {
      setFirstName(user?.firstName ?? '');
      setLastName(user?.lastName ?? '');
      setEmail(user?.email ?? '');
      setAvatarUri(user?.avatarUri ?? null);
      setFavoriteSports(filterValidDisciplines(user?.favoriteSports ?? []));
    }
  }, [user, isEditing]);

  const userBookings = useMemo(
    () => bookings.filter((b) => b.userId === 'me' || b.userId === user?.id),
    [bookings, user?.id],
  );
  const upcomingCount = useMemo(
    () => userBookings.filter((b) => b.status === 'confirmed').length,
    [userBookings],
  );

  const handleSave = async () => {
    try {
      await updateProfile({
        firstName,
        lastName,
        email,
        avatarUri,
        favoriteSports: filterValidDisciplines(favoriteSports),
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
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
    setAvatarUri(user?.avatarUri ?? null);
    setFavoriteSports(filterValidDisciplines(user?.favoriteSports ?? []));
    setIsEditing(false);
  };

  const quickLinks = [
    { href: '/athlete/bookings', label: GENERAL_LABELS.myBookings, icon: Calendar, count: upcomingCount },
    { href: '/athlete/search', label: TAB_LABELS.athlete.search, icon: Search },
    { href: '/athlete/payment-history', label: GENERAL_LABELS.paymentHistory, icon: CreditCard },
    ...(showPaymentMethods
      ? [{ href: '/athlete/profile/payment-methods', label: PROFILE_MENU_LABELS.paymentMethods, icon: CreditCard }]
      : []),
    ...(showClubMembership
      ? [{ href: '/athlete/club-membership', label: SCREEN_TITLES.clubMembership, icon: Building2 }]
      : []),
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={PROFILE_PAGE_LABELS.title} showBack />

      <div className="overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
        <ProfileHero
          gradientClass={PROFILE_GRADIENTS.athlete}
          badgeLabel={ROLE_TITLES.athlete}
          name={`${user?.firstName} ${user?.lastName}`}
          email={user?.email ?? ''}
          avatarUri={isEditing ? avatarUri : user?.avatarUri}
          uploadRole="athlete"
          isEditing={isEditing}
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
        <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
          <ProfileStatCard icon={Calendar} label="Reservas activas" value={upcomingCount} accent="success" />
          <ProfileStatCard
            icon={Heart}
            label={PROFILE_PAGE_LABELS.favoriteSports}
            value={user?.favoriteSports.length ?? 0}
            accent="default"
          />
          <ProfileStatCard icon={Dumbbell} label="Total de reservas" value={userBookings.length} accent="warning" />
        </div>
      </div>

      <ProfileEditFields visible={isEditing}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label={AUTH_LABELS.firstName} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label={AUTH_LABELS.lastName} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Input
            label={AUTH_LABELS.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="md:col-span-2"
          />
        </div>
        <div className="mt-4">
          <MultiSelect
            label={PROFILE_MENU_LABELS.favoriteSports}
            value={favoriteSports}
            onChange={setFavoriteSports}
            options={disciplineSelectOptions()}
          />
        </div>
      </ProfileEditFields>

      <div className={toggleVisible(!isEditing, 'rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6')}>
        <h3 className="mb-4 text-lg font-bold">{PROFILE_PAGE_LABELS.favoriteSports}</h3>
        <p className="text-sm text-[var(--fn-text-muted)]">
          {user?.favoriteSports.length
            ? user.favoriteSports
                .map((d) => DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS] ?? d)
                .join(' · ')
            : GENERAL_LABELS.none}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileQuickLinks links={quickLinks} />
        <ProfileSettingsCard
          title={PROFILE_PAGE_LABELS.notificationsTitle}
          subtitle={PROFILE_PAGE_LABELS.notificationsSubtitle}
          href="/athlete/profile/notifications"
          buttonLabel={DROPDOWN_LABELS.settings}
          icon={Bell}
        />
      </div>

      <ProfilePasswordPanel />
    </div>
  );
}
