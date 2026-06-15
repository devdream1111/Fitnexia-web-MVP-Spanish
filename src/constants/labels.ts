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

export const CLASS_FORMAT_LABELS = {
  group: 'Grupal',
  individual: 'Privada',
} as const;

export function classFormatBadgeLabel(classFormat?: string): string {
  if (classFormat === 'individual') return CLASS_FORMAT_LABELS.individual;
  return CLASS_FORMAT_LABELS.group;
}

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
    earnings: 'Ingresos',
    profile: 'Gimnasio',
  },
  admin: {
    dashboard: 'Panel de Control',
    users: 'Usuarios',
    classes: 'Clases',
    bookings: 'Reservas',
    reviews: 'Reseñas',
    institutions: 'Instituciones',
    payments: 'Pagos',
  },
} as const;

export const ADMIN_LABELS = {
  dashboard: {
    title: 'Panel de Administración Fitnexia',
    subtitle: 'Herramientas internas para gestionar la plataforma',
    totalUsers: 'Usuarios Totales',
    newUsersThisWeek: 'Nuevos Usuarios Esta Semana',
    totalClasses: 'Clases Totales',
    upcomingClasses: 'Clases Proximas',
    totalBookings: 'Reservas Totales',
    totalRevenue: 'Ingresos Totales',
    recentActivity: 'Actividad Reciente',
    quickActions: 'Acciones Rapidas',
    pendingVerifications: 'Verificaciones Pendientes',
    reportedReviews: 'Reseñas Reportadas',
    totalInstructors: 'Instructores',
    totalInstitutions: 'Instituciones',
  },
  users: {
    filterByRole: 'Filtrar por rol',
    allRoles: 'Todos los roles',
    edit: 'Editar',
    verify: 'Verificar',
    suspend: 'Suspender',
  },
  verification: {
    instructorTitle: 'Verificación de Instructores',
    institutionTitle: 'Verificación de Instituciones',
    pending: 'Pendiente',
    verified: 'Verificado',
    verify: 'Verificar',
    reject: 'Rechazar',
    viewProfile: 'Ver Perfil',
  },
  reviews: {
    moderationTitle: 'Moderación de Reseñas',
    reported: 'Reportada',
    approve: 'Aprobar',
    remove: 'Eliminar',
    viewDetails: 'Ver Detalles',
  },
  login: {
    title: 'Panel de administración',
    subtitle: 'Acceso interno para el equipo Fitnexia',
    signIn: 'Iniciar sesión',
    backToApp: 'Volver a la aplicación',
    accessDenied: 'Esta área es solo para administradores.',
  },
  profile: {
    title: 'Mi perfil',
    subtitle: 'Cuenta de administrador de plataforma',
    memberSince: 'Administrador desde',
    editProfile: 'Editar perfil',
    saveProfile: 'Guardar cambios',
    cancelEdit: 'Cancelar',
    accountSecurity: 'Seguridad de la cuenta',
    quickLinks: 'Accesos rápidos',
    preferencesSaved: 'Preferencias guardadas',
  },
  notifications: {
    title: 'Configuración de notificaciones',
    subtitle: 'Elige qué alertas operativas deseas recibir',
    preferences: {
      verificationRequests: 'Solicitudes de verificación',
      reportedReviews: 'Reseñas reportadas',
      platformMetrics: 'Resúmenes y métricas de plataforma',
      newUserSignups: 'Nuevos registros de usuarios',
      paymentAlerts: 'Alertas de pagos y transacciones',
      securityAlerts: 'Alertas de seguridad',
    },
  },
} as const;

export const PROFILE_PAGE_LABELS = {
  title: 'Mi perfil',
  memberSince: 'Miembro desde',
  editProfile: 'Editar perfil',
  cancelEdit: 'Cancelar',
  quickLinks: 'Accesos rápidos',
  accountSecurity: 'Seguridad de la cuenta',
  notificationsTitle: 'Notificaciones',
  notificationsSubtitle: 'Gestiona tus preferencias de alertas y recordatorios',
  saved: 'Perfil actualizado correctamente',
  passwordChangeViaEmail: 'Para cambiar tu contraseña, usa el enlace que te enviamos por correo.',
  resetPasswordLink: 'Restablecer contraseña por correo',
  favoriteSports: 'Deportes favoritos',
  certifications: 'Certificaciones',
  photoGallery: 'Galería de fotos',
  availableNow: 'Disponible ahora',
  notAvailable: 'No disponible',
  hourlyRate: 'Tarifa por hora (UYU)',
  hourlyRateUnset: 'Sin tarifa definida',
  bio: 'Biografía',
  bioUnset: 'Sin biografía',
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
  cancelClass: 'Cancelar clase',
  removeFromStaff: 'Quitar del equipo',
  cancelInvite: 'Cancelar solicitud',
} as const;

export const CLASS_DETAIL_LABELS = {
  when: 'Cuándo',
  duration: 'Duración',
  where: 'Dónde',
  price: 'Precio',
  spots: 'Lugares',
  about: 'Acerca de',
  hostedBy: 'Organiza',
  description: 'Descripción',
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
  acceptTermsPrefix: 'He leído y acepto los',
  termsAndConditions: 'Términos y condiciones',
  acceptTermsMiddle: 'y la',
  privacyPolicy: 'Política de privacidad',
} as const;

export const LEGAL_LABELS = {
  tableOfContents: 'Contenido',
  lastUpdated: 'Última actualización',
  relatedDocuments: 'Documentos relacionados',
  termsLink: 'Términos y condiciones',
  privacyLink: 'Política de privacidad',
  backToHome: 'Volver al inicio',
} as const;

export const ALERT_LABELS = {
  signOutTitle: 'Cerrar sesión',
  signOutMessage: '¿Estás seguro?',
  cancel: 'Cancelar',
  missingInfoTitle: 'Información faltante',
  fillAllFields: 'Por favor, completa todos los campos.',
  gymNameRequired: 'El nombre del gimnasio / escuela es obligatorio.',
  acceptTermsRequired: 'Debes aceptar los términos y condiciones y la política de privacidad.',
  savedTitle: 'Guardado',
} as const;

export const GENERAL_LABELS = {
  back: 'Volver',
  photoGallery: 'Galería de fotos',
  favoriteSports: 'Deportes favoritos',
  disciplines: 'Disciplinas',
  alreadyHaveAccount: '¿Ya tienes una cuenta?',
  forgotPassword: '¿Olvidaste tu contraseña?',
  google: 'Google',
  continueWith: 'Continuar con',
  orContinueWith: 'o continúa con correo',
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
  preparingAccount: 'Preparando tu cuenta…',
  loadingYourData: 'Cargando tu contenido…',
  book: 'Reservar',
  total: 'Total',
  paymentIntegrationDemo: 'Demo de integración de pago: Simularemos un checkout de Mercado Pago.',
  choosePaymentModel: 'Elegí cómo querés pagar',
  paymentModelPerClass: 'Pago por clase',
  paymentModelMonthlyUnlimited: 'Plan mensual ilimitado',
  paymentModelPerPeriod: 'Pago por período',
  billingPeriodWeekly: 'Semanal',
  billingPeriodMonthly: 'Mensual',
  billingPeriodQuarterly: 'Trimestral',
  subscriptionCoversBooking: 'Tu plan mensual cubre esta reserva. Confirmá sin cargo adicional.',
  secureCheckout: 'Checkout seguro',
  orderSummary: 'Resumen del pedido',
  classDetails: 'Detalles de la clase',
  waitlistNote: 'Te avisaremos si se libera un lugar en esta clase.',
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
  admin: 'Administrador',
} as const;

export const ROLE_DESCRIPTIONS = {
  athlete: 'Encuentra y reserva clases cerca de ti',
  instructor: 'Enseña y gestiona tu horario',
  institution: 'Gestiona instructores y clases grupales',
  admin: '',
} as const;

export const LANDING_LABELS = {
  badge: 'MVP · Uruguay',
  nav: {
    what: '¿Qué es?',
    howItWorks: 'Cómo funciona',
    whoIsItFor: 'Para quién es',
    benefits: 'Beneficios',
    start: 'Empezar',
  },
  whatEyebrow: '¿Qué es?',
  whatTitle: 'La plataforma que conecta profesionales del fitness, usuarios y gimnasios en un solo lugar.',
  whatBody:
    'Fitnexia es el ecosistema digital del fitness en Uruguay: descubre clases, reserva con instructores verificados y gestiona tu centro o tu marca personal desde una sola web.',
  trust: ['Instructores verificados', 'Reservas en minutos', 'Pagos transparentes'],
  whoEyebrow: 'Para quién es',
  whoTitle: '¿Para quién es Fitnexia?',
  whoSubtitle: 'Una plataforma pensada para los tres lados del fitness.',
  roles: {
    athlete: {
      label: 'Quiero entrenar',
      headline: 'Encuentra tu próxima rutina',
      body: 'Descubre clases cerca de ti, reserva con instructores verificados y explora nuevas disciplinas.',
      cta: 'Crear cuenta como atleta',
    },
    instructor: {
      label: 'Soy instructor',
      headline: 'Haz crecer tu marca personal',
      body: 'Publica tus clases, gestiona tu agenda y recibe solicitudes de gimnasios que buscan talento.',
      cta: 'Registrarme como instructor',
    },
    institution: {
      label: 'Tengo un gimnasio',
      headline: 'Coordina tu equipo sin fricción',
      body: 'Encuentra profesionales verificados, organiza clases grupales y administra tu centro en un solo panel.',
      cta: 'Registrar mi gimnasio',
    },
  },
  howEyebrow: 'Cómo funciona',
  howTitle: 'Cómo funciona',
  howSubtitle: 'Tres pasos para empezar a usar Fitnexia.',
  steps: [
    {
      num: '1',
      title: 'Crea tu perfil',
      body: 'Regístrate en minutos como atleta, instructor o gimnasio. Configura tu información y especialidades.',
    },
    {
      num: '2',
      title: 'Conecta con la comunidad',
      body: 'Los instructores publican clases, los gimnasios buscan talento y los usuarios encuentran su próxima sesión.',
    },
    {
      num: '3',
      title: 'Reserva, coordina y entrena',
      body: 'Reservas con confirmación inmediata, calendarios sincronizados y recordatorios para no perderte nada.',
    },
  ],
  benefitsEyebrow: 'Beneficios',
  benefitsTitle: 'Beneficios por perfil',
  benefitsSubtitle: 'Lo que cada uno gana con Fitnexia.',
  benefitsTabs: {
    athlete: 'Usuarios',
    instructor: 'Instructores',
    institution: 'Gimnasios',
  },
  benefits: {
    athlete: [
      {
        title: 'Clases cerca de ti',
        body: 'Busca por deporte, ubicación y modalidad con mapa integrado y filtros inteligentes.',
      },
      {
        title: 'Instructores verificados',
        body: 'Perfiles con reseñas, certificaciones y disponibilidad en tiempo real.',
      },
      {
        title: 'Reserva sin complicaciones',
        body: 'Confirma tu plaza en segundos, presencial u online, con historial de pagos.',
      },
    ],
    instructor: [
      {
        title: 'Publica tus clases',
        body: 'Sube tu agenda y empieza a recibir reservas en minutos.',
      },
      {
        title: 'Haz crecer tu marca',
        body: 'Perfil profesional con reseñas, certificaciones y portfolio visible.',
      },
      {
        title: 'Recibe solicitudes',
        body: 'Los gimnasios te encuentran y te contactan para sumarte a su grilla.',
      },
    ],
    institution: [
      {
        title: 'Talento verificado',
        body: 'Encuentra instructores con perfil completo y reseñas de la comunidad.',
      },
      {
        title: 'Gestión centralizada',
        body: 'Clases, staff y reservas en un panel diseñado para centros deportivos.',
      },
      {
        title: 'Más visibilidad',
        body: 'Tu gimnasio aparece en búsquedas locales y atrae nuevos socios.',
      },
    ],
  },
  launchBadge: 'Ya disponible · MVP',
  launchTitle: 'El fitness uruguayo, conectado',
  launchSubtitle: 'Explora la plataforma hoy mismo. Sin listas de espera — crea tu cuenta y empieza a entrenar.',
  stats: [
    { value: '150+', label: 'Usuarios activos' },
    { value: '50+', label: 'Clases publicadas' },
    { value: '4.8★', label: 'Valoración media' },
  ],
  ctaTitle: '¿Listo para tu próximo entrenamiento?',
  ctaSubtitle: 'Únete a Fitnexia y descubre clases, instructores y gimnasios en toda Uruguay.',
  ctaButton: 'Crear cuenta gratis',
  ctaNote: '¿Ya tienes cuenta? Inicia sesión y continúa donde lo dejaste.',
} as const;

export const ONBOARDING_LABELS = {
  intro: 'El marketplace que conecta atletas, instructores y gimnasios en toda Uruguay.',
  tagline: 'Tu próximo entrenamiento empieza aquí.',
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
  managePreferences: 'Preferencias de notificaciones',
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
    disciplines: 'Área de especialidad',
    expertise: 'Especialidades',
    expertiseEmpty: 'Sin especialidades definidas.',
    bio: 'Presentación',
    bioEmpty: 'Este instructor aún no ha añadido una presentación.',
    certifications: 'Certificaciones',
    certificationsEmpty: 'Sin certificaciones publicadas.',
    from: 'Desde',
    reviews: 'Reseñas',
    reviewsEmpty: 'Aún no hay reseñas de atletas.',
    staffReviews: 'Reseñas del equipo',
    staffReviewsHint: 'Valoraciones de gimnasios donde ha impartido clases.',
    availableNow: 'Disponible ahora',
    notAvailableNow: 'No disponible ahora',
    profileEyebrow: 'Perfil de instructor',
  },
  classForm: {
    newClass: 'Nueva clase',
    editClass: 'Editar clase',
    className: 'Nombre de la clase',
    description: 'Descripción',
    descriptionPlaceholder: 'Describe la clase, nivel, qué deben traer los participantes…',
    discipline: 'Disciplina',
    modality: 'Modalidad',
    classFormat: 'Tipo de clase',
    basicsSection: 'Información básica',
    basicsSectionHint: 'Nombre, disciplina y tipo de sesión.',
    scheduleSection: 'Horario',
    scheduleSectionHint: 'Fecha, hora y duración de la clase.',
    pricingSection: 'Precio y cupos',
    pricingSectionHint: 'Define el costo y cuántas personas pueden reservar.',
    date: 'Fecha (AAAA-MM-DD)',
    time: 'Hora (HH:MM)',
    duration: 'Duración (min)',
    price: 'Precio (USD)',
    capacity: 'Capacidad',
    publishClass: 'Publicar clase',
    updateClass: 'Actualizar clase',
    classNameRequired: 'El nombre de la clase es obligatorio.',
    classPublished: 'Clase publicada correctamente.',
    classUpdated: 'Clase actualizada correctamente.',
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
    addClass: 'Nueva clase grupal',
    groupOnly: 'Solo clases grupales',
    pickInstructor: 'Instructor asignado',
    assignmentMode: 'Modo de asignación',
    assignmentModeHint: 'Elegí si la clase la organiza el gimnasio (Modelo A) o un instructor de tu equipo (Modelo B).',
    modelA: 'Sin instructor (Modelo A)',
    modelAHint: 'El gimnasio organiza la clase. No se muestra perfil de instructor en el detalle.',
    modelB: 'Con instructor vinculado (Modelo B)',
    modelBHint: 'Asigná un instructor de tu equipo a esta clase grupal.',
    pickInstructorHint: 'Seleccioná un instructor vinculado a tu gimnasio.',
    noInstructorOption: 'Sin instructor asignado (Modelo A)',
    modelBInstructorRequired: 'Seleccioná un instructor vinculado para publicar con Modelo B.',
    gymHostedClass: 'Clase del gimnasio',
    emptyClassesHint: 'Publicá tu primera clase grupal con o sin instructor asignado.',
    noLinkedInstructors: 'Aún no tienes instructores vinculados. Agrégalos desde la página de instructores.',
    goToInstructors: 'Ir a instructores',
  },
  instructors: {
    yourInstructors: 'Instructores',
    rosterTitle: 'Directorio de instructores',
    rosterSubtitle: 'Explora perfiles, envía solicitudes de vinculación y valora a tu equipo.',
    addToStaff: 'Agregar',
    pending: 'Pendiente',
    onStaff: 'En equipo',
    review: 'Reseñar',
    reviewSent: 'Reseña enviada',
    reviewLocked: 'Completa una clase con este instructor para reseñar',
    inviteSent: 'Solicitud enviada al instructor',
    alreadyPending: 'Ya hay una solicitud pendiente',
    alreadyLinked: 'Este instructor ya forma parte de tu equipo',
    linkedCount: (n: number) => `${n} en tu equipo`,
    pendingCount: (n: number) => `${n} pendiente${n === 1 ? '' : 's'}`,
    noInstructors: 'No hay instructores registrados en la plataforma.',
    acceptInvite: 'Aceptar invitación',
    inviteFromGym: 'Invitación de gimnasio',
    inviteBody: (gym: string) => `${gym} quiere agregarte a su equipo.`,
    inviteAccepted: 'Te has unido al gimnasio correctamente.',
    removedFromStaff: 'Instructor eliminado del equipo.',
    inviteCancelled: 'Solicitud cancelada.',
    unlinkConfirm: '¿Quitar a este instructor de tu equipo?',
  },
  staffReview: {
    title: 'Reseña de instructor',
    subtitle: 'Comparte tu experiencia trabajando con este instructor en tu gimnasio.',
    ratingLabel: 'Calificación',
    commentLabel: 'Comentario',
    commentPlaceholder: 'Describe puntualidad, trato con alumnos, preparación de la clase…',
    submit: 'Publicar reseña',
    notEligible: 'Aún no puedes reseñar a este instructor.',
    needCompletedClass: 'Debe haber completado al menos una clase en tu gimnasio.',
    needLinked: 'El instructor debe estar vinculado a tu gimnasio.',
    alreadyReviewed: 'Ya publicaste una reseña para este instructor.',
    success: 'Reseña publicada correctamente.',
  },
  earnings: {
    yourEarnings: 'Ingresos del gimnasio',
  },
  plan: {
    yourPlan: 'Tu plan',
    planTitle: 'Plan de gym',
    planDescription: 'Compara planes y comisiones disponibles para tu gimnasio.',
    loadError: 'No se pudieron cargar los planes.',
  },
} as const;
