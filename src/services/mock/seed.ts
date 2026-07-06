import type { CreditBalance, Notification, Review } from '@/types/api';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';

export interface MockWaitlistEntry {
  id: string;
  classId: string;
  userId: string;
  classTitle: string;
  startAt: string;
  position: number;
  createdAt: string;
}

export interface MockPaymentMethod {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface MockSupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface MockRecordedClass {
  id: string;
  title: string;
  discipline: string;
  durationMinutes: number;
  thumbnailUrl?: string;
  recordedAt: string;
  instructorName: string;
  watchProgressPct: number;
}

export interface MockStreamSession {
  classId: string;
  joinUrl: string;
  meetingId: string;
  passcode: string;
}

export interface MockReviewResponse {
  reviewId: string;
  response: string;
  respondedAt: string;
}

export interface MockWeeklyScheduleDay {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface MockAnalyticsSnapshot {
  bookings: number;
  revenueCents: number;
  attendanceRate: number;
  bookingsChangePct: number;
  revenueChangePct: number;
  attendanceChangePct: number;
  daily: { label: string; bookings: number; revenueCents: number; attendancePct: number }[];
  topClasses: { title: string; attendancePct: number; bookings: number }[];
}

export function seedNotifications(userId: string, role: string): Notification[] {
  const base = new Date();
  const iso = (daysAgo: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  if (role === 'athlete') {
    return [
      {
        id: `mock-n-${userId}-1`,
        type: 'booking_confirmed',
        title: 'Reserva confirmada',
        body: 'Tu lugar en Yoga matutino está confirmado para el jueves.',
        read: false,
        createdAt: iso(0),
      },
      {
        id: `mock-n-${userId}-2`,
        type: 'waitlist',
        title: 'Lista de espera',
        body: 'Estás en posición #2 para Functional HIIT. Te avisaremos si se libera un cupo.',
        read: false,
        createdAt: iso(1),
      },
      {
        id: `mock-n-${userId}-3`,
        type: 'credits',
        title: 'Créditos de fidelidad',
        body: 'Te quedan 120 créditos. ¡Estás cerca de una clase gratis!',
        read: true,
        createdAt: iso(3),
      },
    ];
  }

  if (role === 'instructor') {
    return [
      {
        id: `mock-n-${userId}-1`,
        type: 'new_booking',
        title: 'Nueva reserva',
        body: 'María reservó tu clase de Pilates reformer.',
        read: false,
        createdAt: iso(0),
      },
      {
        id: `mock-n-${userId}-2`,
        type: 'review',
        title: 'Nueva reseña',
        body: 'Recibiste 5 estrellas en Spinning intenso. Puedes responder desde tu perfil.',
        read: true,
        createdAt: iso(2),
      },
    ];
  }

  return [
    {
      id: `mock-n-${userId}-1`,
      type: 'member_payment',
      title: 'Pago de socio',
      body: 'Juan Pérez completó el pago mensual del plan Familiar.',
      read: false,
      createdAt: iso(0),
    },
    {
      id: `mock-n-${userId}-2`,
      type: 'delinquency',
      title: 'Cuota vencida',
      body: '2 socios tienen pagos vencidos esta semana.',
      read: false,
      createdAt: iso(1),
    },
  ];
}

export function seedCreditBalance(): CreditBalance {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 2);
  return {
    balance: 120,
    creditsUntilReward: 30,
    expiresAt: expires.toISOString(),
    lastBookingAt: new Date().toISOString(),
    freeClassEligible: false,
    maxFreeClassValue: { amount: 250000, currency: DEFAULT_CURRENCY },
  };
}

export function seedPaymentMethods(): MockPaymentMethod[] {
  return [
    {
      id: 'mock-pm-1',
      brand: 'visa',
      last4: '4242',
      expMonth: 8,
      expYear: 2028,
      isDefault: true,
    },
    {
      id: 'mock-pm-2',
      brand: 'mastercard',
      last4: '8210',
      expMonth: 3,
      expYear: 2027,
      isDefault: false,
    },
  ];
}

export function seedRecordedClasses(): MockRecordedClass[] {
  return [
    {
      id: 'mock-rec-1',
      title: 'Yoga para principiantes',
      discipline: 'yoga',
      durationMinutes: 45,
      recordedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      instructorName: 'Ana García',
      watchProgressPct: 100,
    },
    {
      id: 'mock-rec-2',
      title: 'Core & movilidad',
      discipline: 'functional',
      durationMinutes: 35,
      recordedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      instructorName: 'Carlos Méndez',
      watchProgressPct: 42,
    },
    {
      id: 'mock-rec-3',
      title: 'Spinning — sesión express',
      discipline: 'cycling',
      durationMinutes: 30,
      recordedAt: new Date(Date.now() - 86400000).toISOString(),
      instructorName: 'Lucía Fernández',
      watchProgressPct: 0,
    },
  ];
}

export function seedReviewResponses(): MockReviewResponse[] {
  return [
    {
      reviewId: 'mock-review-1',
      response:
        '¡Gracias por tu reseña! Me alegra que hayas disfrutado la sesión. Te espero la próxima semana.',
      respondedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ];
}

export function seedWeeklySchedule(): MockWeeklyScheduleDay[] {
  return [
    { weekday: 1, enabled: true, startTime: '09:00', endTime: '13:00' },
    { weekday: 2, enabled: true, startTime: '09:00', endTime: '13:00' },
    { weekday: 3, enabled: false, startTime: '09:00', endTime: '13:00' },
    { weekday: 4, enabled: true, startTime: '14:00', endTime: '20:00' },
    { weekday: 5, enabled: true, startTime: '09:00', endTime: '18:00' },
    { weekday: 6, enabled: true, startTime: '10:00', endTime: '14:00' },
    { weekday: 0, enabled: false, startTime: '10:00', endTime: '14:00' },
  ];
}

export function seedAnalytics(): MockAnalyticsSnapshot {
  return {
    bookings: 47,
    revenueCents: 385000,
    attendanceRate: 0.78,
    bookingsChangePct: 0.12,
    revenueChangePct: 0.08,
    attendanceChangePct: -0.03,
    daily: [
      { label: 'Lun', bookings: 6, revenueCents: 48000, attendancePct: 0.72 },
      { label: 'Mar', bookings: 8, revenueCents: 62000, attendancePct: 0.81 },
      { label: 'Mié', bookings: 5, revenueCents: 41000, attendancePct: 0.68 },
      { label: 'Jue', bookings: 9, revenueCents: 71000, attendancePct: 0.85 },
      { label: 'Vie', bookings: 11, revenueCents: 89000, attendancePct: 0.79 },
      { label: 'Sáb', bookings: 5, revenueCents: 42000, attendancePct: 0.74 },
      { label: 'Dom', bookings: 3, revenueCents: 32000, attendancePct: 0.65 },
    ],
    topClasses: [
      { title: 'Functional HIIT', attendancePct: 0.92, bookings: 14 },
      { title: 'Yoga flow', attendancePct: 0.86, bookings: 11 },
      { title: 'Spinning', attendancePct: 0.79, bookings: 9 },
    ],
  };
}

export function enrichReviewsWithMockResponses(reviews: Review[]): Review[] {
  const responses = seedReviewResponses();
  const map = new Map(responses.map((r) => [r.reviewId, r.response]));
  return reviews.map((review) => {
    const response = map.get(review.id) ?? review.response;
    return response ? { ...review, response } : review;
  });
}
