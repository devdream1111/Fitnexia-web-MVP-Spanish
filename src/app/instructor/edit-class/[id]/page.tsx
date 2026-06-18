'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, ClipboardList, Wallet } from 'lucide-react';

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
import { ClassCancelPanel } from '@/components/class-form/class-cancel-panel';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import { coerceDiscipline, disciplineSelectOptions } from '@/utils/disciplines';
import {
  ALERT_LABELS,
  BUTTON_LABELS,
  INSTRUCTOR_LABELS,
  MODALITY_LABELS,
  SCREEN_TITLES,
} from '@/constants/labels';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { ApiClientError } from '@/services/api-client';
import { combineDateAndTime, dateToTimeString, timeStringToDate } from '@/utils/schedule';
import type { ClassFormat, ClassListItem, Modality } from '@/types/api';

function splitClassStart(startAt: string) {
  const date = new Date(startAt);
  return {
    date: date.toISOString().slice(0, 10),
    time: dateToTimeString(date),
  };
}

export default function EditClassPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getClassById, fetchClassById, updateClass, cancelClass } = useClasses();
  const { showNotice } = useNoticeModal();
  const segmentOptions = classFormatModalityOptions();

  const [cls, setCls] = useState<ClassListItem | undefined>(getClassById(id ?? ''));
  const [title, setTitle] = useState(cls?.title ?? '');
  const [discipline, setDiscipline] = useState(() => coerceDiscipline(cls?.discipline));
  const [modality, setModality] = useState<Modality>(cls?.modality ?? 'in_person');
  const [classFormat, setClassFormat] = useState<ClassFormat>(cls?.classFormat ?? 'group');
  const [startDate, setStartDate] = useState(() => (cls ? splitClassStart(cls.startAt).date : ''));
  const [startTime, setStartTime] = useState(() => (cls ? splitClassStart(cls.startAt).time : ''));
  const [duration, setDuration] = useState(String(cls?.durationMinutes ?? 60));
  const [price, setPrice] = useState(() =>
    cls?.price ? String((cls.price.amount / 100).toFixed(2)) : '25',
  );
  const [capacity, setCapacity] = useState(String(cls?.capacity ?? 12));
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const isPrivate = classFormat === 'individual';

  useEffect(() => {
    if (!id || cls) return;
    fetchClassById(id).then((c) => {
      if (!c) return;
      setCls(c);
      setTitle(c.title);
      setDiscipline(coerceDiscipline(c.discipline));
      setModality(c.modality);
      setClassFormat(c.classFormat ?? 'group');
      const start = splitClassStart(c.startAt);
      setStartDate(start.date);
      setStartTime(start.time);
      setDuration(String(c.durationMinutes));
      setPrice(String((c.price.amount / 100).toFixed(2)));
      setCapacity(String(c.capacity ?? 12));
    });
  }, [id, cls, fetchClassById]);

  useEffect(() => {
    if (isPrivate) setCapacity('1');
  }, [isPrivate]);

  const instructorName =
    cls?.instructor?.displayName ??
    user?.instructorProfile?.displayName ??
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const previewStartAt = useMemo(() => {
    try {
      return combineDateAndTime(new Date(startDate), timeStringToDate(startTime)).toISOString();
    } catch {
      return cls?.startAt ?? '';
    }
  }, [startDate, startTime, cls?.startAt]);

  const disciplineOptions = disciplineSelectOptions();

  if (!cls) {
    return (
      <ClassFormShell>
        <PageHeader title={INSTRUCTOR_LABELS.classForm.editClass} showBack />
        <p className="text-[var(--fn-text-muted)]">{SCREEN_TITLES.classNotFound}</p>
      </ClassFormShell>
    );
  }

  const handleCancelClass = async () => {
    if (!cls || !window.confirm('¿Cancelar esta clase? Los participantes serán notificados.')) return;
    setCancelling(true);
    try {
      await cancelClass(cls.id);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: 'Clase cancelada correctamente.',
        variant: 'success',
      });
      router.push('/instructor/classes');
    } catch (e) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: e instanceof ApiClientError ? e.message : 'No se pudo cancelar la clase',
        variant: 'error',
      });
    } finally {
      setCancelling(false);
    }
  };

  const save = async () => {
    setLoading(true);
    setError('');
    try {
      const cap = isPrivate ? 1 : parseInt(capacity, 10);
      const startAt = combineDateAndTime(new Date(startDate), timeStringToDate(startTime)).toISOString();
      await updateClass(cls.id, {
        title: title.trim(),
        discipline: coerceDiscipline(discipline),
        modality,
        classFormat,
        startAt,
        durationMinutes: parseInt(duration, 10),
        price: {
          amount: Math.round(parseFloat(price) * 100),
          currency: cls.price.currency || DEFAULT_CURRENCY,
        },
        capacity: cap,
      });
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: INSTRUCTOR_LABELS.classForm.classUpdated,
        variant: 'success',
      });
      router.push('/instructor/classes');
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClassFormShell>
      <PageHeader title={INSTRUCTOR_LABELS.classForm.editClass} showBack />

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
              <p className="text-sm text-[var(--fn-text-muted)]">
                {modality === 'online' ? MODALITY_LABELS.online : MODALITY_LABELS.inPerson}
                {isPrivate ? ' · Capacidad fija de 1 para clases privadas.' : ''}
              </p>
            </ClassFormSection>

            <ClassCancelPanel onCancel={handleCancelClass} loading={cancelling} />
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
              title={BUTTON_LABELS.saveChanges}
              className="w-full"
              loading={loading}
              onClick={save}
            />
          </div>
        }
      />
    </ClassFormShell>
  );
}
