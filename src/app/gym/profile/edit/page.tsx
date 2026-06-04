'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { BUTTON_LABELS, SCREEN_TITLES } from '@/constants/labels';

export default function GymEditProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.institutionProfile?.name ?? '');
  const [description, setDescription] = useState(user?.institutionProfile?.description ?? '');

  const save = () => {
    updateProfile({ institutionProfile: { name, description } });
    router.back();
  };

  return (
    <div>
      <PageHeader title={SCREEN_TITLES.editProfile} showBack />
      <Input label="Gym name" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="mb-4 block">
        <span className="mb-1.5 block text-sm font-medium">Description</span>
        <textarea
          className="w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <Button title={BUTTON_LABELS.saveChanges} onClick={save} />
    </div>
  );
}
