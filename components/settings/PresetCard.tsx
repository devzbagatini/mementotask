'use client';

import type { Preset } from '@/lib/settings';

interface PresetCardProps {
  preset: Preset;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function PresetCard({ preset, isActive, onSelect }: PresetCardProps) {
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

      <p className="text-xs text-text-muted italic mb-3 font-heading">
        &ldquo;{preset.motto}&rdquo;
      </p>

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
