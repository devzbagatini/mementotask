'use client';

import { Info } from 'lucide-react';

interface LatinTooltipProps {
  latin: string;
  translation: string;
}

export function LatinTooltip({ latin, translation }: LatinTooltipProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-xs text-text-muted italic font-heading">
        &ldquo;{latin}&rdquo;
      </span>
      <span className="relative group">
        <Info className="h-3 w-3 text-text-muted/60 cursor-help" />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-surface-3 border border-border text-[11px] text-text-primary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
          {translation}
        </span>
      </span>
    </span>
  );
}
