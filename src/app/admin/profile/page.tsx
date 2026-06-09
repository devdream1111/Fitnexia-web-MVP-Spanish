'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Shield,
  Bell,
  Settings,
  Users,
  Star,
  Building,
  Mail,
  Calendar,
  Pencil,
  X,
} from 'lucide-react';

import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useAdmin } from '@/contexts/admin-context';
import {
  ADMIN_LABELS,
  AUTH_LABELS,
  BUTTON_LABELS,
  DROPDOWN_LABELS,
  ROLE_TITLES,
  ALERT_LABELS,
} from '@/constants/labels';

export default function AdminProfilePage() {
  const { user, updateProfile } = useAuth();
  const { pendingVerifications, reportedReviews, users, institutions } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUri ?? null);

  const handleSave = () => {
    updateProfile({ firstName, lastName, email, avatarUri });
    setIsEditing(false);
    alert(`${ALERT_LABELS.savedTitle}: ${ADMIN_LABELS.profile.saveProfile}`);
  };

  const handleCancel = () => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
    setAvatarUri(user?.avatarUri ?? null);
    setIsEditing(false);
  };

  const quickLinks = [
    {
      href: '/admin/users',
      label: 'Gestionar usuarios',
      icon: Users,
      count: users.length,
    },
    {
      href: '/admin/reviews',
      label: 'Moderar reseñas',
      icon: Star,
      count: reportedReviews.length,
    },
    {
      href: '/admin/institutions',
      label: 'Verificar instituciones',
      icon: Building,
      count: institutions.filter((i) => !i.verified).length,
    },
    {
      href: '/admin/profile/notifications',
      label: DROPDOWN_LABELS.settings,
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={ADMIN_LABELS.profile.title} showBack />

      <div className="overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
        <div className="relative bg-gradient-to-br from-[var(--fn-primary)] via-[#1d4ed8] to-[#312e81] px-6 py-10 md:px-10">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          </div>
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-center gap-5 md:flex-row md:items-end">
              <div className="rounded-full ring-4 ring-white/30 ring-offset-2 ring-offset-transparent">
                <ProfilePictureUpload
                  currentAvatar={isEditing ? avatarUri : user?.avatarUri}
                  onUpload={setAvatarUri}
                  role="athlete"
                  size="lg"
                  editable={isEditing}
                />
              </div>
              <div className="text-center md:text-left">
                <Badge label={ROLE_TITLES.admin} variant="warning" />
                <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="mt-1 flex items-center justify-center gap-2 text-sm text-white/80 md:justify-start">
                  <Mail size={14} />
                  {user?.email}
                </p>
                <p className="mt-2 flex items-center justify-center gap-2 text-xs text-white/70 md:justify-start">
                  <Calendar size={14} />
                  {ADMIN_LABELS.profile.memberSince} 2026
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-2 md:justify-end">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X size={16} />
                    {ADMIN_LABELS.profile.cancelEdit}
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    {BUTTON_LABELS.saveChanges}
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="!bg-white/15 !text-white hover:!bg-white/25"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={16} />
                  {ADMIN_LABELS.profile.editProfile}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
          <StatCard
            icon={Shield}
            label="Verificaciones pendientes"
            value={pendingVerifications.length}
            accent="warning"
          />
          <StatCard
            icon={Star}
            label="Reseñas reportadas"
            value={reportedReviews.length}
            accent="danger"
          />
          <StatCard icon={Users} label="Usuarios en plataforma" value={users.length} accent="default" />
        </div>
      </div>

      {isEditing && (
        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 md:p-8">
          <h3 className="mb-6 text-lg font-bold">{ADMIN_LABELS.profile.editProfile}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={AUTH_LABELS.firstName}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label={AUTH_LABELS.lastName}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              label={AUTH_LABELS.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="md:col-span-2"
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Bell size={20} className="text-[var(--fn-primary)]" />
            {ADMIN_LABELS.profile.quickLinks}
          </h3>
          <div className="space-y-2">
            {quickLinks.map((link) => (
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

        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
            <Settings size={20} className="text-[var(--fn-primary)]" />
            {ADMIN_LABELS.notifications.title}
          </h3>
          <p className="mb-4 text-sm text-[var(--fn-text-muted)]">
            {ADMIN_LABELS.notifications.subtitle}
          </p>
          <Link href="/admin/profile/notifications">
            <Button variant="outline" className="w-full">
              {DROPDOWN_LABELS.settings}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  accent: 'default' | 'warning' | 'danger';
}) {
  const accentClass =
    accent === 'warning'
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
