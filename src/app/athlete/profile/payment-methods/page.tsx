'use client';

import { useState } from 'react';
import { CreditCard, Plus, Shield } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ALERT_LABELS, MOCK_V2V3_LABELS, SCREEN_TITLES } from '@/constants/labels';
import {
  mockPaymentMethodsService,
  type MockPaymentMethod,
} from '@/services/mock/payment-methods.mock';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useFeature } from '@/hooks/use-feature';

export default function PaymentMethodsPage() {
  const enabled = useFeature('savedPaymentMethods');
  const { showNotice } = useNoticeModal();
  const [methods, setMethods] = useState<MockPaymentMethod[]>(() => mockPaymentMethodsService.list());
  const [showForm, setShowForm] = useState(false);
  const [last4, setLast4] = useState('');

  if (!enabled) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pb-4">
        <PageHeader
          variant="premium"
          title={SCREEN_TITLES.paymentMethods}
          showBack
          backHref="/athlete/profile"
        />
        <p className="rounded-3xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 px-6 py-10 text-center text-sm text-[var(--fn-text-muted)]">
          Los métodos de pago guardados estarán disponibles próximamente.
        </p>
      </div>
    );
  }

  const addCard = () => {
    if (last4.length !== 4) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: 'Ingresá los últimos 4 dígitos.',
        variant: 'error',
      });
      return;
    }
    setMethods(
      mockPaymentMethodsService.add({
        brand: 'visa',
        last4,
        expMonth: 12,
        expYear: 2029,
        isDefault: methods.length === 0,
      }),
    );
    setLast4('');
    setShowForm(false);
    showNotice({
      title: ALERT_LABELS.savedTitle,
      message: 'Tarjeta agregada (demostración).',
      variant: 'success',
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <PageHeader
        variant="premium"
        title={SCREEN_TITLES.paymentMethods}
        showBack
        backHref="/athlete/profile"
      />
      <div className="flex flex-wrap items-center gap-2">
        <MockDataBadge />
        <p className="text-sm text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.paymentMethodDemo}</p>
      </div>

      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
                <CreditCard size={20} />
              </span>
              <div>
                <p className="font-semibold capitalize text-[var(--fn-text)]">
                  {method.brand} ···· {method.last4}
                </p>
                <p className="text-sm text-[var(--fn-text-muted)]">
                  Vence {String(method.expMonth).padStart(2, '0')}/{method.expYear}
                  {method.isDefault ? ` · ${MOCK_V2V3_LABELS.paymentMethodDefault}` : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!method.isDefault ? (
                <Button
                  title={MOCK_V2V3_LABELS.paymentMethodDefault}
                  variant="outline"
                  size="sm"
                  onClick={() => setMethods(mockPaymentMethodsService.setDefault(method.id))}
                />
              ) : null}
              <Button
                title={MOCK_V2V3_LABELS.paymentMethodRemove}
                variant="ghost"
                size="sm"
                onClick={() => setMethods(mockPaymentMethodsService.remove(method.id))}
              />
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <section className="rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <Input
            label="Últimos 4 dígitos"
            value={last4}
            maxLength={4}
            onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
          <div className="mt-4 flex gap-2">
            <Button title="Guardar" onClick={addCard} />
            <Button title="Cancelar" variant="outline" onClick={() => setShowForm(false)} />
          </div>
        </section>
      ) : (
        <Button title={MOCK_V2V3_LABELS.paymentMethodAdd} variant="outline" onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          {MOCK_V2V3_LABELS.paymentMethodAdd}
        </Button>
      )}

      <section className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm">
        <Shield size={18} className="mt-0.5 shrink-0 text-emerald-600" />
        <p className="text-[var(--fn-text-secondary)]">
          Datos simulados. Al integrar el backend, las tarjetas se tokenizarán vía Mercado Pago.
        </p>
      </section>
    </div>
  );
}
