'use client';

import { useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Award,
  Bell,
  Circle,
  CircleCheck,
  Clock,
  Star,
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
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import {
  ALERT_LABELS,
  AUTH_LABELS,
  BADGE_LABELS,
  BUTTON_LABELS,
  DISCIPLINE_LABELS,
  DROPDOWN_LABELS,
  GENERAL_LABELS,
  PROFILE_MENU_LABELS,
  PROFILE_PAGE_LABELS,
  ROLE_TITLES,
} from '@/constants/labels';
import { DISCIPLINES } from '@/constants/fitnexia';

export default function InstructorProfilePage() {
  const { user, updateProfile } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const profile = user?.instructorProfile;

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUri ?? null);
  const [editingSports, setEditingSports] = useState(false);
  const [editingCerts, setEditingCerts] = useState(false);
  const [favoriteSports, setFavoriteSports] = useState<string[]>(user?.favoriteSports ?? []);
  const [certifications, setCertifications] = useState<Certification[]>(profile?.certifications ?? []);
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState('');

  const instructorId = user?.instructorId ?? 'inst-1';
  const myClasses = useMemo(() => getClassesByInstructor(instructorId), [getClassesByInstructor, instructorId]);
  const upcomingClasses = useMemo(
    () => myClasses.filter((c) => new Date(c.startAt) > new Date()).length,
    [myClasses],
  );

  const handleSave = () => {
    updateProfile({
      email,
      avatarUri,
      instructorProfile: { ...profile, displayName },
    });
    setIsEditing(false);
    alert(`${ALERT_LABELS.savedTitle}: ${PROFILE_PAGE_LABELS.saved}`);
  };

  const handleCancel = () => {
    setDisplayName(profile?.displayName ?? '');
    setEmail(user?.email ?? '');
    setAvatarUri(user?.avatarUri ?? null);
    setIsEditing(false);
  };

  const quickLinks = [
    { href: '/instructor/classes', label: 'Mis clases', icon: BookOpen, count: myClasses.length },
    { href: '/instructor/calendar', label: 'Calendario', icon: Calendar },
    { href: '/instructor/earnings', label: 'Ingresos', icon: DollarSign },
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

      <button
        type="button"
        onClick={() => updateProfile({ instructorProfile: { availableNow: !profile?.availableNow } })}
        className={[
          'w-full rounded-2xl border p-5 text-left transition hover:opacity-95',
          profile?.availableNow
            ? 'border-[var(--fn-success)] bg-[var(--fn-success-muted)]'
            : 'border-[var(--fn-border)] bg-[var(--fn-surface)]',
          isEditing ? 'hidden' : '',
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
      </button>

      <ProfileEditFields visible={isEditing}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre profesional" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input label={AUTH_LABELS.email} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </ProfileEditFields>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{PROFILE_MENU_LABELS.disciplines}</h3>
            <Button variant="ghost" size="sm" onClick={() => setEditingSports(!editingSports)}>
              {editingSports ? GENERAL_LABELS.cancel : BUTTON_LABELS.edit}
            </Button>
          </div>
          <div className={toggleVisible(editingSports, 'space-y-4')}>
            <MultiSelect
              label={PROFILE_MENU_LABELS.disciplines}
              value={favoriteSports}
              onChange={setFavoriteSports}
              options={DISCIPLINES.map((d) => ({
                value: d,
                label: DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS],
              }))}
            />
            <Button
              onClick={() => {
                updateProfile({ favoriteSports });
                setEditingSports(false);
              }}
            >
              {BUTTON_LABELS.save}
            </Button>
          </div>
          <p className={toggleVisible(!editingSports, 'text-sm text-[var(--fn-text-muted)]')}>
            {profile?.disciplines.length
              ? profile.disciplines.join(' · ')
              : user?.favoriteSports.join(' · ') || GENERAL_LABELS.none}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{PROFILE_PAGE_LABELS.certifications}</h3>
            <Button variant="ghost" size="sm" onClick={() => setEditingCerts(!editingCerts)}>
              {editingCerts ? GENERAL_LABELS.cancel : BUTTON_LABELS.edit}
            </Button>
          </div>
          <div className={toggleVisible(editingCerts, 'space-y-4')}>
            <div className="grid gap-3 md:grid-cols-3">
              <Input label="Certificación" value={newCertName} onChange={(e) => setNewCertName(e.target.value)} />
              <Input label="Emisor" value={newCertIssuer} onChange={(e) => setNewCertIssuer(e.target.value)} />
              <Input label="Año" type="number" value={newCertYear} onChange={(e) => setNewCertYear(e.target.value)} />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (newCertName && newCertIssuer && newCertYear) {
                  setCertifications([
                    ...certifications,
                    { name: newCertName, issuer: newCertIssuer, year: parseInt(newCertYear, 10) },
                  ]);
                  setNewCertName('');
                  setNewCertIssuer('');
                  setNewCertYear('');
                }
              }}
            >
              Agregar
            </Button>
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl bg-[var(--fn-surface-muted)] p-3">
                <span className="text-sm">
                  <strong>{cert.name}</strong> · {cert.issuer} · {cert.year}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}>
                  Eliminar
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                updateProfile({ instructorProfile: { certifications } });
                setEditingCerts(false);
              }}
            >
              {BUTTON_LABELS.save}
            </Button>
          </div>
          <p className={toggleVisible(!editingCerts && certifications.length === 0, 'text-sm text-[var(--fn-text-muted)]')}>
            No hay certificaciones agregadas.
          </p>
          <ul className={toggleVisible(!editingCerts && certifications.length > 0, 'space-y-2')}>
            {certifications.map((cert, idx) => (
              <li key={idx} className="rounded-xl border border-[var(--fn-border)] px-4 py-3 text-sm">
                <span className="font-semibold">{cert.name}</span>
                <span className="text-[var(--fn-text-muted)]"> · {cert.issuer} · {cert.year}</span>
              </li>
            ))}
          </ul>
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
