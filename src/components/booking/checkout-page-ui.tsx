'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  Lock,
  MapPin,
  ShieldCheck,
  UserRound,
  Video,
} from 'lucide-react';

import { PaymentModelPicker } from '@/components/booking/payment-model-picker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  classFormatBadgeLabel,
  DISCIPLINE_LABELS,
  GENERAL_LABELS,
  modalityBadgeLabel,
} from '@/constants/labels';
import { formatClassDate, formatMoney } from '@/utils/format';
import type {
  BillingPeriod,
  ClassBookingPaymentOptions,
  ClassListItem,
  Money,
  PaymentModel,
} from '@/types/api';

function CheckoutMetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fn-text-muted)]">
          {label}
        </p>
        <p className="text-sm font-medium text-[var(--fn-text)]">{value}</p>
      </div>
    </div>
  );
}

export function CheckoutPageUI({
  title,
  cls,
  isWaitlist,
  subscriptionModelsEnabled,
  optionsLoading,
  paymentOptions,
  paymentModel,
  billingPeriod,
  onSelectPayment,
  selectedOptionCovered,
  checkoutTotal,
  paymentsEnabled,
  error,
  loading,
  confirmLabel,
  onConfirm,
}: {
  title: string;
  cls: ClassListItem;
  isWaitlist: boolean;
  subscriptionModelsEnabled: boolean;
  optionsLoading: boolean;
  paymentOptions: ClassBookingPaymentOptions | null;
  paymentModel: PaymentModel;
  billingPeriod?: BillingPeriod;
  onSelectPayment: (model: PaymentModel, period?: BillingPeriod) => void;
  selectedOptionCovered?: boolean;
  checkoutTotal?: Money;
  paymentsEnabled: boolean;
  error: string;
  loading: boolean;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  const router = useRouter();
  const locationLabel =
    cls.modality === 'online'
      ? 'Clase online'
      : cls.location?.label ?? cls.institution?.name ?? 'Por confirmar';

  const displayTotal =
    selectedOptionCovered && checkoutTotal
      ? formatMoney({ amount: 0, currency: checkoutTotal.currency })
      : checkoutTotal
        ? formatMoney(checkoutTotal)
        : '—';

  return (
    <div className="fn-checkout-page">
      <div className="fn-checkout-hero">
        <div className="fn-layout-shell fn-checkout-hero-inner">
          <button
            type="button"
            onClick={() => router.back()}
            className="fn-checkout-back"
            aria-label={GENERAL_LABELS.back}
          >
            <ArrowLeft size={18} />
            {GENERAL_LABELS.back}
          </button>
          <div className="fn-checkout-hero-copy">
            <span className="fn-checkout-secure-badge">
              <Lock size={14} />
              {GENERAL_LABELS.secureCheckout}
            </span>
            <h1 className="fn-checkout-title">{title}</h1>
            <p className="fn-checkout-subtitle">
              {isWaitlist
                ? GENERAL_LABELS.waitlistNote
                : 'Revisá los detalles y elegí cómo querés pagar antes de confirmar.'}
            </p>
          </div>
        </div>
      </div>

      <div className="fn-layout-shell fn-checkout-body">
        <div className="fn-checkout-grid">
          <div className="fn-checkout-main">
            <section className="fn-checkout-card">
              <h2 className="fn-checkout-section-title">{GENERAL_LABELS.classDetails}</h2>
              <div className="fn-checkout-class-row">
                <div className="fn-checkout-class-thumb">
                  <Dumbbell size={32} className="text-white drop-shadow" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-[var(--fn-text)]">{cls.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      label={
                        DISCIPLINE_LABELS[cls.discipline as keyof typeof DISCIPLINE_LABELS] ??
                        cls.discipline
                      }
                    />
                    <Badge label={classFormatBadgeLabel(cls.classFormat)} variant="success" />
                    <Badge label={modalityBadgeLabel(cls.modality)} />
                  </div>
                </div>
              </div>

              <div className="fn-checkout-meta-grid">
                <CheckoutMetaRow
                  icon={Calendar}
                  label="Fecha y hora"
                  value={formatClassDate(cls.startAt)}
                />
                <CheckoutMetaRow
                  icon={Clock}
                  label="Duración"
                  value={`${cls.durationMinutes} ${GENERAL_LABELS.min}`}
                />
                <CheckoutMetaRow icon={UserRound} label="Instructor" value={cls.instructor.displayName} />
                <CheckoutMetaRow
                  icon={cls.modality === 'online' ? Video : MapPin}
                  label="Ubicación"
                  value={locationLabel}
                />
              </div>
            </section>

            {!isWaitlist && subscriptionModelsEnabled ? (
              <section className="fn-checkout-card">
                <h2 className="fn-checkout-section-title">{GENERAL_LABELS.choosePaymentModel}</h2>
                {optionsLoading || !paymentOptions ? (
                  <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
                ) : (
                  <PaymentModelPicker
                    options={paymentOptions}
                    selectedModel={paymentModel}
                    selectedPeriod={billingPeriod}
                    onSelect={onSelectPayment}
                    disabled={loading}
                  />
                )}
                {selectedOptionCovered ? (
                  <p className="fn-checkout-success-note">{GENERAL_LABELS.subscriptionCoversBooking}</p>
                ) : null}
              </section>
            ) : null}

            {!paymentsEnabled && !isWaitlist && !selectedOptionCovered ? (
              <div className="fn-checkout-demo-note">
                <ShieldCheck size={18} className="shrink-0 text-[var(--fn-primary)]" />
                <p>{GENERAL_LABELS.paymentIntegrationDemo}</p>
              </div>
            ) : null}

            {error ? <p className="fn-checkout-error">{error}</p> : null}
          </div>

          <aside className="fn-checkout-sidebar">
            <div className="fn-checkout-summary">
              <h2 className="fn-checkout-section-title">{GENERAL_LABELS.orderSummary}</h2>
              <div className="fn-checkout-summary-lines">
                <div className="fn-checkout-summary-line">
                  <span>{cls.title}</span>
                  <span>{checkoutTotal ? formatMoney(checkoutTotal) : '—'}</span>
                </div>
                {selectedOptionCovered ? (
                  <div className="fn-checkout-summary-line fn-checkout-summary-line--discount">
                    <span>Plan activo</span>
                    <span>Incluido</span>
                  </div>
                ) : null}
              </div>
              <div className="fn-checkout-summary-total">
                <span>{GENERAL_LABELS.total}</span>
                <span>{displayTotal}</span>
              </div>
              <Button
                title={confirmLabel}
                loading={loading}
                className="mt-6 w-full"
                size="md"
                onClick={onConfirm}
              />
              <p className="fn-checkout-summary-footnote">
                <Lock size={12} className="inline" /> Pago procesado de forma segura
              </p>
            </div>
          </aside>
        </div>
      </div>

      <div className="fn-checkout-mobile-cta md:hidden">
        <div className="fn-checkout-mobile-cta-inner">
          <div>
            <p className="text-xs text-[var(--fn-text-muted)]">{GENERAL_LABELS.total}</p>
            <p className="text-xl font-extrabold text-[var(--fn-primary)]">{displayTotal}</p>
          </div>
          <Button title={confirmLabel} loading={loading} size="md" onClick={onConfirm} />
        </div>
      </div>
    </div>
  );
}
