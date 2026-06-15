import type { MouseEvent } from 'react';

export const LANDING_HEADER_OFFSET = 64;

export function smoothScrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function smoothScrollToId(id: string) {
  const element = document.getElementById(id.replace(/^#/, ''));
  if (!element) return;

  const top =
    element.getBoundingClientRect().top + window.scrollY - LANDING_HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

export function handleHashLinkClick(
  event: MouseEvent<HTMLAnchorElement>,
  hash: string,
) {
  if (!hash.startsWith('#')) return;

  event.preventDefault();
  smoothScrollToId(hash);
}
