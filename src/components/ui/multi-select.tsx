'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function MultiSelect({ label, value, onChange, options, placeholder = 'Seleccionar' }: MultiSelectProps) {
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

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const selectedLabels = options.filter(opt => value.includes(opt.value)).map(opt => opt.label);

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-medium text-[var(--fn-text)]">
        {label}
      </label>
      <div className="relative" ref={ref}>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 text-left text-[var(--fn-text)] transition hover:border-[var(--fn-primary)]"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="flex flex-wrap gap-2">
            {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 text-[var(--fn-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between ${
                  value.includes(option.value) ? 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary-text)]' : 'text-[var(--fn-text)] hover:bg-[var(--fn-surface-muted)]'
                }`}
                onClick={() => toggleOption(option.value)}
              >
                {option.label}
                {value.includes(option.value) && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
