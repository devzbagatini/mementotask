'use client';

import type { Item } from '@/lib/types';
import { TIPO_LABELS } from '@/lib/types';
import { cn, formatDate, isOverdue, calculateProgress } from '@/lib/utils';
import { useState } from 'react';

const TYPE_COLORS: Record<string, string> = {
  projeto: 'bg-accent-projeto',
  tarefa: 'bg-accent-tarefa',
  subtarefa: 'bg-accent-subtarefa',
};

interface TimelineBarProps {
  item: Item;
  leftPct: number;
  widthPct: number;
  progress?: number;
  onClick: () => void;
}

export function TimelineBar({ item, leftPct, widthPct, progress, onClick }: TimelineBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const overdue = isOverdue(item.prazo) && item.status !== 'concluido';

  return (
    <div className="relative h-7 flex items-center" style={{ minWidth: 0 }}>
      <div
        className={cn(
          'absolute h-5 rounded-sm cursor-pointer transition-opacity hover:opacity-90',
          overdue ? 'bg-priority-alta/80' : TYPE_COLORS[item.tipo],
        )}
        style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 0.5)}%` }}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Progress bar inside */}
        {progress !== undefined && progress > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-sm bg-white/20"
            style={{ width: `${progress}%` }}
          />
        )}
        {/* Label inside bar */}
        {widthPct > 8 && (
          <span className="absolute inset-0 flex items-center px-1.5 text-[10px] text-white font-medium truncate">
            {item.nome}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-30 bottom-full mb-1 rounded-xl border border-border bg-surface-1 px-3 py-2 shadow-lg text-xs whitespace-nowrap"
          style={{ left: `${leftPct}%` }}
        >
          <p className="font-semibold text-text-primary">{item.nome}</p>
          <p className="text-text-secondary">{TIPO_LABELS[item.tipo]}</p>
          {item.dataInicio && <p className="text-text-muted">Inicio: {formatDate(item.dataInicio)}</p>}
          {item.prazo && (
            <p className={overdue ? 'text-priority-alta font-medium' : 'text-text-muted'}>
              Prazo: {formatDate(item.prazo)}{overdue ? ' (atrasado)' : ''}
            </p>
          )}
          {item.dataEntrega && <p className="text-text-muted">Entrega: {formatDate(item.dataEntrega)}</p>}
          {progress !== undefined && <p className="text-text-muted">Progresso: {progress}%</p>}
        </div>
      )}
    </div>
  );
}
