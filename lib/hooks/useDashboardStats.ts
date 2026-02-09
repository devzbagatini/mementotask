'use client';

import { useMemo } from 'react';
import { useMementotask } from '@/lib/context';
import type { Item } from '@/lib/types';
import { calculateProgress, isOverdue } from '@/lib/utils';

interface ClientProgress {
  nome: string;
  totalProjetos: number;
  progressoMedio: number;
}

export interface DashboardStats {
  totalProjetos: number;
  projetosAtivos: number;
  projetosConcluidos: number;
  totalTarefas: number;
  tarefasConcluidas: number;
  valorTotal: number;
  valorRecebido: number;
  itensAtrasados: Item[];
  progressoGeral: number;
  clienteProgress: ClientProgress[];
}

export function useDashboardStats(): DashboardStats {
  const { items } = useMementotask();

  return useMemo(() => {
    const projetos = items.filter((i) => i.tipo === 'projeto');
    const tarefas = items.filter((i) => i.tipo === 'tarefa' || i.tipo === 'subtarefa');

    const projetosAtivos = projetos.filter(
      (p) => p.status !== 'concluido' && p.status !== 'cancelado',
    ).length;
    const projetosConcluidos = projetos.filter((p) => p.status === 'concluido').length;
    const tarefasConcluidas = tarefas.filter((t) => t.status === 'concluido').length;

    let valorTotal = 0;
    let valorRecebido = 0;
    for (const p of projetos) {
      valorTotal += p.valor ?? 0;
      valorRecebido += p.valorRecebido ?? 0;
    }

    // Overdue items (has prazo, not completed, prazo is past)
    const itensAtrasados = items.filter(
      (i) => isOverdue(i.prazo) && i.status !== 'concluido' && i.status !== 'cancelado',
    );

    // Overall progress
    const allWithTasks = projetos.filter((p) => {
      return items.some((i) => i.parentId === p.id);
    });
    let progressoTotal = 0;
    for (const p of allWithTasks) {
      const children = items.filter((i) => i.parentId === p.id);
      progressoTotal += calculateProgress(children);
    }
    const progressoGeral = allWithTasks.length > 0
      ? Math.round(progressoTotal / allWithTasks.length)
      : 0;

    // Progress by client
    const clientMap = new Map<string, Item[]>();
    for (const p of projetos) {
      if (p.cliente) {
        const list = clientMap.get(p.cliente) ?? [];
        list.push(p);
        clientMap.set(p.cliente, list);
      }
    }

    const clienteProgress: ClientProgress[] = [];
    for (const [nome, clienteProjetos] of clientMap) {
      let prog = 0;
      for (const p of clienteProjetos) {
        const children = items.filter((i) => i.parentId === p.id);
        prog += calculateProgress(children);
      }
      clienteProgress.push({
        nome,
        totalProjetos: clienteProjetos.length,
        progressoMedio: clienteProjetos.length > 0
          ? Math.round(prog / clienteProjetos.length)
          : 0,
      });
    }
    clienteProgress.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    return {
      totalProjetos: projetos.length,
      projetosAtivos,
      projetosConcluidos,
      totalTarefas: tarefas.length,
      tarefasConcluidas,
      valorTotal,
      valorRecebido,
      itensAtrasados,
      progressoGeral,
      clienteProgress,
    };
  }, [items]);
}
