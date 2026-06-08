'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { DISCIPLINES } from '@/constants/fitnexia';
import { MODALITY_LABELS, INSTRUCTOR_LABELS, DISCIPLINE_LABELS } from '@/constants/labels';
import { getLinkedInstructorId } from '@/utils/instructor';
import { combineDateAndTime, dateToTimeString, defaultClassStart, timeStringToDate } from '@/utils/schedule';
import type { Modality } from '@/types/api';

export default function CreateClassPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addClass } = useClasses();
  const defaults = defaultClassStart();
  const instructorId = getLinkedInstructorId(user);

  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState<string>(DISCIPLINES[0]);
  const [modality, setModality] = useState<Modality>('in_person');
  const [startDate, setStartDate] = useState(() => defaults.date.toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(() => dateToTimeString(defaults.time));
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('25');
  const [capacity, setCapacity] = useState('12');

  const publish = () => {
    if (!title.trim()) {
      alert(INSTRUCTOR_LABELS.classForm.classNameRequired);
      return;
    }
    const durationMinutes = parseInt(duration, 10);
    const priceAmount = Math.round(parseFloat(price) * 100);
    const cap = parseInt(capacity, 10);
    const startAt = combineDateAndTime(new Date(startDate), timeStringToDate(startTime)).toISOString();
    const displayName =
      user?.instructorProfile?.displayName ?? `${user?.firstName} ${user?.lastName}`.trim();

    addClass({
      title: title.trim(),
      discipline,
      modality,
      startAt,
      durationMinutes,
      price: { amount: priceAmount, currency: 'USD' },
      capacity: cap,
      spotsLeft: cap,
      instructor: { id: instructorId, displayName },
      location:
        modality === 'in_person'
          ? { lat: -34.6, lng: -58.38, label: 'Studio' }
          : undefined,
    });
    alert(INSTRUCTOR_LABELS.classForm.classPublished);
    router.back();
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <PageHeader title={INSTRUCTOR_LABELS.classForm.newClass} showBack />
      <Input label={INSTRUCTOR_LABELS.classForm.className} value={title} onChange={(e) => setTitle(e.target.value)} />
      <p className="mb-2 text-sm font-medium">{INSTRUCTOR_LABELS.classForm.discipline}</p>
      <div className="mb-4 flex flex-wrap">
        {DISCIPLINES.map((d) => (
          <FilterChip key={d} label={DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS]} active={discipline === d} onPress={() => setDiscipline(d)} />
        ))}
      </div>
      <p className="mb-2 text-sm font-medium">{INSTRUCTOR_LABELS.classForm.modality}</p>
      <div className="mb-4 flex flex-wrap">
        <FilterChip
          label={MODALITY_LABELS.inPerson}
          active={modality === 'in_person'}
          onPress={() => setModality('in_person')}
        />
        <FilterChip
          label={MODALITY_LABELS.online}
          active={modality === 'online'}
          onPress={() => setModality('online')}
        />
      </div>
      <Input label={INSTRUCTOR_LABELS.classForm.date} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <Input label={INSTRUCTOR_LABELS.classForm.time} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      <Input label={INSTRUCTOR_LABELS.classForm.duration} value={duration} onChange={(e) => setDuration(e.target.value)} />
      <Input label={INSTRUCTOR_LABELS.classForm.price} value={price} onChange={(e) => setPrice(e.target.value)} />
      <Input label={INSTRUCTOR_LABELS.classForm.capacity} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      <Button title={INSTRUCTOR_LABELS.classForm.publishClass} className="mt-4" onClick={publish} />
    </div>
  );
}
