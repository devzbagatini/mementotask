'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectPillOption<T extends string> {
  value: T;
  label: string;
}

interface SelectPillProps<T extends string> {
  value: T;
  options: SelectPillOption<T>[];
  onChange: (value: T) => void;
  colorMap: Record<T, string>;
}

export function SelectPill<T extends string>({
  value,
  options,
  onChange,
  colorMap,
}: SelectPillProps<T>) {
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
          colorMap[value],
        )}
      >
        {selected?.label}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-40 min-w-[140px] rounded-xl border border-border bg-surface-1 py-1 shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors',
                opt.value === value
                  ? 'bg-surface-2 font-medium'
                  : 'hover:bg-surface-2',
              )}
            >
              <span className={cn(
                'h-2 w-2 rounded-full shrink-0',
                colorMap[opt.value].split(' ')[1],
              )} style={{ backgroundColor: 'currentColor' }} />
              <span className={opt.value === value ? 'text-text-primary' : 'text-text-secondary'}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
