'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { AUTH_LABELS, BUTTON_LABELS, SCREEN_TITLES } from '@/constants/labels';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const save = () => {
    updateProfile({ firstName, lastName, email });
    alert('Profile saved (mock)');
    router.back();
  };

  return (
    <div>
      <PageHeader title={SCREEN_TITLES.editProfile} showBack />
      <Input label={AUTH_LABELS.firstName} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <Input label={AUTH_LABELS.lastName} value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <Input label={AUTH_LABELS.email} value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button title={BUTTON_LABELS.saveChanges} onClick={save} />
    </div>
  );
}
