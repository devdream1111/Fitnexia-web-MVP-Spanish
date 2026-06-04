'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { ClassesProvider } from '@/contexts/classes-context';
import { ReviewsProvider } from '@/contexts/reviews-context';
import { ThemeProvider } from '@/contexts/theme-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ClassesProvider>
          <ReviewsProvider>{children}</ReviewsProvider>
        </ClassesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
