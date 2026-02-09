'use client';

import type { MonthInfo } from '@/lib/utils';

interface TimelineHeaderProps {
  months: MonthInfo[];
  totalDays: number;
  todayOffset: number | null;
}

export function TimelineHeader({ months, totalDays, todayOffset }: TimelineHeaderProps) {
  return (
    <div className="relative flex h-8 border-b border-border bg-surface-2 text-xs">
      {months.map((m, i) => {
        const leftPct = (m.startDay / totalDays) * 100;
        const widthPct = (m.days / totalDays) * 100;
        return (
          <div
            key={`${m.year}-${m.month}`}
            className="absolute top-0 bottom-0 flex items-center justify-center border-r border-border text-text-secondary font-medium uppercase"
            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
          >
            {widthPct > 4 && m.label}
          </div>
        );
      })}
      {todayOffset !== null && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-priority-alta z-10"
          style={{ left: `${(todayOffset / totalDays) * 100}%` }}
          title="Hoje"
        />
      )}
    </div>
  );
}
