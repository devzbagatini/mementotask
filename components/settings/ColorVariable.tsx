'use client';

import { RotateCcw } from 'lucide-react';
import type { ThemeColors } from '@/lib/settings';

interface ColorVariableProps {
  label: string;
  cssVar: keyof ThemeColors;
  currentColor: string;
  hasOverride: boolean;
  onChange: (cssVar: keyof ThemeColors, value: string) => void;
  onReset: (cssVar: keyof ThemeColors) => void;
}

export function ColorVariable({
  label,
  cssVar,
  currentColor,
  hasOverride,
  onChange,
  onReset,
}: ColorVariableProps) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className={`text-sm ${hasOverride ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={currentColor}
          onChange={(e) => onChange(cssVar, e.target.value)}
          className="h-7 w-7 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
        />
        {hasOverride && (
          <button
            onClick={() => onReset(cssVar)}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
            title="Resetar para o preset"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
      </div>
    </label>
  );
}
