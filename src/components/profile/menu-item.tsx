'use client';

import Link from 'next/link';

export function ProfileMenuItem({
  href,
  label,
  value,
  onClick,
}: {
  href?: string;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="font-medium text-[var(--fn-text)]">{label}</span>
      <span className="text-[var(--fn-text-muted)]">{value ?? '›'}</span>
    </>
  );
  const className =
    'flex w-full items-center justify-between border-b border-[var(--fn-border)] last:border-b-0 bg-[var(--fn-surface)] px-6 py-4 text-left transition hover:bg-[var(--fn-surface-muted)]';

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
