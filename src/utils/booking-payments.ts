import { GENERAL_LABELS } from '@/constants/labels';
import type {
  BillingPeriod,
  ClassBookingPaymentOptions,
  ClassListItem,
  CreateBookingRequest,
  Money,
  PaymentModel,
} from '@/types/api';

/** Fallback monthly unlimited price (F-21) when API does not return options */
export const DEFAULT_MONTHLY_UNLIMITED_CENTS = 19900;

const PERIOD_MULTIPLIERS: Record<BillingPeriod, number> = {
  weekly: 3,
  monthly: 10,
  quarterly: 25,
};

export function buildFallbackPaymentOptions(cls: ClassListItem): ClassBookingPaymentOptions {
  const currency = cls.price.currency;
  const perClass = cls.price.amount;

  const option = (
    paymentModel: PaymentModel,
    label: string,
    description: string,
    amount: number,
    billingPeriod?: BillingPeriod,
  ) => ({
    paymentModel,
    billingPeriod,
    label,
    description,
    price: { amount, currency } satisfies Money,
  });

  return {
    classId: cls.id,
    currency,
    options: [
      option(
        'per_class',
        GENERAL_LABELS.paymentModelPerClass,
        'Pagá solo esta clase al confirmar la reserva.',
        perClass,
      ),
      option(
        'monthly_unlimited',
        GENERAL_LABELS.paymentModelMonthlyUnlimited,
        'Acceso ilimitado a clases elegibles durante 30 días.',
        DEFAULT_MONTHLY_UNLIMITED_CENTS,
      ),
      option(
        'per_period',
        GENERAL_LABELS.billingPeriodWeekly,
        'Acceso por 7 días a clases del instructor o gimnasio.',
        Math.round(perClass * PERIOD_MULTIPLIERS.weekly),
        'weekly',
      ),
      option(
        'per_period',
        GENERAL_LABELS.billingPeriodMonthly,
        'Acceso por 30 días a clases del instructor o gimnasio.',
        Math.round(perClass * PERIOD_MULTIPLIERS.monthly),
        'monthly',
      ),
      option(
        'per_period',
        GENERAL_LABELS.billingPeriodQuarterly,
        'Acceso por 90 días a clases del instructor o gimnasio.',
        Math.round(perClass * PERIOD_MULTIPLIERS.quarterly),
        'quarterly',
      ),
    ],
  };
}

export function findPaymentOption(
  options: ClassBookingPaymentOptions,
  paymentModel: PaymentModel,
  billingPeriod?: BillingPeriod,
) {
  return options.options.find(
    (o) =>
      o.paymentModel === paymentModel &&
      (paymentModel !== 'per_period' || o.billingPeriod === billingPeriod),
  );
}

export function buildCreateBookingRequest(
  classId: string,
  paymentModel: PaymentModel,
  billingPeriod?: BillingPeriod,
): CreateBookingRequest {
  const body: CreateBookingRequest = { classId, paymentModel };
  if (paymentModel === 'per_period') {
    if (!billingPeriod) {
      throw new Error('billingPeriod is required for per_period bookings');
    }
    body.billingPeriod = billingPeriod;
  }
  return body;
}

export function paymentOptionKey(paymentModel: PaymentModel, billingPeriod?: BillingPeriod): string {
  return paymentModel === 'per_period' ? `${paymentModel}:${billingPeriod}` : paymentModel;
}

export function formatBookingPaymentLabel(
  paymentModel?: PaymentModel,
  billingPeriod?: BillingPeriod,
): string | null {
  if (!paymentModel || paymentModel === 'per_class') return null;
  if (paymentModel === 'monthly_unlimited') return GENERAL_LABELS.paymentModelMonthlyUnlimited;
  if (paymentModel === 'per_period') {
    if (billingPeriod === 'weekly') return `${GENERAL_LABELS.paymentModelPerPeriod} · ${GENERAL_LABELS.billingPeriodWeekly}`;
    if (billingPeriod === 'monthly') return `${GENERAL_LABELS.paymentModelPerPeriod} · ${GENERAL_LABELS.billingPeriodMonthly}`;
    if (billingPeriod === 'quarterly') return `${GENERAL_LABELS.paymentModelPerPeriod} · ${GENERAL_LABELS.billingPeriodQuarterly}`;
    return GENERAL_LABELS.paymentModelPerPeriod;
  }
  return null;
}
