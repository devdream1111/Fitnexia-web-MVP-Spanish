'use client';

import { Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import type { MockStreamSession } from '@/services/mock/streaming.mock';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';

export function LiveStreamPanel({ session }: { session: MockStreamSession }) {
  return (
    <section className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Video size={20} className="text-sky-600" />
        <h3 className="font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.liveStreamTitle}</h3>
        <MockDataBadge />
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.liveStreamMeetingId}</dt>
          <dd className="font-mono font-semibold text-[var(--fn-text)]">{session.meetingId}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.liveStreamPasscode}</dt>
          <dd className="font-mono font-semibold text-[var(--fn-text)]">{session.passcode}</dd>
        </div>
      </dl>
      <Button
        title={MOCK_V2V3_LABELS.liveStreamJoin}
        className="mt-4 w-full sm:w-auto"
        onClick={() => window.open(session.joinUrl, '_blank', 'noopener,noreferrer')}
      />
    </section>
  );
}
