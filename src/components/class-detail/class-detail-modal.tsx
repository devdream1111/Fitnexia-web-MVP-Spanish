'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import { ClassDetailView } from '@/components/class-detail/class-detail-view';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';

export function ClassDetailModal({ classId }: { classId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const isClassRoute = pathname.startsWith('/class/');

  const close = useCallback(() => {
    router.back();
  }, [router]);

  useBodyScrollLock(isClassRoute);

  useEffect(() => {
    if (!isClassRoute) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [close, isClassRoute]);

  if (!isClassRoute) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--fn-text)]/40 backdrop-blur-[2px]"
        onClick={close}
        aria-label="Cerrar detalles de la clase"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-detail-title"
        className="relative z-10 flex max-h-[min(94vh,58rem)] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl border border-[var(--fn-border)] bg-[var(--fn-bg)] shadow-2xl sm:rounded-2xl"
      >
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <ClassDetailView classId={classId} onClose={close} variant="modal" />
        </div>
      </div>
    </div>
  );
}
