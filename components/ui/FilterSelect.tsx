'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  placeholder: string;
}

export function FilterSelect({ value, options, onChange, placeholder }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none transition-colors cursor-pointer',
          value ? 'text-text-primary' : 'text-text-muted',
          open && 'border-accent-projeto',
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-[180px] max-h-64 overflow-y-auto rounded-xl border border-border bg-surface-1 py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                opt.value === value
                  ? 'bg-surface-2 text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
              )}
            >
              <span className="flex-1 text-left truncate">{opt.label}</span>
              {opt.value === value && <Check className="h-3.5 w-3.5 shrink-0 text-accent-projeto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
