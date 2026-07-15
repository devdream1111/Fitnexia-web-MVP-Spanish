'use client';

import { useCallback, useState } from 'react';
import { Smartphone } from 'lucide-react';

import { MOBILE_APP_LABELS } from '@/constants/labels';
import {
  hasMobileAppStoreUrl,
  openStoreOrFallback,
  preferredStorePlatform,
} from '@/constants/mobile-app';
import { useDevicePlatform } from '@/hooks/use-device-platform';
import { isMobileDevicePlatform } from '@/utils/device-platform';
import { AppStoreBadges } from './app-store-badges';
import { GetTheAppModal } from './get-the-app-modal';

/** Hero carousel download CTAs — platform badges + primary action. */
export function HeroAppCta() {
  const device = useDevicePlatform();
  const [modalOpen, setModalOpen] = useState(false);

  const onPrimary = useCallback(() => {
    if (isMobileDevicePlatform(device)) {
      const store = preferredStorePlatform(device);
      if (hasMobileAppStoreUrl(store)) {
        openStoreOrFallback(store);
        return;
      }
    }
    setModalOpen(true);
  }, [device]);

  return (
    <div className="fn-hero-app-cta">
      <button type="button" className="fn-hero-app-cta__primary" onClick={onPrimary}>
        <Smartphone size={18} aria-hidden="true" />
        <span>{MOBILE_APP_LABELS.heroCta}</span>
      </button>
      <p className="fn-hero-app-cta__hint">{MOBILE_APP_LABELS.heroHint}</p>
      <AppStoreBadges
        tone="brand"
        preferDevice
        className="fn-hero-app-cta__badges"
      />
      <GetTheAppModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
