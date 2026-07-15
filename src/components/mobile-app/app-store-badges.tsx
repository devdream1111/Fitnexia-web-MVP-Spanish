'use client';

import { MOBILE_APP_LABELS } from '@/constants/labels';
import {
  type AppStorePlatform,
  getAndroidDistribution,
  hasMobileAppStoreUrl,
  MOBILE_APP_STORES,
  openStoreOrFallback,
} from '@/constants/mobile-app';
import { useDevicePlatform } from '@/hooks/use-device-platform';
import { AppleGlyph, PlayGlyph } from './store-glyphs';

export type StoreBadgeTone = 'footer' | 'onDark' | 'onLight' | 'brand';

type AppStoreBadgeProps = {
  platform: AppStorePlatform;
  tone?: StoreBadgeTone;
  className?: string;
  /** Emphasize preferred platform on the current device. */
  emphasized?: boolean;
};

const TONE_CLASS: Record<StoreBadgeTone, { ready: string; soon: string }> = {
  footer: {
    ready:
      'border-[#475569] bg-[#0f172a] text-[#F8FAFC] hover:border-[#60A5FA] hover:text-white',
    soon: 'border-[#475569] bg-[#1e293b] text-[#94A3B8]',
  },
  onDark: {
    ready:
      'border-white/25 bg-black/55 text-white backdrop-blur-md hover:border-white/50 hover:bg-black/70',
    soon: 'border-white/15 bg-white/10 text-white/55',
  },
  onLight: {
    ready:
      'border-[var(--fn-border)] bg-[var(--fn-surface)] text-[var(--fn-text)] shadow-sm hover:border-[var(--fn-primary)] hover:shadow-md',
    soon: 'border-[var(--fn-border)] bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)]',
  },
  brand: {
    ready:
      'border-white/30 bg-white text-slate-900 shadow-lg shadow-black/20 hover:bg-white/95',
    soon: 'border-white/20 bg-white/15 text-white/70',
  },
};

function androidCopy() {
  const mode = getAndroidDistribution();
  if (mode === 'apk') {
    return {
      label: MOBILE_APP_LABELS.androidApk,
      micro: MOBILE_APP_LABELS.androidApkMicro,
      aria: MOBILE_APP_LABELS.androidApkAria,
    };
  }
  return {
    label: MOBILE_APP_LABELS.android,
    micro: MOBILE_APP_LABELS.androidMicro,
    aria: MOBILE_APP_LABELS.androidAria,
  };
}

export function AppStoreBadge({
  platform,
  tone = 'onLight',
  className = '',
  emphasized = false,
}: AppStoreBadgeProps) {
  const ready = hasMobileAppStoreUrl(platform);
  const android = platform === 'android' ? androidCopy() : null;
  const label = platform === 'ios' ? MOBILE_APP_LABELS.ios : android!.label;
  const micro = ready
    ? platform === 'ios'
      ? MOBILE_APP_LABELS.iosMicro
      : android!.micro
    : MOBILE_APP_LABELS.comingSoon;
  const aria = platform === 'ios' ? MOBILE_APP_LABELS.iosAria : android!.aria;
  const Glyph = platform === 'ios' ? AppleGlyph : PlayGlyph;
  const toneClass = ready ? TONE_CLASS[tone].ready : TONE_CLASS[tone].soon;
  const androidMode = platform === 'android' ? getAndroidDistribution() : null;

  const content = (
    <>
      <Glyph className="h-5 w-5 shrink-0 sm:h-[1.35rem] sm:w-[1.35rem]" />
      <span className="flex min-w-0 flex-col items-start leading-tight">
        <span className="text-[9px] font-medium uppercase tracking-[0.08em] opacity-75 sm:text-[10px]">
          {micro}
        </span>
        <span className="text-[13px] font-semibold tracking-tight sm:text-sm">{label}</span>
      </span>
    </>
  );

  const baseClass = [
    'fn-app-store-badge',
    emphasized ? 'fn-app-store-badge--emphasized' : '',
    toneClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!ready) {
    return (
      <span
        className={`${baseClass} cursor-default`}
        aria-label={`${aria} — ${MOBILE_APP_LABELS.comingSoonAria}`}
        title={MOBILE_APP_LABELS.comingSoon}
      >
        {content}
      </span>
    );
  }

  if (androidMode === 'apk') {
    return (
      <button
        type="button"
        data-store="android-apk"
        aria-label={aria}
        className={baseClass}
        onClick={() => openStoreOrFallback('android')}
      >
        {content}
      </button>
    );
  }

  const href = platform === 'ios' ? MOBILE_APP_STORES.ios : MOBILE_APP_STORES.android;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-store={platform}
      aria-label={aria}
      className={baseClass}
    >
      {content}
    </a>
  );
}

type AppStoreBadgesProps = {
  tone?: StoreBadgeTone;
  className?: string;
  /** Hide the non-preferred store on phones (still show both on desktop). */
  preferDevice?: boolean;
  layout?: 'row' | 'stack';
};

export function AppStoreBadges({
  tone = 'onLight',
  className = '',
  preferDevice = false,
  layout = 'row',
}: AppStoreBadgesProps) {
  const device = useDevicePlatform();
  const emphasizeIos = device === 'ios';
  const emphasizeAndroid = device === 'android';
  const hideIos = preferDevice && device === 'android';
  const hideAndroid = preferDevice && device === 'ios';

  return (
    <div
      className={[
        'fn-app-store-badges',
        layout === 'stack' ? 'fn-app-store-badges--stack' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {!hideIos ? (
        <AppStoreBadge platform="ios" tone={tone} emphasized={emphasizeIos} />
      ) : null}
      {!hideAndroid ? (
        <AppStoreBadge platform="android" tone={tone} emphasized={emphasizeAndroid} />
      ) : null}
    </div>
  );
}
