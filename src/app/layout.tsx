import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import { AppProviders } from '@/components/providers';
import { PageBackground } from '@/components/layout/PageBackground';

import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

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
    <html lang="es-UY" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} antialiased`}>
        <AppProviders>
          <PageBackground>{children}</PageBackground>
          {modal}
        </AppProviders>
      </body>
    </html>
  );
}
