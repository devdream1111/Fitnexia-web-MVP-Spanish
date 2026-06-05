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

export const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-1',
    userId: 'u-1',
    displayName: 'Carlos Ruiz',
    bio: 'PTR certified tennis coach with 10+ years experience.',
    disciplines: ['Tennis', 'Padel'],
    verified: true,
    availableNow: true,
    averageRating: 4.9,
    reviewCount: 124,
    plan: 'pro',
    hourlyRate: { amount: 5000, currency: 'USD' },
    certifications: [
      { name: 'PTR Certified', issuer: 'PTR', year: 2018 },
      { name: 'Sports Psychology', issuer: 'ITF', year: 2020 },
    ],
  },
  {
    id: 'inst-2',
    userId: 'u-2',
    displayName: 'Mia Chen',
    bio: 'Yoga & mindfulness instructor. RYT-500.',
    disciplines: ['Yoga', 'Pilates'],
    verified: true,
    availableNow: false,
    averageRating: 4.8,
    reviewCount: 89,
    plan: 'basic',
    hourlyRate: { amount: 3500, currency: 'USD' },
    certifications: [{ name: 'RYT-500', issuer: 'Yoga Alliance', year: 2019 }],
  },
  {
    id: 'inst-3',
    userId: 'u-3',
    displayName: 'James Okonkwo',
    bio: 'HIIT & strength specialist.',
    disciplines: ['HIIT', 'CrossFit'],
    verified: false,
    availableNow: false,
    averageRating: 4.6,
    reviewCount: 42,
    plan: 'basic',
  },
];

export const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'gym-1',
    name: 'FitHub Downtown',
    description: 'Premium fitness studio in the city center.',
    verified: true,
    plan: 'institutional',
    location: {
      address: '123 Main St',
      city: 'Buenos Aires',
      country: 'AR',
      lat: -34.6037,
      lng: -58.3816,
    },
    instructors: [
      { id: 'inst-1', displayName: 'Carlos Ruiz' },
      { id: 'inst-2', displayName: 'Mia Chen' },
      { id: 'inst-3', displayName: 'James Okonkwo' },
    ],
  },
];

export const MOCK_CLASSES: ClassListItem[] = [
  {
    id: 'class-1',
    title: 'Morning Flow Yoga',
    discipline: 'Yoga',
    modality: 'in_person',
    startAt: '2026-06-10T08:00:00Z',
    durationMinutes: 60,
    price: { amount: 2500, currency: 'USD' },
    capacity: 12,
    spotsLeft: 4,
    instructor: {
      id: 'inst-2',
      displayName: 'Mia Chen',
    },
    location: { lat: -34.6, lng: -58.38, label: 'FitHub Studio A' },
    averageRating: 4.8,
  },
  {
    id: 'class-2',
    title: 'Tennis Fundamentals',
    discipline: 'Tennis',
    modality: 'in_person',
    startAt: '2026-06-11T10:00:00Z',
    durationMinutes: 90,
    price: { amount: 4500, currency: 'USD' },
    capacity: 4,
    spotsLeft: 1,
    instructor: {
      id: 'inst-1',
      displayName: 'Carlos Ruiz',
    },
    location: { lat: -34.61, lng: -58.39, label: 'Central Courts' },
    averageRating: 4.9,
  },
  {
    id: 'class-3',
    title: 'HIIT Burn (Online)',
    discipline: 'HIIT',
    modality: 'online',
    startAt: '2026-06-12T18:00:00Z',
    durationMinutes: 45,
    price: { amount: 1500, currency: 'USD' },
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
    title: 'Group CrossFit',
    discipline: 'CrossFit',
    modality: 'in_person',
    startAt: '2026-06-13T07:00:00Z',
    durationMinutes: 55,
    price: { amount: 2000, currency: 'USD' },
    capacity: 20,
    spotsLeft: 0,
    instructor: {
      id: 'inst-3',
      displayName: 'James Okonkwo',
    },
    institution: { id: 'gym-1', name: 'FitHub Downtown' },
    location: { lat: -34.6037, lng: -58.3816, label: 'FitHub Downtown' },
    averageRating: 4.7,
  },
  {
    id: 'class-5',
    title: 'Evening Pilates',
    discipline: 'Pilates',
    modality: 'in_person',
    startAt: '2026-06-14T19:00:00Z',
    durationMinutes: 50,
    price: { amount: 2800, currency: 'USD' },
    capacity: 10,
    spotsLeft: 6,
    instructor: {
      id: 'inst-2',
      displayName: 'Mia Chen',
    },
    location: { lat: -34.59, lng: -58.37, label: 'Wellness Loft' },
    averageRating: 4.8,
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    status: 'confirmed',
    classId: 'class-1',
    userId: 'me',
    price: { amount: 2500, currency: 'USD' },
    createdAt: '2026-05-28T10:00:00Z',
  },
  {
    id: 'book-2',
    status: 'completed',
    classId: 'class-2',
    userId: 'me',
    price: { amount: 4500, currency: 'USD' },
    createdAt: '2026-05-01T10:00:00Z',
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-1',
    classId: 'class-2',
    instructorId: 'inst-1',
    userId: 'u-4',
    authorName: 'Sarah Johnson',
    rating: 5,
    comment: 'Amazing tennis lesson! Carlos is very patient and knowledgeable.',
    createdAt: '2026-05-15T14:30:00Z',
    verified: true,
  },
  {
    id: 'review-2',
    classId: 'class-1',
    instructorId: 'inst-2',
    userId: 'u-5',
    authorName: 'Michael Brown',
    rating: 4,
    comment: 'Great yoga flow, perfect way to start the morning.',
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
  maxFreeClassValue: { amount: 3000, currency: 'USD' },
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
  revenueCents: 284000,
  attendanceRate: 0.82,
  bookingsChangePct: 0.12,
  revenueChangePct: 0.08,
  attendanceChangePct: 0.05,
  daily: [
    { label: 'Mon', bookings: 6, revenueCents: 36000, attendancePct: 0.65 },
    { label: 'Tue', bookings: 8, revenueCents: 48000, attendancePct: 0.82 },
    { label: 'Wed', bookings: 5, revenueCents: 30000, attendancePct: 0.45 },
    { label: 'Thu', bookings: 9, revenueCents: 54000, attendancePct: 0.9 },
    { label: 'Fri', bookings: 8, revenueCents: 48000, attendancePct: 0.78 },
    { label: 'Sat', bookings: 7, revenueCents: 42000, attendancePct: 0.95 },
    { label: 'Sun', bookings: 4, revenueCents: 26000, attendancePct: 0.55 },
  ],
};

export function formatMoney(m: { amount: number; currency: string }): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: m.currency,
  }).format(m.amount / 100);
}

export function formatClassDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
    amount: { amount: 2500, currency: 'USD' },
    status: 'paid',
    paymentMethod: 'Credit Card (Visa)',
    createdAt: '2026-05-28T10:00:00Z',
    updatedAt: '2026-05-28T10:05:00Z',
  },
  {
    id: 'pay-2',
    bookingId: 'book-2',
    userId: 'me',
    amount: { amount: 4500, currency: 'USD' },
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
      title: 'Booking Confirmed!',
      body: 'Your class booking for Morning Flow Yoga has been confirmed.',
      read: false,
      createdAt: '2026-05-28T10:05:00Z',
    },
    {
      id: 'notif-2',
      type: 'class_reminder',
      title: 'Class Tomorrow!',
      body: 'Reminder: You have a Tennis Fundamentals class tomorrow at 10:00 AM.',
      read: true,
      createdAt: '2026-06-03T09:00:00Z',
    },
  ],
  'inst-1': [ // Instructor
    {
      id: 'inst-notif-1',
      type: 'new_booking',
      title: 'New Booking!',
      body: 'Someone just booked your Morning Flow Yoga class!',
      read: false,
      createdAt: '2026-05-28T10:00:00Z',
    },
    {
      id: 'inst-notif-2',
      type: 'review',
      title: 'New Review!',
      body: 'You received a 5-star review for your Tennis Fundamentals class.',
      read: true,
      createdAt: '2026-06-02T14:30:00Z',
    },
  ],
  'gym-1': [ // Gym
    {
      id: 'gym-notif-1',
      type: 'new_instructor',
      title: 'New Instructor Joined!',
      body: 'A new instructor has joined your gym and is ready to teach classes.',
      read: false,
      createdAt: '2026-05-25T09:00:00Z',
    },
    {
      id: 'gym-notif-2',
      type: 'booking_update',
      title: 'Booking Peak Today!',
      body: 'Today is your busiest day this week with 15 bookings.',
      read: true,
      createdAt: '2026-06-04T08:00:00Z',
    },
  ],
};

// --- Geolocation Service ---
export function geocodeAddress(address: string): GeocodeResult {
  // Mock geocoding - in real life, use Google Maps or Mapbox API
  const mockLocations: Record<string, GeocodeResult> = {
    '123 Main St': {
      lat: -34.6037,
      lng: -58.3816,
      address: '123 Main St',
      city: 'Buenos Aires',
      country: 'AR',
    },
    'Central Courts': {
      lat: -34.61,
      lng: -58.39,
      address: 'Central Courts',
      city: 'Buenos Aires',
      country: 'AR',
    },
    'Wellness Loft': {
      lat: -34.59,
      lng: -58.37,
      address: 'Wellness Loft',
      city: 'Buenos Aires',
      country: 'AR',
    },
  };
  
  return mockLocations[address] || {
    lat: -34.6037,
    lng: -58.3816,
    address: address,
    city: 'Buenos Aires',
    country: 'AR',
  };
}

export function getCurrentLocation(): Promise<GeocodeResult> {
  // Mock getting user's current location
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        lat: -34.6037,
        lng: -58.3816,
        address: 'Your Location',
        city: 'Buenos Aires',
        country: 'AR',
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
