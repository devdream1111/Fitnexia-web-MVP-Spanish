'use client';

import { useCallback, useEffect, useState } from 'react';

import { DashboardPage } from '@/components/dashboard/dashboard-ui';
import {
  InstructorApplicationCard,
  InstructorJobCard,
  JobApplyModal,
  JobsEmptyState,
  JobsHero,
  JobsSearchBar,
  JobsTabBar,
} from '@/components/jobs/jobs-ui';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiApplyToJob,
  apiListMyJobApplications,
  apiListOpenJobs,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { ALERT_LABELS, GENERAL_LABELS, GYM_LABELS } from '@/constants/labels';
import type { JobApplication, JobPosting } from '@/types/api';

export default function InstructorJobsPage() {
  const { showNotice } = useNoticeModal();
  const [tab, setTab] = useState<'browse' | 'applications'>('browse');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  const loadJobs = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const res = await apiListOpenJobs(q);
      setJobs(res.data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    try {
      const res = await apiListMyJobApplications();
      setApplications(res.data);
    } catch {
      setApplications([]);
    }
  }, []);

  useEffect(() => {
    if (tab === 'browse') loadJobs();
    else loadApplications();
  }, [tab, loadJobs, loadApplications]);

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplyingId(selectedJob.id);
    try {
      await apiApplyToJob(selectedJob.id, { message: applyMessage.trim() || undefined });
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: GYM_LABELS.jobs.applySuccess,
        variant: 'success',
      });
      setSelectedJob(null);
      setApplyMessage('');
      await loadApplications();
    } catch (error) {
      const msg =
        error instanceof ApiClientError && error.code === 'ALREADY_APPLIED'
          ? GYM_LABELS.jobs.applied
          : error instanceof ApiClientError
            ? error.message
            : 'No se pudo postular';
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: msg,
        variant: 'error',
      });
    } finally {
      setApplyingId(null);
    }
  };

  const appliedJobIds = new Set(applications.map((a) => a.jobId));

  return (
    <DashboardPage>
      <JobsHero
        variant="instructor"
        title={GYM_LABELS.jobs.browseTitle}
        subtitle={GYM_LABELS.jobs.browseSubtitle}
      />

      <JobsTabBar
        active={tab}
        onChange={(id) => setTab(id as 'browse' | 'applications')}
        tabs={[
          { id: 'browse', label: 'Explorar ofertas', count: jobs.length },
          { id: 'applications', label: GYM_LABELS.jobs.myApplications, count: applications.length },
        ]}
      />

      {tab === 'browse' ? (
        <div className="space-y-6">
          <JobsSearchBar
            value={query}
            onChange={setQuery}
            onSearch={() => loadJobs(query.trim() || undefined)}
          />

          {loading ? (
            <p className="text-center text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
          ) : jobs.length === 0 ? (
            <JobsEmptyState
              title={GYM_LABELS.jobs.empty}
              description="Volvé más tarde o probá otra búsqueda."
            />
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <InstructorJobCard
                  key={job.id}
                  job={job}
                  applied={appliedJobIds.has(job.id)}
                  onApply={() => setSelectedJob(job)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <JobsEmptyState
              title={GYM_LABELS.jobs.noApplications}
              description="Explorá ofertas abiertas y enviá tu primera postulación."
            />
          ) : (
            <ul className="grid gap-4">
              {applications.map((app) => (
                <InstructorApplicationCard key={app.id} app={app} />
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedJob ? (
        <JobApplyModal
          job={selectedJob}
          message={applyMessage}
          onMessageChange={setApplyMessage}
          loading={applyingId === selectedJob.id}
          onApply={handleApply}
          onClose={() => setSelectedJob(null)}
        />
      ) : null}
    </DashboardPage>
  );
}
