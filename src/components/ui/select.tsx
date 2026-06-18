'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  compact?: boolean;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  compact = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={compact ? 'mb-0' : 'mb-4'}>
      <label className={`block ${compact ? 'mb-1.5' : 'mb-2'} text-sm font-medium text-[var(--fn-text-secondary)]`}>
        {label}
      </label>
      <div className="relative" ref={ref}>
        <button
          type="button"
          className={`flex w-full items-center justify-between rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 text-left text-[var(--fn-text)] transition hover:border-[var(--fn-primary)] ${
            compact ? 'h-12 py-0' : 'py-3'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">{selectedOption?.label || placeholder}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--fn-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-[200] mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full px-4 py-3 text-left text-sm transition ${
                  option.value === value ? 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary-text)]' : 'text-[var(--fn-text)] hover:bg-[var(--fn-surface-muted)]'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
