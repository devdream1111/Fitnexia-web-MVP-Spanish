'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { Smartphone, X } from 'lucide-react';

import { ModalPortal } from '@/components/ui/modal-portal';
import { MOBILE_APP_LABELS } from '@/constants/labels';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { AppStoreBadges } from './app-store-badges';

type GetTheAppModalProps = {
  open: boolean;
  onClose: () => void;
};

export function GetTheAppModal({ open, onClose }: GetTheAppModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(open);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener('keydown', onKeyDown);
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.cancelAnimationFrame(frame);
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fn-app-download-modal" role="presentation">
        <button
          type="button"
          className="fn-app-download-modal__backdrop"
          aria-label={MOBILE_APP_LABELS.modalClose}
          onClick={onClose}
        />
        <div
          className="fn-app-download-modal__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            ref={closeRef}
            type="button"
            className="fn-app-download-modal__close"
            onClick={onClose}
            aria-label={MOBILE_APP_LABELS.modalClose}
          >
            <X size={18} />
          </button>

          <div className="fn-app-download-modal__icon" aria-hidden="true">
            <Smartphone size={28} />
          </div>
          <h2 id={titleId} className="fn-app-download-modal__title">
            {MOBILE_APP_LABELS.modalTitle}
          </h2>
          <p className="fn-app-download-modal__subtitle">{MOBILE_APP_LABELS.modalSubtitle}</p>
          <AppStoreBadges tone="onLight" className="fn-app-download-modal__badges" />
        </div>
      </div>
    </ModalPortal>
  );
}
