'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Shield } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { apiGetPaymentsConfig } from '@/services/api';
import { SCREEN_TITLES } from '@/constants/labels';

export default function PaymentMethodsPage() {
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    apiGetPaymentsConfig()
      .then((cfg) => setPaymentsEnabled(cfg.enabled))
      .catch(() => setPaymentsEnabled(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={SCREEN_TITLES.paymentMethods} showBack />

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
            <CreditCard size={22} />
          </span>
          <div>
            <h2 className="font-bold text-[var(--fn-text)]">Métodos de pago guardados</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fn-text-muted)]">
              {paymentsEnabled === null
                ? 'Cargando configuración de pagos…'
                : paymentsEnabled
                  ? 'Los pagos integrados están activos. Al reservar una clase, completarás el pago de forma segura en el checkout. La opción de guardar tarjetas estará disponible próximamente.'
                  : 'Los pagos integrados aún no están habilitados en tu región. Puedes reservar clases y consultar tu historial de pagos cuando estén disponibles.'}
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-[var(--fn-text-secondary)]">
        <Shield size={18} className="mt-0.5 shrink-0 text-emerald-600" />
        <p>Tus datos de pago se procesan de forma segura a través de proveedores certificados.</p>
      </section>
    </div>
  );
}
