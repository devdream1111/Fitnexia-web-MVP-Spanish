'use client';

import Link from 'next/link';
import { Building2, MapPin, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { MockInstitutionSearchResult } from '@/services/mock/institutions.mock';

export function InstitutionClubCard({ club }: { club: MockInstitutionSearchResult }) {
  return (
    <Link
      href={`/club/${club.id}`}
      className="block rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 shadow-sm transition hover:border-[var(--fn-primary)]/40"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)]">
          <Building2 size={22} className="text-[var(--fn-primary)]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-[var(--fn-text)]">{club.name}</h3>
            {club.verified ? <Badge label="Verificado" variant="success" size="sm" /> : null}
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-[var(--fn-text-muted)]">
            <MapPin size={14} />
            {club.city} · {club.address}
          </p>
          <p className="mt-2 flex items-center gap-1 text-xs text-[var(--fn-text-muted)]">
            <Users size={14} />
            {club.memberCount} socios · {club.disciplines.join(' · ')}
          </p>
        </div>
      </div>
    </Link>
  );
}
