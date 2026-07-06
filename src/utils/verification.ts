import { BADGE_LABELS, VERIFICATION_LABELS } from '@/constants/labels';
import type { VerificationStatus } from '@/types/api';

export function resolveVerificationStatus(profile?: {
  verificationStatus?: VerificationStatus;
  verified?: boolean;
}): VerificationStatus {
  if (profile?.verificationStatus) return profile.verificationStatus;
  if (profile?.verified) return 'verified';
  return 'unverified';
}

export function isProfileVerified(profile?: {
  verificationStatus?: VerificationStatus;
  verified?: boolean;
}): boolean {
  return resolveVerificationStatus(profile) === 'verified';
}

export function getProfileHeroBadge(
  status: VerificationStatus,
  roleFallback?: string,
): { label: string; variant: 'default' | 'success' | 'warning' } | null {
  if (status === 'verified') {
    return { label: BADGE_LABELS.verified, variant: 'success' };
  }
  if (status === 'pending') {
    return { label: VERIFICATION_LABELS.statusInReview, variant: 'warning' };
  }
  if (roleFallback) {
    return { label: roleFallback, variant: 'default' };
  }
  return null;
}

export function hostIsVerified(cls: {
  instructor?: { id?: string; displayName?: string; verified?: boolean } | null;
  institution?: { verified?: boolean } | null;
}): boolean {
  if (cls.instructor?.id || cls.instructor?.displayName) {
    return cls.instructor.verified === true;
  }
  return cls.institution?.verified === true;
}
