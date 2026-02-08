'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 flex-1 rounded-full bg-surface-3">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            clamped === 100 ? 'bg-status-concluido' : 'bg-accent-projeto',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-xs font-medium text-text-muted">{clamped}%</span>
    </div>
  );
}
