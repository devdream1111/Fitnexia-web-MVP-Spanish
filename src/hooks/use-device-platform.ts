'use client';

import { useEffect, useState } from 'react';

import { detectDevicePlatform, type DevicePlatform } from '@/utils/device-platform';

/** Hydration-safe platform detection (starts as desktop, then resolves). */
export function useDevicePlatform(): DevicePlatform {
  const [platform, setPlatform] = useState<DevicePlatform>('desktop');

  useEffect(() => {
    setPlatform(detectDevicePlatform());
  }, []);

  return platform;
}
