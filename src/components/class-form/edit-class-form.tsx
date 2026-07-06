'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, ClipboardList, Wallet } from 'lucide-react';

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
import { ClassLocationField } from '@/components/class-form/class-location-field';
import { ClassMetadataFields } from '@/components/class-form/class-metadata-fields';
import { ClassCancelPanel } from '@/components/class-form/class-cancel-panel';
import { RecurrenceSeriesPanel } from '@/components/class-form/recurrence-series-panel';
import {
  RecurrenceEditScopeModal,
  type RecurrenceEditScope,
} from '@/components/class-form/recurrence-edit-scope-modal';
import { RegularClassBadge } from '@/components/regular-class-badge';
import { ModalPortal } from '@/components/ui/modal-portal';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import { coerceDiscipline, disciplineSelectOptions } from '@/utils/disciplines';
import {
  ALERT_LABELS,
  BUTTON_LABELS,
  GENERAL_LABELS,
  INSTRUCTOR_LABELS,
  MODALITY_LABELS,
  RECURRENCE_LABELS,
  SCREEN_TITLES,
} from '@/constants/labels';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useFeature } from '@/hooks/use-feature';
import { ApiClientError } from '@/services/api-client';
import { apiGetClass, apiGetClassSeries, apiGetClassSeriesInstances } from '@/services/api';
import { classStartAtFromForm, splitClassStartForForm } from '@/utils/schedule';
import { buildLocationPayload, labelFromClassLocation } from '@/utils/class-location';
import { formatRecurrenceWeekdays, isClassInPast } from '@/utils/class-recurrence';
import { formatSeriesTime, getSeriesIdFromClass, isRecurringClass, normalizeClassRecurrence } from '@/utils/class-series';
import type { Class, ClassFormat, ClassLevel, ClassSeries, Modality } from '@/types/api';

export type EditClassFormProps = {
  classId: string;
  successRedirect: string;
  pageTitle?: string;
};

export function EditClassForm({
  classId,
  successRedirect,
  pageTitle = INSTRUCTOR_LABELS.classForm.editClass,
}: EditClassFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    updateClass,
    updateClassWithRecurrenceScope,
    pauseRecurrenceSeries,
    resumeRecurrenceSeries,
    deleteRecurrenceSeries,
    cancelClass,
  } = useClasses();
  const { showNotice } = useNoticeModal();
  const recurringEnabled = useFeature('recurringClasses');
  const segmentOptions = classFormatModalityOptions();

  const [pageLoading, setPageLoading] = useState(true);
  const [cls, setCls] = useState<Class | null>(null);
  const [series, setSeries] = useState<ClassSeries | null>(null);
  const [seriesInstanceCount, setSeriesInstanceCount] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discipline, setDiscipline] = useState<string>('');
  const [modality, setModality] = useState<Modality>('in_person');
  const [classFormat, setClassFormat] = useState<ClassFormat>('group');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('25');
  const [capacity, setCapacity] = useState('12');
  const [level, setLevel] = useState<ClassLevel | ''>('');
  const [language, setLanguage] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [seriesBusy, setSeriesBusy] = useState<'pause' | 'delete' | null>(null);
  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const [error, setError] = useState('');

  const isPrivate = classFormat === 'individual';
  const seriesId = cls ? getSeriesIdFromClass(cls) : undefined;
  const isSeriesMember = recurringEnabled && Boolean(seriesId);
  const isPastClass = cls ? isClassInPast(cls.startAt) : false;

  const hydrateFromClass = useCallback(
    async (loaded: Class) => {
      setCls(loaded);
      setTitle(loaded.title);
      setDescription(loaded.description ?? '');
      setDiscipline(coerceDiscipline(loaded.discipline));
      setModality(loaded.modality);
      setClassFormat(loaded.classFormat ?? 'group');
      const start = splitClassStartForForm(loaded.startAt);
      setStartDate(start.date);
      setStartTime(start.time);
      setDuration(String(loaded.durationMinutes));
      setPrice(String((loaded.price.amount / 100).toFixed(2)));
      setCapacity(String(loaded.capacity ?? 12));
      setLevel(loaded.level ?? '');
      setLanguage(loaded.language ?? '');
      setLocationLabel(labelFromClassLocation(loaded.location));

      const sid = getSeriesIdFromClass(loaded);
      if (!recurringEnabled || !sid) {
        setSeries(null);
        setSeriesInstanceCount(0);
        return;
      }

      try {
        const [seriesData, instances] = await Promise.all([
          apiGetClassSeries(sid),
          apiGetClassSeriesInstances(sid),
        ]);
        setSeries(seriesData);
        setSeriesInstanceCount(instances.data.length);
      } catch {
        setSeries(null);
        setSeriesInstanceCount(0);
      }
    },
    [recurringEnabled],
  );

  useEffect(() => {
    if (!classId) {
      setCls(null);
      setPageLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setPageLoading(true);
      setError('');
      try {
        const raw = await apiGetClass(classId);
        if (cancelled) return;
        const loaded = normalizeClassRecurrence(raw) as Class;
        await hydrateFromClass(loaded);
      } catch {
        if (!cancelled) setCls(null);
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [classId, hydrateFromClass]);

  useEffect(() => {
    if (isPrivate) setCapacity('1');
  }, [isPrivate]);

  const instructorName =
    cls?.instructor?.displayName ??
    user?.instructorProfile?.displayName ??
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const previewStartAt = useMemo(() => {
    try {
      return classStartAtFromForm(startDate, startTime);
    } catch {
      return cls?.startAt ?? '';
    }
  }, [startDate, startTime, cls?.startAt]);

  const disciplineOptions = disciplineSelectOptions();

  const buildUpdates = (scope?: RecurrenceEditScope) => {
    const cap = isPrivate ? 1 : parseInt(capacity, 10);
    const updates = {
      title: title.trim(),
      description: description.trim() || undefined,
      discipline: coerceDiscipline(discipline),
      modality,
      classFormat,
      level: level || undefined,
      language: language || undefined,
      durationMinutes: parseInt(duration, 10),
      price: {
        amount: Math.round(parseFloat(price) * 100),
        currency: cls?.price.currency || DEFAULT_CURRENCY,
      },
      capacity: cap,
      location: buildLocationPayload(modality, locationLabel, cls?.location),
      ...(!isPastClass ? { startAt: classStartAtFromForm(startDate, startTime) } : {}),
    };

    if (isSeriesMember && scope === 'following') {
      const { startAt: _omit, ...withoutSchedule } = updates;
      return withoutSchedule;
    }

    return updates;
  };

  const persistUpdates = async (scope: RecurrenceEditScope) => {
    if (!cls) return;
    setLoading(true);
    setError('');
    try {
      const updates = buildUpdates(scope);
      if (isSeriesMember && scope === 'following') {
        await updateClassWithRecurrenceScope(cls.id, updates, 'following');
      } else if (isSeriesMember) {
        await updateClassWithRecurrenceScope(cls.id, updates, 'single');
      } else {
        await updateClass(cls.id, updates);
      }
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: INSTRUCTOR_LABELS.classForm.classUpdated,
        variant: 'success',
      });
      router.push(successRedirect);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'No se pudo guardar');
    } finally {
      setLoading(false);
      setScopeModalOpen(false);
    }
  };

  const save = () => {
    if (!title.trim()) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: INSTRUCTOR_LABELS.classForm.classNameRequired,
        variant: 'error',
      });
      return;
    }
    if (modality === 'in_person' && !locationLabel.trim()) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: INSTRUCTOR_LABELS.classForm.locationRequired,
        variant: 'error',
      });
      return;
    }
    if (isSeriesMember && series?.status !== 'deleted') {
      setScopeModalOpen(true);
      return;
    }
    void persistUpdates('single');
  };

  const handleCancelClass = async () => {
    if (!cls) return;
    setCancelling(true);
    try {
      await cancelClass(cls.id);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: INSTRUCTOR_LABELS.classForm.classCancelled,
        variant: 'success',
      });
      router.push(successRedirect);
    } catch (e) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message:
          e instanceof ApiClientError ? e.message : INSTRUCTOR_LABELS.classForm.classCancelFailed,
        variant: 'error',
      });
    } finally {
      setCancelling(false);
    }
  };

  const handlePauseSeries = async () => {
    if (!series) return;
    setSeriesBusy('pause');
    try {
      if (series.status === 'paused') {
        await resumeRecurrenceSeries(series.id);
      } else {
        await pauseRecurrenceSeries(series.id);
      }
      const refreshed = await apiGetClassSeries(series.id);
      setSeries(refreshed);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message:
          refreshed.status === 'paused'
            ? RECURRENCE_LABELS.pauseSeriesDone
            : RECURRENCE_LABELS.resumeSeriesDone,
        variant: 'success',
      });
    } catch (e) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: e instanceof ApiClientError ? e.message : 'No se pudo actualizar la serie',
        variant: 'error',
      });
    } finally {
      setSeriesBusy(null);
    }
  };

  const handleDeleteSeries = async () => {
    if (!series) return;
    setSeriesBusy('delete');
    try {
      const { skipped } = await deleteRecurrenceSeries(series.id);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message:
          skipped > 0
            ? `${RECURRENCE_LABELS.deleteSeriesDone} ${RECURRENCE_LABELS.deleteSeriesPartial}`
            : RECURRENCE_LABELS.deleteSeriesDone,
        variant: skipped > 0 ? 'info' : 'success',
      });
      router.push(successRedirect);
    } catch (e) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: e instanceof ApiClientError ? e.message : 'No se pudo eliminar la serie',
        variant: 'error',
      });
    } finally {
      setSeriesBusy(null);
    }
  };

  if (pageLoading) {
    return (
      <ClassFormShell>
        <PageHeader title={pageTitle} showBack />
        <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      </ClassFormShell>
    );
  }

  if (!cls) {
    return (
      <ClassFormShell>
        <PageHeader title={pageTitle} showBack />
        <p className="text-[var(--fn-text-muted)]">{SCREEN_TITLES.classNotFound}</p>
      </ClassFormShell>
    );
  }

  return (
    <ClassFormShell>
      <PageHeader title={pageTitle} showBack />

      {isSeriesMember && cls.isSeriesException ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          {RECURRENCE_LABELS.seriesExceptionNotice}
        </p>
      ) : null}

      {isSeriesMember && series?.status === 'deleted' ? (
        <p className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)] px-4 py-3 text-sm text-[var(--fn-text-muted)]">
          {RECURRENCE_LABELS.seriesDeletedNotice}
        </p>
      ) : null}

      {isSeriesMember && series && series.status !== 'deleted' ? (
        <RecurrenceSeriesPanel
          series={series}
          instanceCount={seriesInstanceCount}
          onPause={handlePauseSeries}
          onResume={handlePauseSeries}
          onDelete={handleDeleteSeries}
          busy={seriesBusy}
        />
      ) : null}

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
              <Textarea
                label={INSTRUCTOR_LABELS.classForm.description}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
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
              <ClassMetadataFields
                level={level}
                language={language}
                onLevelChange={setLevel}
                onLanguageChange={setLanguage}
              />
              {modality === 'in_person' ? (
                <ClassLocationField value={locationLabel} onChange={setLocationLabel} />
              ) : null}
            </ClassFormSection>

            <ClassFormSection
              title={INSTRUCTOR_LABELS.classForm.scheduleSection}
              description={INSTRUCTOR_LABELS.classForm.scheduleSectionHint}
              icon={CalendarClock}
            >
              {isSeriesMember && series ? (
                <div className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm text-[var(--fn-text-secondary)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <RegularClassBadge item={cls} size="sm" />
                    <span>
                      {formatRecurrenceWeekdays(series.weekdays)} · {formatSeriesTime(series.timeOfDay)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--fn-text-muted)]">
                    {RECURRENCE_LABELS.editScheduleSingleHint}
                  </p>
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={INSTRUCTOR_LABELS.classForm.date}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isPastClass}
                />
                <Input
                  label={INSTRUCTOR_LABELS.classForm.time}
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isPastClass}
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
                {isPastClass ? ' · Esta sesión ya pasó; la fecha y hora no se pueden cambiar.' : ''}
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
              locationLabel={modality === 'in_person' ? locationLabel : undefined}
            />
            {isRecurringClass(cls) ? (
              <div className="flex justify-center">
                <RegularClassBadge item={cls} size="default" />
              </div>
            ) : null}
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

      {scopeModalOpen ? (
        <ModalPortal>
          <RecurrenceEditScopeModal
            open={scopeModalOpen}
            onClose={() => setScopeModalOpen(false)}
            onConfirm={(scope) => void persistUpdates(scope)}
          />
        </ModalPortal>
      ) : null}
    </ClassFormShell>
  );
}
