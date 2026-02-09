'use client';

import { useEffect, useMemo } from 'react';
import type { FontSlot, FontOption } from '@/lib/settings';
import { loadFont } from '@/lib/font-loader';

interface FontPickerProps {
  slot: FontSlot;
  slotLabel: string;
  options: FontOption[];
  currentFamily: string;
  onSelect: (slot: FontSlot, family: string) => void;
}

export function FontPicker({ slot, slotLabel, options, currentFamily, onSelect }: FontPickerProps) {
  // Pre-load fonts for previews
  useEffect(() => {
    for (const opt of options) {
      if (opt.googleFamily) {
        loadFont(opt.googleFamily, opt.weights);
      }
    }
  }, [options]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, FontOption[]> = {};
    for (const opt of options) {
      if (!groups[opt.category]) groups[opt.category] = [];
      groups[opt.category].push(opt);
    }
    return groups;
  }, [options]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-secondary">{slotLabel}</label>
      <div className="space-y-3">
        {Object.entries(grouped).map(([category, fonts]) => (
          <div key={category}>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">{category}</p>
            <div className="space-y-1.5">
              {fonts.map((opt) => (
                <button
                  key={opt.family}
                  onClick={() => onSelect(slot, opt.family)}
                  className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                    currentFamily === opt.family
                      ? 'border-accent-projeto bg-surface-2'
                      : 'border-border hover:border-border-light bg-surface-1'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-text-primary">{opt.label}</span>
                    {currentFamily === opt.family && (
                      <span className="text-[10px] text-accent-projeto">ativo</span>
                    )}
                  </div>
                  <p
                    className="text-sm text-text-secondary truncate"
                    style={{ fontFamily: `'${opt.family}', ${opt.fallback}` }}
                  >
                    Nosce te ipsum — AaBbCc 0123456789
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
