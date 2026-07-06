'use client';

import { useParams } from 'next/navigation';

import { EditClassForm } from '@/components/class-form/edit-class-form';
import { GYM_LABELS } from '@/constants/labels';

export default function GymEditClassPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <EditClassForm
      classId={id ?? ''}
      successRedirect="/gym/classes"
      pageTitle={GYM_LABELS.classes.editClass}
    />
  );
}
