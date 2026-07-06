'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Bell, ChevronRight, Mail, Calendar, Pencil, X } from 'lucide-react';

import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { BUTTON_LABELS, NOTIFICATIONS_LABELS, PROFILE_PAGE_LABELS } from '@/constants/labels';
import type { UserRole } from '@/types/api';
import type { ImageUploadInput } from '@/utils/media';

/** Keep nodes mounted; toggle visibility only — safe with browser translators + React. */
export function toggleVisible(visible: boolean, className = '') {
  return visible ? className : [className, 'hidden'].filter(Boolean).join(' ');
}

export const PROFILE_PAGE_GAP = 'space-y-5';

export type ProfileAccent = 'default' | 'success' | 'warning' | 'danger';

export type QuickLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
};

export type QuickLinkGroup = {
  title: string;
  links: QuickLink[];
};

const PROFILE_HERO_GRADIENT = 'from-[var(--fn-primary)] via-[#1d4ed8] to-[#312e81]';

export const PROFILE_GRADIENTS = {
  athlete: PROFILE_HERO_GRADIENT,
  instructor: PROFILE_HERO_GRADIENT,
  institution: PROFILE_HERO_GRADIENT,
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
  saving = false,
  onEdit,
  onSave,
  onCancel,
  onAvatarUpload,
  onAvatarError,
}: {
  gradientClass: string;
  badgeLabel?: string;
  badgeVariant?: 'default' | 'success' | 'warning';
  name: string;
  email: string;
  memberSince?: string;
  avatarUri?: ImageUploadInput;
  uploadRole: UserRole;
  isEditing: boolean;
  saving?: boolean;
  onEdit: () => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  onAvatarUpload: (value: string | File) => void;
  onAvatarError?: (message: string) => void;
}) {
  return (
    <>
      {saving ? <FullScreenLoader message={PROFILE_PAGE_LABELS.savingProfile} /> : null}
    <div className={`relative bg-gradient-to-br ${gradientClass} px-4 py-5 sm:px-6`}>
      <div className="absolute inset-0 opacity-15" aria-hidden="true">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
      </div>
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="rounded-full ring-2 ring-white/25">
            <ProfilePictureUpload
              currentAvatar={avatarUri}
              onUpload={onAvatarUpload}
              onError={onAvatarError}
              role={uploadRole}
              size="md"
              editable={isEditing}
            />
          </div>
          <div className="min-w-0">
            {badgeLabel ? <Badge label={badgeLabel} variant={badgeVariant} size="sm" /> : null}
            <h2 className={`truncate text-xl font-bold text-white sm:text-2xl ${badgeLabel ? 'mt-1.5' : ''}`}>
              {name}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/80">
              <Mail size={12} className="shrink-0" />
              {email}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/65">
              <Calendar size={11} />
              {PROFILE_PAGE_LABELS.memberSince} {memberSince}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-2">
          <div className={toggleVisible(!isEditing, 'contents')}>
            <Button
              variant="secondary"
              size="sm"
              className="!h-8 !bg-white/15 !px-3 !text-xs !text-white hover:!bg-white/25"
              onClick={onEdit}
              disabled={saving}
            >
              <Pencil size={14} aria-hidden />
              <span>{PROFILE_PAGE_LABELS.editProfile}</span>
            </Button>
          </div>
          <div className={toggleVisible(isEditing, 'flex gap-2')}>
            <Button variant="outline" size="sm" className="!h-8 !text-xs" onClick={onCancel} disabled={saving}>
              <X size={14} aria-hidden />
              <span>{PROFILE_PAGE_LABELS.cancelEdit}</span>
            </Button>
            <Button size="sm" className="!h-8 !text-xs" onClick={onSave} disabled={saving}>
              {BUTTON_LABELS.saveChanges}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
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
    <div className="flex items-center gap-3 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-3 py-2.5">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accentClass}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none tabular-nums text-[var(--fn-text)]">{value}</p>
        <p className="mt-0.5 truncate text-[11px] text-[var(--fn-text-muted)]">{label}</p>
      </div>
    </div>
  );
}

function QuickLinkTile({ link }: { link: QuickLink }) {
  return (
    <Link
      href={link.href}
      className="group flex min-h-[3.25rem] items-center gap-2.5 rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 px-3 py-2 transition hover:border-[var(--fn-primary)]/40 hover:bg-[var(--fn-primary-muted)]/25"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--fn-surface)] text-[var(--fn-primary)] shadow-sm">
        <link.icon size={16} />
      </span>
      <span className="min-w-0 flex-1 text-xs font-semibold leading-tight text-[var(--fn-text)]">
        {link.label}
      </span>
      {link.count != null && link.count > 0 ? (
        <Badge label={String(link.count)} variant="warning" size="sm" />
      ) : null}
    </Link>
  );
}

export function ProfileQuickLinks({
  links,
  groups,
  title,
}: {
  links?: QuickLink[];
  groups?: QuickLinkGroup[];
  title?: string;
}) {
  const resolvedGroups: QuickLinkGroup[] =
    groups ??
    (links?.length
      ? [{ title: title ?? PROFILE_PAGE_LABELS.quickLinks, links }]
      : []);

  if (resolvedGroups.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
      <h3 className="mb-3 text-sm font-bold text-[var(--fn-text)]">
        {title ?? PROFILE_PAGE_LABELS.quickLinks}
      </h3>
      <div className="space-y-4">
        {resolvedGroups.map((group) => (
          <div key={group.title}>
            {resolvedGroups.length > 1 ? (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">
                {group.title}
              </p>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
              {group.links.map((link) => (
                <QuickLinkTile key={link.href} link={link} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileNotificationsHub({
  inboxHref,
  preferencesHref,
  unreadCount = 0,
}: {
  inboxHref: string;
  preferencesHref: string;
  unreadCount?: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)]">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--fn-primary)]/10 blur-2xl"
        aria-hidden
      />
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
            <Bell size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--fn-text)]">
                {PROFILE_PAGE_LABELS.notificationsTitle}
              </h3>
              {unreadCount > 0 ? (
                <Badge label={NOTIFICATIONS_LABELS.unreadCount(unreadCount)} variant="warning" size="sm" />
              ) : null}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--fn-text-muted)]">
              {NOTIFICATIONS_LABELS.hubSubtitle}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link
            href={inboxHref}
            className="group flex items-center justify-between gap-2 rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-3 py-2.5 transition hover:border-[var(--fn-primary)]/35 hover:bg-[var(--fn-primary-muted)]/20"
          >
            <span className="text-xs font-semibold text-[var(--fn-text)]">
              {NOTIFICATIONS_LABELS.openInbox}
            </span>
            <ChevronRight
              size={16}
              className="shrink-0 text-[var(--fn-text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--fn-primary)]"
            />
          </Link>
          <Link
            href={preferencesHref}
            className="group flex items-center justify-between gap-2 rounded-lg border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-3 py-2.5 transition hover:border-[var(--fn-primary)]/35 hover:bg-[var(--fn-primary-muted)]/20"
          >
            <span className="text-xs font-semibold text-[var(--fn-text)]">
              {NOTIFICATIONS_LABELS.managePreferences}
            </span>
            <ChevronRight
              size={16}
              className="shrink-0 text-[var(--fn-text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--fn-primary)]"
            />
          </Link>
        </div>
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
    <div className="flex flex-col justify-between rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Icon size={16} className="text-[var(--fn-primary)]" />
          {title}
        </h3>
        <p className="mt-1 text-xs text-[var(--fn-text-muted)]">{subtitle}</p>
      </div>
      <Link href={href} className="mt-3 shrink-0 sm:mt-0">
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
        'rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 sm:p-5',
      )}
      aria-hidden={!visible}
    >
      <h3 className="mb-4 text-sm font-bold">{title ?? PROFILE_PAGE_LABELS.editProfile}</h3>
      {children}
    </div>
  );
}

export function ProfileDetailsCard({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 ${className}`}>
      {title ? <h3 className="mb-3 text-sm font-bold text-[var(--fn-text)]">{title}</h3> : null}
      {children}
    </div>
  );
}

export function ProfileDetailRow({
  label,
  value,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">{label}</p>
      <div className="mt-0.5 text-sm text-[var(--fn-text)]">{value}</div>
    </div>
  );
}

export function ProfilePasswordPanel() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-bold">{PROFILE_PAGE_LABELS.accountSecurity}</h3>
        <p className="mt-1 max-w-xl text-xs text-[var(--fn-text-muted)]">
          {PROFILE_PAGE_LABELS.passwordChangeViaEmail}
        </p>
      </div>
      <Link href="/auth/forgot-password" className="shrink-0">
        <Button variant="outline" size="sm" title={PROFILE_PAGE_LABELS.resetPasswordLink} />
      </Link>
    </div>
  );
}

export function ProfileStatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-t border-[var(--fn-border)] bg-[var(--fn-surface)] p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}

export function ProfileCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
      {children}
    </div>
  );
}
