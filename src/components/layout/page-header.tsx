'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function PageHeader({
  title,
  showBack,
  backHref,
  action,
}: {
  title: string;
  showBack?: boolean;
  backHref?: string;
  action?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="mb-6 flex items-center gap-3">
      {showBack ? (
        backHref ? (
          <Link href={backHref} className="text-2xl text-[var(--fn-text-muted)] hover:text-[var(--fn-text)]">
            ←
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            className="text-2xl text-[var(--fn-text-muted)] hover:text-[var(--fn-text)]">
            ←
          </button>
        )
      ) : null}
      <h1 className="flex-1 text-xl font-bold text-[var(--fn-text)]">{title}</h1>
      {action}
    </header>
  );
}
