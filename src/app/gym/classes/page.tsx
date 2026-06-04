'use client';

import Link from 'next/link';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { resolveInstitutionId } from '@/utils/gym-classes';

export default function GymClassesPage() {
  const { user } = useAuth();
  const { classes } = useClasses();
  const institutionId = resolveInstitutionId(user);
  const gymClasses = classes.filter((c) => c.institution?.id === institutionId);

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h1 className="text-3xl font-extrabold">Classes</h1>
        <Link href="/create-class">
          <Button title="Add class" size="sm" />
        </Link>
      </div>
      {gymClasses.map((c) => (
        <ClassCard key={c.id} item={c} />
      ))}
    </div>
  );
}
