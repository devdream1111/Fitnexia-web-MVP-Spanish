'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { useClasses } from '@/contexts/classes-context';

export default function EditClassPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getClassById, updateClass } = useClasses();
  const cls = getClassById(id ?? '');
  const [title, setTitle] = useState(cls?.title ?? '');
  const [capacity, setCapacity] = useState(String(cls?.capacity ?? 12));

  if (!cls) {
    return (
      <div className="mx-auto max-w-lg px-6 py-12">
        <PageHeader title="Edit class" showBack />
        <p>Class not found.</p>
      </div>
    );
  }

  const save = () => {
    const cap = parseInt(capacity, 10);
    updateClass(cls.id, { title: title.trim(), capacity: cap, spotsLeft: Math.min(cls.spotsLeft ?? cap, cap) });
    alert('Class updated (mock)');
    router.back();
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <PageHeader title="Edit class" showBack />
      <Input label="Class name" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input label="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      <Button title="Save changes" className="mt-4" onClick={save} />
    </div>
  );
}
