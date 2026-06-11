'use client';

import { useParams } from 'next/navigation';

import { ClassDetailModal } from '@/components/class-detail/class-detail-modal';

export default function InterceptedClassDetailModal() {
  const { id } = useParams<{ id: string }>();
  return <ClassDetailModal classId={id} />;
}
