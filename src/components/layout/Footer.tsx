'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Heart, Star, User } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { Logo } from './Logo';
import type { UserRole } from '@/types/api';

type FooterLink = { label: string; href: string };

const LANDING_QUICK_LINKS: FooterLink[] = [
  { label: 'Sobre nosotros', href: '/#que-es' },
  { label: 'Cómo funciona', href: '/#como-funciona' },
  { label: 'Precios', href: '/#beneficios' },
  { label: 'Preguntas frecuentes', href: '/#empezar' },
];

const LANDING_FOR_YOU_LINKS: FooterLink[] = [
  { label: 'Encontrar clases', href: '/#para-quien' },
  { label: 'Ser instructor', href: '/auth/register' },
  { label: 'Registrar gimnasio', href: '/auth/register' },
  { label: 'Blog', href: '/#que-es' },
];

function profileHref(role: UserRole | undefined): string {
  if (!role) return '/auth/login';
  if (role === 'instructor') return '/instructor/profile';
  if (role === 'institution') return '/gym/profile';
  if (role === 'admin') return '/admin/profile';
  return '/athlete/profile';
}

function quickLinksForRole(role: UserRole): FooterLink[] {
  if (role === 'admin') {
    return [
      { label: 'Sobre nosotros', href: '/legal/terms' },
      { label: 'Panel', href: '/admin/dashboard' },
      { label: 'Usuarios', href: '/admin/users' },
      { label: 'Preguntas frecuentes', href: '/legal/privacy' },
    ];
  }
  if (role === 'athlete') {
    return [
      { label: 'Sobre nosotros', href: '/legal/terms' },
      { label: 'Cómo funciona', href: '/athlete/search' },
      { label: 'Mis reservas', href: '/athlete/bookings' },
      { label: 'Preguntas frecuentes', href: '/legal/privacy' },
    ];
  }
  if (role === 'instructor') {
    return [
      { label: 'Sobre nosotros', href: '/legal/terms' },
      { label: 'Mis clases', href: '/instructor/classes' },
      { label: 'Mi calendario', href: '/instructor/calendar' },
      { label: 'Preguntas frecuentes', href: '/legal/privacy' },
    ];
  }
  if (role === 'institution') {
    return [
      { label: 'Sobre nosotros', href: '/legal/terms' },
      { label: 'Gestionar clases', href: '/gym/classes' },
      { label: 'Instructores', href: '/gym/instructors' },
      { label: 'Preguntas frecuentes', href: '/legal/privacy' },
    ];
  }
  return LANDING_QUICK_LINKS;
}

function forYouLinksForRole(role: UserRole): FooterLink[] {
  if (role === 'admin') {
    return [
      { label: 'Reservas', href: '/admin/bookings' },
      { label: 'Clases', href: '/admin/classes' },
      { label: 'Instituciones', href: '/admin/institutions' },
      { label: 'Mi perfil', href: '/admin/profile' },
    ];
  }
  if (role === 'athlete') {
    return [
      { label: 'Encontrar clases', href: '/athlete/search' },
      { label: 'Mi perfil', href: '/athlete/profile' },
      { label: 'Historial de pagos', href: '/athlete/payment-history' },
      { label: 'Soporte', href: '/athlete/profile/support' },
    ];
  }
  if (role === 'instructor') {
    return [
      { label: 'Panel', href: '/instructor/dashboard' },
      { label: 'Mis ganancias', href: '/instructor/earnings' },
      { label: 'Mi perfil', href: '/instructor/profile' },
      { label: 'Crear clase', href: '/instructor/create-class' },
    ];
  }
  if (role === 'institution') {
    return [
      { label: 'Panel', href: '/gym/dashboard' },
      { label: 'Ganancias', href: '/gym/earnings' },
      { label: 'Perfil del gimnasio', href: '/gym/profile' },
      { label: 'Crear clase', href: '/gym/create-class' },
    ];
  }
  return LANDING_FOR_YOU_LINKS;
}

function footerLinkClassName() {
  return 'text-[#94A3B8] hover:text-[#60A5FA] transition text-sm';
}

export function Footer() {
  const { user } = useAuth();
  const quickLinks = user ? quickLinksForRole(user.role) : LANDING_QUICK_LINKS;
  const forYouLinks = user ? forYouLinksForRole(user.role) : LANDING_FOR_YOU_LINKS;

  return (
    <footer
      className={`relative z-10 border-t border-[#334155] bg-[#121C2D] ${
        user ? 'mb-16 md:mb-0' : ''
      }`}
    >
      <div className="fn-layout-shell py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo href="/" size="md" className="mb-4 brightness-0 invert" />
            <p className="mb-6 text-sm leading-relaxed text-[#94A3B8]">
              Conecta con los mejores instructores y gimnasios para alcanzar tus metas de fitness.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:hola@fitnexia.com"
                className="text-[#94A3B8] transition hover:text-[#60A5FA]"
                aria-label="Enviar correo a Fitnexia"
              >
                <Heart size={20} />
              </a>
              <Link
                href="/legal/privacy"
                className="text-[#94A3B8] transition hover:text-[#60A5FA]"
                aria-label="Política de privacidad"
              >
                <Star size={20} />
              </Link>
              <Link
                href={profileHref(user?.role)}
                className="text-[#94A3B8] transition hover:text-[#60A5FA]"
                aria-label={user ? 'Mi perfil' : 'Iniciar sesión'}
              >
                <User size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#F8FAFC]">Enlaces rápidos</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={footerLinkClassName()}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#F8FAFC]">Para ti</h3>
            <ul className="space-y-2">
              {forYouLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={footerLinkClassName()}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#F8FAFC]">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-[#94A3B8]">
                <MapPin size={18} className="shrink-0 text-[#60A5FA]" />
                <span>Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#94A3B8]">
                <Mail size={18} className="shrink-0 text-[#60A5FA]" />
                <a href="mailto:hola@fitnexia.com" className="transition hover:text-[#60A5FA]">
                  hola@fitnexia.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#94A3B8]">
                <Phone size={18} className="shrink-0 text-[#60A5FA]" />
                <a href="tel:+541112345678" className="transition hover:text-[#60A5FA]">
                  +54 11 1234-5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#334155] pt-8 md:flex-row">
          <p className="text-sm text-[#94A3B8]">© 2026 Fitnexia. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/legal/privacy" className={footerLinkClassName()}>
              Política de privacidad
            </Link>
            <Link href="/legal/terms" className={footerLinkClassName()}>
              Términos y condiciones
            </Link>
            <Link href="/legal/privacy" className={footerLinkClassName()}>
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
