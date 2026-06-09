'use client';

import { useEffect, useState } from 'react';

import { Logo } from '@/components/layout/Logo';
import { ONBOARDING_LABELS } from '@/constants/labels';

const SLIDE_INTERVAL_MS = 5500;

export const HERO_SLIDES = [
  {
    title: ONBOARDING_LABELS.slides[0].title,
    body: ONBOARDING_LABELS.slides[0].body,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80&fit=crop',
  },
  {
    title: ONBOARDING_LABELS.slides[1].title,
    body: ONBOARDING_LABELS.slides[1].body,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80&fit=crop',
  },
  {
    title: ONBOARDING_LABELS.slides[2].title,
    body: ONBOARDING_LABELS.slides[2].body,
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1920&q=80&fit=crop',
  },
] as const;

export function HeroSplash() {
  const [index, setIndex] = useState(0);
  const slide = HERO_SLIDES[index];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="inicio" className="fn-hero-splash" aria-label="Presentación Fitnexia">
      <div className="fn-hero-splash-viewport" aria-hidden="true">
        <div
          className="fn-hero-splash-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {HERO_SLIDES.map((item) => (
            <div
              key={item.image}
              className="fn-hero-splash-panel"
              style={{ backgroundImage: `url(${item.image})` }}
            />
          ))}
        </div>
      </div>

      <div className="fn-hero-splash-overlay" />

      <div className="fn-hero-splash-content">
        <div className="fn-hero-splash-brand">
          <Logo size="lg" className="brightness-0 invert drop-shadow-lg" />
          <p className="fn-hero-splash-intro">{ONBOARDING_LABELS.intro}</p>
          <p className="fn-hero-splash-tagline">{ONBOARDING_LABELS.tagline}</p>
        </div>

        <div key={index} className="fn-hero-splash-slogan">
          <h1 className="fn-hero-splash-slogan-title">{slide.title}</h1>
          <p className="fn-hero-splash-slogan-body">{slide.body}</p>
        </div>

        <div className="fn-hero-splash-dots" role="tablist" aria-label="Diapositivas">
          {HERO_SLIDES.map((item, i) => (
            <button
              key={item.image}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Diapositiva ${i + 1}`}
              className={`fn-hero-splash-dot${i === index ? ' fn-hero-splash-dot--active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
