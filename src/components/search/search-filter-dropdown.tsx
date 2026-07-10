'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

/** Above page chrome/map; below app modals (z-[160]+). */
const DROPDOWN_Z_BACKDROP = 120;
const DROPDOWN_Z_MENU = 121;

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

function computeMenuPosition(anchor: HTMLElement): MenuPosition {
  const rect = anchor.getBoundingClientRect();
  const gap = 8;
  const viewportPadding = 8;
  const preferredMax = 240;
  const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
  const spaceAbove = rect.top - gap - viewportPadding;

  let maxHeight = Math.min(preferredMax, Math.max(spaceBelow, 0));
  let top = rect.bottom + gap;

  if (maxHeight < 120 && spaceAbove > spaceBelow) {
    maxHeight = Math.min(preferredMax, Math.max(spaceAbove, 0));
    top = Math.max(viewportPadding, rect.top - gap - maxHeight);
  }

  return {
    top,
    left: rect.left,
    width: rect.width,
    maxHeight: Math.max(maxHeight, 0),
  };
}

export function SearchFilterDropdown({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  ariaLabel?: string;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return;
    setMenuPosition(computeMenuPosition(anchorRef.current));
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuPosition(null);
      return;
    }
    updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => updatePosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, updatePosition]);

  const menu =
    isOpen && menuPosition && mounted
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 cursor-default bg-transparent"
              style={{ zIndex: DROPDOWN_Z_BACKDROP }}
              aria-label="Cerrar"
              onClick={close}
            />
            <div
              role="listbox"
              aria-label={ariaLabel ?? placeholder}
              className="fixed overflow-auto rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-1.5 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.35)]"
              style={{
                zIndex: DROPDOWN_Z_MENU,
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
              }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value);
                    close();
                  }}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
                    option.value === value
                      ? 'bg-[var(--fn-primary-muted)] font-bold text-[var(--fn-primary)]'
                      : 'text-[var(--fn-text)] hover:bg-[var(--fn-surface-muted)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div ref={anchorRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel ?? placeholder}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--fn-primary-muted)] ${
          value
            ? 'border-[color-mix(in_srgb,var(--fn-primary)_28%,var(--fn-border))] bg-[var(--fn-primary-muted)]/30 text-[var(--fn-text)] hover:border-[color-mix(in_srgb,var(--fn-primary)_40%,var(--fn-border))] hover:bg-[var(--fn-primary-muted)]/45'
            : 'border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 text-[var(--fn-text)] hover:border-[color-mix(in_srgb,var(--fn-primary)_30%,var(--fn-border))] hover:bg-[var(--fn-surface)]'
        }`}
      >
        <span className={selectedOption && value ? 'text-[var(--fn-text)]' : 'text-[var(--fn-text-muted)]'}>
          {selectedOption && value ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-[var(--fn-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--fn-primary)]' : ''}`}
        />
      </button>
      {menu}
    </div>
  );
}
