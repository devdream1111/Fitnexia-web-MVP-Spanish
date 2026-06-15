'use client';

import { GENERAL_LABELS } from '@/constants/labels';

export function FullScreenLoader({
  message = GENERAL_LABELS.loading,
}: {
  message?: string;
}) {
  return (
    <div
      className="fn-fullscreen-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className="fn-fullscreen-loader-content">
        <div className="fn-fullscreen-loader-ring" aria-hidden="true">
          <img
            src="/fitnexia-logo.png"
            alt=""
            className="fn-fullscreen-loader-logo"
          />
        </div>
        <p className="fn-fullscreen-loader-message">{message}</p>
      </div>
    </div>
  );
}
