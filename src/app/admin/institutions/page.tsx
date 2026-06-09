'use client';

import { PageHeader } from '@/components/layout/page-header';
import { TAB_LABELS, ADMIN_LABELS } from '@/constants/labels';
import { useAdmin } from '@/contexts/admin-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function AdminInstitutionsPage() {
  const { institutions, verifyInstitution, rejectInstitution } = useAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title={TAB_LABELS.admin.institutions} showBack />

      <div className="overflow-hidden rounded-xl bg-[var(--fn-surface)]">
        {institutions.map((inst) => (
          <div
            key={inst.id}
            className="flex flex-col gap-4 border-b border-[var(--fn-border)] p-4 last:border-b-0 hover:bg-[var(--fn-surface-muted)] md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-semibold text-[var(--fn-text)]">{inst.name}</p>
              <p className="text-sm text-[var(--fn-text-muted)]">
                {inst.location?.city}, {inst.location?.country}
              </p>
              <p className="mt-1 text-sm text-[var(--fn-text-muted)] line-clamp-2">{inst.description}</p>
              <p className="mt-1 text-xs text-[var(--fn-text-muted)]">
                {inst.instructors?.length ?? 0} instructores · Plan {inst.plan}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                label={inst.verified ? ADMIN_LABELS.verification.verified : ADMIN_LABELS.verification.pending}
                variant={inst.verified ? 'success' : 'warning'}
              />
              {!inst.verified && (
                <Button variant="outline" size="sm" onClick={() => verifyInstitution(inst.id)}>
                  <CheckCircle2 size={14} />
                  {ADMIN_LABELS.verification.verify}
                </Button>
              )}
              {inst.verified && (
                <Button variant="ghost" size="sm" onClick={() => rejectInstitution(inst.id)}>
                  <XCircle size={14} />
                  Desverificar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
