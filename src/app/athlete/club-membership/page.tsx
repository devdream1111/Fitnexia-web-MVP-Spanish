'use client';

import { useEffect, useState } from 'react';

import {
  ClubAlertBanner,
  ClubAthleteHero,
  ClubAthleteMembershipCard,
  ClubEmptyState,
} from '@/components/gym/club-members-ui';
import { useAuth } from '@/contexts/auth-context';
import { apiListMyClubMemberships } from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { CLUB_LABELS, GENERAL_LABELS } from '@/constants/labels';
import type { AthleteClubMembership } from '@/types/api';
import { normalizeAthleteMembershipsList } from '@/utils/club-members';

export default function AthleteClubMembershipPage() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<AthleteClubMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'athlete') return;
    apiListMyClubMemberships()
      .then((res) => {
        setMemberships(normalizeAthleteMembershipsList(res));
        setLoadError(null);
      })
      .catch((error) => {
        setMemberships([]);
        setLoadError(error instanceof ApiClientError ? error.message : CLUB_LABELS.athlete.empty);
      })
      .finally(() => setLoading(false));
  }, [user?.role]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <ClubAthleteHero />

      {loadError ? <ClubAlertBanner>{loadError}</ClubAlertBanner> : null}

      {loading ? (
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : memberships.length === 0 ? (
        <ClubEmptyState title={CLUB_LABELS.athlete.empty} />
      ) : (
        <div className="space-y-4">
          {memberships.map((m) => (
            <ClubAthleteMembershipCard key={m.id} membership={m} />
          ))}
        </div>
      )}
    </div>
  );
}
