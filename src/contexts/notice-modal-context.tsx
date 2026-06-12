'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { BUTTON_LABELS } from '@/constants/labels';

type NoticeVariant = 'success' | 'error' | 'info';

export interface NoticeOptions {
  title: string;
  message: string;
  variant?: NoticeVariant;
}

interface NoticeModalContextValue {
  showNotice: (options: NoticeOptions) => void;
}

const NoticeModalContext = createContext<NoticeModalContextValue | null>(null);

export function NoticeModalProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<NoticeOptions | null>(null);

  const close = useCallback(() => setNotice(null), []);

  const showNotice = useCallback((options: NoticeOptions) => {
    setNotice(options);
  }, []);

  useEffect(() => {
    if (!notice) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [notice, close]);

  const value = useMemo(() => ({ showNotice }), [showNotice]);

  return (
    <NoticeModalContext.Provider value={value}>
      {children}
      {notice ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--fn-text)]/40 backdrop-blur-[2px]"
            onClick={close}
            aria-label="Cerrar notificación"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-modal-title"
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-[var(--fn-border)] bg-[var(--fn-bg)] p-6 shadow-2xl sm:rounded-2xl"
          >
            <h2
              id="notice-modal-title"
              className="text-lg font-semibold text-[var(--fn-text)]"
            >
              {notice.title}
            </h2>
            <p className="mt-2 text-[var(--fn-text-muted)]">{notice.message}</p>
            <div className="mt-6 flex justify-end">
              <Button onClick={close}>{BUTTON_LABELS.continue}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </NoticeModalContext.Provider>
  );
}

export function useNoticeModal() {
  const ctx = useContext(NoticeModalContext);
  if (!ctx) throw new Error('useNoticeModal must be used within NoticeModalProvider');
  return ctx;
}
