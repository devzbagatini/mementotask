'use client';

import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Item, KanbanStatus } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/types';
import { DraggableCard } from './DraggableCard';
import { cn } from '@/lib/utils';
import { useMementotask } from '@/lib/context';
import { Plus, FolderPlus, ListPlus, ListChecks } from 'lucide-react';

const COL_BG: Record<KanbanStatus, string> = {
  a_fazer: 'bg-col-a-fazer',
  em_andamento: 'bg-col-em-andamento',
  pausado: 'bg-col-pausado',
  concluido: 'bg-col-concluido',
};

const COL_ACCENT: Record<KanbanStatus, string> = {
  a_fazer: 'bg-status-a-fazer',
  em_andamento: 'bg-status-em-andamento',
  pausado: 'bg-status-pausado',
  concluido: 'bg-status-concluido',
};

interface KanbanColumnProps {
  status: KanbanStatus;
  items: Item[];
}

export function KanbanColumn({ status, items }: KanbanColumnProps) {
  const { openCreateModal } = useMementotask();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { status },
  });

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-xl p-3 transition-colors',
        COL_BG[status],
        isOver && 'ring-2 ring-accent-projeto/50',
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className={cn('h-2.5 w-2.5 rounded-full', COL_ACCENT[status])} />
        <h3 className="text-sm font-semibold text-text-primary">
          {STATUS_LABELS[status]}
        </h3>
        <span className="text-xs font-medium text-text-muted">
          {items.length}
        </span>
        <div className="relative ml-auto" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded p-0.5 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
            title="Novo item"
          >
            <Plus className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-surface-1 py-1 shadow-lg">
              <button
                onClick={() => { openCreateModal('projeto', null, status); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-2 transition-colors"
              >
                <FolderPlus className="h-4 w-4 text-accent-projeto" />
                Novo Projeto
              </button>
              <button
                onClick={() => { openCreateModal('tarefa', null, status); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-2 transition-colors"
              >
                <ListPlus className="h-4 w-4 text-accent-tarefa" />
                Nova Tarefa
              </button>
              <button
                onClick={() => { openCreateModal('subtarefa', null, status); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-2 transition-colors"
              >
                <ListChecks className="h-4 w-4 text-accent-subtarefa" />
                Nova Subtarefa
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <DraggableCard key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <p className="py-4 text-center text-xs text-text-muted">Nihil hic — nenhum item</p>
        )}
      </div>
    </div>
  );
}
