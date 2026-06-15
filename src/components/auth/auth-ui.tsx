'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import {
  Building2,
  CalendarCheck,
  ChevronDown,
  Dumbbell,
  Eye,
  EyeOff,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  UserRound,
  Users,
} from 'lucide-react';

import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { PAGE_BACKGROUNDS } from '@/constants/backgrounds';
import { GENERAL_LABELS, AUTH_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import type { UserRole } from '@/types/api';

const BRAND_FEATURES = [
  { icon: CalendarCheck, text: 'Reserva clases presenciales y online al instante' },
  { icon: MapPin, text: 'Explora instructores y gimnasios cerca de ti' },
  { icon: Users, text: 'Una plataforma para atletas, instructores y centros' },
] as const;

const BRAND_STATS = [
  { value: '150+', label: 'Usuarios activos' },
  { value: '50+', label: 'Clases publicadas' },
  { value: '4.8★', label: 'Valoración media' },
] as const;

export function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M47.5 24.5C47.5 22.9 47.3 21.3 47 19.8H24V29H38.3C37.8 31.6 36.4 33.9 34.2 35.6L42 41.6C45.3 38.6 47.5 32.1 47.5 24.5Z" fill="#4285F4" />
      <path d="M24 48C30.4 48 35.8 45.9 40 42.4L32.2 36.4C29.9 38.1 27.1 39.1 24 39.1C18.2 39.1 13.2 35.9 11.1 31.2L3.3 37.5C7.4 45.3 15.1 48 24 48Z" fill="#34A853" />
      <path d="M11.1 31.2C9.9 28.8 9.2 26.1 9.2 23.2C9.2 20.3 9.9 17.6 11.1 15.2L3.3 8.9C0.5 14.4 0 20.5 0 23.2C0 25.9 0.5 32 3.3 37.5L11.1 31.2Z" fill="#FBBC05" />
      <path d="M24 8.8C27.3 8.8 30.3 10 32.7 12.3L39.8 5.2C35.7 1.5 30.3 0 24 0C15.1 0 7.4 2.7 3.3 8.9L11.1 15.2C13.2 10.5 18.2 7.3 24 7.3C24 7.3 24 8.8 24 8.8Z" fill="#EA4335" />
    </svg>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[var(--fn-border)]" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-[var(--fn-bg)] px-4 text-[var(--fn-text-muted)]">{label}</span>
      </div>
    </div>
  );
}

export function GoogleSignInButton({
  label,
  onClick,
  disabled,
  loading,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`fn-auth-google-btn w-full${disabled || loading ? ' opacity-60' : ''}`}
    >
      <GoogleIcon />
      <span>{loading ? '...' : label}</span>
    </button>
  );
}

function AuthThemeToggle() {
  const { isDark, toggleDarkMode } = useAppTheme();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="fn-auth-theme-toggle"
      aria-label="Cambiar tema"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function AuthBrandPanel({ variant }: { variant: 'login' | 'register' }) {
  const { isDark } = useAppTheme();
  const headline =
    variant === 'login'
      ? 'Vuelve a entrenar con los mejores profesionales'
      : 'Únete a la comunidad fitness que está transformando España';

  return (
    <aside className="fn-auth-brand">
      <div
        className="fn-auth-brand-image"
        style={{ backgroundImage: `url(${isDark ? PAGE_BACKGROUNDS.dark : PAGE_BACKGROUNDS.light})` }}
      />
      <div className="fn-auth-brand-overlay" />
      <div className="relative z-10 flex h-full flex-col justify-between p-6 lg:p-8">
        <div>
          <Logo href="/" size="md" className="!mx-0 mb-6 brightness-0 invert" />
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90">
            <Sparkles size={14} />
            Marketplace fitness
          </div>
          <h2 className="max-w-md text-2xl font-extrabold leading-tight text-white lg:text-3xl">
            {headline}
          </h2>
          <ul className="mt-5 space-y-3">
            {BRAND_FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/85">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon size={14} className="text-white" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {BRAND_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/15 bg-white/10 px-2 py-3 backdrop-blur-sm"
            >
              <p className="text-lg font-extrabold text-white">{stat.value}</p>
              <p className="mt-0.5 text-[10px] text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function AuthShell({
  variant,
  children,
}: {
  variant: 'login' | 'register';
  children: ReactNode;
}) {
  const { isDark } = useAppTheme();

  return (
    <div className="fn-auth-shell">
      <AuthThemeToggle />
      <AuthBrandPanel variant={variant} />

      <section className="fn-auth-form-section">
        <div className="fn-auth-form-inner">
          <div className="fn-auth-mobile-banner">
            <div
              className="fn-auth-brand-image"
              style={{ backgroundImage: `url(${isDark ? PAGE_BACKGROUNDS.dark : PAGE_BACKGROUNDS.light})` }}
            />
            <div className="fn-auth-brand-overlay" />
            <div className="relative z-10">
              <Logo href="/" size="md" className="!mx-0 mb-3 brightness-0 invert" />
              <h2 className="text-xl font-extrabold text-white">
                {variant === 'login'
                  ? 'Tu plataforma fitness en España'
                  : 'Crea tu cuenta en minutos'}
              </h2>
            </div>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}

export function AuthFormIntro({ children }: { children: ReactNode }) {
  return <div className="fn-auth-form-intro">{children}</div>;
}

export function AuthFormHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="fn-auth-form-header">
      <h1 className="text-2xl font-extrabold tracking-tight text-[var(--fn-text)] md:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-base text-[var(--fn-text-muted)]">{subtitle}</p>
    </header>
  );
}

export function AuthFooterLink({
  prompt,
  linkLabel,
  href,
}: {
  prompt: string;
  linkLabel: string;
  href: string;
}) {
  return (
    <p className="text-center text-sm text-[var(--fn-text-muted)]">
      {prompt}{' '}
      <Link href={href} className="font-semibold text-[var(--fn-primary)] transition hover:opacity-80">
        {linkLabel}
      </Link>
    </p>
  );
}

export function AuthTermsCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/50 px-3.5 py-3 transition hover:border-[var(--fn-primary-muted)]">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
          checked
            ? 'border-[var(--fn-primary)] bg-[var(--fn-primary)] text-white'
            : 'border-[var(--fn-border)] bg-[var(--fn-surface)]'
        }`}
      >
        {checked ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span className="text-sm leading-relaxed text-[var(--fn-text-secondary)]">
        {AUTH_LABELS.acceptTermsPrefix}{' '}
        <Link
          href="/legal/terms"
          className="font-semibold text-[var(--fn-primary)] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {AUTH_LABELS.termsAndConditions}
        </Link>{' '}
        {AUTH_LABELS.acceptTermsMiddle}{' '}
        <Link
          href="/legal/privacy"
          className="font-semibold text-[var(--fn-primary)] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {AUTH_LABELS.privacyPolicy}
        </Link>
        .
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
    </label>
  );
}

export function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="fn-auth-field block w-full">
      <span className="mb-2 block text-sm font-medium text-[var(--fn-text-secondary)]">{label}</span>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] py-3.5 pl-4 pr-12 text-[var(--fn-text)] outline-none transition focus:border-[var(--fn-primary)] focus:ring-2 focus:ring-[var(--fn-primary-muted)]"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[var(--fn-text-muted)] transition hover:bg-[var(--fn-surface-muted)] hover:text-[var(--fn-text)]"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

type RegisterRole = Exclude<UserRole, 'admin'>;

const ROLE_OPTIONS: {
  value: RegisterRole;
  label: string;
  hint: string;
  icon: typeof Dumbbell;
}[] = [
  { value: 'athlete', label: 'Atleta', hint: 'Reserva clases', icon: Dumbbell },
  { value: 'instructor', label: 'Instructor', hint: 'Publica sesiones', icon: UserRound },
  { value: 'institution', label: 'Gimnasio', hint: 'Gestiona tu centro', icon: Building2 },
];

export function RoleTileSelector({
  value,
  onChange,
  label,
}: {
  value: RegisterRole;
  onChange: (role: RegisterRole) => void;
  label: string;
}) {
  return (
    <div className="fn-auth-role-selector">
      <span className="fn-auth-role-selector-label">{label}</span>
      <div className="fn-auth-role-tiles" role="radiogroup" aria-label={label}>
        {ROLE_OPTIONS.map((role) => {
          const Icon = role.icon;
          const active = value === role.value;
          return (
            <button
              key={role.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(role.value)}
              className={`fn-auth-role-tile${active ? ' fn-auth-role-tile--active' : ''}`}
            >
              <span className="fn-auth-role-tile-icon">
                <Icon size={22} />
              </span>
              <span className="fn-auth-role-tile-label">{role.label}</span>
              <span className="fn-auth-role-tile-hint">{role.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DemoAccessPanel({
  onDemoLogin,
}: {
  onDemoLogin: (role: UserRole) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fn-auth-demo">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-center"
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--fn-text)]">{GENERAL_LABELS.quickDemo}</p>
          <p className="mt-0.5 text-xs text-[var(--fn-text-muted)]">
            Acceso simulado para explorar la plataforma web
          </p>
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[var(--fn-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button title="Atleta" variant="outline" size="sm" onClick={() => onDemoLogin('athlete')} />
          <Button title="Entrenador" variant="outline" size="sm" onClick={() => onDemoLogin('instructor')} />
          <Button title="Gimnasio" variant="outline" size="sm" onClick={() => onDemoLogin('institution')} />
        </div>
      ) : null}
    </div>
  );
}
