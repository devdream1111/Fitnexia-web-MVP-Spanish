'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

const SLIDES = [
  {
    title: 'Find your next class',
    body: 'Discover sports and fitness classes from top instructors and gyms near you.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  },
  {
    title: 'Book in one tap',
    body: 'Reserve in-person or online sessions. Get reminders before every class.',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop',
  },
  {
    title: 'Train with the best',
    body: 'Verified instructors, real reviews, and a loyalty program that rewards you.',
    image: 'https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=400&h=300&fit=crop',
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
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
      <div className="flex justify-center">
        <img 
          src={slide.image} 
          alt={slide.title} 
          className="h-64 w-full max-w-md rounded-2xl object-cover"
        />
      </div>
      <h1 className="mt-8 text-center text-3xl font-extrabold md:text-5xl">{slide.title}</h1>
      <p className="mt-6 text-center text-lg text-[var(--fn-text-muted)] md:text-xl">{slide.body}</p>
      <div className="mt-10 flex justify-center gap-3">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full ${i === index ? 'bg-[var(--fn-primary)]' : 'bg-[var(--fn-border)]'}`}
          />
        ))}
      </div>
      <div className="mt-12 flex flex-col items-center gap-4">
        <Button title={index < SLIDES.length - 1 ? 'Next' : 'Get started'} className="w-full max-w-md" onClick={next} />
        {index < SLIDES.length - 1 ? (
          <button type="button" onClick={finish} className="text-sm text-[var(--fn-text-muted)]">
            Skip
          </button>
        ) : null}
      </div>
    </div>
  );
}
