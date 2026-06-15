'use client';

import { AppConfigProvider } from '@/contexts/app-config-context';
import { AuthProvider } from '@/contexts/auth-context';
import { BookingsProvider } from '@/contexts/bookings-context';
import { ClassesProvider } from '@/contexts/classes-context';
import { InstructorsProvider } from '@/contexts/instructors-context';
import { NoticeModalProvider } from '@/contexts/notice-modal-context';
import { NotificationsProvider } from '@/contexts/notifications-context';
import { PaymentsProvider } from '@/contexts/payments-context';
import { ReviewsProvider } from '@/contexts/reviews-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { GlobalLoadingOverlay } from '@/components/layout/global-loading-overlay';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppConfigProvider>
      <NoticeModalProvider>
      <AuthProvider>
        <ClassesProvider>
          <InstructorsProvider>
          <BookingsProvider>
          <PaymentsProvider>
          <NotificationsProvider>
            <ReviewsProvider>
              {children}
              <GlobalLoadingOverlay />
            </ReviewsProvider>
          </NotificationsProvider>
          </PaymentsProvider>
        </BookingsProvider>
          </InstructorsProvider>
        </ClassesProvider>
      </AuthProvider>
      </NoticeModalProvider>
      </AppConfigProvider>
    </ThemeProvider>
  );
}
