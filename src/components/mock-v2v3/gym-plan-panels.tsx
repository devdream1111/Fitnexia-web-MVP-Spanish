'use client';

import { useState } from 'react';
import { Check, Circle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnalyticsMetricsPanel } from '@/components/mock-v2v3/analytics-metrics-panel';
import { ALERT_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { mockAttendanceService } from '@/services/mock/attendance.mock';
import { mockStaffSchedulesService } from '@/services/mock/staff-schedules.mock';
import { mockActivitiesService } from '@/services/mock/activities.mock';
import { mockGymBillingService } from '@/services/mock/gym-billing.mock';
import {
  mockBrandingService,
  mockEnterpriseService,
} from '@/services/mock/gym-enterprise.mock';
import { mockGymReportsService } from '@/services/mock/gym-reports.mock';
import { mockInstructorProService } from '@/services/mock/instructor-pro.mock';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { formatMoneyFromCents } from '@/utils/format';
import { formatAttendanceRate } from '@/utils/gym-metrics';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';

export function GymBasicReportsPanel() {
  const data = mockGymReportsService.getBasic();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Socios inactivos" value={String(data.inactiveMembers)} />
        <MiniStat label="Crecimiento" value={`${Math.round(data.growthPct * 100)}%`} />
        <MiniStat label="Ocupación" value={formatAttendanceRate(data.attendanceRate)} />
      </div>
      <AnalyticsMetricsPanel snapshot={data} />
    </div>
  );
}

export function GymAdvancedReportsPanel() {
  const data = mockGymReportsService.getAdvanced();
  return (
    <div className="space-y-6">
      <GymBasicReportsPanel />
      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
        <h3 className="mb-4 font-bold">Segmentación de socios</h3>
        <ul className="space-y-3">
          {data.memberSegments.map((s) => (
            <li key={s.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{s.label}</span>
                <span>{s.count} ({Math.round(s.pct * 100)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--fn-surface-muted)]">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${s.pct * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[var(--fn-text-muted)]">
          Retención: {formatAttendanceRate(data.retentionRate)} · Proyección:{' '}
          {formatMoneyFromCents(data.revenueProjectionCents, DEFAULT_CURRENCY)}
        </p>
      </section>
    </div>
  );
}

export function StaffSchedulesPanel({ institutionId }: { institutionId: string }) {
  const [rows, setRows] = useState(() => mockStaffSchedulesService.list(institutionId));
  const weekdays = MOCK_V2V3_LABELS.weekdayNames;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--fn-border)]">
      <table className="w-full min-w-[32rem] text-sm">
        <thead className="bg-[var(--fn-surface-muted)] text-left">
          <tr>
            <th className="px-4 py-3 font-semibold">Profesional</th>
            <th className="px-4 py-3 font-semibold">Clase</th>
            <th className="px-4 py-3 font-semibold">Día</th>
            <th className="px-4 py-3 font-semibold">Horario</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[var(--fn-border)]">
              <td className="px-4 py-3">{r.instructorName}</td>
              <td className="px-4 py-3">{r.classTitle}</td>
              <td className="px-4 py-3">{weekdays[r.weekday]}</td>
              <td className="px-4 py-3">{r.startTime}–{r.endTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AttendanceRosterPanel({ institutionId }: { institutionId: string }) {
  const { showNotice } = useNoticeModal();
  const [rows, setRows] = useState(() => mockAttendanceService.list(institutionId));

  const mark = (bookingId: string, present: boolean) => {
    mockAttendanceService.setPresent(institutionId, bookingId, present);
    setRows(mockAttendanceService.list(institutionId));
    showNotice({
      title: ALERT_LABELS.savedTitle,
      message: MOCK_V2V3_LABELS.attendanceSaved,
      variant: 'success',
    });
  };

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.bookingId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--fn-border)] p-4">
          <div>
            <p className="font-semibold">{r.athleteName}</p>
            <p className="text-sm text-[var(--fn-text-muted)]">{r.classTitle}</p>
          </div>
          <div className="flex gap-2">
            <Button
              title={MOCK_V2V3_LABELS.attendanceMarkPresent}
              size="sm"
              variant={r.present === true ? 'primary' : 'outline'}
              onClick={() => mark(r.bookingId, true)}
            />
            <Button
              title={MOCK_V2V3_LABELS.attendanceMarkAbsent}
              size="sm"
              variant={r.present === false ? 'primary' : 'outline'}
              onClick={() => mark(r.bookingId, false)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ClubBrandingPanel({ institutionId }: { institutionId: string }) {
  const [branding, setBranding] = useState(() => mockBrandingService.get(institutionId));
  const { showNotice } = useNoticeModal();

  const save = () => {
    mockBrandingService.save(institutionId, branding);
    showNotice({ title: ALERT_LABELS.savedTitle, message: 'Marca guardada (demostración).', variant: 'success' });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
      <p className="text-sm text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.brandingHint}</p>
      <div
        className="rounded-xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }}
      >
        <p className="text-lg font-bold">{branding.logoLabel}</p>
        <p className="text-sm opacity-90">Vista previa para socios</p>
      </div>
      <Input
        label="Color primario"
        value={branding.primaryColor}
        onChange={(e) => setBranding((b) => ({ ...b, primaryColor: e.target.value }))}
      />
      <Input
        label="Color acento"
        value={branding.accentColor}
        onChange={(e) => setBranding((b) => ({ ...b, accentColor: e.target.value }))}
      />
      <Button title="Guardar marca" onClick={save} />
    </div>
  );
}

export function ActivitiesPanel({ institutionId }: { institutionId: string }) {
  const [items, setItems] = useState(() => mockActivitiesService.list(institutionId));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((a) => (
        <article key={a.id} className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
          <h3 className="font-bold">{a.title}</h3>
          <p className="text-sm capitalize text-[var(--fn-text-muted)]">{a.type}</p>
          <p className="mt-2 text-sm">
            {a.enrolled}/{a.capacity} inscriptos
            {a.waitlist > 0 ? ` · ${a.waitlist} en lista de espera` : ''}
          </p>
          <p className="mt-1 text-sm font-medium">
            {a.priceCents === 0 ? 'Gratis' : formatMoneyFromCents(a.priceCents, DEFAULT_CURRENCY)}
          </p>
        </article>
      ))}
    </div>
  );
}

export function EnterpriseOnboardingPanel({ institutionId }: { institutionId: string }) {
  const [onboarding, setOnboarding] = useState(() => mockEnterpriseService.getOnboarding(institutionId));

  const toggle = (id: string) => {
    setOnboarding(mockEnterpriseService.toggleStep(institutionId, id));
  };

  return (
    <ul className="space-y-3">
      {onboarding.steps.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => toggle(s.id)}
            className="flex w-full items-center gap-3 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 text-left"
          >
            {s.done ? (
              <Check size={20} className="text-emerald-600" />
            ) : (
              <Circle size={20} className="text-[var(--fn-text-muted)]" />
            )}
            <span className={s.done ? 'line-through opacity-70' : 'font-medium'}>{s.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function IntegrationsPanel({ institutionId }: { institutionId: string }) {
  const [items, setItems] = useState(() => mockEnterpriseService.listIntegrations(institutionId));

  const toggle = (id: string) => {
    setItems(mockEnterpriseService.toggleIntegration(institutionId, id));
  };

  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.id} className="flex items-center justify-between rounded-xl border border-[var(--fn-border)] p-4">
          <div>
            <p className="font-semibold">{i.name}</p>
            <p className="text-sm text-[var(--fn-text-muted)]">{i.description}</p>
          </div>
          <Button
            title={i.connected ? 'Desconectar' : 'Conectar'}
            size="sm"
            variant={i.connected ? 'outline' : 'primary'}
            onClick={() => toggle(i.id)}
          />
        </li>
      ))}
    </ul>
  );
}

export function GymBillingPanel({
  institutionId,
  monthlyFeeCents,
}: {
  institutionId: string;
  monthlyFeeCents: number;
}) {
  const { showNotice } = useNoticeModal();
  const [billing, setBilling] = useState(() => mockGymBillingService.get(institutionId));

  const subscribe = () => {
    setBilling(mockGymBillingService.enableAutoBilling(institutionId, monthlyFeeCents));
    showNotice({
      title: ALERT_LABELS.savedTitle,
      message: MOCK_V2V3_LABELS.gymBillingDemo,
      variant: 'success',
    });
  };

  if (billing.autoBillingEnabled) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <p className="font-bold text-emerald-800 dark:text-emerald-200">{MOCK_V2V3_LABELS.gymBillingActive}</p>
        <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
          Próximo cargo: {billing.nextChargeAt ? new Date(billing.nextChargeAt).toLocaleDateString('es-UY') : '—'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
      <p className="text-sm text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.gymBillingDemo}</p>
      <Button title={MOCK_V2V3_LABELS.gymBillingSubscribe} className="mt-4" onClick={subscribe} />
    </div>
  );
}

export function InstructorProSubscribePanel({ instructorId }: { instructorId: string }) {
  const { showNotice } = useNoticeModal();
  const [state, setState] = useState(() => mockInstructorProService.get(instructorId));

  const subscribe = () => {
    setState(mockInstructorProService.subscribe(instructorId));
    showNotice({
      title: ALERT_LABELS.savedTitle,
      message: MOCK_V2V3_LABELS.gymBillingDemo,
      variant: 'success',
    });
  };

  if (state.subscribed) {
    return (
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5">
        <p className="font-bold">{MOCK_V2V3_LABELS.instructorProActive}</p>
        <p className="mt-1 text-sm text-[var(--fn-text-muted)]">Comisión reducida al 8%</p>
      </div>
    );
  }

  return <Button title={MOCK_V2V3_LABELS.instructorProSubscribe} onClick={subscribe} />;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4">
      <p className="text-xs text-[var(--fn-text-muted)]">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
