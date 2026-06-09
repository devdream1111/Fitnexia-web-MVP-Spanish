'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { BUTTON_LABELS, LANDING_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';

export function LandingHeader() {
  const { isDark, toggleDarkMode } = useAppTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fn-landing-header${scrolled ? ' fn-landing-header--solid' : ''}`}>
      <div className="fn-layout-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo
            size="md"
            className={scrolled ? '' : 'brightness-0 invert drop-shadow-md'}
          />
          {!scrolled ? (
            <span className="hidden fn-uy-header-badge sm:inline">{LANDING_LABELS.badge}</span>
          ) : null}
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Principal">
          <a href="#que-es" className="fn-landing-nav-link">
            {LANDING_LABELS.nav.what}
          </a>
          <a href="#como-funciona" className="fn-landing-nav-link">
            {LANDING_LABELS.nav.howItWorks}
          </a>
          <a href="#para-quien" className="fn-landing-nav-link">
            {LANDING_LABELS.nav.whoIsItFor}
          </a>
          <a href="#beneficios" className="fn-landing-nav-link">
            {LANDING_LABELS.nav.benefits}
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="fn-landing-icon-btn"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link href="/auth/login" className="hidden sm:block">
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
      </div>
    </header>
  );
}
