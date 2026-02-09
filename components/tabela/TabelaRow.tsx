'use client';

import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Item, Status, Prioridade } from '@/lib/types';
import { STATUSES, STATUS_LABELS, PRIORIDADES, PRIORIDADE_LABELS } from '@/lib/types';
import type { ColumnDef } from '@/lib/columns';
import { useMementotask } from '@/lib/context';
import { useToast } from '@/lib/toast';
import { TipoBadge } from '@/components/ui/Badge';
import { SelectPill } from '@/components/ui/SelectPill';
import { cn, formatCurrency, formatDate, isOverdue } from '@/lib/utils';
import { Pencil, Trash2, Plus, GripVertical, ChevronRight, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }));
const PRIORITY_OPTIONS = PRIORIDADES.map((p) => ({ value: p, label: PRIORIDADE_LABELS[p] }));

const STATUS_COLORS: Record<Status, string> = {
  a_fazer: 'bg-status-a-fazer/15 text-status-a-fazer',
  em_andamento: 'bg-status-em-andamento/15 text-status-em-andamento',
  pausado: 'bg-status-pausado/15 text-status-pausado',
  concluido: 'bg-status-concluido/15 text-status-concluido',
  cancelado: 'bg-status-cancelado/15 text-status-cancelado',
};

const PRIORITY_COLORS: Record<Prioridade, string> = {
  alta: 'bg-priority-alta/15 text-priority-alta',
  media: 'bg-priority-media/15 text-priority-media',
  baixa: 'bg-priority-baixa/15 text-priority-baixa',
};

export type DropZone = 'above' | 'inside' | 'below';

interface TabelaRowProps {
  item: Item;
  depth: number;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
  dropIndicator?: DropZone | null;
  clienteNome?: string;
  columns: ColumnDef[];
}

export function TabelaRow({
  item,
  depth,
  hasChildren,
  isCollapsed,
  onToggleCollapse,
  dropIndicator,
  clienteNome,
  columns,
}: TabelaRowProps) {
  const { openEditModal, openCreateModal, confirmDelete, editItem } = useMementotask();
  const { addToast } = useToast();

  const childTipo = item.tipo === 'projeto' ? 'tarefa' : item.tipo === 'tarefa' ? 'subtarefa' : null;

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

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  function renderCell(col: ColumnDef): ReactNode {
    const tdClass = cn('px-4 py-3', col.className);

    switch (col.key) {
      case 'cliente':
        return (
          <td key="cliente" className={tdClass}>
            {clienteNome ? (
              <span className="text-xs text-text-secondary">{clienteNome}</span>
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
          </td>
        );

      case 'tipo':
        return (
          <td key="tipo" className={tdClass}>
            <TipoBadge tipo={item.tipo} />
          </td>
        );

      case 'status':
        return (
          <td key="status" className={tdClass} onClick={(e) => e.stopPropagation()}>
            <SelectPill
              value={item.status}
              options={STATUS_OPTIONS}
              colorMap={STATUS_COLORS}
              onChange={(newStatus) => {
                editItem(item.id, { status: newStatus });
                addToast(`"${item.nome}" alterado para ${STATUS_LABELS[newStatus]}`);
              }}
            />
          </td>
        );

      case 'prioridade':
        return (
          <td key="prioridade" className={tdClass} onClick={(e) => e.stopPropagation()}>
            <SelectPill
              value={item.prioridade}
              options={PRIORITY_OPTIONS}
              colorMap={PRIORITY_COLORS}
              onChange={(newPrioridade) => {
                editItem(item.id, { prioridade: newPrioridade });
                addToast(`"${item.nome}" prioridade alterada para ${PRIORIDADE_LABELS[newPrioridade]}`);
              }}
            />
          </td>
        );

      case 'prazo': {
        let daysLabel: { text: string; className: string } | null = null;
        if (item.prazo && item.status !== 'concluido' && item.status !== 'cancelado') {
          const diff = Math.ceil((new Date(item.prazo + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000);
          if (diff < 0) daysLabel = { text: `${Math.abs(diff)}d atrasado`, className: 'text-priority-alta' };
          else if (diff === 0) daysLabel = { text: 'Hoje', className: 'text-status-pausado' };
          else daysLabel = { text: `${diff}d restante${diff > 1 ? 's' : ''}`, className: 'text-text-muted' };
        }
        return (
          <td key="prazo" className={tdClass}>
            {item.prazo ? (
              <div>
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
                {daysLabel && (
                  <div className={cn('text-[10px] mt-0.5', daysLabel.className)}>{daysLabel.text}</div>
                )}
              </div>
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
          </td>
        );
      }

      case 'horas':
        return (
          <td key="horas" className={tdClass}>
            {item.horas != null ? (
              <span className="text-xs text-text-secondary">{item.horas}h</span>
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
          </td>
        );

      case 'valor':
        return (
          <td key="valor" className={tdClass}>
            {item.valor != null ? (
              <span className="text-xs font-medium text-text-primary">
                {formatCurrency(item.valor)}
              </span>
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
          </td>
        );

      case 'valorRecebido':
        return (
          <td key="valorRecebido" className={tdClass}>
            {item.valorRecebido != null ? (
              <span className="text-xs font-medium text-text-primary">
                {formatCurrency(item.valorRecebido)}
              </span>
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
          </td>
        );

      case 'tipoProjeto':
        return (
          <td key="tipoProjeto" className={tdClass}>
            {item.tipoProjeto ? (
              <span className="text-xs text-text-secondary">{item.tipoProjeto}</span>
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
          </td>
        );

      case 'dataInicio':
        return (
          <td key="dataInicio" className={tdClass}>
            {item.dataInicio ? (
              <span className="text-xs text-text-secondary">{formatDate(item.dataInicio)}</span>
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
          </td>
        );

      case 'dataEntrega':
        return (
          <td key="dataEntrega" className={tdClass}>
            {item.dataEntrega ? (
              <span className="text-xs text-text-secondary">{formatDate(item.dataEntrega)}</span>
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
          </td>
        );

      case 'responsavel':
        return (
          <td key="responsavel" className={tdClass}>
            {item.responsavel ? (
              <span className="text-xs text-text-secondary">{item.responsavel}</span>
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
          </td>
        );

      case 'criadoEm':
        return (
          <td key="criadoEm" className={tdClass}>
            <span className="text-xs text-text-secondary">{formatDate(item.criadoEm)}</span>
          </td>
        );

      case 'atualizadoEm':
        return (
          <td key="atualizadoEm" className={tdClass}>
            <span className="text-xs text-text-secondary">{formatDate(item.atualizadoEm)}</span>
          </td>
        );

      default:
        return null;
    }
  }

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
      {/* Nome (always first — grip, chevron, +, checkbox, name) */}
      <td className="px-4 py-3 relative">
        {dropIndicator === 'above' && (
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-accent-projeto rounded-full z-20 pointer-events-none" />
        )}
        {dropIndicator === 'below' && (
          <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-accent-projeto rounded-full z-20 pointer-events-none" />
        )}

        <div className="flex items-center gap-1.5" style={{ paddingLeft: `${depth * 20}px` }}>
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover/row:opacity-100 shrink-0 cursor-grab active:cursor-grabbing rounded p-0.5 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-all"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>

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

      {/* Dynamic columns (excludes 'nome') */}
      {columns.filter((c) => c.key !== 'nome').map((col) => renderCell(col))}

      {/* Actions (always last) */}
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
