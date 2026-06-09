'use client';

import { AdminNotificationsForm } from '@/components/profile/admin-notifications-form';
import { PageHeader } from '@/components/layout/page-header';
import { ADMIN_LABELS } from '@/constants/labels';

export default function AdminProfileNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title={ADMIN_LABELS.notifications.title} showBack backHref="/admin/profile" />
      <AdminNotificationsForm />
    </div>
  );
}
