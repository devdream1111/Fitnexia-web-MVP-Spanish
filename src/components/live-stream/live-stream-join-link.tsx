'use client';

import Link from 'next/link';
import { Radio } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LIVE_STREAM_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import { isWithinLiveStreamJoinWindow, liveStreamClassHref } from '@/utils/live-stream';

type Props = {
  classId: string;
  startAt: string;
  durationMinutes?: number;
  size?: 'sm' | 'md';
  className?: string;
  /** Shorter label for compact layouts (e.g. booking cards). */
  compact?: boolean;
};

export function LiveStreamJoinLink({
  classId,
  startAt,
  durationMinutes = 60,
  size = 'sm',
  className,
  compact = false,
}: Props) {
  const liveStreamingEnabled = useFeature('liveStreaming');

  if (!liveStreamingEnabled || !isWithinLiveStreamJoinWindow(startAt, durationMinutes)) {
    return null;
  }

  const href = liveStreamClassHref(classId);
  const label = compact ? LIVE_STREAM_LABELS.joinLiveShort : LIVE_STREAM_LABELS.join;

  return (
    <Link href={href} className={className}>
      <Button title={label} size={size} className="inline-flex items-center gap-1.5">
        <Radio size={14} className="animate-pulse" />
        {label}
      </Button>
    </Link>
  );
}
