'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { BookingsProvider } from '@/contexts/bookings-context';
import { ClassesProvider } from '@/contexts/classes-context';
import { NotificationsProvider } from '@/contexts/notifications-context';
import { PaymentsProvider } from '@/contexts/payments-context';
import { ReviewsProvider } from '@/contexts/reviews-context';
import { ThemeProvider } from '@/contexts/theme-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ClassesProvider>
          <BookingsProvider>
          <PaymentsProvider>
          <NotificationsProvider>
            <ReviewsProvider>{children}</ReviewsProvider>
          </NotificationsProvider>
          </PaymentsProvider>
        </BookingsProvider>
        </ClassesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
