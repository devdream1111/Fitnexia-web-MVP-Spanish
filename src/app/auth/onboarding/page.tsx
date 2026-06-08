'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { ONBOARDING_LABELS } from '@/constants/labels';

const SLIDES = [
  {
    title: ONBOARDING_LABELS.slides[0].title,
    body: ONBOARDING_LABELS.slides[0].body,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
  },
  {
    title: ONBOARDING_LABELS.slides[1].title,
    body: ONBOARDING_LABELS.slides[1].body,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
  },
  {
    title: ONBOARDING_LABELS.slides[2].title,
    body: ONBOARDING_LABELS.slides[2].body,
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=600&fit=crop',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);
  const slide = SLIDES[index];

  useEffect(() => {
    setKey(k => k + 1);
  }, [index]);

  const finish = () => {
    completeOnboarding();
    router.replace('/auth/login');
  };

  const next = () => {
    if (index < SLIDES.length - 1) setIndex(index + 1);
    else finish();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
      <div key={key} className="animate-bounce-in">
        <div className="flex justify-center">
          <img 
            src={slide.image} 
            alt={slide.title} 
            className="h-64 w-full max-w-md rounded-2xl object-cover animate-float"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <h1 className="mt-8 text-center text-3xl font-extrabold md:text-5xl animate-slide-up stagger-1">{slide.title}</h1>
        <p className="mt-6 text-center text-lg text-[var(--fn-text-muted)] md:text-xl animate-slide-up stagger-2">{slide.body}</p>
        <div className="mt-10 flex justify-center gap-3 animate-slide-up stagger-3">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${i === index ? 'bg-[var(--fn-primary)] w-8 rounded-lg' : 'bg-[var(--fn-border)]'}`}
            />
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 animate-slide-up stagger-4">
          <Button 
            title={index < SLIDES.length - 1 ? ONBOARDING_LABELS.next : ONBOARDING_LABELS.getStarted} 
            className="w-full max-w-md hover:animate-pulse-glow" 
            onClick={next} 
          />
          {index < SLIDES.length - 1 ? (
            <button type="button" onClick={finish} className="text-sm text-[var(--fn-text-muted)]">
              {ONBOARDING_LABELS.skip}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
