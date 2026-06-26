'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';

import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { BUTTON_LABELS, LANDING_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import { handleHashLinkClick } from '@/utils/smooth-scroll';

const NAV_ITEMS = [
  { href: '#que-es', label: LANDING_LABELS.nav.what },
  { href: '#como-funciona', label: LANDING_LABELS.nav.howItWorks },
  { href: '#para-quien', label: LANDING_LABELS.nav.whoIsItFor },
  { href: '#beneficios', label: LANDING_LABELS.nav.benefits },
] as const;

export function LandingHeader() {
  const { isDark, toggleDarkMode } = useAppTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (media.matches) closeMenu();
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [closeMenu]);

  const headerClass = `fn-landing-header${scrolled ? ' fn-landing-header--solid' : ''}${menuOpen ? ' fn-landing-header--menu-open' : ''}`;

  return (
    <header className={headerClass}>
      <div className="fn-layout-shell flex h-14 min-w-0 items-center justify-between gap-2 sm:h-16 sm:gap-4">
        <div className="flex min-w-0 shrink items-center">
          <Logo
            href="/"
            size="sm"
            className={`sm:hidden ${scrolled ? '' : 'brightness-0 invert drop-shadow-md'}`}
          />
          <Logo
            href="/"
            size="md"
            className={`hidden sm:block ${scrolled ? '' : 'brightness-0 invert drop-shadow-md'}`}
          />
        </div>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Principal">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="fn-landing-nav-link"
              onClick={(e) => handleHashLinkClick(e, item.href)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="fn-landing-icon-btn"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link href="/auth/login">
            <Button
              title={BUTTON_LABELS.signIn}
              variant="outline"
              size="sm"
              className="fn-landing-btn-login"
            />
          </Link>
          <Link href="/auth/register">
            <Button title={LANDING_LABELS.nav.start} size="sm" />
          </Link>
        </div>

        <button
          type="button"
          className="fn-landing-menu-btn flex lg:hidden"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="landing-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fn-landing-menu-backdrop lg:hidden"
            aria-label="Cerrar menú"
            onClick={closeMenu}
          />
          <div id="landing-mobile-menu" className="fn-landing-mobile-menu lg:hidden">
            <nav className="fn-landing-mobile-nav" aria-label="Principal móvil">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="fn-landing-mobile-nav-link"
                  onClick={(e) => {
                    handleHashLinkClick(e, item.href);
                    closeMenu();
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="fn-landing-mobile-actions">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="fn-landing-mobile-theme"
              >
                <span className="fn-landing-mobile-theme-icon">
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </span>
                <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
              </button>

              <Link href="/auth/login" className="block w-full" onClick={closeMenu}>
                <Button
                  title={BUTTON_LABELS.signIn}
                  variant="outline"
                  size="md"
                  className="w-full fn-landing-btn-login"
                />
              </Link>
              <Link href="/auth/register" className="block w-full" onClick={closeMenu}>
                <Button title={LANDING_LABELS.nav.start} size="md" className="w-full" />
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
