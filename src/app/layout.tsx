import type { Metadata } from 'next';

import { AppProviders } from '@/components/providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Fitnexia',
  description: 'Marketplace connecting athletes, instructors, and gyms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
