'use client';

import type { Item } from '@/lib/types';
import { useMementotask } from '@/lib/context';
import { StatusBadge, PriorityDot, TipoBadge } from '@/components/ui/Badge';
import { cn, formatCurrency, formatDate, isOverdue } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

interface TabelaRowProps {
  item: Item;
  depth: number;
}

export function TabelaRow({ item, depth }: TabelaRowProps) {
  const { openEditModal, confirmDelete } = useMementotask();

  return (
    <tr
      className="bg-surface-1 transition-colors hover:bg-surface-2 cursor-pointer"
      onClick={() => openEditModal(item)}
    >
      {/* Nome (with indentation) */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
          <div
            className={cn(
              'h-2 w-2 rounded-full shrink-0',
              item.tipo === 'projeto' && 'bg-accent-projeto',
              item.tipo === 'tarefa' && 'bg-accent-tarefa',
              item.tipo === 'subtarefa' && 'bg-accent-subtarefa',
            )}
          />
          <span className="font-medium text-text-primary">{item.nome}</span>
        </div>
      </td>

      {/* Tipo */}
      <td className="hidden sm:table-cell px-4 py-3">
        <TipoBadge tipo={item.tipo} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={item.status} />
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
