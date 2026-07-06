'use client';

import { MOCK_V2V3_LABELS } from '@/constants/labels';

export function MockDataBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300 ${className}`}
    >
      {MOCK_V2V3_LABELS.mockDataBadge}
    </span>
  );
}
