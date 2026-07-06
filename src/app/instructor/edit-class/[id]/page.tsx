'use client';

import { useParams } from 'next/navigation';

import { EditClassForm } from '@/components/class-form/edit-class-form';

export default function InstructorEditClassPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <EditClassForm classId={id ?? ''} successRedirect="/instructor/classes" />
  );
}
