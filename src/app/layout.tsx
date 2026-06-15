import type { Metadata } from 'next';

import { AppProviders } from '@/components/providers';
import { PageBackground } from '@/components/layout/PageBackground';

import './globals.css';

export const metadata: Metadata = {
  title: 'Fitnexia',
  description: 'Marketplace fitness que conecta atletas, instructores y gimnasios en Uruguay',
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="es-UY" suppressHydrationWarning>
      <body className="antialiased">
        <AppProviders>
          <PageBackground>{children}</PageBackground>
          {modal}
        </AppProviders>
      </body>
    </html>
  );
}
