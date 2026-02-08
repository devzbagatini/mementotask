'use client';

import { CheckSquare, Plus } from 'lucide-react';
import { useMementotask } from '@/lib/context';

export function Header() {
  const { openCreateModal } = useMementotask();

  return (
    <header className="border-b border-border bg-surface-1">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-accent-projeto" />
          <h1 className="text-xl font-bold text-text-primary">Mementotask</h1>
        </div>
        <button
          onClick={() => openCreateModal('projeto')}
          className="flex items-center gap-2 rounded-lg bg-accent-projeto px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Novo Projeto
        </button>
      </div>
    </header>
  );
}
