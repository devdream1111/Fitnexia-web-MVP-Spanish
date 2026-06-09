'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ClassCard } from '@/components/class-card';
import { TAB_LABELS } from '@/constants/labels';
import { useClasses } from '@/contexts/classes-context';

export default function AdminClassesPage() {
  const { classes } = useClasses();
  return (
    <div className="space-y-6">
      <PageHeader title={TAB_LABELS.admin.classes} showBack />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map(c => (
          <ClassCard key={c.id} item={c} showEdit editHref={`/admin/classes/${c.id}`} />
        ))}
      </div>
    </div>
  );
}
