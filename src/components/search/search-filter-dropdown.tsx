'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={ariaLabel ?? placeholder}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] px-4 py-3 text-sm transition hover:border-[var(--fn-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fn-primary-muted)]"
      >
        <span className={selectedOption ? 'text-[var(--fn-text)]' : 'text-[var(--fn-text-muted)]'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-[var(--fn-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Cerrar"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 z-20 mt-2 max-h-60 overflow-auto rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition ${
                  option.value === value
                    ? 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]'
                    : 'text-[var(--fn-text)] hover:bg-[var(--fn-surface-muted)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
