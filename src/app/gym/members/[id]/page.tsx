'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import {
  ClubInfoNote,
  ClubMemberDetailCard,
} from '@/components/gym/club-members-ui';
import { PageHeader } from '@/components/layout/page-header';
import { apiFindClubMember } from '@/services/api';
import { CLUB_LABELS, GENERAL_LABELS } from '@/constants/labels';
import type { ClubMember } from '@/types/api';
import { formatClubMemberName } from '@/utils/club-members';

export default function GymMemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<ClubMember | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const found = await apiFindClubMember(id);
      setMember(found);
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="p-6 text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>;
  }

  if (!member) {
    return (
      <div className="space-y-4 p-6">
        <PageHeader title="Socio" showBack />
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.notFound}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={formatClubMemberName(member)} showBack />
      <ClubMemberDetailCard member={member} />
      <ClubInfoNote>{CLUB_LABELS.members.billingNote}</ClubInfoNote>
    </div>
  );
}
