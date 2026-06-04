'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { DarkModeToggle } from '@/components/profile/dark-mode-toggle';
import { ProfileMenuItem } from '@/components/profile/menu-item';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { BUTTON_LABELS, PROFILE_MENU_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function AthleteProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const showPaymentMethods = useFeature('savedPaymentMethods');
  const showSupport = useFeature('platformSupport');

  const signOut = () => {
    if (confirm('Sign out?')) {
      logout();
      router.replace('/auth/login');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">{SCREEN_TITLES.profile}</h1>
        <Link href="/athlete/profile/edit" className="font-semibold text-[var(--fn-primary)]">
          {BUTTON_LABELS.edit}
        </Link>
      </div>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--fn-primary-muted)] text-2xl">
          👤
        </div>
        <div>
          <p className="text-xl font-extrabold">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-[var(--fn-text-muted)]">{user?.email}</p>
        </div>
      </div>
      <DarkModeToggle />
      <ProfileMenuItem
        href="/athlete/profile/favorite-sports"
        label={PROFILE_MENU_LABELS.favoriteSports}
        value={user?.favoriteSports.length ? user.favoriteSports.join(', ') : 'None'}
      />
      <ProfileMenuItem href="/athlete/profile/notifications" label={PROFILE_MENU_LABELS.notifications} />
      {showPaymentMethods ? (
        <ProfileMenuItem href="/athlete/profile/payment-methods" label={PROFILE_MENU_LABELS.paymentMethods} />
      ) : null}
      {showSupport ? (
        <ProfileMenuItem href="/athlete/profile/support" label={PROFILE_MENU_LABELS.helpSupport} />
      ) : null}
      <Button title={BUTTON_LABELS.signOut} variant="outline" className="mt-6" onClick={signOut} />
    </div>
  );
}
