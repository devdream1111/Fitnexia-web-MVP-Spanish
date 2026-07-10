'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Search,
  Heart,
  CreditCard,
  Dumbbell,
  Building2,
  Video,
  Sparkles,
  LifeBuoy,
  MapPin,
  MessageSquare,
  UsersRound,
  Signal,
} from 'lucide-react';

import { DisplayCurrencySelector } from '@/components/mock-v2v3/display-currency-selector';
import { PageHeader } from '@/components/layout/page-header';
import { IS_MOCK_V2V3_ENABLED } from '@/config/mock-v2v3';
import { useFeature } from '@/hooks/use-feature';
import { apiGetMyCredits } from '@/services/api';
import { mockCurrencyService } from '@/services/mock/currency.mock';
import { disciplineSelectOptions, filterValidDisciplines } from '@/utils/disciplines';
import type { ImageUploadInput } from '@/utils/media';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select } from '@/components/ui/select';
import type { CreditBalance } from '@/types/api';
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
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notifications-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useBookings } from '@/contexts/bookings-context';
import {
  ALERT_LABELS,
  AUTH_LABELS,
  ADVANCED_SEARCH_LABELS,
  DISCIPLINE_LABELS,
  GENERAL_LABELS,
  PROFILE_MENU_LABELS,
  PROFILE_PAGE_LABELS,
  ROLE_TITLES,
  TAB_LABELS,
  MOCK_V2V3_LABELS,
  SCREEN_TITLES,
} from '@/constants/labels';
import { CLASS_LEVELS } from '@/constants/fitnexia';
import { levelLabel } from '@/utils/advanced-search';
import {
  getAthleteTrainingLevel,
  setAthleteTrainingLevel,
} from '@/utils/athlete-preferences';
import type { ClassLevel } from '@/types/api';

export default function AthleteProfilePage() {
  const { user, updateProfile } = useAuth();
  const { unreadCount } = useNotifications();
  const { showNotice } = useNoticeModal();
  const { bookings } = useBookings();
  const showPaymentMethods = useFeature('savedPaymentMethods');
  const showClubMembership = useFeature('clubMemberPortal');
  const showAccountDeletion = useFeature('accountDeletion');
  const showRecordedLibrary = useFeature('recordedClasses');
  const showLoyaltyCredits = useFeature('loyaltyCredits');
  const showMultiCurrency = useFeature('multipleCurrencies');
  const showChat = useFeature('userInstructorChat');
  const [displayCurrency, setDisplayCurrency] = useState(() => mockCurrencyService.getDisplayCurrency());
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);

  useEffect(() => {
    if (!user || !showLoyaltyCredits) {
      setCreditBalance(null);
      return;
    }
    let cancelled = false;
    apiGetMyCredits()
      .then((balance) => {
        if (!cancelled) setCreditBalance(balance);
      })
      .catch(() => {
        if (!cancelled) setCreditBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [showLoyaltyCredits, user]);

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<ImageUploadInput>(user?.avatarUri ?? null);
  const [favoriteSports, setFavoriteSports] = useState<string[]>(
    filterValidDisciplines(user?.favoriteSports ?? []),
  );
  const [trainingLevel, setTrainingLevel] = useState<ClassLevel | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTrainingLevel(getAthleteTrainingLevel());
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setFirstName(user?.firstName ?? '');
      setLastName(user?.lastName ?? '');
      setEmail(user?.email ?? '');
      setAvatarUri(user?.avatarUri ?? null);
      setFavoriteSports(filterValidDisciplines(user?.favoriteSports ?? []));
      setTrainingLevel(getAthleteTrainingLevel());
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
    setSaving(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        email,
        avatarUri,
        favoriteSports: filterValidDisciplines(favoriteSports),
      });
      setAthleteTrainingLevel(trainingLevel);
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
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
    setAvatarUri(user?.avatarUri ?? null);
    setFavoriteSports(filterValidDisciplines(user?.favoriteSports ?? []));
    setTrainingLevel(getAthleteTrainingLevel());
    setIsEditing(false);
  };

  const quickLinkGroups: QuickLinkGroup[] = [
    {
      title: 'Actividad',
      links: [
        { href: '/athlete/bookings', label: GENERAL_LABELS.myBookings, icon: Calendar, count: upcomingCount },
        { href: '/athlete/search', label: TAB_LABELS.athlete.search, icon: Search },
        { href: '/athlete/payment-history', label: GENERAL_LABELS.paymentHistory, icon: CreditCard },
        ...(showRecordedLibrary
          ? [{ href: '/athlete/library', label: SCREEN_TITLES.recordedLibrary, icon: Video }]
          : []),
      ],
    },
    {
      title: 'Club y reservas',
      links: [
        ...(showClubMembership
          ? [{ href: '/athlete/club-membership', label: SCREEN_TITLES.clubMembership, icon: Building2 }]
          : []),
        { href: '/athlete/courts', label: MOCK_V2V3_LABELS.courtsBook, icon: MapPin },
        { href: '/athlete/court-bookings', label: MOCK_V2V3_LABELS.courtsMyBookings, icon: Calendar },
        { href: '/athlete/open-games', label: MOCK_V2V3_LABELS.openGamesTitle, icon: UsersRound },
        ...(showChat ? [{ href: '/athlete/messages', label: MOCK_V2V3_LABELS.chatTitle, icon: MessageSquare }] : []),
      ].filter(Boolean) as QuickLinkGroup['links'],
    },
    {
      title: 'Cuenta',
      links: [
        ...(showPaymentMethods
          ? [{ href: '/athlete/profile/payment-methods', label: PROFILE_MENU_LABELS.paymentMethods, icon: CreditCard }]
          : []),
        { href: '/athlete/profile/support', label: PROFILE_MENU_LABELS.helpSupport, icon: LifeBuoy },
      ].filter(Boolean) as QuickLinkGroup['links'],
    },
  ].filter((group) => group.links.length > 0);

  return (
    <div className={`${PROFILE_PAGE_GAP} pb-4`}>
      <PageHeader
        variant="premium"
        title={PROFILE_PAGE_LABELS.title}
        eyebrow={GENERAL_LABELS.athleteProfileEyebrow}
        subtitle={GENERAL_LABELS.athleteProfileSubtitle}
        showBack
      />

      <ProfileCardShell>
        <ProfileHero
          gradientClass={PROFILE_GRADIENTS.athlete}
          badgeLabel={ROLE_TITLES.athlete}
          name={`${user?.firstName} ${user?.lastName}`}
          email={user?.email ?? ''}
          avatarUri={isEditing ? avatarUri : user?.avatarUri}
          uploadRole="athlete"
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
          <ProfileStatCard icon={Calendar} label="Reservas activas" value={upcomingCount} accent="success" />
          <ProfileStatCard
            icon={Heart}
            label={PROFILE_PAGE_LABELS.favoriteSports}
            value={user?.favoriteSports.length ?? 0}
          />
          <ProfileStatCard icon={Dumbbell} label="Total reservas" value={userBookings.length} accent="warning" />
          <ProfileStatCard
            icon={Signal}
            label={PROFILE_PAGE_LABELS.trainingLevel}
            value={trainingLevel ? levelLabel(trainingLevel) : '—'}
          />
        </ProfileStatsGrid>
      </ProfileCardShell>

      <ProfileEditFields visible={isEditing}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label={AUTH_LABELS.firstName} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label={AUTH_LABELS.lastName} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Input
            label={AUTH_LABELS.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="md:col-span-2"
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <MultiSelect
            label={PROFILE_MENU_LABELS.favoriteSports}
            value={favoriteSports}
            onChange={setFavoriteSports}
            options={disciplineSelectOptions()}
          />
          <Select
            label={PROFILE_PAGE_LABELS.trainingLevel}
            value={trainingLevel}
            onChange={(value) => setTrainingLevel((value as ClassLevel) || '')}
            options={[
              { value: '', label: ADVANCED_SEARCH_LABELS.anyLevel },
              ...CLASS_LEVELS.map((item) => ({ value: item.id, label: item.label })),
            ]}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--fn-text-muted)]">{PROFILE_PAGE_LABELS.trainingLevelHint}</p>
      </ProfileEditFields>

      <div className={toggleVisible(!isEditing)}>
        <ProfileDetailsCard>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileDetailRow
              label={PROFILE_PAGE_LABELS.favoriteSports}
              value={
                user?.favoriteSports.length
                  ? user.favoriteSports
                      .map((d) => DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS] ?? d)
                      .join(' · ')
                  : GENERAL_LABELS.none
              }
            />
            <ProfileDetailRow
              label={PROFILE_PAGE_LABELS.trainingLevel}
              value={trainingLevel ? levelLabel(trainingLevel) : GENERAL_LABELS.none}
            />
          </div>
        </ProfileDetailsCard>
      </div>

      {creditBalance ? (
        <section className="rounded-3xl border border-[color-mix(in_srgb,var(--fn-primary)_22%,var(--fn-border))] bg-[color-mix(in_srgb,var(--fn-primary-muted)_40%,var(--fn-surface))] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles size={18} className="text-[var(--fn-primary)]" />
            <h3 className="text-sm font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.creditsBalance}</h3>
          </div>
          <p className="mt-1 text-xl font-extrabold text-[var(--fn-text)]">{creditBalance.balance}</p>
          <p className="mt-0.5 text-xs text-[var(--fn-text-muted)]">
            {MOCK_V2V3_LABELS.creditsHint(creditBalance.balance, creditBalance.creditsUntilReward)}
          </p>
        </section>
      ) : null}

      {showMultiCurrency && IS_MOCK_V2V3_ENABLED ? (
        <DisplayCurrencySelector
          value={displayCurrency}
          onChange={(currency) => setDisplayCurrency(mockCurrencyService.setDisplayCurrency(currency))}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ProfileQuickLinks groups={quickLinkGroups} />
        <ProfileNotificationsHub
          inboxHref="/athlete/notifications"
          preferencesHref="/athlete/profile/notifications"
          unreadCount={unreadCount}
        />
      </div>

      <ProfilePasswordPanel />

      {showAccountDeletion && user?.email ? <ProfileDangerZone email={user.email} /> : null}
    </div>
  );
}
