'use client';

import { useCallback, useEffect, useState } from 'react';
import { Smartphone, X } from 'lucide-react';

import { MOBILE_APP_LABELS } from '@/constants/labels';
import {
  hasMobileAppStoreUrl,
  openStoreOrFallback,
  preferredStorePlatform,
  SMART_APP_BANNER_DISMISS_KEY,
} from '@/constants/mobile-app';
import { useDevicePlatform } from '@/hooks/use-device-platform';
import { isMobileDevicePlatform } from '@/utils/device-platform';
import { GetTheAppModal } from './get-the-app-modal';

type SmartAppBannerProps = {
  /** Extra top offset when a fixed header sits above (px or CSS length). */
  offsetClassName?: string;
  storageKey?: string;
};

export function SmartAppBanner({
  offsetClassName = '',
  storageKey = SMART_APP_BANNER_DISMISS_KEY,
}: SmartAppBannerProps) {
  const device = useDevicePlatform();
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!isMobileDevicePlatform(device)) {
      setVisible(false);
      return;
    }
    try {
      if (localStorage.getItem(storageKey) === '1') {
        setVisible(false);
        return;
      }
    } catch {
      /* ignore private mode */
    }
    setVisible(true);
  }, [device, storageKey]);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const openPreferred = useCallback(() => {
    const store = preferredStorePlatform(device);
    if (hasMobileAppStoreUrl(store)) {
      openStoreOrFallback(store);
      return;
    }
    setModalOpen(true);
  }, [device]);

  if (!visible) {
    return <GetTheAppModal open={modalOpen} onClose={() => setModalOpen(false)} />;
  }

  return (
    <>
      <div className={`fn-smart-app-banner ${offsetClassName}`.trim()} role="region" aria-label={MOBILE_APP_LABELS.bannerTitle}>
        <div className="fn-smart-app-banner__inner">
          <span className="fn-smart-app-banner__icon" aria-hidden="true">
            <Smartphone size={20} />
          </span>
          <div className="fn-smart-app-banner__copy">
            <p className="fn-smart-app-banner__title">{MOBILE_APP_LABELS.bannerTitle}</p>
            <p className="fn-smart-app-banner__subtitle">{MOBILE_APP_LABELS.bannerSubtitle}</p>
          </div>
          <button type="button" className="fn-smart-app-banner__cta" onClick={openPreferred}>
            {MOBILE_APP_LABELS.bannerCta}
          </button>
          <button
            type="button"
            className="fn-smart-app-banner__dismiss"
            onClick={dismiss}
            aria-label={MOBILE_APP_LABELS.bannerDismiss}
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <GetTheAppModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
