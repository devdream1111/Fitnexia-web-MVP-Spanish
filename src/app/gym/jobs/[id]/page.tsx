'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { DashboardPage } from '@/components/dashboard/dashboard-ui';
import {
  DisciplineTags,
  GymApplicationCard,
  JobsEmptyState,
  JobsHero,
} from '@/components/jobs/jobs-ui';
import { Badge } from '@/components/ui/badge';
import { GENERAL_LABELS, GYM_LABELS } from '@/constants/labels';
import { apiGetGymJob, apiListJobApplications } from '@/services/api';
import type { JobApplication, JobPosting } from '@/types/api';
import { jobRoleLabel, jobStatusLabel } from '@/utils/opening-hours';

export default function GymJobApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        apiGetGymJob(id),
        apiListJobApplications(id),
      ]);
      setJob(jobRes);
      setApplications(appsRes.data);
    } catch {
      setJob(null);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <DashboardPage>
        <p className="py-16 text-center text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      </DashboardPage>
    );
  }

  if (!job) {
    return (
      <DashboardPage>
        <JobsEmptyState title={GENERAL_LABELS.notFound} />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <JobsHero
        variant="applications"
        title={GYM_LABELS.jobs.applications}
        subtitle={job.title}
      />

      <section className="overflow-hidden rounded-3xl border border-orange-500/15 bg-[var(--fn-surface)] shadow-lg">
        <div className="border-b border-[var(--fn-border)] bg-gradient-to-r from-orange-500/5 to-rose-500/5 px-6 py-5 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-[var(--fn-text)]">{job.title}</h2>
            <Badge label={jobStatusLabel(job.status)} variant={job.status === 'open' ? 'success' : 'default'} />
          </div>
          <p className="mt-1 text-sm font-semibold text-[var(--fn-text-muted)]">{jobRoleLabel(job.roleType)}</p>
          <div className="mt-3">
            <DisciplineTags disciplines={job.disciplines} />
          </div>
        </div>
        <div className="px-6 py-4 md:px-8">
          <p className="text-sm text-[var(--fn-text-secondary)]">
            <span className="font-bold text-[var(--fn-text)]">{applications.length}</span> postulaciones recibidas
          </p>
        </div>
      </section>

      {applications.length === 0 ? (
        <JobsEmptyState
          title="Sin postulaciones todavía"
          description="Cuando instructores se postulen, aparecerán aquí con su mensaje y datos."
        />
      ) : (
        <ul className="grid gap-4">
          {applications.map((app) => (
            <GymApplicationCard key={app.id} app={app} />
          ))}
        </ul>
      )}
    </DashboardPage>
  );
}
