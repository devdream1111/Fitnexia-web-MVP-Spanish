'use client';

import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { SCREEN_TITLES } from '@/constants/labels';

export default function InviteInstructorPage() {
  const { user, updateProfile } = useAuth();
  const [email, setEmail] = useState('');

  const send = () => {
    if (!email.trim()) return;
    const invites = user?.institutionProfile?.pendingInvites ?? [];
    updateProfile({
      institutionProfile: {
        pendingInvites: [
          ...invites,
          { id: `inv-${Date.now()}`, email: email.trim(), sentAt: new Date().toISOString(), status: 'pending' },
        ],
      },
    });
    alert('Invite sent (mock)');
    setEmail('');
  };

  return (
    <div>
      <PageHeader title={SCREEN_TITLES.inviteInstructor} showBack />
      <Input label="Instructor email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button title="Send invite" onClick={send} />
    </div>
  );
}
