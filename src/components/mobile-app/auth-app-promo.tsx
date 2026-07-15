'use client';

import { MOBILE_APP_LABELS } from '@/constants/labels';
import { AppStoreBadges } from './app-store-badges';

/** Auth brand-panel download row: copy on the left, store badges on the right. */
export function AuthAppPromo() {
  return (
    <div className="fn-auth-app-promo fn-auth-app-promo--brand">
      <div className="fn-auth-app-promo__copy">
        <p className="fn-auth-app-promo__title">{MOBILE_APP_LABELS.title}</p>
        <p className="fn-auth-app-promo__body">{MOBILE_APP_LABELS.authPromoBody}</p>
      </div>
      <AppStoreBadges tone="onDark" className="fn-auth-app-promo__badges" />
    </div>
  );
}
