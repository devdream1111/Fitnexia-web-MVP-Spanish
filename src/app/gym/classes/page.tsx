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
import { resolveInstitutionId } from '@/utils/gym-classes';
import { isOnlineClass } from '@/utils/live-stream';
import { GYM_LABELS } from '@/constants/labels';

export default function GymClassesPage() {
  const { user } = useAuth();
  const { classes } = useClasses();
  const institutionId = resolveInstitutionId(user);
  const gymClasses = classes.filter((c) => c.institution?.id === institutionId);

  return (
    <DashboardPage>
      <DashboardHero
        gradient={DASHBOARD_GRADIENTS.gym}
        eyebrow={GYM_LABELS.classes.yourClasses}
        title="Clases grupales de tu gimnasio"
      >
        <Link href="/gym/create-class">
          <Button title={GYM_LABELS.classes.addClass} className="shadow-lg shadow-black/20" />
        </Link>
      </DashboardHero>

      <DashboardSection
        title={`${gymClasses.length} ${gymClasses.length === 1 ? 'clase programada' : 'clases programadas'}`}
        action={
          <Link href="/gym/create-class">
            <Button title={GYM_LABELS.classes.addClass} variant="outline" size="sm" />
          </Link>
        }
      >
        {gymClasses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-6 py-14 text-center">
            <p className="text-[var(--fn-text-muted)]">{GYM_LABELS.classes.emptyClassesHint}</p>
            <Link href="/gym/create-class" className="mt-4 inline-block">
              <Button title={GYM_LABELS.classes.addClass} />
            </Link>
          </div>
        ) : (
          <DashboardClassGrid>
            {gymClasses.map((c) => (
              <div key={c.id} className="flex flex-col gap-2">
                <ClassCard item={c} showEdit editHref={`/gym/edit-class/${c.id}`} />
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
