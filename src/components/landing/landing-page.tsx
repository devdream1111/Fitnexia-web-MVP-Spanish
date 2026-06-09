'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Dumbbell, Sparkles, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BUTTON_LABELS, LANDING_LABELS } from '@/constants/labels';
import { LandingBenefits } from './landing-benefits';
import { HeroSplash } from './hero-splash';
import { LandingHeader } from './landing-header';

const ROLE_CONFIG = [
  { key: 'athlete' as const, icon: Dumbbell, accent: 'emerald' },
  { key: 'instructor' as const, icon: UserRound, accent: 'blue' },
  { key: 'institution' as const, icon: Building2, accent: 'violet' },
];

export function LandingPage() {
  return (
    <div className="fn-landing fn-uy-landing">
      <LandingHeader />
      <HeroSplash />

      <section id="que-es" className="fn-uy-section fn-uy-what">
        <div className="fn-layout-shell fn-uy-what-inner">
          <span className="fn-uy-eyebrow">{LANDING_LABELS.whatEyebrow}</span>
          <h2 className="fn-uy-what-title">{LANDING_LABELS.whatTitle}</h2>
          <p className="fn-uy-what-body">{LANDING_LABELS.whatBody}</p>
          <div className="fn-uy-trust-row">
            {LANDING_LABELS.trust.map((item) => (
              <span key={item} className="fn-uy-trust-pill">
                <Sparkles size={14} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="para-quien" className="fn-uy-section fn-uy-section--surface">
        <div className="fn-layout-shell">
          <div className="fn-uy-section-head">
            <span className="fn-uy-eyebrow">{LANDING_LABELS.whoEyebrow}</span>
            <h2 className="fn-uy-section-title">{LANDING_LABELS.whoTitle}</h2>
            <p className="fn-uy-section-subtitle">{LANDING_LABELS.whoSubtitle}</p>
          </div>

          <div className="fn-uy-role-grid">
            {ROLE_CONFIG.map(({ key, icon: Icon, accent }) => {
              const role = LANDING_LABELS.roles[key];
              return (
                <article key={key} className={`fn-uy-role-card fn-uy-role-card--${accent}`}>
                  <span className="fn-uy-role-icon">
                    <Icon size={28} />
                  </span>
                  <p className="fn-uy-role-label">{role.label}</p>
                  <h3 className="fn-uy-role-headline">{role.headline}</h3>
                  <p className="fn-uy-role-body">{role.body}</p>
                  <Link href="/auth/register" className="fn-uy-role-cta">
                    {role.cta}
                    <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="fn-uy-section">
        <div className="fn-layout-shell">
          <div className="fn-uy-section-head">
            <span className="fn-uy-eyebrow">{LANDING_LABELS.howEyebrow}</span>
            <h2 className="fn-uy-section-title">{LANDING_LABELS.howTitle}</h2>
            <p className="fn-uy-section-subtitle">{LANDING_LABELS.howSubtitle}</p>
          </div>

          <div className="fn-uy-timeline">
            {LANDING_LABELS.steps.map((step) => (
              <article key={step.num} className="fn-uy-timeline-step">
                <div className="fn-uy-timeline-marker">
                  <span className="fn-uy-timeline-num">{step.num}</span>
                </div>
                <div className="fn-uy-timeline-content">
                  <h3 className="fn-uy-timeline-title">{step.title}</h3>
                  <p className="fn-uy-timeline-body">{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <LandingBenefits />

      <section className="fn-uy-launch-band">
        <div className="fn-layout-shell fn-uy-launch-inner">
          <div className="fn-uy-launch-copy">
            <span className="fn-uy-launch-badge">{LANDING_LABELS.launchBadge}</span>
            <h2 className="fn-uy-launch-title">{LANDING_LABELS.launchTitle}</h2>
            <p className="fn-uy-launch-subtitle">{LANDING_LABELS.launchSubtitle}</p>
          </div>
          <div className="fn-uy-launch-stats">
            {LANDING_LABELS.stats.map((stat) => (
              <div key={stat.label} className="fn-uy-launch-stat">
                <p className="fn-uy-launch-stat-value">{stat.value}</p>
                <p className="fn-uy-launch-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="empezar" className="fn-uy-section fn-uy-cta-section">
        <div className="fn-layout-shell">
          <div className="fn-uy-cta-card">
            <h2 className="fn-uy-cta-title">{LANDING_LABELS.ctaTitle}</h2>
            <p className="fn-uy-cta-subtitle">{LANDING_LABELS.ctaSubtitle}</p>
            <div className="fn-uy-cta-actions">
              <Link href="/auth/register">
                <Button title={LANDING_LABELS.ctaButton} size="lg" />
              </Link>
              <Link href="/auth/login">
                <Button title={BUTTON_LABELS.signIn} variant="outline" size="lg" />
              </Link>
            </div>
            <p className="fn-uy-cta-note">{LANDING_LABELS.ctaNote}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
