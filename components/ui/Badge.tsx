'use client';

import type { Status, Prioridade, Tipo } from '@/lib/types';
import { STATUS_LABELS, TIPO_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<Status, string> = {
  a_fazer: 'bg-status-a-fazer/15 text-status-a-fazer',
  em_andamento: 'bg-status-em-andamento/15 text-status-em-andamento',
  pausado: 'bg-status-pausado/15 text-status-pausado',
  concluido: 'bg-status-concluido/15 text-status-concluido',
  cancelado: 'bg-status-cancelado/15 text-status-cancelado',
};

const PRIORITY_COLORS: Record<Prioridade, string> = {
  alta: 'bg-priority-alta',
  media: 'bg-priority-media',
  baixa: 'bg-priority-baixa',
};

const TIPO_COLORS: Record<Tipo, string> = {
  projeto: 'bg-accent-projeto/15 text-accent-projeto',
  tarefa: 'bg-accent-tarefa/15 text-accent-tarefa',
  subtarefa: 'bg-accent-subtarefa/15 text-accent-subtarefa',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_COLORS[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityDot({ prioridade }: { prioridade: Prioridade }) {
  return (
    <span
      className={cn('inline-block h-2.5 w-2.5 rounded-full', PRIORITY_COLORS[prioridade])}
      title={prioridade === 'alta' ? 'Alta' : prioridade === 'media' ? 'Média' : 'Baixa'}
    />
  );
}

export function TipoBadge({ tipo }: { tipo: Tipo }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        TIPO_COLORS[tipo],
      )}
    >
      {TIPO_LABELS[tipo]}
    </span>
  );
}
