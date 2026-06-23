import type {
  Booking,
  ClassListItem,
  CreditBalance,
  Instructor,
  Institution,
  Review,
  Payment,
  Notification,
  GeocodeResult,
  Money,
} from '@/types/api';

import { usdCentsToUyuCents } from '@/utils/currency';
import { DEFAULT_MAP_CENTER } from '@/constants/fitnexia';

/** Punta del Este area coordinates for mock venues */
const PDE = DEFAULT_MAP_CENTER;
const PDE_STUDIO_WELLNESS = { lat: -34.958, lng: -54.94 } as const;
const PDE_ESTUDIO_A = { lat: -34.9625, lng: -54.95 } as const;
const PDE_CANCHAS = { lat: -34.965, lng: -54.955 } as const;
const PDE_LOFT = { lat: -34.957, lng: -54.938 } as const;

export { formatClassDate, formatMoney } from '@/utils/format';

export const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-1',
    userId: 'u-1',
    displayName: 'Carlos Ruiz',
    bio: 'Entrenador de tenis certificado por PTR con más de 10 años de experiencia.',
    disciplines: ['Tenis', 'Padel'],
    verified: true,
    availableNow: true,
    averageRating: 4.9,
    reviewCount: 124,
    plan: 'pro',
    hourlyRate: { amount: usdCentsToUyuCents(5000), currency: 'UYU' },
    certifications: [
      { name: 'Certificado PTR', issuer: 'PTR', year: 2018 },
      { name: 'Psicología del Deporte', issuer: 'ITF', year: 2020 },
    ],
  },
  {
    id: 'inst-2',
    userId: 'u-2',
    displayName: 'Mia Chen',
    bio: 'Instructora de yoga y mindfulness. RYT-500.',
    disciplines: ['Yoga', 'Pilates'],
    verified: true,
    availableNow: false,
    averageRating: 4.8,
    reviewCount: 89,
    plan: 'basic',
    hourlyRate: { amount: usdCentsToUyuCents(3500), currency: 'UYU' },
    certifications: [{ name: 'RYT-500', issuer: 'Yoga Alliance', year: 2019 }],
  },
  {
    id: 'inst-3',
    userId: 'u-3',
    displayName: 'James Okonkwo',
    bio: 'Especialista en HIIT y fuerza.',
    disciplines: ['HIIT', 'CrossFit'],
    verified: false,
    availableNow: false,
    averageRating: 4.6,
    reviewCount: 42,
    plan: 'basic',
  },
  {
    id: 'inst-4',
    userId: 'u-4',
    displayName: 'Lucia Gomez',
    bio: 'Entrenadora de fitness funcional y pilates.',
    disciplines: ['Fitness Funcional', 'Pilates'],
    verified: false,
    availableNow: true,
    averageRating: 4.3,
    reviewCount: 18,
    plan: 'basic',
  },
];

export const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'gym-1',
    name: 'FitHub Centro',
    description: 'Estudio de fitness premium en el centro de Punta del Este.',
    verified: true,
    plan: 'institutional',
    location: {
      address: 'Calle Principal 123',
      city: 'Punta del Este',
      country: 'UY',
      lat: PDE.lat,
      lng: PDE.lng,
    },
    instructors: [
      { id: 'inst-1', displayName: 'Carlos Ruiz' },
      { id: 'inst-2', displayName: 'Mia Chen' },
      { id: 'inst-3', displayName: 'James Okonkwo' },
    ],
  },
  {
    id: 'gym-2',
    name: 'Studio Wellness',
    description: 'Espacio dedicado al bienestar y la salud.',
    verified: false,
    plan: 'institutional',
    location: {
      address: 'Avenida del Sol 456',
      city: 'Punta del Este',
      country: 'UY',
      lat: PDE_STUDIO_WELLNESS.lat,
      lng: PDE_STUDIO_WELLNESS.lng,
    },
    instructors: [
      { id: 'inst-4', displayName: 'Lucia Gomez' },
    ],
  },
];

export const MOCK_CLASSES: ClassListItem[] = [
  {
    id: 'class-1',
    title: 'Yoga Flow Matutino',
    discipline: 'Yoga',
    modality: 'in_person',
    startAt: '2026-06-10T08:00:00Z',
    durationMinutes: 60,
    price: { amount: usdCentsToUyuCents(2500), currency: 'UYU' },
    capacity: 12,
    spotsLeft: 4,
    instructor: {
      id: 'inst-2',
      displayName: 'Mia Chen',
    },
    location: { lat: PDE_ESTUDIO_A.lat, lng: PDE_ESTUDIO_A.lng, label: 'FitHub Estudio A' },
    averageRating: 4.8,
  },
  {
    id: 'class-2',
    title: 'Fundamentos de Tenis',
    discipline: 'Tenis',
    modality: 'in_person',
    startAt: '2026-06-11T10:00:00Z',
    durationMinutes: 90,
    price: { amount: usdCentsToUyuCents(4500), currency: 'UYU' },
    capacity: 4,
    spotsLeft: 1,
    instructor: {
      id: 'inst-1',
      displayName: 'Carlos Ruiz',
    },
    location: { lat: PDE_CANCHAS.lat, lng: PDE_CANCHAS.lng, label: 'Canchas Centrales' },
    averageRating: 4.9,
  },
  {
    id: 'class-3',
    title: 'HIIT Quemador (Online)',
    discipline: 'HIIT',
    modality: 'online',
    startAt: '2026-06-12T18:00:00Z',
    durationMinutes: 45,
    price: { amount: usdCentsToUyuCents(1500), currency: 'UYU' },
    capacity: 30,
    spotsLeft: 12,
    instructor: {
      id: 'inst-3',
      displayName: 'James Okonkwo',
    },
    averageRating: 4.6,
  },
  {
    id: 'class-4',
    title: 'CrossFit Grupal',
    discipline: 'CrossFit',
    modality: 'in_person',
    startAt: '2026-06-13T07:00:00Z',
    durationMinutes: 55,
    price: { amount: usdCentsToUyuCents(2000), currency: 'UYU' },
    capacity: 20,
    spotsLeft: 0,
    instructor: {
      id: 'inst-3',
      displayName: 'James Okonkwo',
    },
    institution: { id: 'gym-1', name: 'FitHub Centro' },
    location: { lat: PDE.lat, lng: PDE.lng, label: 'FitHub Centro' },
    averageRating: 4.7,
  },
  {
    id: 'class-5',
    title: 'Pilates Vespertino',
    discipline: 'Pilates',
    modality: 'in_person',
    startAt: '2026-06-14T19:00:00Z',
    durationMinutes: 50,
    price: { amount: usdCentsToUyuCents(2800), currency: 'UYU' },
    capacity: 10,
    spotsLeft: 6,
    instructor: {
      id: 'inst-2',
      displayName: 'Mia Chen',
    },
    location: { lat: PDE_LOFT.lat, lng: PDE_LOFT.lng, label: 'Loft de Bienestar' },
    averageRating: 4.8,
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    status: 'confirmed',
    classId: 'class-1',
    userId: 'me',
    price: { amount: usdCentsToUyuCents(2500), currency: 'UYU' },
    createdAt: '2026-05-28T10:00:00Z',
  },
  {
    id: 'book-2',
    status: 'completed',
    classId: 'class-2',
    userId: 'me',
    price: { amount: usdCentsToUyuCents(4500), currency: 'UYU' },
    createdAt: '2026-05-01T10:00:00Z',
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-1',
    classId: 'class-2',
    instructorId: 'inst-1',
    userId: 'u-4',
    authorName: 'Sofia Martinez',
    rating: 5,
    comment: '¡Increíble clase de tenis! Carlos es muy paciente y conocedor.',
    createdAt: '2026-05-15T14:30:00Z',
    verified: true,
  },
  {
    id: 'review-2',
    classId: 'class-1',
    instructorId: 'inst-2',
    userId: 'u-5',
    authorName: 'Miguel Lopez',
    rating: 4,
    comment: 'Excelente flujo de yoga, la manera perfecta de empezar la mañana.',
    createdAt: '2026-05-20T09:15:00Z',
    verified: true,
  },
];

export const MOCK_CREDITS: CreditBalance = {
  balance: 7,
  creditsUntilReward: 3,
  expiresAt: '2027-06-01T00:00:00Z',
  lastBookingAt: '2026-05-28T10:00:00Z',
  freeClassEligible: false,
  maxFreeClassValue: { amount: usdCentsToUyuCents(3000), currency: 'UYU' },
};

export type GymDayMetric = {
  label: string;
  bookings: number;
  revenueCents: number;
  attendancePct: number;
};

export type GymWeeklyMetrics = {
  bookings: number;
  revenueCents: number;
  attendanceRate: number;
  bookingsChangePct: number;
  revenueChangePct: number;
  attendanceChangePct: number;
  daily: GymDayMetric[];
};

export const MOCK_GYM_WEEKLY_METRICS: GymWeeklyMetrics = {
  bookings: 47,
  revenueCents: usdCentsToUyuCents(284000),
  attendanceRate: 0.82,
  bookingsChangePct: 0.12,
  revenueChangePct: 0.08,
  attendanceChangePct: 0.05,
  daily: [
    { label: 'Lun', bookings: 6, revenueCents: usdCentsToUyuCents(36000), attendancePct: 0.65 },
    { label: 'Mar', bookings: 8, revenueCents: usdCentsToUyuCents(48000), attendancePct: 0.82 },
    { label: 'Mié', bookings: 5, revenueCents: usdCentsToUyuCents(30000), attendancePct: 0.45 },
    { label: 'Jue', bookings: 9, revenueCents: usdCentsToUyuCents(54000), attendancePct: 0.9 },
    { label: 'Vie', bookings: 8, revenueCents: usdCentsToUyuCents(48000), attendancePct: 0.78 },
    { label: 'Sáb', bookings: 7, revenueCents: usdCentsToUyuCents(42000), attendancePct: 0.95 },
    { label: 'Dom', bookings: 4, revenueCents: usdCentsToUyuCents(26000), attendancePct: 0.55 },
  ],
};

export function getClassById(id: string): ClassListItem | undefined {
  return MOCK_CLASSES.find((c) => c.id === id);
}

export function getInstructorById(id: string): Instructor | undefined {
  return MOCK_INSTRUCTORS.find((i) => i.id === id);
}

export function getInstitutionById(id: string): Institution | undefined {
  return MOCK_INSTITUTIONS.find((g) => g.id === id);
}

export function updateMockInstitution(id: string, patch: Partial<Institution>): void {
  const index = MOCK_INSTITUTIONS.findIndex((g) => g.id === id);
  if (index >= 0) {
    MOCK_INSTITUTIONS[index] = { ...MOCK_INSTITUTIONS[index], ...patch };
  }
}

export function updateMockInstructor(id: string, patch: Partial<Instructor>): void {
  const index = MOCK_INSTRUCTORS.findIndex((i) => i.id === id);
  if (index >= 0) {
    MOCK_INSTRUCTORS[index] = { ...MOCK_INSTRUCTORS[index], ...patch };
  }
}

export function getBookingById(id: string): Booking | undefined {
  return MOCK_BOOKINGS.find((b) => b.id === id);
}

export function getReviewsForClass(classId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.classId === classId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getReviewsForInstructor(instructorId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.instructorId === instructorId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addReview(review: Omit<Review, 'id' | 'createdAt' | 'verified'>): Review {
  const newReview: Review = {
    ...review,
    id: `review-${Date.now()}`,
    createdAt: new Date().toISOString(),
    verified: true,
  };
  MOCK_REVIEWS.push(newReview);
  
  // Update instructor's average rating and review count
  const instructor = getInstructorById(review.instructorId);
  if (instructor) {
    const instructorReviews = getReviewsForInstructor(review.instructorId);
    const totalRating = instructorReviews.reduce((sum, r) => sum + r.rating, 0);
    instructor.averageRating = totalRating / instructorReviews.length;
    instructor.reviewCount = instructorReviews.length;
  }
  
  return newReview;
}

export function addBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Booking {
  const newBooking: Booking = {
    ...booking,
    id: `book-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  MOCK_BOOKINGS.push(newBooking);
  
  // Update class spots left
  const cls = getClassById(booking.classId);
  if (cls && cls.spotsLeft !== undefined) {
    cls.spotsLeft = Math.max(0, cls.spotsLeft - 1);
  }
  
  return newBooking;
}

export function cancelBooking(bookingId: string): Booking | undefined {
  const index = MOCK_BOOKINGS.findIndex((b) => b.id === bookingId);
  if (index >= 0) {
    const booking: Booking = { ...MOCK_BOOKINGS[index], status: 'cancelled' as const };
    MOCK_BOOKINGS[index] = booking;
    
    // Restore class spots left
    const cls = getClassById(booking.classId);
    if (cls && cls.capacity !== undefined) {
      const bookedCount = MOCK_BOOKINGS.filter(b => b.classId === booking.classId && b.status === 'confirmed').length;
      cls.spotsLeft = cls.capacity - bookedCount;
    }
    
    return booking;
  }
  return undefined;
}

// --- Payment Data ---
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    bookingId: 'book-1',
    userId: 'me',
    amount: { amount: usdCentsToUyuCents(2500), currency: 'UYU' },
    status: 'paid',
    paymentMethod: 'Tarjeta de Crédito (Visa)',
    createdAt: '2026-05-28T10:00:00Z',
    updatedAt: '2026-05-28T10:05:00Z',
  },
  {
    id: 'pay-2',
    bookingId: 'book-2',
    userId: 'me',
    amount: { amount: usdCentsToUyuCents(4500), currency: 'UYU' },
    status: 'paid',
    paymentMethod: 'Mercado Pago',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:05:00Z',
  },
];

// --- Notification Data ---
export const MOCK_NOTIFICATIONS_BY_USER: Record<string, Notification[]> = {
  'mock-user': [ // Athlete
    {
      id: 'notif-1',
      type: 'booking_confirmed',
      title: '¡Reserva Confirmada!',
      body: 'Tu reserva para la clase de Yoga Flow Matutino ha sido confirmada.',
      read: false,
      createdAt: '2026-05-28T10:05:00Z',
    },
    {
      id: 'notif-2',
      type: 'class_reminder',
      title: '¡Clase Mañana!',
      body: 'Recordatorio: Tienes una clase de Fundamentos de Tenis mañana a las 10:00 AM.',
      read: true,
      createdAt: '2026-06-03T09:00:00Z',
    },
  ],
  'inst-1': [ // Instructor
    {
      id: 'inst-notif-1',
      type: 'new_booking',
      title: '¡Nueva Reserva!',
      body: 'Alguien acaba de reservar tu clase de Yoga Flow Matutino!',
      read: false,
      createdAt: '2026-05-28T10:00:00Z',
    },
    {
      id: 'inst-notif-2',
      type: 'review',
      title: '¡Nueva Reseña!',
      body: 'Recibiste una reseña de 5 estrellas para tu clase de Fundamentos de Tenis.',
      read: true,
      createdAt: '2026-06-02T14:30:00Z',
    },
  ],
  'gym-1': [ // Gym
    {
      id: 'gym-notif-1',
      type: 'new_instructor',
      title: '¡Nuevo Instructor!',
      body: 'Un nuevo instructor se ha unido a tu gimnasio y está listo para dar clases.',
      read: false,
      createdAt: '2026-05-25T09:00:00Z',
    },
    {
      id: 'gym-notif-2',
      type: 'booking_update',
      title: '¡Pico de Reservas Hoy!',
      body: 'Hoy es tu día más ocupado de la semana con 15 reservas.',
      read: true,
      createdAt: '2026-06-04T08:00:00Z',
    },
  ],
};

// --- Geolocation Service ---
export function geocodeAddress(address: string): GeocodeResult {
  // Mock geocoding - in real life, use Google Maps or Mapbox API
  const mockLocations: Record<string, GeocodeResult> = {
    'Calle Principal 123': {
      lat: PDE.lat,
      lng: PDE.lng,
      address: 'Calle Principal 123',
      city: 'Punta del Este',
      country: 'UY',
    },
    'Canchas Centrales': {
      lat: PDE_CANCHAS.lat,
      lng: PDE_CANCHAS.lng,
      address: 'Canchas Centrales',
      city: 'Punta del Este',
      country: 'UY',
    },
    'Loft de Bienestar': {
      lat: PDE_LOFT.lat,
      lng: PDE_LOFT.lng,
      address: 'Loft de Bienestar',
      city: 'Punta del Este',
      country: 'UY',
    },
  };
  
  return mockLocations[address] || {
    lat: PDE.lat,
    lng: PDE.lng,
    address: address,
    city: 'Punta del Este',
    country: 'UY',
  };
}

export function getCurrentLocation(): Promise<GeocodeResult> {
  // Mock getting user's current location
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        lat: PDE.lat,
        lng: PDE.lng,
        address: 'Tu Ubicación',
        city: 'Punta del Este',
        country: 'UY',
      });
    }, 1000);
  });
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// --- Payment Service ---
export function createMercadoPagoPreference(bookingId: string, amount: Money): { id: string; url: string } {
  // Mock Mercado Pago preference creation
  return {
    id: `pref-${Date.now()}`,
    url: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref-id=pref-${Date.now()}`,
  };
}

export function addPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
  const newPayment: Payment = {
    ...payment,
    id: `pay-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_PAYMENTS.push(newPayment);
  return newPayment;
}

export function getPaymentsForUser(userId: string): Payment[] {
  return MOCK_PAYMENTS.filter(p => p.userId === userId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// --- Notification Service ---
export function addNotification(userId: string, notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  if (!MOCK_NOTIFICATIONS_BY_USER[userId]) {
    MOCK_NOTIFICATIONS_BY_USER[userId] = [];
  }
  MOCK_NOTIFICATIONS_BY_USER[userId].push(newNotification);
  return newNotification;
}

export function getNotificationsForUser(userId: string): Notification[] {
  return (MOCK_NOTIFICATIONS_BY_USER[userId] || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function markNotificationAsRead(userId: string, notificationId: string): void {
  const notifications = MOCK_NOTIFICATIONS_BY_USER[userId];
  if (notifications) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }
}

// --- Booking Policies ---
export function canCancelBooking(classStartAt: string): boolean {
  const classStart = new Date(classStartAt);
  const now = new Date();
  const hoursUntilClass = (classStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilClass >= 24; // Can cancel up to 24 hours before
}

export function getRefundAmount(booking: Booking): Money {
  if (canCancelBooking(getClassById(booking.classId)?.startAt || '')) {
    return booking.price; // Full refund
  }
  return { amount: Math.floor(booking.price.amount * 0.5), currency: booking.price.currency }; // 50% refund
}
