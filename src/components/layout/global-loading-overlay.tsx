'use client';

import { usePathname } from 'next/navigation';

import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { useAuth } from '@/contexts/auth-context';
import { useBookings } from '@/contexts/bookings-context';
import { useClasses } from '@/contexts/classes-context';
import { GENERAL_LABELS } from '@/constants/labels';

const DASHBOARD_PATHS = new Set([
  '/instructor/dashboard',
  '/gym/dashboard',
]);

export function GlobalLoadingOverlay() {
  const pathname = usePathname();
  const { user, isLoading: authLoading, isAuthenticating } = useAuth();
  const { loading: classesLoading, homeFeed, classes } = useClasses();
  const { loading: bookingsLoading, bookings } = useBookings();

  const isRedirectingFromLanding = pathname === '/' && !!user;
  const showAuthOverlay = authLoading || isAuthenticating || isRedirectingFromLanding;

  const showAthleteHomeOverlay =
    pathname === '/athlete/home' && classesLoading && !homeFeed;

  const showAthleteSearchOverlay =
    pathname === '/athlete/search' && classesLoading && classes.length === 0;

  const showAthleteBookingsOverlay =
    pathname === '/athlete/bookings' && bookingsLoading && bookings.length === 0;

  const showDashboardOverlay =
    DASHBOARD_PATHS.has(pathname) &&
    classesLoading &&
    classes.length === 0 &&
    (user?.role === 'instructor' || user?.role === 'institution');

  const showDataOverlay =
    !!user &&
    !showAuthOverlay &&
    (showAthleteHomeOverlay ||
      showAthleteSearchOverlay ||
      showAthleteBookingsOverlay ||
      showDashboardOverlay);

  const visible = showAuthOverlay || showDataOverlay;

  if (!visible) return null;

  let message: string = GENERAL_LABELS.loading;
  if (isAuthenticating || isRedirectingFromLanding) {
    message = GENERAL_LABELS.preparingAccount;
  } else if (showDataOverlay) {
    message = GENERAL_LABELS.loadingYourData;
  }

  return <FullScreenLoader message={message} />;
}
