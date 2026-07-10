'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { AUTH_LABELS, BUTTON_LABELS, GENERAL_LABELS, SCREEN_TITLES } from '@/constants/labels';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setLoading(true);
    setError('');
    try {
      await updateProfile({ firstName, lastName, email });
      router.back();
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-4">
      <PageHeader
        variant="premium"
        title={SCREEN_TITLES.editProfile}
        eyebrow={GENERAL_LABELS.athleteProfileEyebrow}
        showBack
        backHref="/athlete/profile"
      />
      <div className="space-y-4 rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-6">
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
        />
        {error ? (
          <p className="rounded-xl border border-[var(--fn-error)]/25 bg-red-50 px-3 py-2 text-sm text-[var(--fn-error)] dark:bg-red-950/30">
            {error}
          </p>
        ) : null}
        <Button title={BUTTON_LABELS.saveChanges} loading={loading} onClick={save} className="w-full" />
      </div>
    </div>
  );
}
