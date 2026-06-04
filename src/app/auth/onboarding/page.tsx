'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

const SLIDES = [
  {
    title: 'Find your next class',
    body: 'Discover sports and fitness classes from top instructors and gyms near you.',
    emoji: '🏃',
  },
  {
    title: 'Book in one tap',
    body: 'Reserve in-person or online sessions. Get reminders before every class.',
    emoji: '📅',
  },
  {
    title: 'Train with the best',
    body: 'Verified instructors, real reviews, and a loyalty program that rewards you.',
    emoji: '⭐',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const finish = () => {
    completeOnboarding();
    router.replace('/auth/login');
  };

  const next = () => {
    if (index < SLIDES.length - 1) setIndex(index + 1);
    else finish();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <p className="text-center text-6xl">{slide.emoji}</p>
      <h1 className="mt-8 text-center text-3xl font-extrabold">{slide.title}</h1>
      <p className="mt-4 text-center text-[var(--fn-text-muted)]">{slide.body}</p>
      <div className="mt-8 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${i === index ? 'bg-[var(--fn-primary)]' : 'bg-[var(--fn-border)]'}`}
          />
        ))}
      </div>
      <Button title={index < SLIDES.length - 1 ? 'Next' : 'Get started'} className="mt-10" onClick={next} />
      {index < SLIDES.length - 1 ? (
        <button type="button" onClick={finish} className="mt-4 text-center text-sm text-[var(--fn-text-muted)]">
          Skip
        </button>
      ) : null}
    </div>
  );
}
