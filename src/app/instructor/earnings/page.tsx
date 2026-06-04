'use client';

export default function InstructorEarningsPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-extrabold">Earnings</h1>
      <p className="text-[var(--fn-text-muted)]">Mock payout summary for MVP demo.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-[var(--fn-surface)] p-6">
          <p className="text-sm text-[var(--fn-text-muted)]">This week</p>
          <p className="text-3xl font-extrabold text-[var(--fn-primary)]">$427</p>
        </div>
        <div className="rounded-2xl bg-[var(--fn-surface)] p-6">
          <p className="text-sm text-[var(--fn-text-muted)]">Pending</p>
          <p className="text-3xl font-extrabold">$89</p>
        </div>
      </div>
    </div>
  );
}
