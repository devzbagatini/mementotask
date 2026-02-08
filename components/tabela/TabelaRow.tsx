'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Item, Status } from '@/lib/types';
import { STATUSES, STATUS_LABELS } from '@/lib/types';
import { useMementotask } from '@/lib/context';
import { PriorityDot, TipoBadge } from '@/components/ui/Badge';
import { cn, formatCurrency, formatDate, isOverdue } from '@/lib/utils';
import { Pencil, Trash2, Plus, GripVertical, ChevronRight, ChevronDown } from 'lucide-react';

const STATUS_COLORS: Record<Status, string> = {
  a_fazer: 'bg-status-a-fazer/15 text-status-a-fazer',
  em_andamento: 'bg-status-em-andamento/15 text-status-em-andamento',
  pausado: 'bg-status-pausado/15 text-status-pausado',
  concluido: 'bg-status-concluido/15 text-status-concluido',
  cancelado: 'bg-status-cancelado/15 text-status-cancelado',
};

export type DropZone = 'above' | 'inside' | 'below';

interface TabelaRowProps {
  item: Item;
  depth: number;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
  dropIndicator?: DropZone | null;
}

export function TabelaRow({ item, depth, hasChildren, isCollapsed, onToggleCollapse, dropIndicator }: TabelaRowProps) {
  const { openEditModal, openCreateModal, confirmDelete, editItem } = useMementotask();

  const childTipo = item.tipo === 'projeto' ? 'tarefa' : item.tipo === 'tarefa' ? 'subtarefa' : null;

  // useSortable combines draggable + droppable with proper ref management
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { item },
  });

  // Apply CSS transforms so SortableContext can properly track positions
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/row bg-surface-1 transition-colors hover:bg-surface-2 cursor-pointer',
        isDragging && 'opacity-30 z-10',
        dropIndicator === 'inside' && 'ring-2 ring-inset ring-accent-projeto/50',
      )}
      onClick={() => openEditModal(item)}
    >
      {/* Nome (with grip, hover +, checkbox, indentation) */}
      <td className="px-4 py-3 relative">
        {/* Visual drop indicators */}
        {dropIndicator === 'above' && (
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-accent-projeto rounded-full z-20 pointer-events-none" />
        )}
        {dropIndicator === 'below' && (
          <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-accent-projeto rounded-full z-20 pointer-events-none" />
        )}

        <div className="flex items-center gap-1.5" style={{ paddingLeft: `${depth * 20}px` }}>
          {/* Grip handle — aparece no hover, activator for drag */}
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover/row:opacity-100 shrink-0 cursor-grab active:cursor-grabbing rounded p-0.5 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-all"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>

          {/* Chevron collapse/expand */}
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCollapse(item.id); }}
              className="shrink-0 rounded p-0.5 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-all"
              title={isCollapsed ? 'Expandir' : 'Recolher'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <span className="shrink-0 w-[22px]" />
          )}

          {/* Botão + estilo Notion — aparece no hover */}
          {childTipo ? (
            <button
              onClick={(e) => { e.stopPropagation(); openCreateModal(childTipo, item.id); }}
              className="opacity-0 group-hover/row:opacity-100 shrink-0 rounded p-0.5 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-all"
              title={item.tipo === 'projeto' ? 'Nova Tarefa' : 'Nova Subtarefa'}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="shrink-0 w-[22px] opacity-0 group-hover/row:opacity-0" />
          )}

          {/* Checkbox para tarefas/subtarefas, bolinha para projetos */}
          {(item.tipo === 'tarefa' || item.tipo === 'subtarefa') ? (
            <input
              type="checkbox"
              checked={item.status === 'concluido'}
              onChange={(e) => {
                e.stopPropagation();
                editItem(item.id, { status: item.status === 'concluido' ? 'a_fazer' : 'concluido' });
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 shrink-0 rounded border-border accent-status-concluido cursor-pointer"
            />
          ) : (
            <div className="h-2 w-2 rounded-full shrink-0 bg-accent-projeto" />
          )}

          <span className={cn(
            'font-medium',
            item.status === 'concluido' ? 'text-text-muted line-through' : 'text-text-primary',
          )}>
            {item.nome}
          </span>
        </div>
      </td>

      {/* Tipo */}
      <td className="hidden sm:table-cell px-4 py-3">
        <TipoBadge tipo={item.tipo} />
      </td>

      {/* Status (dropdown inline) */}
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <select
          value={item.status}
          onChange={(e) => editItem(item.id, { status: e.target.value as Status })}
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium border-none outline-none cursor-pointer appearance-none pr-5 bg-no-repeat bg-[length:12px] bg-[right_4px_center]',
            STATUS_COLORS[item.status],
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </td>

      {/* Prioridade */}
      <td className="hidden md:table-cell px-4 py-3">
        <PriorityDot prioridade={item.prioridade} />
      </td>

      {/* Prazo */}
      <td className="hidden md:table-cell px-4 py-3">
        {item.prazo ? (
          <span
            className={cn(
              'text-xs',
              isOverdue(item.prazo) && item.status !== 'concluido'
                ? 'text-priority-alta font-medium'
                : 'text-text-secondary',
            )}
          >
            {formatDate(item.prazo)}
          </span>
        ) : (
          <span className="text-xs text-text-muted">—</span>
        )}
      </td>

      {/* Valor */}
      <td className="hidden lg:table-cell px-4 py-3">
        {item.valor != null ? (
          <span className="text-xs font-medium text-text-primary">
            {formatCurrency(item.valor)}
          </span>
        ) : (
          <span className="text-xs text-text-muted">—</span>
        )}
      </td>

      {/* Ações */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openEditModal(item)}
            className="rounded p-1 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-colors"
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => confirmDelete(item.id, item.nome)}
            className="rounded p-1 text-text-muted hover:bg-surface-3 hover:text-priority-alta transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
