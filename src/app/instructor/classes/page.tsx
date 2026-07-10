'use client';

import Link from 'next/link';

import { ClassCard } from '@/components/class-card';
import { LiveStreamJoinLink } from '@/components/live-stream/live-stream-join-link';
import { Button } from '@/components/ui/button';
import {
  DashboardClassGrid,
  DashboardHero,
  DashboardPage,
  DashboardSection,
  DASHBOARD_GRADIENTS,
} from '@/components/dashboard/dashboard-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { getLinkedInstructorId } from '@/utils/instructor';
import { isOnlineClass } from '@/utils/live-stream';
import { INSTRUCTOR_LABELS } from '@/constants/labels';

export default function InstructorClassesPage() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const mine = getClassesByInstructor(getLinkedInstructorId(user));

  return (
    <DashboardPage>
      <DashboardHero
        gradient={DASHBOARD_GRADIENTS.instructor}
        eyebrow={INSTRUCTOR_LABELS.classes.yourClasses}
        title="Gestiona y publica tus sesiones"
      >
        <Link href="/instructor/create-class">
          <Button title={INSTRUCTOR_LABELS.dashboard.newClass} className="shadow-lg shadow-black/20" />
        </Link>
      </DashboardHero>

      <DashboardSection
        title={`${mine.length} ${mine.length === 1 ? 'clase activa' : 'clases activas'}`}
        action={
          <Link href="/instructor/create-class">
            <Button title={INSTRUCTOR_LABELS.classForm.newClass} variant="outline" size="sm" />
          </Link>
        }
      >
        {mine.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-6 py-12 text-center">
            <p className="text-[var(--fn-text-muted)]">
              {INSTRUCTOR_LABELS.classes.noClassesYet} Crea tu primera clase para empezar a recibir reservas.
            </p>
            <Link href="/instructor/create-class" className="mt-4 inline-block">
              <Button title={INSTRUCTOR_LABELS.classForm.publishClass} />
            </Link>
          </div>
        ) : (
          <DashboardClassGrid>
            {mine.map((c) => (
              <div key={c.id} className="flex flex-col gap-2">
                <ClassCard item={c} showEdit editHref={`/instructor/edit-class/${c.id}`} />
                {isOnlineClass(c.modality) ? (
                  <LiveStreamJoinLink
                    classId={c.id}
                    startAt={c.startAt}
                    durationMinutes={c.durationMinutes}
                    className="self-start"
                  />
                ) : null}
              </div>
            ))}
          </DashboardClassGrid>
        )}
      </DashboardSection>
    </DashboardPage>
  );
}
