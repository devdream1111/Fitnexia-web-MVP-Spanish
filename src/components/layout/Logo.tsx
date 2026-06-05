'use client';

import { useAppTheme } from '@/contexts/theme-context';

export function Logo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const { isDark } = useAppTheme();
  
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20',
    xl: 'h-32'
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center ${className}`}>
      <img
        src="/fitnexia-logo.svg"
        alt="Fitnexia Logo"
        className={`w-auto h-full ${isDark ? 'invert brightness-125' : ''}`}
      />
    </div>
  );
}
