'use client';

import { PageHeader } from '@/components/layout/page-header';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';

export function MockFeatureGate({
  enabled,
  title,
  backHref,
  children,
}: {
  enabled: boolean;
  title: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  if (!enabled) {
    return (
      <div>
        <PageHeader title={title} showBack backHref={backHref} />
        <p className="text-[var(--fn-text-muted)]">Disponible en una próxima versión.</p>
      </div>
    );
  }
  return <>{children}</>;
}

export function MockPageShell({
  title,
  backHref,
  children,
}: {
  title: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={title} showBack backHref={backHref} />
      <MockDataBadge />
      {children}
    </div>
  );
}
