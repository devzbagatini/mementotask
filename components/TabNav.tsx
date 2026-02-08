'use client';

import { useMementotask } from '@/lib/context';
import type { ViewType } from '@/lib/types';
import { Columns3, Table, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS: { id: ViewType; label: string; icon: typeof Columns3 }[] = [
  { id: 'kanban', label: 'Kanban', icon: Columns3 },
  { id: 'tabela', label: 'Tabela', icon: Table },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

export function TabNav() {
  const { view, setView } = useMementotask();

  return (
    <nav className="flex gap-1 border-b border-border">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            view === id
              ? 'border-accent-projeto text-accent-projeto'
              : 'border-transparent text-text-muted hover:text-text-secondary',
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}
