'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, ClipboardList, Users, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/page-header';
import {
  ClassFormLayout,
  ClassFormPreview,
  ClassFormSection,
  ClassFormSegment,
  ClassFormShell,
  classFormatModalityOptions,
} from '@/components/class-form/class-form-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { DISCIPLINES } from '@/constants/fitnexia';
import {
  ALERT_LABELS,
  DISCIPLINE_LABELS,
  GYM_LABELS,
  INSTRUCTOR_LABELS,
  modalityBadgeLabel,
} from '@/constants/labels';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { apiListLinkedInstructors, type LinkedInstructor } from '@/services/api';
import { resolveInstitutionId } from '@/utils/gym-classes';
import { combineDateAndTime, dateToTimeString, defaultClassStart, timeStringToDate } from '@/utils/schedule';
import { ApiClientError } from '@/services/api-client';
import type { Modality } from '@/types/api';

type AssignmentModel = 'model_a' | 'model_b';

export default function GymCreateClassPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addClass } = useClasses();
  const { showNotice } = useNoticeModal();
  const defaults = defaultClassStart();
  const segmentOptions = classFormatModalityOptions();
  const institutionId = resolveInstitutionId(user);
  const institutionName = user?.institutionProfile?.name ?? 'Gimnasio';

  const [linkedInstructors, setLinkedInstructors] = useState<LinkedInstructor[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [assignmentModel, setAssignmentModel] = useState<AssignmentModel>('model_a');
  const [instructorId, setInstructorId] = useState('');
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState<string>(DISCIPLINES[0]);
  const [modality, setModality] = useState<Modality>('in_person');
  const [startDate, setStartDate] = useState(() => defaults.date.toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(() => dateToTimeString(defaults.time));
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('25');
  const [capacity, setCapacity] = useState('12');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'institution') return;
    apiListLinkedInstructors()
      .then((res) => setLinkedInstructors(res.data))
      .finally(() => setLoadingStaff(false));
  }, [user?.role]);

  const selectedInstructor = linkedInstructors.find((i) => i.id === instructorId);

  const previewStartAt = useMemo(() => {
    try {
      return combineDateAndTime(new Date(startDate), timeStringToDate(startTime)).toISOString();
    } catch {
      return '';
    }
  }, [startDate, startTime]);

  const disciplineOptions = DISCIPLINES.map((d) => ({
    value: d,
    label: DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS],
  }));

  const linkedInstructorOptions = linkedInstructors.map((i) => ({
    value: i.id,
    label: i.displayName,
  }));

  const previewInstructorName =
    assignmentModel === 'model_b' && selectedInstructor
      ? selectedInstructor.displayName
      : GYM_LABELS.classes.gymHostedClass;

  const handleAssignmentModelChange = (model: AssignmentModel) => {
    setAssignmentModel(model);
    if (model === 'model_a') {
      setInstructorId('');
    }
  };

  const publish = async () => {
    if (!title.trim()) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: INSTRUCTOR_LABELS.classForm.classNameRequired,
        variant: 'error',
      });
      return;
    }
    if (assignmentModel === 'model_b' && !selectedInstructor) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: GYM_LABELS.classes.modelBInstructorRequired,
        variant: 'error',
      });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const durationMinutes = parseInt(duration, 10);
      const priceAmount = Math.round(parseFloat(price) * 100);
      const cap = parseInt(capacity, 10);
      const startAt = combineDateAndTime(new Date(startDate), timeStringToDate(startTime)).toISOString();

      await addClass({
        title: title.trim(),
        discipline,
        modality,
        classFormat: 'group',
        startAt,
        durationMinutes,
        price: { amount: priceAmount, currency: 'UYU' },
        capacity: cap,
        spotsLeft: cap,
        instructor:
          assignmentModel === 'model_b' && selectedInstructor
            ? { id: instructorId, displayName: selectedInstructor.displayName }
            : undefined,
        institution: { id: institutionId, name: institutionName },
        location:
          modality === 'in_person'
            ? { lat: -34.6, lng: -58.38, label: institutionName }
            : undefined,
      });
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: INSTRUCTOR_LABELS.classForm.classPublished,
        variant: 'success',
      });
      router.push('/gym/classes');
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'No se pudo publicar la clase');
    } finally {
      setLoading(false);
    }
  };

  if (loadingStaff) {
    return (
      <ClassFormShell>
        <PageHeader title={GYM_LABELS.classes.addClass} showBack />
        <p className="text-[var(--fn-text-muted)]">Cargando instructores…</p>
      </ClassFormShell>
    );
  }

  return (
    <ClassFormShell>
      <PageHeader title={GYM_LABELS.classes.addClass} showBack />

      <div className="mb-2 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
        {GYM_LABELS.classes.groupOnly}
      </div>

      <ClassFormLayout
        main={
          <>
            <ClassFormSection
              title={GYM_LABELS.classes.assignmentMode}
              description={GYM_LABELS.classes.assignmentModeHint}
              icon={Users}
            >
              <ClassFormSegment
                label={GYM_LABELS.classes.assignmentMode}
                value={assignmentModel}
                onChange={handleAssignmentModelChange}
                options={[
                  {
                    value: 'model_a',
                    label: GYM_LABELS.classes.modelA,
                    hint: GYM_LABELS.classes.modelAHint,
                  },
                  {
                    value: 'model_b',
                    label: GYM_LABELS.classes.modelB,
                    hint: GYM_LABELS.classes.modelBHint,
                  },
                ]}
              />

              {assignmentModel === 'model_b' ? (
                linkedInstructors.length > 0 ? (
                  <Select
                    label={GYM_LABELS.classes.pickInstructor}
                    value={instructorId}
                    onChange={setInstructorId}
                    options={linkedInstructorOptions}
                    placeholder="Elegí un instructor"
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 px-4 py-5 text-center">
                    <p className="text-sm text-[var(--fn-text-muted)]">
                      {GYM_LABELS.classes.noLinkedInstructors}
                    </p>
                    <Link href="/gym/instructors" className="mt-3 inline-block">
                      <Button title={GYM_LABELS.classes.goToInstructors} variant="outline" size="sm" />
                    </Link>
                  </div>
                )
              ) : (
                <p className="text-sm text-[var(--fn-text-muted)]">{GYM_LABELS.classes.modelAHint}</p>
              )}
            </ClassFormSection>

            <ClassFormSection
              title={INSTRUCTOR_LABELS.classForm.basicsSection}
              description={INSTRUCTOR_LABELS.classForm.basicsSectionHint}
              icon={ClipboardList}
            >
              <Input
                label={INSTRUCTOR_LABELS.classForm.className}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Spin grupal, funcional en equipo…"
              />
              <Select
                label={INSTRUCTOR_LABELS.classForm.discipline}
                value={discipline}
                onChange={setDiscipline}
                options={disciplineOptions}
              />
              <ClassFormSegment
                label={INSTRUCTOR_LABELS.classForm.modality}
                value={modality}
                onChange={setModality}
                options={segmentOptions.modality}
              />
            </ClassFormSection>

            <ClassFormSection
              title={INSTRUCTOR_LABELS.classForm.scheduleSection}
              description={INSTRUCTOR_LABELS.classForm.scheduleSectionHint}
              icon={CalendarClock}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={INSTRUCTOR_LABELS.classForm.date}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label={INSTRUCTOR_LABELS.classForm.time}
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <Input
                  label={INSTRUCTOR_LABELS.classForm.duration}
                  type="number"
                  min="15"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="sm:col-span-2"
                />
              </div>
            </ClassFormSection>

            <ClassFormSection
              title={INSTRUCTOR_LABELS.classForm.pricingSection}
              description={INSTRUCTOR_LABELS.classForm.pricingSectionHint}
              icon={Wallet}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={INSTRUCTOR_LABELS.classForm.price}
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <Input
                  label={INSTRUCTOR_LABELS.classForm.capacity}
                  type="number"
                  min="2"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>
              <p className="text-sm text-[var(--fn-text-muted)]">
                {modalityBadgeLabel(modality)} · Clase grupal
              </p>
            </ClassFormSection>
          </>
        }
        aside={
          <div className="space-y-5">
            <ClassFormPreview
              title={title}
              discipline={discipline}
              modality={modality}
              classFormat="group"
              startAt={previewStartAt}
              durationMinutes={parseInt(duration, 10) || 0}
              priceAmount={Math.round(parseFloat(price || '0') * 100)}
              capacity={parseInt(capacity, 10) || 0}
              instructorName={previewInstructorName}
            />
            {error ? <p className="text-sm text-[var(--fn-error)]">{error}</p> : null}
            <Button
              title={INSTRUCTOR_LABELS.classForm.publishClass}
              className="w-full"
              loading={loading}
              onClick={publish}
            />
          </div>
        }
      />
    </ClassFormShell>
  );
}
