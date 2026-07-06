'use client';

import { VERIFICATION_LABELS } from '@/constants/labels';
import type { VerificationStatus } from '@/types/api';
import { resolveVerificationStatus } from '@/utils/verification';

export function UnverifiedPublishWarning({
  profile,
}: {
  profile?: { verificationStatus?: VerificationStatus; verified?: boolean };
}) {
  const status = resolveVerificationStatus(profile);
  if (status === 'verified' || status === 'pending') return null;

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-[var(--fn-text-secondary)]">
      {VERIFICATION_LABELS.publishWarning}
    </div>
  );
}
