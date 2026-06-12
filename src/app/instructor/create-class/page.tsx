'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, ClipboardList, Sparkles, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { ALERT_LABELS, INSTRUCTOR_LABELS, DISCIPLINE_LABELS } from '@/constants/labels';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { getLinkedInstructorId } from '@/utils/instructor';
import { combineDateAndTime, dateToTimeString, defaultClassStart, timeStringToDate } from '@/utils/schedule';
import { ApiClientError } from '@/services/api-client';
import type { ClassFormat, Modality } from '@/types/api';

export default function CreateClassPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addClass } = useClasses();
  const { showNotice } = useNoticeModal();
  const defaults = defaultClassStart();
  const instructorId = getLinkedInstructorId(user);
  const segmentOptions = classFormatModalityOptions();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discipline, setDiscipline] = useState<string>(DISCIPLINES[0]);
  const [modality, setModality] = useState<Modality>('in_person');
  const [classFormat, setClassFormat] = useState<ClassFormat>('group');
  const [startDate, setStartDate] = useState(() => defaults.date.toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(() => dateToTimeString(defaults.time));
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('25');
  const [capacity, setCapacity] = useState('12');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPrivate = classFormat === 'individual';

  useEffect(() => {
    if (isPrivate) setCapacity('1');
  }, [isPrivate]);

  const instructorName =
    user?.instructorProfile?.displayName ?? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

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

  const publish = async () => {
    if (!title.trim()) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: INSTRUCTOR_LABELS.classForm.classNameRequired,
        variant: 'error',
      });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const durationMinutes = parseInt(duration, 10);
      const priceAmount = Math.round(parseFloat(price) * 100);
      const cap = isPrivate ? 1 : parseInt(capacity, 10);
      const startAt = combineDateAndTime(new Date(startDate), timeStringToDate(startTime)).toISOString();

      await addClass({
        title: title.trim(),
        description: description.trim() || undefined,
        discipline,
        modality,
        classFormat,
        startAt,
        durationMinutes,
        price: { amount: priceAmount, currency: 'UYU' },
        capacity: cap,
        spotsLeft: cap,
        instructor: { id: instructorId, displayName: instructorName },
        location:
          modality === 'in_person'
            ? { lat: -34.6, lng: -58.38, label: 'Studio' }
            : undefined,
      });
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: INSTRUCTOR_LABELS.classForm.classPublished,
        variant: 'success',
      });
      router.push('/instructor/classes');
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'No se pudo publicar la clase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClassFormShell>
      <PageHeader title={INSTRUCTOR_LABELS.classForm.newClass} showBack />

      <ClassFormLayout
        main={
          <>
            <ClassFormSection
              title={INSTRUCTOR_LABELS.classForm.basicsSection}
              description={INSTRUCTOR_LABELS.classForm.basicsSectionHint}
              icon={ClipboardList}
            >
              <Input
                label={INSTRUCTOR_LABELS.classForm.className}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Yoga matutino, HIIT funcional…"
              />
              <Textarea
                label={INSTRUCTOR_LABELS.classForm.description}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={INSTRUCTOR_LABELS.classForm.descriptionPlaceholder}
                rows={4}
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
              <ClassFormSegment
                label={INSTRUCTOR_LABELS.classForm.classFormat}
                value={classFormat}
                onChange={setClassFormat}
                options={segmentOptions.classFormat}
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
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  disabled={isPrivate}
                />
              </div>
              {isPrivate ? (
                <p className="text-sm text-[var(--fn-text-muted)]">
                  Las clases privadas tienen capacidad fija de 1 participante.
                </p>
              ) : null}
            </ClassFormSection>
          </>
        }
        aside={
          <div className="space-y-5">
            <ClassFormPreview
              title={title}
              discipline={discipline}
              modality={modality}
              classFormat={classFormat}
              startAt={previewStartAt}
              durationMinutes={parseInt(duration, 10) || 0}
              priceAmount={Math.round(parseFloat(price || '0') * 100)}
              capacity={isPrivate ? 1 : parseInt(capacity, 10) || 0}
              instructorName={instructorName}
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
