'use client';

import { Info } from 'lucide-react';
import type { Preset } from '@/lib/settings';

const MOTTO_TRANSLATIONS: Record<string, string> = {
  'Respice post te, hominem te esse memento': 'Olhe para tras, lembre-se de que voce e humano',
  'Sustine et abstine': 'Suporte e abstenha-se',
  'Lux in tenebris lucet': 'A luz brilha nas trevas',
  'Per aspera ad astra': 'Atraves das dificuldades, ate as estrelas',
  'Ars longa, vita brevis': 'A arte e longa, a vida e breve',
};

interface PresetCardProps {
  preset: Preset;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function PresetCard({ preset, isActive, onSelect }: PresetCardProps) {
  const translation = MOTTO_TRANSLATIONS[preset.motto];

  return (
    <button
      onClick={() => onSelect(preset.id)}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all hover:scale-[1.02] ${
        isActive
          ? 'border-accent-projeto bg-surface-2 shadow-lg'
          : 'border-border hover:border-border-light bg-surface-1'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-text-primary">{preset.name}</h4>
        {isActive && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-accent-projeto/20 text-accent-projeto">
            ativo
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 mb-3">
        <p className="text-xs text-text-muted italic font-heading">
          &ldquo;{preset.motto}&rdquo;
        </p>
        {translation && (
          <span className="relative group flex-shrink-0">
            <Info className="h-3 w-3 text-text-muted/60 cursor-help" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-surface-3 border border-border text-[11px] text-text-primary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
              {translation}
            </span>
          </span>
        )}
      </div>

      {/* Dual color strips — dark & light */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-text-muted w-6">dark</span>
          <div className="flex gap-0.5 h-4 rounded overflow-hidden flex-1">
            {preset.stripDark.map((color, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-text-muted w-6">light</span>
          <div className="flex gap-0.5 h-4 rounded overflow-hidden flex-1">
            {preset.stripLight.map((color, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
