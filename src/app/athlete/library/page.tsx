'use client';

import { useState } from 'react';
import { Play, Video } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ALERT_LABELS, MOCK_V2V3_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { mockRecordedClassesService } from '@/services/mock/recorded-classes.mock';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';
import { useNoticeModal } from '@/contexts/notice-modal-context';

export default function RecordedLibraryPage() {
  const { showNotice } = useNoticeModal();
  const [items, setItems] = useState(() => mockRecordedClassesService.list());

  const play = (id: string) => {
    setItems(mockRecordedClassesService.updateProgress(id, 100));
    showNotice({
      title: MOCK_V2V3_LABELS.watchNow,
      message: 'Reproducción simulada — el reproductor VOD estará disponible con el backend.',
      variant: 'info',
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-4">
      <PageHeader
        variant="premium"
        title={SCREEN_TITLES.recordedLibrary}
        showBack
        backHref="/athlete/profile"
      />
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.recordedLibraryHint}</p>
        <MockDataBadge />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--fn-primary)_30%,var(--fn-border))] hover:shadow-[0_16px_36px_-22px_color-mix(in_srgb,var(--fn-primary)_40%,transparent)]"
          >
            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[var(--fn-primary)] via-[#1d4ed8] to-[#0f172a]">
              <Video size={40} className="text-white/90" />
            </div>
            <div className="space-y-3 p-5">
              <h3 className="font-extrabold tracking-tight text-[var(--fn-text)]">{item.title}</h3>
              <p className="text-sm text-[var(--fn-text-muted)]">
                {item.instructorName} · {item.durationMinutes} min
              </p>
              {item.watchProgressPct > 0 ? (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-[var(--fn-text-muted)]">
                    <span>
                      {item.watchProgressPct >= 100
                        ? 'Completada'
                        : MOCK_V2V3_LABELS.continueWatching}
                    </span>
                    <span>{item.watchProgressPct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--fn-surface-muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--fn-primary)]"
                      style={{ width: `${item.watchProgressPct}%` }}
                    />
                  </div>
                </div>
              ) : null}
              <Button title={MOCK_V2V3_LABELS.watchNow} size="sm" onClick={() => play(item.id)}>
                <Play size={16} className="mr-1" />
                {MOCK_V2V3_LABELS.watchNow}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
