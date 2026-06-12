'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
import { combineDateAndTime, dateToTimeString, defaultClassStart, timeStringToDate } from '@/utils/schedule';
import { ApiClientError } from '@/services/api-client';
import type { Modality } from '@/types/api';

export default function GymCreateClassPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addClass } = useClasses();
  const { showNotice } = useNoticeModal();
  const defaults = defaultClassStart();
  const segmentOptions = classFormatModalityOptions();

  const [linkedInstructors, setLinkedInstructors] = useState<LinkedInstructor[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
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
      .then((res) => {
        setLinkedInstructors(res.data);
        if (res.data[0]) setInstructorId(res.data[0].id);
      })
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

  const instructorOptions = linkedInstructors.map((i) => ({
    value: i.id,
    label: i.displayName,
  }));

  const publish = async () => {
    if (!title.trim()) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: INSTRUCTOR_LABELS.classForm.classNameRequired,
        variant: 'error',
      });
      return;
    }
    if (!instructorId || !selectedInstructor) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: GYM_LABELS.classes.noLinkedInstructors,
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
        instructor: { id: instructorId, displayName: selectedInstructor.displayName },
        location:
          modality === 'in_person'
            ? { lat: -34.6, lng: -58.38, label: user?.institutionProfile?.name ?? 'Gimnasio' }
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

  if (linkedInstructors.length === 0) {
    return (
      <ClassFormShell>
        <PageHeader title={GYM_LABELS.classes.addClass} showBack />
        <div className="rounded-2xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-6 py-14 text-center">
          <Users size={40} className="mx-auto mb-4 text-[var(--fn-primary)]" />
          <p className="text-[var(--fn-text-muted)]">{GYM_LABELS.classes.noLinkedInstructors}</p>
          <Link href="/gym/instructors" className="mt-6 inline-block">
            <Button title={GYM_LABELS.classes.goToInstructors} />
          </Link>
        </div>
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
              title={GYM_LABELS.classes.pickInstructor}
              description={GYM_LABELS.classes.pickInstructorHint}
              icon={Users}
            >
              <Select
                label={GYM_LABELS.classes.pickInstructor}
                value={instructorId}
                onChange={setInstructorId}
                options={instructorOptions}
              />
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
              instructorName={selectedInstructor?.displayName ?? ''}
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
