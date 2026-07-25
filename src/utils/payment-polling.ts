export interface PollHandle {
  cancel: () => void;
}

/**
 * Polls `check` until it resolves `true`, the timeout elapses, or the poll is
 * cancelled. Mercado Pago back_urls redirect to the mobile deep link, so the
 * web app confirms checkout/authorization completion by re-fetching state
 * while the user pays in another tab.
 */
export function pollUntil(
  check: () => Promise<boolean>,
  {
    intervalMs = 5000,
    timeoutMs = 5 * 60 * 1000,
    onSuccess,
    onTimeout,
  }: {
    intervalMs?: number;
    timeoutMs?: number;
    onSuccess?: () => void;
    onTimeout?: () => void;
  } = {},
): PollHandle {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const startedAt = Date.now();

  const tick = async () => {
    if (cancelled) return;
    let done = false;
    try {
      done = await check();
    } catch {
      // Transient network/API errors: keep polling until timeout.
    }
    if (cancelled) return;
    if (done) {
      onSuccess?.();
      return;
    }
    if (Date.now() - startedAt >= timeoutMs) {
      onTimeout?.();
      return;
    }
    timer = setTimeout(tick, intervalMs);
  };

  timer = setTimeout(tick, intervalMs);

  return {
    cancel: () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    },
  };
}
