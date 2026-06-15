'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAppTheme } from '@/contexts/theme-context';
import { smoothScrollToTop } from '@/utils/smooth-scroll';

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
  const pathname = usePathname();

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
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      const targetPath = href.split('#')[0] || '/';
      const currentPath = pathname || '/';
      if (targetPath === currentPath) {
        event.preventDefault();
        smoothScrollToTop();
      }
    };

    return (
      <Link
        href={href}
        onClick={handleClick}
        className={`${wrapperClass} shrink-0 transition-opacity hover:opacity-90`}
        aria-label="Volver al inicio"
      >
        {image}
      </Link>
    );
  }

  return <div className={wrapperClass}>{image}</div>;
}
