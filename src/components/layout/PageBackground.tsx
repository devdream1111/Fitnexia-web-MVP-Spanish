'use client';

import { useAppTheme } from '@/contexts/theme-context';
import { Footer } from './Footer';

export function PageBackground({ children }: { children: React.ReactNode }) {
  const { isDark } = useAppTheme();
  
  const lightBg = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80';
  const darkBg = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&q=80';

  return (
    <div className="relative min-h-screen flex flex-col">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10"
        style={{ backgroundImage: `url(${isDark ? darkBg : lightBg})` }}
      />
      <div className="relative z-10 flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
