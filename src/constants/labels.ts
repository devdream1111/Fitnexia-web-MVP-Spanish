/**
 * User-facing copy — single source of truth for product labels.
 * Change a value here instead of hunting strings across screens.
 */
import type { Modality } from '@/types/api';

export const BADGE_LABELS = {
  verified: 'Verificado',
  availableNow: 'Disponible ahora',
  full: 'Lleno',
} as const;

export const DROPDOWN_LABELS = {
  myProfile: 'Mi Perfil',
  settings: 'Configuración',
  logOut: 'Cerrar Sesión',
} as const;

export const CLASS_CARD_LABELS = {
  spotsLeft: (count: number) => `${count} lugares disponibles`,
} as const;

export const MODALITY_LABELS = {
  online: 'Online',
  inPerson: 'Presencial',
} as const;

export function modalityBadgeLabel(modality: Modality): string {
  return modality === 'online' ? MODALITY_LABELS.online : MODALITY_LABELS.inPerson;
}

export function modalityLocationLabel(modality: Modality, locationLabel?: string): string {
  if (modality === 'online') return MODALITY_LABELS.online;
  return locationLabel ?? MODALITY_LABELS.inPerson;
}

export const TAB_LABELS = {
  athlete: {
    home: 'Inicio',
    search: 'Buscar',
    bookings: 'Reservas',
    profile: 'Perfil',
  },
  instructor: {
    dashboard: 'Panel',
    classes: 'Clases',
    calendar: 'Calendario',
    earnings: 'Ingresos',
    profile: 'Perfil',
  },
  gym: {
    dashboard: 'Panel',
    staff: 'Personal',
    classes: 'Clases',
    profile: 'Gimnasio',
  },
} as const;

export const PROFILE_MENU_LABELS = {
  favoriteSports: 'Deportes favoritos',
  notifications: 'Notificaciones',
  paymentMethods: 'Métodos de pago',
  payoutAccount: 'Cuenta de pago',
  planCommission: 'Plan y comisión',
  helpSupport: 'Ayuda y soporte',
  location: 'Ubicación',
  disciplines: 'Disciplinas',
  certifications: 'Certificaciones',
  scheduleAvailability: 'Horario y disponibilidad',
  photoGallery: 'Galería de fotos',
  instructors: 'Instructores',
} as const;

export const SCREEN_TITLES = {
  profile: 'Perfil',
  gymProfile: 'Perfil del gimnasio',
  editProfile: 'Editar perfil',
  notifications: 'Notificaciones',
  favoriteSports: 'Deportes favoritos',
  paymentMethods: 'Métodos de pago',
  payoutAccount: 'Cuenta de pago',
  helpSupport: 'Ayuda y soporte',
  planCommission: 'Plan y comisión',
  inviteInstructor: 'Invitar instructor',
  class: 'Clase',
  classDetails: 'Detalles de la clase',
  classNotFound: 'Clase no encontrada',
  paymentHistory: 'Historial de pagos',
} as const;

export const BUTTON_LABELS = {
  signOut: 'Cerrar sesión',
  save: 'Guardar',
  saveChanges: 'Guardar cambios',
  edit: 'Editar',
  continue: 'Continuar',
  createAccount: 'Crear cuenta',
  signIn: 'Iniciar sesión',
  bookNow: 'Reservar ahora',
  joinWaitlist: 'Unirse a la lista de espera',
  joinWaitlistShort: 'Unirse a lista de espera',
  classFull: 'Clase llena',
  viewProfile: 'Perfil',
  confirmBooking: 'Confirmar reserva',
  payAndConfirm: 'Pagar y confirmar',
} as const;

export const CLASS_DETAIL_LABELS = {
  when: 'Cuándo',
  duration: 'Duración',
  where: 'Dónde',
  price: 'Precio',
  spots: 'Lugares',
  about: 'Acerca de',
  locationTbd: 'Por confirmar',
  full: 'Lleno',
  fullWaitlist: 'Lleno — lista de espera disponible',
  liveStream: 'Transmisión en vivo en Fitnexia',
  onlineSessionLink: 'Sesión online (enlace compartido después de reservar)',
} as const;

export function classSpotsLabel(
  spotsLeft: number,
  capacity: number,
  options?: { waitlistEnabled?: boolean },
): string {
  if (spotsLeft === 0) {
    return options?.waitlistEnabled
      ? CLASS_DETAIL_LABELS.fullWaitlist
      : CLASS_DETAIL_LABELS.full;
  }
  return `${spotsLeft} de ${capacity} disponibles`;
}

export const AUTH_LABELS = {
  welcomeBack: 'Bienvenido de nuevo',
  signInSubtitle: 'Inicia sesión para continuar',
  chooseProfile: 'Elige tu perfil',
  createAccount: 'Crear cuenta',
  howWillYouUse: '¿Cómo usarás Fitnexia?',
  completeProfile: 'Completa tu perfil básico',
  gymSchoolName: 'Nombre del gimnasio / escuela',
  gymSchoolPlaceholder: 'Nombre de tu instalación',
  firstName: 'Nombre',
  lastName: 'Apellidos',
  email: 'Correo electrónico',
  password: 'Contraseña',
  logoPhoto: 'Logo / foto',
  profilePhoto: 'Foto de perfil',
} as const;

export const ALERT_LABELS = {
  signOutTitle: 'Cerrar sesión',
  signOutMessage: '¿Estás seguro?',
  cancel: 'Cancelar',
  missingInfoTitle: 'Información faltante',
  fillAllFields: 'Por favor, completa todos los campos.',
  gymNameRequired: 'El nombre del gimnasio / escuela es obligatorio.',
  savedTitle: 'Guardado',
} as const;

export const GENERAL_LABELS = {
  back: 'Volver',
  photoGallery: 'Galería de fotos',
  favoriteSports: 'Deportes favoritos',
  disciplines: 'Disciplinas',
  alreadyHaveAccount: '¿Ya tienes una cuenta?',
  forgotPassword: '¿Olvidaste tu contraseña?',
  orContinueWith: 'o continúa con',
  google: 'Google',
  quickDemo: 'Demo rápida (simulada)',
  coach: 'Entrenador',
  newHere: '¿Eres nuevo aquí?',
  resetPassword: 'Restablecer contraseña',
  checkYourEmail: 'Revisa tu correo electrónico',
  ifAccountExists: 'Si existe una cuenta para',
  willReceiveResetInstructions: 'recibirás instrucciones para restablecer (simulada).',
  enterYourEmail: 'Ingresa tu correo electrónico y te enviaremos un enlace de restablecimiento.',
  sendResetLink: 'Enviar enlace de restablecimiento',
  backToSignIn: 'Volver a iniciar sesión',
  somethingWentWrong: '¡Algo salió mal!',
  weAreSorryError: 'Lo sentimos, pero hubo un error al cargar esta página.',
  tryAgain: 'Intentar de nuevo',
  goBackHome: 'Volver al inicio',
  pageDoesNotExist: '¡Ups! La página que buscas no existe.',
  search: 'Buscar',
  classInstructorGym: 'Clase, instructor o gimnasio...',
  cityNeighborhoodVenue: 'Ciudad, barrio o lugar...',
  discipline: 'Disciplina',
  modality: 'Modalidad',
  schedule: 'Horario',
  price: 'Precio',
  clearFilters: 'Limpiar filtros',
  class: 'clase',
  classes: 'clases',
  goodMorning: '¡Buenos días!',
  findYourNextClass: 'Encuentra tu próxima clase',
  searchClassesCoachesGyms: 'Buscar clases, entrenadores, gimnasios...',
  nearby: 'Cerca',
  recommendedForYou: 'Recomendado para ti',
  reviews: 'Reseñas',
  min: 'min',
  loading: 'Cargando…',
  book: 'Reservar',
  total: 'Total',
  paymentIntegrationDemo: 'Demo de integración de pago: Simularemos un checkout de Mercado Pago.',
  selectPaymentMethod: 'Seleccionar método de pago',
  mercadoPago: 'Mercado Pago',
  creditCard: 'Tarjeta de crédito',
  debitCard: 'Tarjeta de débito',
  joinedWaitlistTitle: '¡Te has unido a la lista de espera!',
  joinedWaitlistBody: 'Te has unido a la lista de espera para {classTitle}. Te notificaremos si se libera un lugar.',
  onWaitlistAlert: 'En lista de espera — te notificaremos cuando se libere un lugar.',
  bookingConfirmedTitle: '¡Reserva confirmada!',
  bookingConfirmedBody: 'Tu reserva para {classTitle} ha sido confirmada.',
  paymentSuccessfulAlert: '¡Pago exitoso! Revisa tus reservas.',
  myBookings: 'Mis reservas',
  hideCalendar: 'Ocultar calendario',
  showCalendar: 'Mostrar calendario',
  noBookingsForDay: 'No hay reservas para este día.',
  status: 'Estado',
  upcoming: 'Próximas',
  history: 'Historial',
  noBookingsInTab: 'No hay reservas en esta pestaña.',
  cancel: 'Cancelar',
  cancelBooking: '¿Cancelar reserva?',
  fullRefund: 'Recibirás un reembolso completo de {amount}.',
  partialRefund: 'Estás dentro de las 24 horas de la clase. Recibirás un reembolso del 50% de {amount}.',
  confirmCancel: 'Confirmar cancelación',
  keepBooking: 'Mantener reserva',
  bookingCancelledTitle: 'Reserva cancelada',
  bookingCancelledBody: 'Tu reserva para {classTitle} ha sido cancelada. Reembolso: {amount}',
  bookingCancelledAlert: '¡Reserva cancelada!',
  leaveReview: 'Dejar reseña',
  review: 'Reseña',
  bookingNotFound: 'Reserva no encontrada.',
  leaveAReview: 'Dejar una reseña',
  rating: 'Calificación',
  shareYourExperience: 'Comparte tu experiencia...',
  submitReview: 'Enviar reseña',
  reviewSubmittedAlert: '¡Reseña enviada!',
  firstName: 'Nombre',
  lastName: 'Apellidos',
  email: 'Correo electrónico',
  none: 'Ninguno',
  paymentHistory: 'Historial de pagos',
  changePassword: 'Cambiar contraseña',
  currentPassword: 'Contraseña actual',
  newPassword: 'Nueva contraseña',
  confirmNewPassword: 'Confirmar nueva contraseña',
  newPasswordsDoNotMatch: 'Las nuevas contraseñas no coinciden',
  passwordChangedSuccessfully: '¡Contraseña cambiada exitosamente!',
  failedToChangePassword: 'Error al cambiar la contraseña',
  change: 'Cambiar',
  // cancel: 'Cancelar',
  saveChange: 'Guardar cambios',
  noPaymentHistoryYet: 'Aún no hay historial de pagos.',
  classBooking: 'Reserva de clase',
  paid: 'Pagado',
  refunded: 'Reembolsado',
} as const;

export const DISCIPLINE_LABELS = {
  'Yoga': 'Yoga',
  'CrossFit': 'CrossFit',
  'Tennis': 'Tenis',
  'Swimming': 'Natación',
  'HIIT': 'HIIT',
  'Pilates': 'Pilates',
  'Boxing': 'Boxeo',
  'Running': 'Correr',
  'Padel': 'Padel',
  'Entrenamiento personal': 'Entrenamiento personal',
  'Fuerza': 'Fuerza',
  'Other': 'Otro',
} as const;

export const SCHEDULE_FILTER_LABELS = {
  'Any time': 'Cualquier horario',
  'Next 7 days': 'Próximos 7 días',
  'Next 30 days': 'Próximos 30 días',
  'Morning': 'Mañana',
  'Afternoon': 'Tarde',
  'Evening': 'Noche',
} as const;

export const PRICE_RANGE_LABELS = {
  'Any price': 'Cualquier precio',
  'Under $20': 'Menos de $20',
  '$20 – $35': '$20 – $35',
  '$35+': '$35+',
} as const;

export const ROLE_TITLES = {
  athlete: 'Atleta',
  instructor: 'Instructor',
  institution: 'Gimnasio / Escuela',
} as const;

export const ROLE_DESCRIPTIONS = {
  athlete: 'Encuentra y reserva clases cerca de ti',
  instructor: 'Enseña y gestiona tu horario',
  institution: 'Gestiona instructores y clases grupales',
  admin: '',
} as const;

export const ONBOARDING_LABELS = {
  slides: [
    {
      title: 'Encuentra tu próxima clase',
      body: 'Descubre clases de deportes y fitness de los mejores instructores y gimnasios cerca de ti.',
    },
    {
      title: 'Reserva en un solo toque',
      body: 'Reserva sesiones presenciales u online. Recibe recordatorios antes de cada clase.',
    },
    {
      title: 'Entrena con los mejores',
      body: 'Instructores verificados, reseñas reales y un programa de fidelidad que te recompensa.',
    },
  ],
  next: 'Siguiente',
  getStarted: 'Empezar',
  skip: 'Omitir',
} as const;

export const NOTIFICATIONS_LABELS = {
  noNotificationsYet: 'Aún no hay notificaciones.',
  preferences: {
    bookingConfirmed: 'Reserva confirmada',
    classReminders: 'Recordatorios de clase',
    paymentUpdates: 'Actualizaciones de pago',
    creditsExpiring: 'Créditos a punto de vencer',
    marketing: 'Marketing y consejos',
  },
} as const;

export const INSTRUCTOR_LABELS = {
  dashboard: {
    hi: 'Hola,',
    todayOverview: 'Resumen del día',
    newClass: 'Nueva clase',
    bookings: 'Reservas',
    revenue: 'Ingresos',
    classes: 'Clases',
    todayClasses: 'Clases de hoy',
  },
  classes: {
    yourClasses: 'Tus clases',
    noClassesYet: 'Aún no tienes clases.',
  },
  calendar: {
    yourCalendar: 'Tu calendario',
  },
  earnings: {
    yourEarnings: 'Tus ingresos',
    totalEarnings: 'Ingresos totales',
    thisMonth: 'Este mes',
    thisWeek: 'Esta semana',
    upcomingPayouts: 'Próximos pagos',
    noEarningsYet: 'Aún no tienes ingresos.',
  },
  notifications: {
    yourNotifications: 'Tus notificaciones',
  },
  publicProfile: {
    instructor: 'Instructor',
    notFound: 'No encontrado.',
    disciplines: 'Disciplinas:',
    from: 'Desde',
    reviews: 'Reseñas',
  },
  classForm: {
    newClass: 'Nueva clase',
    editClass: 'Editar clase',
    className: 'Nombre de la clase',
    discipline: 'Disciplina',
    modality: 'Modalidad',
    date: 'Fecha (AAAA-MM-DD)',
    time: 'Hora (HH:MM)',
    duration: 'Duración (min)',
    price: 'Precio (USD)',
    capacity: 'Capacidad',
    publishClass: 'Publicar clase',
    updateClass: 'Actualizar clase',
    classNameRequired: 'El nombre de la clase es obligatorio.',
    classPublished: 'Clase publicada (simulada)',
    classUpdated: 'Clase actualizada (simulada)',
  },
} as const;

export const GYM_LABELS = {
  dashboard: {
    controlPanel: 'Panel de control',
    bookingsToday: 'Reservas de hoy',
    revenue: 'Ingresos',
    occupancy: 'Ocupación',
    upcomingClasses: 'Próximas clases',
  },
  classes: {
    yourClasses: 'Tus clases',
    addClass: 'Agregar clase',
  },
  instructors: {
    yourInstructors: 'Tus instructores',
    inviteInstructor: 'Invitar instructor',
    instructorName: 'Nombre del instructor',
    email: 'Correo electrónico',
    sendInvite: 'Enviar invitación',
    inviteSent: 'Invitación enviada (simulada)',
  },
  plan: {
    yourPlan: 'Tu plan',
    planTitle: 'Plan de gym',
    planDescription: 'Plan básico para gestionar tus clases y instructores.',
  },
} as const;
