'use client';

import { NotificationsForm } from '@/components/profile/notifications-form';
import { PageHeader } from '@/components/layout/page-header';
import { SCREEN_TITLES } from '@/constants/labels';

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader title={SCREEN_TITLES.notifications} showBack />
      <NotificationsForm />
    </div>
  );
}
