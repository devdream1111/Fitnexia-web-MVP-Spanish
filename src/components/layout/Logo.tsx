'use client';

import Link from 'next/link';

import { useAppTheme } from '@/contexts/theme-context';

export function Logo({
  className = '',
  size = 'md',
  href,
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
}) {
  const { isDark } = useAppTheme();

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20',
    xl: 'h-32',
  };

  const wrapperClass = `${sizeClasses[size]} flex w-fit items-center justify-center ${href ? '' : 'mx-auto'} ${className}`;

  const image = (
    <img
      src="/fitnexia-logo.png"
      alt="Fitnexia Logo"
      className={`h-full w-auto object-contain ${isDark ? 'invert brightness-125' : ''}`}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${wrapperClass} shrink-0 transition-opacity hover:opacity-90`}
        aria-label="Volver al inicio"
      >
        {image}
      </Link>
    );
  }

  return <div className={wrapperClass}>{image}</div>;
}
