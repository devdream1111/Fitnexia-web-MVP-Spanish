'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  Dumbbell,
  MessageSquare,
  Pencil,
  Sparkles,
  Trash2,
  UserCircle,
  Users,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GYM_LABELS } from '@/constants/labels';
import type { JobApplication, JobPosting, JobRoleType, JobStatus } from '@/types/api';
import { disciplineLabel } from '@/utils/disciplines';
import { jobRoleLabel, jobStatusLabel } from '@/utils/opening-hours';

const HERO_STYLES = {
  gym: {
    gradient: 'from-slate-900 via-indigo-950 to-violet-900',
    blobA: 'bg-amber-400/25',
    blobB: 'bg-indigo-400/20',
    eyebrow: 'Reclutamiento · Fitnexia',
  },
  instructor: {
    gradient: 'from-emerald-900 via-teal-900 to-cyan-950',
    blobA: 'bg-lime-400/20',
    blobB: 'bg-cyan-400/25',
    eyebrow: 'Oportunidades · Fitnexia',
  },
  applications: {
    gradient: 'from-rose-900 via-orange-900 to-amber-900',
    blobA: 'bg-orange-300/25',
    blobB: 'bg-rose-400/20',
    eyebrow: 'Postulaciones · Fitnexia',
  },
} as const;

function JobsHeroBlobs({ a, b }: { a: string; b: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className={`absolute -right-16 -top-20 h-64 w-64 rounded-full blur-3xl ${a}`} />
      <div className={`absolute bottom-0 left-0 h-48 w-48 rounded-full blur-3xl ${b}`} />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwIDkuOTQtOC4wNiAxOC0xOCAxOHMtMTgtOC4wNi0xOC0xOCA4LjA2LTE4IDE4LTE4IDE4IDguMDYgMTggMTh6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMDMiLz48L2c+PC9zdmc+')] opacity-40" />
    </div>
  );
}

export function JobsHero({
  variant,
  title,
  subtitle,
  children,
}: {
  variant: keyof typeof HERO_STYLES;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const style = HERO_STYLES[variant];
  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${style.gradient} px-6 py-9 shadow-2xl md:px-10 md:py-11`}
    >
      <JobsHeroBlobs a={style.blobA} b={style.blobB} />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            <Sparkles size={14} />
            {style.eyebrow}
          </p>
          <h1 className="text-3xl font-black leading-tight text-white md:text-4xl">{title}</h1>
          {subtitle ? <p className="text-base leading-relaxed text-white/80">{subtitle}</p> : null}
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </section>
  );
}

export function JobsTabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 p-1.5">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition',
              isActive
                ? 'bg-[var(--fn-surface)] text-[var(--fn-text)] shadow-md ring-1 ring-[var(--fn-border)]'
                : 'text-[var(--fn-text-muted)] hover:text-[var(--fn-text)]',
            ].join(' ')}
          >
            {tab.label}
            {tab.count != null ? (
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                  isActive ? 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]' : 'bg-[var(--fn-border)]',
                ].join(' ')}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function DisciplineTags({ disciplines }: { disciplines: string[] }) {
  if (!disciplines.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {disciplines.map((d) => (
        <span
          key={d}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--fn-primary)]/20 bg-[var(--fn-primary-muted)]/60 px-2.5 py-1 text-xs font-semibold text-[var(--fn-primary)]"
        >
          <Dumbbell size={11} />
          {disciplineLabel(d)}
        </span>
      ))}
    </div>
  );
}

const ROLE_ACCENT: Record<JobRoleType, string> = {
  instructor: 'from-violet-500/15 to-indigo-500/10 text-violet-700 dark:text-violet-200',
  trainer: 'from-emerald-500/15 to-teal-500/10 text-emerald-700 dark:text-emerald-200',
  staff: 'from-amber-500/15 to-orange-500/10 text-amber-800 dark:text-amber-200',
};

export function GymJobCard({
  job,
  onEdit,
  onDelete,
}: {
  job: JobPosting;
  onEdit: (job: JobPosting) => void;
  onDelete: (id: string) => void;
}) {
  const accent = ROLE_ACCENT[job.roleType] ?? ROLE_ACCENT.instructor;
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-80`} aria-hidden="true" />
      <div className="relative p-6 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--fn-surface)]/80 text-[var(--fn-primary)] shadow-sm backdrop-blur-sm">
                <Briefcase size={20} strokeWidth={2.25} />
              </span>
              <div>
                <h3 className="text-xl font-black tracking-tight text-[var(--fn-text)]">{job.title}</h3>
                <p className="text-sm font-semibold text-[var(--fn-text-muted)]">{jobRoleLabel(job.roleType)}</p>
              </div>
              <Badge
                label={jobStatusLabel(job.status)}
                variant={job.status === 'open' ? 'success' : job.status === 'draft' ? 'warning' : 'default'}
                size="sm"
              />
            </div>
            {job.description ? (
              <p className="max-w-3xl text-sm leading-relaxed text-[var(--fn-text-secondary)] line-clamp-3">
                {job.description}
              </p>
            ) : null}
            <DisciplineTags disciplines={job.disciplines} />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
            <Link href={`/gym/jobs/${job.id}`} className="w-full">
              <Button title={GYM_LABELS.jobs.applications} variant="outline" size="sm" className="w-full">
                <Users size={15} className="mr-1.5" />
                {GYM_LABELS.jobs.applications}
                {job.applicationCount != null ? ` (${job.applicationCount})` : ''}
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button title="Editar" variant="ghost" size="sm" onClick={() => onEdit(job)}>
                <Pencil size={15} />
              </Button>
              <Button
                title="Eliminar"
                variant="ghost"
                size="sm"
                className="text-[var(--fn-error)] hover:bg-red-500/10"
                onClick={() => onDelete(job.id)}
              >
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function GymJobFormPanel({
  editing,
  title,
  onTitleChange,
  roleType,
  onRoleTypeChange,
  description,
  onDescriptionChange,
  disciplines,
  onDisciplinesChange,
  disciplineOptions,
  status,
  onStatusChange,
  roleOptions,
  statusOptions,
  saving,
  onSave,
  onCancel,
}: {
  editing: boolean;
  title: string;
  onTitleChange: (v: string) => void;
  roleType: JobRoleType;
  onRoleTypeChange: (v: JobRoleType) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  disciplines: string[];
  onDisciplinesChange: (v: string[]) => void;
  disciplineOptions: { value: string; label: string }[];
  status: JobStatus;
  onStatusChange: (v: JobStatus) => void;
  roleOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-[var(--fn-surface)] to-violet-500/5 shadow-lg ring-1 ring-indigo-500/10">
      <div className="border-b border-[var(--fn-border)] bg-indigo-500/5 px-6 py-5 md:px-8">
        <h2 className="text-lg font-extrabold text-[var(--fn-text)]">
          {editing ? 'Editar oferta' : GYM_LABELS.jobs.create}
        </h2>
        <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
          Publicá la vacante con disciplinas claras para que instructores calificados te encuentren.
        </p>
      </div>
      <div className="grid gap-5 p-6 md:grid-cols-2 md:p-8">
        <Input
          label={GYM_LABELS.jobs.fields.title}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="md:col-span-2"
        />
        <Select
          label={GYM_LABELS.jobs.fields.roleType}
          value={roleType}
          onChange={(v) => onRoleTypeChange(v as JobRoleType)}
          options={roleOptions}
        />
        <Select
          label={GYM_LABELS.jobs.fields.status}
          value={status}
          onChange={(v) => onStatusChange(v as JobStatus)}
          options={statusOptions}
        />
        <div className="md:col-span-2">
          <MultiSelect
            label={GYM_LABELS.jobs.fields.disciplines}
            value={disciplines}
            onChange={onDisciplinesChange}
            options={disciplineOptions}
            placeholder="Seleccioná una o más disciplinas"
          />
        </div>
        <div className="md:col-span-2">
          <Textarea
            label={GYM_LABELS.jobs.fields.description}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={5}
            placeholder="Requisitos, horarios, tipo de contrato, beneficios…"
          />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button title="Guardar oferta" loading={saving} onClick={onSave} />
          <Button title="Cancelar" variant="outline" onClick={onCancel} />
        </div>
      </div>
    </section>
  );
}

export function InstructorJobCard({
  job,
  applied,
  onApply,
}: {
  job: JobPosting;
  applied: boolean;
  onApply: () => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-emerald-500/15 bg-[var(--fn-surface)] shadow-sm transition hover:border-emerald-500/35 hover:shadow-xl">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl transition group-hover:bg-emerald-400/20" />
      <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">
        <div className="min-w-0 space-y-3">
          <div className="flex items-start gap-3">
            {job.institutionLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.institutionLogoUrl}
                alt=""
                className="h-12 w-12 rounded-xl border border-[var(--fn-border)] object-cover shadow-sm"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600">
                <Building2 size={22} />
              </span>
            )}
            <div>
              <h3 className="text-lg font-extrabold text-[var(--fn-text)]">{job.title}</h3>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{job.institutionName}</p>
              <p className="text-xs font-medium text-[var(--fn-text-muted)]">{jobRoleLabel(job.roleType)}</p>
            </div>
          </div>
          {job.description ? (
            <p className="text-sm leading-relaxed text-[var(--fn-text-secondary)] line-clamp-2">{job.description}</p>
          ) : null}
          <DisciplineTags disciplines={job.disciplines} />
        </div>
        <div className="shrink-0">
          {applied ? (
            <Badge label={GYM_LABELS.jobs.applied} variant="success" />
          ) : (
            <Button title={GYM_LABELS.jobs.apply} onClick={onApply} className="min-w-[140px]">
              {GYM_LABELS.jobs.apply}
              <ChevronRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function JobApplyModal({
  job,
  message,
  onMessageChange,
  loading,
  onApply,
  onClose,
}: {
  job: JobPosting;
  message: string;
  onMessageChange: (v: string) => void;
  loading: boolean;
  onApply: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-500/20 bg-[var(--fn-surface)] shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/75">Postulación</p>
              <h3 className="mt-1 text-xl font-black">{job.title}</h3>
              <p className="mt-1 text-sm text-white/85">{job.institutionName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-white/80 transition hover:bg-white/15"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <DisciplineTags disciplines={job.disciplines} />
          <Textarea
            label="Mensaje para el gimnasio (opcional)"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={4}
            placeholder="Contá tu experiencia, disponibilidad o por qué te interesa el puesto…"
          />
          <div className="flex gap-2 pt-1">
            <Button title={GYM_LABELS.jobs.apply} loading={loading} onClick={onApply} className="flex-1" />
            <Button title="Cancelar" variant="outline" onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function InstructorApplicationCard({ app }: { app: JobApplication }) {
  return (
    <li className="relative overflow-hidden rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 shadow-sm transition hover:shadow-md">
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-amber-500/10 to-transparent" />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold text-[var(--fn-text)]">{app.jobTitle ?? 'Oferta'}</p>
          <p className="mt-0.5 text-sm font-bold text-[var(--fn-primary)]">{app.institutionName}</p>
        </div>
        <Badge label={app.status} size="sm" />
      </div>
      {app.message ? (
        <p className="relative mt-3 flex gap-2 text-sm leading-relaxed text-[var(--fn-text-secondary)]">
          <MessageSquare size={15} className="mt-0.5 shrink-0 text-[var(--fn-text-muted)]" />
          {app.message}
        </p>
      ) : null}
      <p className="relative mt-3 flex items-center gap-1.5 text-xs text-[var(--fn-text-muted)]">
        <Calendar size={12} />
        {new Date(app.createdAt).toLocaleString('es-UY')}
      </p>
    </li>
  );
}

export function GymApplicationCard({ app }: { app: JobApplication }) {
  const initials = (app.instructorName ?? 'I')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <li className="flex gap-4 rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 shadow-sm transition hover:border-orange-500/25 hover:shadow-md">
      {app.instructorPhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={app.instructorPhotoUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-2xl border border-[var(--fn-border)] object-cover"
        />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 text-lg font-black text-orange-700 dark:text-orange-300">
          {initials || <UserCircle size={28} />}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-extrabold text-[var(--fn-text)]">
            {app.instructorName ?? 'Instructor'}
          </span>
          <Badge label={app.status} size="sm" />
        </div>
        {app.message ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--fn-text-secondary)]">{app.message}</p>
        ) : (
          <p className="mt-2 text-sm italic text-[var(--fn-text-muted)]">Sin mensaje adjunto</p>
        )}
        <p className="mt-2 text-xs text-[var(--fn-text-muted)]">
          {new Date(app.createdAt).toLocaleString('es-UY')}
        </p>
      </div>
    </li>
  );
}

export function JobsEmptyState({
  title,
  description,
  icon: Icon = Briefcase,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--fn-border)] bg-gradient-to-b from-[var(--fn-surface-muted)]/40 to-transparent px-8 py-16 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--fn-primary-muted)] to-violet-500/15 text-[var(--fn-primary)] shadow-inner">
        <Icon size={30} strokeWidth={2} />
      </span>
      <p className="text-lg font-extrabold text-[var(--fn-text)]">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--fn-text-muted)]">{description}</p>
      ) : null}
    </div>
  );
}

export function JobsSearchBar({
  value,
  onChange,
  onSearch,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 shadow-sm sm:flex-row sm:items-end">
      <Input
        label="Buscar empleos"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Yoga, CrossFit, Pilates…'}
        className="flex-1"
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
      />
      <Button title="Buscar" onClick={onSearch} className="sm:mb-0.5">
        Buscar
      </Button>
    </div>
  );
}
