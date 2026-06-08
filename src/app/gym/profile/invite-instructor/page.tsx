'use client';

import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { SCREEN_TITLES, GYM_LABELS } from '@/constants/labels';

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
    alert(GYM_LABELS.instructors.inviteSent);
    setEmail('');
  };

  return (
    <div>
      <PageHeader title={SCREEN_TITLES.inviteInstructor} showBack />
      <Input label={GYM_LABELS.instructors.email} value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button title={GYM_LABELS.instructors.sendInvite} onClick={send} />
    </div>
  );
}
