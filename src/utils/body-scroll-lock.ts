let lockCount = 0;
let savedOverflow = '';

/** Prevent background scroll while a modal/dialog is open. Supports nested modals. */
export function lockBodyScroll(): () => void {
  if (typeof document === 'undefined') return () => {};

  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released || lockCount <= 0) return;
    released = true;
    lockCount -= 1;
    if (lockCount === 0) {
      document.body.style.overflow = savedOverflow;
    }
  };
}

/** Reset all scroll locks (e.g. before programmatic navigation from a modal). */
export function forceUnlockBodyScroll(): void {
  lockCount = 0;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = savedOverflow || '';
  }
}
