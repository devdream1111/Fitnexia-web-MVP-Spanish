'use client';

import { FeatureGate } from '@/components/feature-gate';

export default function GymMembersLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGate feature="clubMembers">{children}</FeatureGate>;
}
