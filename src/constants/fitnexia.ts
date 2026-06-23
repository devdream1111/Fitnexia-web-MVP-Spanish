/** UI copy (labels, buttons, screen titles): see `constants/labels.ts`. */

/** Semantic theme tokens for light & dark mode */
export type AppThemeColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryMuted: string;
  primaryText: string;
  accent: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  tabBar: string;
  tabBarBorder: string;
  input: string;
  shadow: string;
  onPrimary: string;
};

export const LightThemeColors: AppThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#2563EB',
  primaryMuted: '#DBEAFE',
  primaryText: '#1E40AF',
  accent: '#3B82F6',
  success: '#22c55e',
  successMuted: '#dcfce7',
  warning: '#EAB308',
  warningMuted: '#FEF9C3',
  error: '#EF4444',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  input: '#FFFFFF',
  shadow: '#000000',
  onPrimary: '#FFFFFF',
};

export const DarkThemeColors: AppThemeColors = {
  background: '#0B1120',
  surface: '#1E293B',
  surfaceMuted: '#334155',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
  primary: '#3B82F6',
  primaryMuted: '#1E3A8A',
  primaryText: '#60A5FA',
  accent: '#60A5FA',
  success: '#4ade80',
  successMuted: '#14532d',
  warning: '#FACC15',
  warningMuted: '#713F12',
  error: '#F87171',
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  input: '#334155',
  shadow: '#000000',
  onPrimary: '#FFFFFF',
};

/** @deprecated Use useAppTheme() instead */
export const FitnexiaColors = {
  primary: LightThemeColors.primary,
  primaryDark: LightThemeColors.primaryText,
  primaryLight: LightThemeColors.primaryMuted,
  accent: LightThemeColors.accent,
  success: LightThemeColors.success,
  warning: LightThemeColors.warning,
  error: LightThemeColors.error,
  white: '#FFFFFF',
  black: '#0F172A',
  gray50: LightThemeColors.background,
  gray100: LightThemeColors.surfaceMuted,
  gray200: LightThemeColors.border,
  gray400: '#94A3B8',
  gray500: LightThemeColors.textMuted,
  gray700: LightThemeColors.textSecondary,
  gray900: LightThemeColors.text,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

/** ISO 4217 default for prices and payouts */
export const DEFAULT_CURRENCY = 'UYU' as const;

/** Reference FX rate used when migrating list prices from USD to UYU (1 USD ≈ 40 UYU). */
export const USD_TO_UYU_RATE = 40;

/** Default class price in UYU major units for create-class forms (≈ former USD 25). */
export const DEFAULT_CLASS_PRICE_UYU = 25 * USD_TO_UYU_RATE;

export const DISCIPLINES = [
  'Musculación',
  'Entrenamiento Funcional',
  'Entrenamiento Personalizado',
  'Entrenamiento para adultos mayores',
  'Entrenamiento para embarazadas',
  'Zumba/Ritmos',
  'Indoor Cycling',
  'Pilates Mat/Reformer',
  'Tenis',
  'Pádel',
  'Hidrogimnasia',
  'Natación',
  'Fútbol',
  'Basquetbol',
  'Voleibol',
  'Hockey',
  'Yoga',
  'Crossfit',
  'Otros',
] as const;

export const ROLE_LABELS = {
  athlete: 'Atleta',
  instructor: 'Instructor',
  institution: 'Gimnasio / Escuela',
} as const;

/** Default map viewport — Punta del Este, Uruguay */
export const DEFAULT_MAP_CENTER = {
  lat: -34.9614,
  lng: -54.9478,
} as const;

export const MOCK_LOCATION_AREAS = [
  'Centro',
  'FitHub',
  'Loft de Bienestar',
  'Canchas Centrales',
  'Online',
] as const;

export const PRICE_RANGES = [
  { id: 'any', label: 'Cualquier precio', min: 0, max: Infinity },
  { id: 'budget', label: 'Menos de 800 UYU', min: 0, max: 80000 },
  { id: 'mid', label: '800 – 1.400 UYU', min: 80000, max: 140000 },
  { id: 'premium', label: 'Más de 1.400 UYU', min: 140000, max: Infinity },
] as const;

export type ScheduleFilter =
  | 'any'
  | 'week'
  | 'month'
  | 'morning'
  | 'afternoon'
  | 'evening';

export const SCHEDULE_FILTERS: { id: ScheduleFilter; label: string }[] = [
  { id: 'any', label: 'Cualquier horario' },
  { id: 'week', label: 'Próximos 7 días' },
  { id: 'month', label: 'Próximos 30 días' },
  { id: 'morning', label: 'Mañana' },
  { id: 'afternoon', label: 'Tarde' },
  { id: 'evening', label: 'Noche' },
];
