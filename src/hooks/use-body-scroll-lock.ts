import { useEffect } from 'react';

import { lockBodyScroll } from '@/utils/body-scroll-lock';

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    return lockBodyScroll();
  }, [active]);
}
