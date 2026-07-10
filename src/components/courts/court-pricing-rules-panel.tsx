'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ALERT_LABELS, GENERAL_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiCreateCourtPricingRule,
  apiDeleteCourtPricingRule,
  apiListCourtPricingRules,
  apiListMyCourts,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type { Court, CourtPricingRule } from '@/types/api';
import { formatMoney } from '@/utils/format';
import { isActiveCourt } from '@/utils/courts';

function pesosToCents(value: string): number {
  const n = Number(value.replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export function CourtPricingRulesPanel() {
  const { showNotice } = useNoticeModal();
  const [rules, setRules] = useState<CourtPricingRule[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState('Tarifa general');
  const [courtId, setCourtId] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('22:00');
  const [memberPesos, setMemberPesos] = useState('800');
  const [guestPesos, setGuestPesos] = useState('1200');
  const [isPeak, setIsPeak] = useState(false);
  const [isWeekend, setIsWeekend] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, courtsRes] = await Promise.all([
        apiListCourtPricingRules(),
        apiListMyCourts(),
      ]);
      setRules(rulesRes.data ?? []);
      setCourts((courtsRes.data ?? []).filter(isActiveCourt));
    } catch {
      setRules([]);
      setCourts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    const memberAmount = pesosToCents(memberPesos);
    const guestAmount = pesosToCents(guestPesos);
    if (memberAmount <= 0 || guestAmount <= 0) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: 'Ingresá precios válidos para socio y no socio.',
        variant: 'error',
      });
      return;
    }
    setSaving(true);
    try {
      await apiCreateCourtPricingRule({
        label: label.trim() || 'Tarifa',
        courtId: courtId || null,
        startTime,
        endTime,
        isPeak,
        isWeekend,
        memberPrice: { amount: memberAmount, currency: DEFAULT_CURRENCY },
        nonMemberPrice: { amount: guestAmount, currency: DEFAULT_CURRENCY },
        priority: isPeak || isWeekend ? 10 : 0,
      });
      await load();
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: 'Tarifa creada.',
        variant: 'success',
      });
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo crear la tarifa',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setSaving(true);
    try {
      await apiDeleteCourtPricingRule(id);
      await load();
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo eliminar la tarifa',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
      <h3 className="m-0 font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.courtPricingTitle}</h3>
      <p className="m-0 text-sm text-[var(--fn-text-muted)]">
        Definí tarifas por franja (pico / fin de semana) y precio socio vs. no socio.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Etiqueta" value={label} onChange={(e) => setLabel(e.target.value)} compact />
        <Select
          label="Cancha (opcional)"
          value={courtId}
          onChange={setCourtId}
          options={[
            { value: '', label: 'Todas las canchas' },
            ...courts.map((c) => ({ value: c.id, label: c.name })),
          ]}
          compact
        />
        <Input
          label="Apertura franja"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          compact
        />
        <Input
          label="Cierre franja"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          compact
        />
        <Input
          label={`${MOCK_V2V3_LABELS.courtMemberPrice} (UYU)`}
          value={memberPesos}
          onChange={(e) => setMemberPesos(e.target.value)}
          compact
        />
        <Input
          label={`${MOCK_V2V3_LABELS.courtGuestPrice} (UYU)`}
          value={guestPesos}
          onChange={(e) => setGuestPesos(e.target.value)}
          compact
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Checkbox label="Hora pico" checked={isPeak} onChange={() => setIsPeak((v) => !v)} />
        <Checkbox
          label="Fin de semana"
          checked={isWeekend}
          onChange={() => setIsWeekend((v) => !v)}
        />
        <Button title={MOCK_V2V3_LABELS.courtPricingAdd} loading={saving} onClick={() => void add()}>
          <Plus size={16} />
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : rules.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--fn-border)] px-4 py-6 text-center text-sm text-[var(--fn-text-muted)]">
          {MOCK_V2V3_LABELS.courtPricingEmpty}
        </p>
      ) : (
        <ul className="m-0 list-none space-y-2 p-0">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--fn-border)] px-4 py-3 text-sm"
            >
              <div>
                <p className="m-0 font-semibold text-[var(--fn-text)]">
                  {rule.label || 'Tarifa'} · {rule.startTime}–{rule.endTime}
                </p>
                <p className="mt-1 m-0 text-xs text-[var(--fn-text-muted)]">
                  Socio {formatMoney(rule.memberPrice)} · No socio {formatMoney(rule.nonMemberPrice)}
                  {rule.isPeak ? ' · Pico' : ''}
                  {rule.isWeekend ? ' · Fin de semana' : ''}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-[var(--fn-text-muted)] hover:bg-[var(--fn-primary-muted)] hover:text-[var(--fn-primary-text)]"
                aria-label="Eliminar tarifa"
                disabled={saving}
                onClick={() => void remove(rule.id)}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
