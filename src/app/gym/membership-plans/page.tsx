'use client';

import { useCallback, useEffect, useState } from 'react';
import { Settings, Sparkles } from 'lucide-react';

import {
  ClubAlertBanner,
  ClubCardGrid,
  ClubEmptyState,
  ClubPlanCard,
  ClubPlansHero,
  ClubSection,
} from '@/components/gym/club-members-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiCreateClubMembershipPlan,
  apiDeactivateClubMembershipPlan,
  apiGetMembershipBillingSettings,
  apiListClubMembershipPlans,
  apiUpdateClubMembershipPlan,
  apiUpdateMembershipBillingSettings,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import { ALERT_LABELS, BUTTON_LABELS, CLUB_LABELS, GENERAL_LABELS } from '@/constants/labels';
import type { ClubMembershipPlan, ClubPlanCadence, MembershipBillingSettings } from '@/types/api';
import { clubPlanCadenceLabel, normalizePlanList } from '@/utils/club-members';

const CADENCE_OPTIONS: { value: ClubPlanCadence; label: string }[] = [
  { value: 'monthly', label: clubPlanCadenceLabel('monthly') },
  { value: 'quarterly', label: clubPlanCadenceLabel('quarterly') },
  { value: 'annual', label: clubPlanCadenceLabel('annual') },
];

export default function GymMembershipPlansPage() {
  const { showNotice } = useNoticeModal();
  const [plans, setPlans] = useState<ClubMembershipPlan[]>([]);
  const [settings, setSettings] = useState<MembershipBillingSettings>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cadence, setCadence] = useState<ClubPlanCadence>('monthly');
  const [priceMajor, setPriceMajor] = useState('1000');
  const [familySlots, setFamilySlots] = useState('');
  const [active, setActive] = useState(true);
  const [reminderDays, setReminderDays] = useState('3');
  const [graceDays, setGraceDays] = useState('7');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const [plansResult, settingsResult] = await Promise.allSettled([
      apiListClubMembershipPlans(),
      apiGetMembershipBillingSettings(),
    ]);

    if (plansResult.status === 'fulfilled') {
      setPlans(normalizePlanList(plansResult.value));
    } else {
      setPlans([]);
      setLoadError(
        plansResult.reason instanceof ApiClientError
          ? plansResult.reason.message
          : CLUB_LABELS.plans.empty,
      );
    }

    if (settingsResult.status === 'fulfilled') {
      setSettings(settingsResult.value);
      if (settingsResult.value.reminderDaysBeforeDue != null) {
        setReminderDays(String(settingsResult.value.reminderDaysBeforeDue));
      }
      if (settingsResult.value.graceDays != null) {
        setGraceDays(String(settingsResult.value.graceDays));
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCadence('monthly');
    setPriceMajor('1000');
    setFamilySlots('');
    setActive(true);
    setShowForm(false);
  };

  const startEdit = (plan: ClubMembershipPlan) => {
    setEditingId(plan.id);
    setName(plan.name);
    setCadence(plan.cadence);
    setPriceMajor(String(Math.round(plan.price.amount / 100)));
    setFamilySlots(plan.familySlots ? String(plan.familySlots) : '');
    setActive(plan.active);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const amount = Math.round(parseFloat(priceMajor) * 100);
    if (!Number.isFinite(amount) || amount <= 0) return;

    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        cadence,
        price: { amount, currency: DEFAULT_CURRENCY },
        familySlots: familySlots ? parseInt(familySlots, 10) : undefined,
        active,
      };
      if (editingId) {
        await apiUpdateClubMembershipPlan(editingId, body);
      } else {
        await apiCreateClubMembershipPlan(body);
      }
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.plans.saved,
        variant: 'success',
      });
      resetForm();
      await load();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo guardar',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm(CLUB_LABELS.plans.deactivated + '?')) return;
    try {
      await apiDeactivateClubMembershipPlan(id);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.plans.deactivated,
        variant: 'success',
      });
      await load();
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo desactivar',
        variant: 'error',
      });
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const days = parseInt(reminderDays, 10);
      const grace = parseInt(graceDays, 10);
      const updated = await apiUpdateMembershipBillingSettings({
        reminderDaysBeforeDue: Number.isFinite(days) ? days : undefined,
        graceDays: Number.isFinite(grace) ? grace : undefined,
      });
      setSettings(updated);
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: CLUB_LABELS.plans.saved,
        variant: 'success',
      });
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: error instanceof ApiClientError ? error.message : 'No se pudo guardar',
        variant: 'error',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <ClubPlansHero />
      <p className="max-w-2xl text-sm text-[var(--fn-text-muted)]">{CLUB_LABELS.plans.fitnexiaPlanHint}</p>

      <ClubSection title={CLUB_LABELS.plans.settingsTitle} subtitle={CLUB_LABELS.plans.settingsSubtitle} icon={Settings}>
        <Input
          label={CLUB_LABELS.plans.reminderDays}
          type="number"
          min={1}
          max={30}
          value={reminderDays}
          onChange={(e) => setReminderDays(e.target.value)}
        />
        <Input
          label={CLUB_LABELS.plans.graceDays}
          type="number"
          min={0}
          max={90}
          value={graceDays}
          onChange={(e) => setGraceDays(e.target.value)}
        />
        <Button
          title={CLUB_LABELS.plans.saveSettings}
          onClick={handleSaveSettings}
          loading={savingSettings}
        />
      </ClubSection>

      <ClubSection
        title={showForm ? (editingId ? CLUB_LABELS.plans.edit : CLUB_LABELS.plans.create) : 'Tus planes'}
        subtitle={showForm ? undefined : 'Creá y administrá las cuotas de tus socios.'}
        icon={Sparkles}
        actions={
          <Button
            title={showForm ? GENERAL_LABELS.cancel : CLUB_LABELS.plans.create}
            variant={showForm ? 'outline' : 'primary'}
            size="sm"
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
          />
        }
      >
        {showForm ? (
          <div className="space-y-4">
            <Input label={CLUB_LABELS.plans.name} value={name} onChange={(e) => setName(e.target.value)} />
            <Select
              label={CLUB_LABELS.plans.cadence}
              value={cadence}
              onChange={(v) => setCadence(v as ClubPlanCadence)}
              options={CADENCE_OPTIONS}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={CLUB_LABELS.plans.price}
                type="number"
                min={1}
                value={priceMajor}
                onChange={(e) => setPriceMajor(e.target.value)}
              />
              <Input
                label={CLUB_LABELS.plans.familySlots}
                type="number"
                min={0}
                value={familySlots}
                onChange={(e) => setFamilySlots(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              {CLUB_LABELS.plans.active}
            </label>
            <Button title={BUTTON_LABELS.save} onClick={handleSave} loading={saving} />
          </div>
        ) : null}

        {loadError ? <ClubAlertBanner>{loadError}</ClubAlertBanner> : null}

        {loading ? (
          <p className="text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
        ) : !showForm && plans.length === 0 ? (
          <ClubEmptyState title={CLUB_LABELS.plans.empty} icon={Sparkles} />
        ) : plans.length > 0 ? (
          <ClubCardGrid>
            {plans.map((plan) => (
              <ClubPlanCard
                key={plan.id}
                plan={plan}
                onEdit={startEdit}
                onDeactivate={handleDeactivate}
              />
            ))}
          </ClubCardGrid>
        ) : null}
      </ClubSection>
    </div>
  );
}
