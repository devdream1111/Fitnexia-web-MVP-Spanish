'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { BUTTON_LABELS, SCREEN_TITLES } from '@/constants/labels';

export default function InstructorEditProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.instructorProfile?.displayName ?? '');
  const [bio, setBio] = useState(user?.instructorProfile?.bio ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setLoading(true);
    setError('');
    try {
      await updateProfile({ instructorProfile: { displayName, bio } });
      router.back();
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title={SCREEN_TITLES.editProfile} showBack />
      <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      <label className="mb-4 block">
        <span className="mb-1.5 block text-sm font-medium">Bio</span>
        <textarea
          className="w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </label>
      {error ? <p className="mb-2 text-sm text-[var(--fn-error)]">{error}</p> : null}
      <Button title={BUTTON_LABELS.saveChanges} loading={loading} onClick={save} />
    </div>
  );
}
