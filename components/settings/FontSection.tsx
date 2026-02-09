'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FONT_OPTIONS, type FontSlot, type FontOption } from '@/lib/settings';
import { useSettings } from '@/lib/settings-context';
import { loadFont } from '@/lib/font-loader';
import { LatinTooltip } from './LatinTooltip';

const SLOTS: { key: FontSlot; label: string }[] = [
  { key: 'body', label: 'Corpo / Dados' },
  { key: 'headings', label: 'Titulos' },
  { key: 'interface', label: 'Interface' },
];

function groupByCategory(options: FontOption[]) {
  const groups: Record<string, FontOption[]> = {};
  for (const opt of options) {
    if (!groups[opt.category]) groups[opt.category] = [];
    groups[opt.category].push(opt);
  }
  return groups;
}

export function FontSection() {
  const { settings, setFont } = useSettings();
  const [openSlots, setOpenSlots] = useState<Set<string>>(new Set());

  const toggleSlot = (key: string) => {
    setOpenSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Pre-load all fonts for previews when a slot is opened
  const allOptions = useMemo(() => {
    const all: FontOption[] = [];
    for (const slot of SLOTS) {
      all.push(...FONT_OPTIONS[slot.key]);
    }
    return all;
  }, []);

  useEffect(() => {
    if (openSlots.size === 0) return;
    for (const opt of allOptions) {
      if (opt.googleFamily) {
        loadFont(opt.googleFamily, opt.weights);
      }
    }
  }, [openSlots.size, allOptions]);

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary mb-1">Tipografia</h3>
        <LatinTooltip latin="Littera scripta manet" translation="A letra escrita permanece" />
      </div>

      <div className="space-y-2">
        {SLOTS.map(({ key, label }) => {
          const isOpen = openSlots.has(key);
          const currentFamily = settings.fonts[key];
          const options = FONT_OPTIONS[key];
          const grouped = groupByCategory(options);

          return (
            <div key={key} className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => toggleSlot(key)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-surface-1 hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
                  )}
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    {label}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted">
                  {currentFamily}
                </span>
              </button>

              {isOpen && (
                <div className="px-3 py-2.5 space-y-3 bg-surface-0">
                  {Object.entries(grouped).map(([category, fonts]) => (
                    <div key={category}>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">{category}</p>
                      <div className="space-y-1.5">
                        {fonts.map((opt) => (
                          <button
                            key={opt.family}
                            onClick={() => setFont(key, opt.family)}
                            className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${
                              currentFamily === opt.family
                                ? 'border-accent-projeto bg-surface-2'
                                : 'border-border hover:border-border-light bg-surface-1'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
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
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
