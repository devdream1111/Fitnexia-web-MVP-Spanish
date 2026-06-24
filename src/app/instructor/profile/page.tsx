'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Award,
  Bell,
  Briefcase,
  Circle,
  CircleCheck,
  Clock,
  Star,
  Wallet,
} from 'lucide-react';
import type { Certification } from '@/types/api';

import { PageHeader } from '@/components/layout/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useClasses } from '@/contexts/classes-context';
import {
  ALERT_LABELS,
  AUTH_LABELS,
  BADGE_LABELS,
  DISCIPLINE_LABELS,
  DROPDOWN_LABELS,
  GENERAL_LABELS,
  PROFILE_MENU_LABELS,
  PROFILE_PAGE_LABELS,
  ROLE_TITLES,
  TAB_LABELS,
} from '@/constants/labels';
import { disciplineSelectOptions, filterValidDisciplines } from '@/utils/disciplines';
import type { ImageUploadInput } from '@/utils/media';

export default function InstructorProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showNotice } = useNoticeModal();
  const { getClassesByInstructor } = useClasses();
  const profile = user?.instructorProfile;

  const [isEditing, setIsEditing] = useState(false);
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
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState('');

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
      setNewCertName('');
      setNewCertIssuer('');
      setNewCertYear('');
    }
  }, [user, isEditing]);

  const instructorId = user?.instructorId ?? 'inst-1';
  const myClasses = useMemo(() => getClassesByInstructor(instructorId), [getClassesByInstructor, instructorId]);
  const upcomingClasses = useMemo(
    () => myClasses.filter((c) => new Date(c.startAt) > new Date()).length,
    [myClasses],
  );

  const handleSave = async () => {
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

  const handleCancel = () => {
    setDisplayName(profile?.displayName ?? '');
    setEmail(user?.email ?? '');
    setAvatarUri(user?.avatarUri ?? null);
    setHourlyRate(profile?.hourlyRate ?? '');
    setBio(profile?.bio ?? '');
    setDisciplines(filterValidDisciplines(profile?.disciplines ?? []));
    setCertifications(profile?.certifications ?? []);
    setAvailableNow(profile?.availableNow ?? false);
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

  const quickLinks = [
    { href: '/instructor/classes', label: 'Mis clases', icon: BookOpen, count: myClasses.length },
    { href: '/instructor/calendar', label: 'Calendario', icon: Calendar },
    { href: '/instructor/jobs', label: TAB_LABELS.instructor.jobs, icon: Briefcase },
    { href: '/instructor/earnings', label: 'Ingresos', icon: DollarSign },
    { href: '/instructor/profile/payout-account', label: PROFILE_MENU_LABELS.payoutAccount, icon: Wallet },
    { href: '/instructor/profile/availability', label: PROFILE_MENU_LABELS.scheduleAvailability, icon: Clock },
    { href: '/instructor/profile/plan', label: PROFILE_MENU_LABELS.planCommission, icon: Star },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={PROFILE_PAGE_LABELS.title} showBack />

      <div className="overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
        <ProfileHero
          gradientClass={PROFILE_GRADIENTS.instructor}
          badgeLabel={profile?.verified ? BADGE_LABELS.verified : ROLE_TITLES.instructor}
          badgeVariant={profile?.verified ? 'success' : 'default'}
          name={profile?.displayName ?? `${user?.firstName} ${user?.lastName}`}
          email={user?.email ?? ''}
          avatarUri={isEditing ? avatarUri : user?.avatarUri}
          uploadRole="instructor"
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
          <ProfileStatCard icon={BookOpen} label="Clases publicadas" value={myClasses.length} />
          <ProfileStatCard icon={Calendar} label="Próximas clases" value={upcomingClasses} accent="success" />
          <ProfileStatCard
            icon={Award}
            label={PROFILE_PAGE_LABELS.certifications}
            value={profile?.certifications.length ?? 0}
            accent="warning"
          />
        </div>
      </div>

      <div
        className={[
          'rounded-2xl border p-5',
          profile?.availableNow
            ? 'border-[var(--fn-success)] bg-[var(--fn-success-muted)]'
            : 'border-[var(--fn-border)] bg-[var(--fn-surface)]',
          toggleVisible(!isEditing),
        ].join(' ')}
      >
        <span className="flex items-center gap-3 text-lg font-semibold">
          <CircleCheck size={22} className={toggleVisible(!!profile?.availableNow, 'text-[var(--fn-success)]')} />
          <Circle size={22} className={toggleVisible(!profile?.availableNow, 'text-[var(--fn-text-muted)]')} />
          <span>{profile?.availableNow ? PROFILE_PAGE_LABELS.availableNow : PROFILE_PAGE_LABELS.notAvailable}</span>
          <span className={toggleVisible(!!profile?.availableNow)}>
            <Badge label={BADGE_LABELS.availableNow} variant="success" size="sm" />
          </span>
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

      <div className={toggleVisible(!isEditing, 'rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6')}>
        <p className="text-sm font-medium text-[var(--fn-text-muted)]">{PROFILE_PAGE_LABELS.bio}</p>
        <p className="mt-2 whitespace-pre-wrap text-[var(--fn-text)]">
          {profile?.bio?.trim() ? profile.bio : PROFILE_PAGE_LABELS.bioUnset}
        </p>
      </div>

      <div className={toggleVisible(!isEditing, 'rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6')}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fn-surface-muted)] text-[var(--fn-primary)]">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--fn-text-muted)]">{PROFILE_PAGE_LABELS.hourlyRate}</p>
            <p className="text-lg font-bold text-[var(--fn-text)]">
              {profile?.hourlyRate ? `${profile.hourlyRate} UYU` : PROFILE_PAGE_LABELS.hourlyRateUnset}
            </p>
          </div>
        </div>
      </div>

      <div className={toggleVisible(!isEditing, 'grid gap-6 lg:grid-cols-2')}>
        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
          <h3 className="mb-4 text-lg font-bold">{PROFILE_MENU_LABELS.disciplines}</h3>
          <p className="text-sm text-[var(--fn-text-muted)]">
            {profile?.disciplines.length
              ? profile.disciplines
                  .map((d) => DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS] ?? d)
                  .join(' · ')
              : GENERAL_LABELS.none}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
          <h3 className="mb-4 text-lg font-bold">{PROFILE_PAGE_LABELS.certifications}</h3>
          {profile?.certifications.length ? (
            <ul className="space-y-2">
              {profile.certifications.map((cert, idx) => (
                <li key={idx} className="rounded-xl border border-[var(--fn-border)] px-4 py-3 text-sm">
                  <span className="font-semibold">{cert.name}</span>
                  <span className="text-[var(--fn-text-muted)]">
                    {' '}
                    · {cert.issuer} · {cert.year}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--fn-text-muted)]">No hay certificaciones agregadas.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileQuickLinks links={quickLinks} />
        <ProfileSettingsCard
          title={PROFILE_PAGE_LABELS.notificationsTitle}
          subtitle={PROFILE_PAGE_LABELS.notificationsSubtitle}
          href="/instructor/profile/notifications"
          buttonLabel={DROPDOWN_LABELS.settings}
          icon={Bell}
        />
      </div>

      <ProfilePasswordPanel />
    </div>
  );
}
