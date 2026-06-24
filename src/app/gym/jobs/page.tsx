'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import {
  GymJobCard,
  GymJobFormPanel,
  JobsEmptyState,
  JobsHero,
} from '@/components/jobs/jobs-ui';
import { DashboardPage } from '@/components/dashboard/dashboard-ui';
import { Button } from '@/components/ui/button';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiCreateGymJob,
  apiDeleteGymJob,
  apiListGymJobs,
  apiUpdateGymJob,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { ALERT_LABELS, GENERAL_LABELS, GYM_LABELS } from '@/constants/labels';
import type { JobPosting, JobRoleType, JobStatus } from '@/types/api';
import { disciplineSelectOptions, filterValidDisciplines } from '@/utils/disciplines';

const ROLE_OPTIONS = [
  { value: 'instructor', label: 'Instructor/a' },
  { value: 'trainer', label: 'Entrenador/a' },
  { value: 'staff', label: 'Staff' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Abierta' },
  { value: 'draft', label: 'Borrador' },
  { value: 'closed', label: 'Cerrada' },
];

export default function GymJobsPage() {
  const { showNotice } = useNoticeModal();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [roleType, setRoleType] = useState<JobRoleType>('instructor');
  const [description, setDescription] = useState('');
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [status, setStatus] = useState<JobStatus>('open');

  const disciplineOptions = disciplineSelectOptions();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiListGymJobs();
      setJobs(res.data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setRoleType('instructor');
    setDescription('');
    setDisciplines([]);
    setStatus('open');
    setShowForm(false);
  };

  const startEdit = (job: JobPosting) => {
    setEditingId(job.id);
    setTitle(job.title);
    setRoleType(job.roleType);
    setDescription(job.description ?? '');
    setDisciplines(filterValidDisciplines(job.disciplines));
    setStatus(job.status);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const body = {
      title: title.trim(),
      roleType,
      description: description.trim() || undefined,
      disciplines: filterValidDisciplines(disciplines),
      status,
    };
    try {
      if (editingId) {
        await apiUpdateGymJob(editingId, body);
      } else {
        await apiCreateGymJob(body);
      }
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: GYM_LABELS.jobs.saved,
        variant: 'success',
      });
      resetForm();
      await load();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo guardar',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta oferta?')) return;
    try {
      await apiDeleteGymJob(id);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: GYM_LABELS.jobs.deleted,
        variant: 'success',
      });
      await load();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo eliminar',
        variant: 'error',
      });
    }
  };

  const openCount = jobs.filter((j) => j.status === 'open').length;

  return (
    <DashboardPage>
      <JobsHero
        variant="gym"
        title={GYM_LABELS.jobs.title}
        subtitle={GYM_LABELS.jobs.subtitle}
      >
        <Button
          title={GYM_LABELS.jobs.create}
          variant="secondary"
          className="!border-white/20 !bg-white/15 !text-white hover:!bg-white/25"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus size={16} className="mr-2" />
          {GYM_LABELS.jobs.create}
        </Button>
      </JobsHero>

      {!loading && jobs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--fn-text-muted)]">Total</p>
            <p className="mt-1 text-3xl font-black text-[var(--fn-text)]">{jobs.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Abiertas</p>
            <p className="mt-1 text-3xl font-black text-emerald-700 dark:text-emerald-300">{openCount}</p>
          </div>
          <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--fn-text-muted)]">Postulaciones</p>
            <p className="mt-1 text-3xl font-black text-[var(--fn-primary)]">
              {jobs.reduce((n, j) => n + (j.applicationCount ?? 0), 0)}
            </p>
          </div>
        </div>
      ) : null}

      {showForm ? (
        <GymJobFormPanel
          editing={!!editingId}
          title={title}
          onTitleChange={setTitle}
          roleType={roleType}
          onRoleTypeChange={setRoleType}
          description={description}
          onDescriptionChange={setDescription}
          disciplines={disciplines}
          onDisciplinesChange={setDisciplines}
          disciplineOptions={disciplineOptions}
          status={status}
          onStatusChange={setStatus}
          roleOptions={ROLE_OPTIONS}
          statusOptions={STATUS_OPTIONS}
          saving={saving}
          onSave={handleSave}
          onCancel={resetForm}
        />
      ) : null}

      {loading ? (
        <p className="text-center text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : jobs.length === 0 ? (
        <JobsEmptyState
          title={GYM_LABELS.jobs.empty}
          description="Creá tu primera oferta para atraer instructores y staff a tu club."
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--fn-text-muted)]">
            Ofertas publicadas
          </h2>
          {jobs.map((job) => (
            <GymJobCard key={job.id} job={job} onEdit={startEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </DashboardPage>
  );
}
