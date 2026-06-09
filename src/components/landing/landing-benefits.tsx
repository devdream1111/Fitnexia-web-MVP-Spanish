'use client';

import { useState } from 'react';
import { Building2, Check, Dumbbell, UserRound } from 'lucide-react';

import { LANDING_LABELS } from '@/constants/labels';

type BenefitRole = keyof typeof LANDING_LABELS.benefits;

const TAB_META: Record<BenefitRole, { label: string; icon: typeof Dumbbell }> = {
  athlete: { label: LANDING_LABELS.benefitsTabs.athlete, icon: Dumbbell },
  instructor: { label: LANDING_LABELS.benefitsTabs.instructor, icon: UserRound },
  institution: { label: LANDING_LABELS.benefitsTabs.institution, icon: Building2 },
};

export function LandingBenefits() {
  const [active, setActive] = useState<BenefitRole>('athlete');
  const items = LANDING_LABELS.benefits[active];

  return (
    <section id="beneficios" className="fn-uy-section fn-uy-section--muted">
      <div className="fn-layout-shell">
        <div className="fn-uy-section-head">
          <span className="fn-uy-eyebrow">{LANDING_LABELS.benefitsEyebrow}</span>
          <h2 className="fn-uy-section-title">{LANDING_LABELS.benefitsTitle}</h2>
          <p className="fn-uy-section-subtitle">{LANDING_LABELS.benefitsSubtitle}</p>
        </div>

        <div className="fn-uy-benefits-tabs" role="tablist" aria-label={LANDING_LABELS.benefitsTitle}>
          {(Object.keys(TAB_META) as BenefitRole[]).map((role) => {
            const { label, icon: Icon } = TAB_META[role];
            const isActive = active === role;
            return (
              <button
                key={role}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`fn-uy-benefits-tab${isActive ? ' fn-uy-benefits-tab--active' : ''}`}
                onClick={() => setActive(role)}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </div>

        <div key={active} className="fn-uy-benefits-panel" role="tabpanel">
          {items.map((item) => (
            <article key={item.title} className="fn-uy-benefit-item">
              <span className="fn-uy-benefit-check">
                <Check size={18} strokeWidth={2.5} />
              </span>
              <div>
                <h3 className="fn-uy-benefit-title">{item.title}</h3>
                <p className="fn-uy-benefit-body">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
