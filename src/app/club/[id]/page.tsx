'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { PublicClubProfile } from '@/components/club/public-club-profile';
import { PublicProfileShell } from '@/components/layout/public-profile-shell';
import { GENERAL_LABELS } from '@/constants/labels';
import { apiGetInstitution } from '@/services/api';
import type { Institution } from '@/types/api';
import { normalizePublicInstitution } from '@/utils/institution-public';

export default function PublicClubPage() {
  const { id } = useParams<{ id: string }>();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGetInstitution(id)
      .then((data) => setInstitution(normalizePublicInstitution(data)))
      .catch(() => setInstitution(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PublicProfileShell backHref="/">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
        </div>
      </PublicProfileShell>
    );
  }

  if (!institution) {
    return (
      <PublicProfileShell backHref="/">
        <div className="mx-auto max-w-lg py-20 text-center">
          <p className="text-lg font-bold text-[var(--fn-text)]">{GENERAL_LABELS.notFound}</p>
        </div>
      </PublicProfileShell>
    );
  }

  return <PublicClubProfile institution={institution} />;
}
