'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { PublicClubProfile } from '@/components/club/public-club-profile';
import { GENERAL_LABELS } from '@/constants/labels';
import { apiGetInstitution } from '@/services/api';
import type { Institution } from '@/types/api';
import { normalizeOpeningHours } from '@/utils/opening-hours';

export default function PublicClubPage() {
  const { id } = useParams<{ id: string }>();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGetInstitution(id)
      .then((data) =>
        setInstitution({
          ...data,
          openingHours: normalizeOpeningHours(data.openingHours),
        }),
      )
      .catch(() => setInstitution(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gradient-to-b from-[var(--fn-surface-muted)]/30 to-transparent">
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-lg font-bold text-[var(--fn-text)]">{GENERAL_LABELS.notFound}</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fn-primary)]"
        >
          <ArrowLeft size={14} />
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--fn-surface-muted)]/40 via-transparent to-transparent">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fn-text-muted)] transition hover:text-[var(--fn-primary)]"
        >
          <ArrowLeft size={14} />
          Fitnexia
        </Link>
        <PublicClubProfile institution={institution} />
      </div>
    </div>
  );
}
