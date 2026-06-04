'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { DarkModeToggle } from '@/components/profile/dark-mode-toggle';
import { ProfileMenuItem } from '@/components/profile/menu-item';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { BUTTON_LABELS, PROFILE_MENU_LABELS, SCREEN_TITLES } from '@/constants/labels';

export default function GymProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h1 className="text-3xl font-extrabold">{SCREEN_TITLES.gymProfile}</h1>
        <Link href="/gym/profile/edit" className="font-semibold text-[var(--fn-primary)]">
          {BUTTON_LABELS.edit}
        </Link>
      </div>
      <p className="mb-6 text-xl font-bold">{user?.institutionProfile?.name}</p>
      <DarkModeToggle />
      <ProfileMenuItem href="/gym/profile/gallery" label={PROFILE_MENU_LABELS.photoGallery} />
      <ProfileMenuItem href="/gym/profile/instructors" label={PROFILE_MENU_LABELS.instructors} />
      <ProfileMenuItem href="/gym/profile/notifications" label={PROFILE_MENU_LABELS.notifications} />
      <ProfileMenuItem href="/gym/profile/plan" label={PROFILE_MENU_LABELS.planCommission} />
      <Button
        title={BUTTON_LABELS.signOut}
        variant="outline"
        className="mt-6"
        onClick={() => {
          if (confirm('Sign out?')) {
            logout();
            router.replace('/auth/login');
          }
        }}
      />
    </div>
  );
}
