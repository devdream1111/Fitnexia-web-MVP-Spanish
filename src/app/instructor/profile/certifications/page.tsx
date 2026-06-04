'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useAuth } from '@/contexts/auth-context';
import { PROFILE_MENU_LABELS } from '@/constants/labels';

export default function CertificationsPage() {
  const { user } = useAuth();
  const certs = user?.instructorProfile?.certifications ?? [];

  return (
    <div>
      <PageHeader title={PROFILE_MENU_LABELS.certifications} showBack />
      {certs.length === 0 ? (
        <p className="text-[var(--fn-text-muted)]">No certifications added.</p>
      ) : (
        <ul className="space-y-3">
          {certs.map((c) => (
            <li key={`${c.name}-${c.year}`} className="rounded-xl bg-[var(--fn-surface)] p-4">
              <p className="font-bold">{c.name}</p>
              <p className="text-sm text-[var(--fn-text-muted)]">
                {c.issuer} · {c.year}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
