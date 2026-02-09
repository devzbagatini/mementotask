'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { THEME_SECTIONS, getEffectiveColors, type ThemeColors } from '@/lib/settings';
import { useSettings } from '@/lib/settings-context';
import { ColorVariable } from './ColorVariable';
import { LatinTooltip } from './LatinTooltip';

export function ColorSection() {
  const { settings, resolvedMode, setColorOverride, removeColorOverride } = useSettings();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const effectiveColors = getEffectiveColors(settings.activePreset, resolvedMode, settings.colorOverrides);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary mb-1">Cores</h3>
        <LatinTooltip latin="De gustibus non est disputandum" translation="Sobre gostos nao se discute" />
        <p className="text-xs text-text-muted mt-1">
          Editando modo <span className="font-medium text-text-secondary">{resolvedMode}</span> do preset ativo. Overrides aplicam em ambos os modos.
        </p>
      </div>

      <div className="space-y-2">
        {THEME_SECTIONS.map((section) => {
          const isOpen = openSections.has(section.title);
          const overrideCount = section.vars.filter(
            (v) => settings.colorOverrides[v.cssVar] !== undefined
          ).length;

          return (
            <div key={section.title} className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-surface-1 hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
                  )}
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    {section.title}
                  </span>
                </div>
                {overrideCount > 0 && (
                  <span className="text-[10px] bg-accent-projeto/20 text-accent-projeto px-1.5 py-0.5 rounded-full">
                    {overrideCount} editado{overrideCount > 1 ? 's' : ''}
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="px-3 py-2.5 space-y-2 bg-surface-0">
                  {section.vars.map((v) => (
                    <ColorVariable
                      key={v.cssVar}
                      label={v.label}
                      cssVar={v.cssVar}
                      currentColor={effectiveColors[v.cssVar]}
                      hasOverride={settings.colorOverrides[v.cssVar] !== undefined}
                      onChange={setColorOverride}
                      onReset={removeColorOverride}
                    />
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
