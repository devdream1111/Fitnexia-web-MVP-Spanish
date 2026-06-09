'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Mail, Calendar, Pencil, X } from 'lucide-react';

import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { BUTTON_LABELS, GENERAL_LABELS, PROFILE_PAGE_LABELS } from '@/constants/labels';
import type { UserRole } from '@/types/api';

/** Keep nodes mounted; toggle visibility only — safe with browser translators + React. */
export function toggleVisible(visible: boolean, className = '') {
  return visible ? className : [className, 'hidden'].filter(Boolean).join(' ');
}

export type ProfileAccent = 'default' | 'success' | 'warning' | 'danger';

export type QuickLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
};

const PROFILE_HERO_GRADIENT = 'from-[var(--fn-primary)] via-[#1d4ed8] to-[#312e81]';

export const PROFILE_GRADIENTS = {
  athlete: PROFILE_HERO_GRADIENT,
  instructor: PROFILE_HERO_GRADIENT,
  institution: PROFILE_HERO_GRADIENT,
  admin: PROFILE_HERO_GRADIENT,
} as const;

export function ProfileHero({
  gradientClass,
  badgeLabel,
  badgeVariant = 'success',
  name,
  email,
  memberSince = '2026',
  avatarUri,
  uploadRole,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onAvatarUpload,
}: {
  gradientClass: string;
  badgeLabel: string;
  badgeVariant?: 'default' | 'success' | 'warning';
  name: string;
  email: string;
  memberSince?: string;
  avatarUri?: string | null;
  uploadRole: Exclude<UserRole, 'admin'>;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAvatarUpload: (uri: string) => void;
}) {
  return (
    <div className={`relative bg-gradient-to-br ${gradientClass} px-6 py-10 md:px-10`}>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
      </div>
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-end">
          <div className="rounded-full ring-4 ring-white/30 ring-offset-2 ring-offset-transparent">
            <ProfilePictureUpload
              currentAvatar={avatarUri}
              onUpload={onAvatarUpload}
              role={uploadRole}
              size="lg"
              editable={isEditing}
            />
          </div>
          <div className="text-center md:text-left">
            <Badge label={badgeLabel} variant={badgeVariant} />
            <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">{name}</h2>
            <p className="mt-1 flex items-center justify-center gap-2 text-sm text-white/80 md:justify-start">
              <Mail size={14} />
              {email}
            </p>
            <p className="mt-2 flex items-center justify-center gap-2 text-xs text-white/70 md:justify-start">
              <Calendar size={14} />
              {PROFILE_PAGE_LABELS.memberSince} {memberSince}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-2 md:justify-end">
          <div className={toggleVisible(!isEditing, 'contents')}>
            <Button
              variant="secondary"
              size="sm"
              className="!bg-white/15 !text-white hover:!bg-white/25"
              onClick={onEdit}
            >
              <Pencil size={16} aria-hidden />
              <span>{PROFILE_PAGE_LABELS.editProfile}</span>
            </Button>
          </div>
          <div className={toggleVisible(isEditing, 'flex gap-2')}>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X size={16} aria-hidden />
              <span>{PROFILE_PAGE_LABELS.cancelEdit}</span>
            </Button>
            <Button size="sm" onClick={onSave}>
              {BUTTON_LABELS.saveChanges}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileStatCard({
  icon: Icon,
  label,
  value,
  accent = 'default',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: ProfileAccent;
}) {
  const accentClass =
    accent === 'success'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
      : accent === 'warning'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
        : accent === 'danger'
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200'
          : 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]';

  return (
    <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accentClass}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-extrabold text-[var(--fn-text)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--fn-text-muted)]">{label}</p>
    </div>
  );
}

export function ProfileQuickLinks({ links, title }: { links: QuickLink[]; title?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
      <h3 className="mb-4 text-lg font-bold">{title ?? PROFILE_PAGE_LABELS.quickLinks}</h3>
      <div className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between rounded-xl border border-[var(--fn-border)] px-4 py-3 transition hover:border-[var(--fn-primary)] hover:bg-[var(--fn-primary-muted)]/40"
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <link.icon size={18} className="text-[var(--fn-primary)]" />
              {link.label}
            </span>
            {link.count != null && link.count > 0 && (
              <Badge label={String(link.count)} variant="warning" size="sm" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ProfileSettingsCard({
  title,
  subtitle,
  href,
  buttonLabel,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  href: string;
  buttonLabel: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
      <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
        <Icon size={20} className="text-[var(--fn-primary)]" />
        {title}
      </h3>
      <p className="mb-4 text-sm text-[var(--fn-text-muted)]">{subtitle}</p>
      <Link href={href}>
        <Button variant="outline" className="w-full">
          {buttonLabel}
        </Button>
      </Link>
    </div>
  );
}

export function ProfileEditFields({
  children,
  title,
  visible = true,
}: {
  children: React.ReactNode;
  title?: string;
  visible?: boolean;
}) {
  return (
    <div
      className={toggleVisible(
        visible,
        'rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 md:p-8',
      )}
      aria-hidden={!visible}
    >
      <h3 className="mb-6 text-lg font-bold">{title ?? PROFILE_PAGE_LABELS.editProfile}</h3>
      {children}
    </div>
  );
}

export function ProfilePasswordPanel() {
  const { changePassword } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) {
      setPasswordError(GENERAL_LABELS.newPasswordsDoNotMatch);
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(GENERAL_LABELS.passwordChangedSuccessfully);
      setIsChanging(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : GENERAL_LABELS.failedToChangePassword);
    }
  };

  const handleCancel = () => {
    setIsChanging(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  return (
    <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
      <h3 className="mb-4 text-lg font-bold">{PROFILE_PAGE_LABELS.accountSecurity}</h3>
      <div className={toggleVisible(!isChanging)}>
        <Button variant="outline" onClick={() => setIsChanging(true)}>
          {GENERAL_LABELS.changePassword}
        </Button>
      </div>
      <div className={toggleVisible(isChanging, 'space-y-4')}>
        <Input
          label={GENERAL_LABELS.currentPassword}
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label={GENERAL_LABELS.newPassword}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label={GENERAL_LABELS.confirmNewPassword}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <p className={toggleVisible(!!passwordError, 'text-sm text-[var(--fn-error)]')}>
          {passwordError || '\u00a0'}
        </p>
        <p className={toggleVisible(!!passwordSuccess, 'text-sm text-[var(--fn-success)]')}>
          {passwordSuccess || '\u00a0'}
        </p>
        <div className="flex gap-3">
          <Button title={GENERAL_LABELS.cancel} variant="outline" onClick={handleCancel} />
          <Button title={GENERAL_LABELS.changePassword} onClick={handleChangePassword} />
        </div>
      </div>
    </div>
  );
}
