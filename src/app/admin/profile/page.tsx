'use client';

import { useState } from 'react';
import { Shield, Bell, Users, Star, Building, Settings } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Input } from '@/components/ui/input';
import {
  ProfileHero,
  ProfileStatCard,
  ProfileQuickLinks,
  ProfileSettingsCard,
  ProfileEditFields,
  PROFILE_GRADIENTS,
} from '@/components/profile/profile-page-ui';
import { useAuth } from '@/contexts/auth-context';
import { useAdmin } from '@/contexts/admin-context';
import {
  ADMIN_LABELS,
  AUTH_LABELS,
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
    { href: '/admin/users', label: 'Gestionar usuarios', icon: Users, count: users.length },
    { href: '/admin/reviews', label: 'Moderar reseñas', icon: Star, count: reportedReviews.length },
    {
      href: '/admin/institutions',
      label: 'Verificar instituciones',
      icon: Building,
      count: institutions.filter((i) => !i.verified).length,
    },
    { href: '/admin/profile/notifications', label: DROPDOWN_LABELS.settings, icon: Settings },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={ADMIN_LABELS.profile.title} showBack />

      <div className="overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm">
        <ProfileHero
          gradientClass={PROFILE_GRADIENTS.admin}
          badgeLabel={ROLE_TITLES.admin}
          badgeVariant="warning"
          name={`${user?.firstName} ${user?.lastName}`}
          email={user?.email ?? ''}
          avatarUri={isEditing ? avatarUri : user?.avatarUri}
          uploadRole="athlete"
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onAvatarUpload={setAvatarUri}
        />
        <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
          <ProfileStatCard
            icon={Shield}
            label="Verificaciones pendientes"
            value={pendingVerifications.length}
            accent="warning"
          />
          <ProfileStatCard
            icon={Star}
            label="Reseñas reportadas"
            value={reportedReviews.length}
            accent="danger"
          />
          <ProfileStatCard icon={Users} label="Usuarios en plataforma" value={users.length} />
        </div>
      </div>

      <ProfileEditFields visible={isEditing} title={ADMIN_LABELS.profile.editProfile}>
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
      </ProfileEditFields>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileQuickLinks links={quickLinks} title={ADMIN_LABELS.profile.quickLinks} />
        <ProfileSettingsCard
          title={ADMIN_LABELS.notifications.title}
          subtitle={ADMIN_LABELS.notifications.subtitle}
          href="/admin/profile/notifications"
          buttonLabel={DROPDOWN_LABELS.settings}
          icon={Bell}
        />
      </div>
    </div>
  );
}
