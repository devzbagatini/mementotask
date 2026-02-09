'use client';

import { useState, useRef, useEffect } from 'react';
import type { Item } from '@/lib/types';
import { useMementotask } from '@/lib/context';
import { cn, formatCurrency, formatDate, isOverdue } from '@/lib/utils';
import { PriorityDot } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Calendar, User, FolderOpen, ListTodo, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';

const CARD_BORDER: Record<Item['tipo'], string> = {
  projeto: 'border-l-accent-projeto',
  tarefa: 'border-l-accent-tarefa',
  subtarefa: 'border-l-accent-subtarefa',
};

interface KanbanCardProps {
  item: Item;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: React.HTMLAttributes<HTMLElement>;
  isDragging?: boolean;
}

export function KanbanCard({ item, dragListeners, dragAttributes, isDragging }: KanbanCardProps) {
  const { getChildrenOf, getProjectProgress, getParent, openEditModal, openCreateModal, confirmDelete } = useMementotask();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const parent = item.parentId ? getParent(item.parentId) : undefined;

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const childTipo = item.tipo === 'projeto' ? 'tarefa' : item.tipo === 'tarefa' ? 'subtarefa' : null;

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface-1 p-3 border-l-[3px] transition-colors hover:bg-surface-2',
        CARD_BORDER[item.tipo],
        isDragging && 'opacity-50',
      )}
      {...dragAttributes}
      {...dragListeners}
    >
      {/* Header: name + priority + menu */}
      <div className="flex items-start justify-between gap-2">
        <h4
          className="text-sm font-medium text-text-primary leading-snug cursor-pointer hover:underline flex-1"
          onClick={() => openEditModal(item)}
        >
          {item.nome}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          <PriorityDot prioridade={item.prioridade} />
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="rounded p-0.5 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 z-20 w-44 rounded-xl border border-border bg-surface-1 py-1 shadow-lg">
                <button
                  onClick={() => { openEditModal(item); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                {childTipo && (
                  <button
                    onClick={() => { openCreateModal(childTipo, item.id); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {item.tipo === 'projeto' ? 'Nova Tarefa' : 'Nova Subtarefa'}
                  </button>
                )}
                <button
                  onClick={() => { confirmDelete(item.id, item.nome); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-priority-alta hover:bg-surface-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tipo-specific content */}
      <div className="mt-2 flex flex-col gap-1.5">
        {/* Projeto: cliente, valor, progresso */}
        {item.tipo === 'projeto' && (
          <>
            {item.cliente && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <User className="h-3 w-3" />
                {item.cliente}
              </div>
            )}
            {item.valor != null && (
              <div className="text-xs font-medium text-text-primary">
                {formatCurrency(item.valor)}
              </div>
            )}
            <ProgressBar value={getProjectProgress(item.id)} className="mt-1" />
            {item.tipoProjeto && (
              <span className="text-xs text-text-muted">{item.tipoProjeto}</span>
            )}
          </>
        )}

        {/* Tarefa: parent project */}
        {item.tipo === 'tarefa' && parent && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <FolderOpen className="h-3 w-3" />
            {parent.nome}
          </div>
        )}

        {/* Subtarefa: parent task */}
        {item.tipo === 'subtarefa' && parent && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <ListTodo className="h-3 w-3" />
            {parent.nome}
          </div>
        )}

        {/* Prazo (all types) */}
        {item.prazo && (
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs',
              isOverdue(item.prazo) && item.status !== 'concluido'
                ? 'text-priority-alta font-medium'
                : 'text-text-muted',
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(item.prazo)}
          </div>
        )}

        {/* Children count for projects and tasks */}
        {(item.tipo === 'projeto' || item.tipo === 'tarefa') && (
          <div className="text-xs text-text-muted">
            {getChildrenOf(item.id).length}{' '}
            {item.tipo === 'projeto' ? 'tarefas' : 'subtarefas'}
          </div>
        )}
      </div>
    </div>
  );
}
