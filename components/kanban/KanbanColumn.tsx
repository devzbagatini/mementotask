'use client';

import { useDroppable } from '@dnd-kit/core';
import type { Item, KanbanStatus } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/types';
import { DraggableCard } from './DraggableCard';
import { cn } from '@/lib/utils';
import { useMementotask } from '@/lib/context';
import { Plus } from 'lucide-react';

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
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { status },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg p-3 transition-colors',
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
        <button
          onClick={() => openCreateModal('projeto')}
          className="ml-auto rounded p-0.5 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
          title="Novo item"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <DraggableCard key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <p className="py-4 text-center text-xs text-text-muted">Nenhum item</p>
        )}
      </div>
    </div>
  );
}
