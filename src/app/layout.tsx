import type { Metadata } from 'next';

import { AppProviders } from '@/components/providers';
import { PageBackground } from '@/components/layout/PageBackground';

import './globals.css';

export const metadata: Metadata = {
  title: 'Fitnexia',
  description: 'Marketplace connecting athletes, instructors, and gyms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <AppProviders>
          <PageBackground>{children}</PageBackground>
        </AppProviders>
      </body>
    </html>
  );
}
