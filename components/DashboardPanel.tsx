'use client';

import { useState, useEffect } from 'react';
import { BarChart3, ChevronDown, ChevronUp, Briefcase, CheckSquare, DollarSign, AlertTriangle } from 'lucide-react';
import { useDashboardStats } from '@/lib/hooks/useDashboardStats';
import { useMementotask } from '@/lib/context';
import { formatCurrency, cn } from '@/lib/utils';
import { TIPO_LABELS } from '@/lib/types';

const STORAGE_KEY = 'mementotask_dashboard_open';

function StatCard({ icon: Icon, label, value, subValue, color }: {
  icon: typeof Briefcase;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('h-4 w-4', color)} />
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      {subValue && <p className="text-sm text-text-secondary mt-0.5">{subValue}</p>}
    </div>
  );
}

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 rounded-full bg-surface-3 overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-status-concluido transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function DashboardPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const stats = useDashboardStats();
  const { openEditModal } = useMementotask();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'true') setIsOpen(true);
  }, []);

  function toggle() {
    setIsOpen((prev) => {
      localStorage.setItem(STORAGE_KEY, String(!prev));
      return !prev;
    });
  }

  return (
    <div className="mt-4">
      <button
        onClick={toggle}
        className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
      >
        <BarChart3 className="h-4 w-4" />
        Resumo
        {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-2 rounded-xl border border-border bg-surface-1 p-4 space-y-4 font-data text-sm">
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={Briefcase}
              label="Projetos"
              value={stats.totalProjetos}
              subValue={`${stats.projetosAtivos} ativos, ${stats.projetosConcluidos} concluidos`}
              color="text-accent-projeto"
            />
            <StatCard
              icon={CheckSquare}
              label="Tarefas"
              value={stats.totalTarefas}
              subValue={`${stats.tarefasConcluidas} concluidas`}
              color="text-accent-tarefa"
            />
            <StatCard
              icon={DollarSign}
              label="Valor Total"
              value={formatCurrency(stats.valorTotal)}
              color="text-status-concluido"
            />
            <StatCard
              icon={DollarSign}
              label="Valor Recebido"
              value={formatCurrency(stats.valorRecebido)}
              subValue={stats.valorTotal > 0 ? `${Math.round((stats.valorRecebido / stats.valorTotal) * 100)}% do total` : undefined}
              color="text-status-pausado"
            />
          </div>

          {/* Overall progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-text-secondary">Progresso Geral</span>
              <span className="text-xs font-bold text-text-primary">{stats.progressoGeral}%</span>
            </div>
            <ProgressBar value={stats.progressoGeral} />
          </div>

          {/* Overdue items */}
          {stats.itensAtrasados.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-4 w-4 text-priority-alta" />
                <span className="text-xs font-medium text-priority-alta">
                  {stats.itensAtrasados.length} item(ns) atrasado(s)
                </span>
              </div>
              <div className="space-y-1">
                {stats.itensAtrasados.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openEditModal(item)}
                    className="w-full text-left flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-surface-2 transition-colors"
                  >
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full shrink-0',
                      item.tipo === 'projeto' ? 'bg-accent-projeto' : item.tipo === 'tarefa' ? 'bg-accent-tarefa' : 'bg-accent-subtarefa',
                    )} />
                    <span className="text-text-primary truncate flex-1">{item.nome}</span>
                    <span className="text-text-muted shrink-0">{TIPO_LABELS[item.tipo]}</span>
                  </button>
                ))}
                {stats.itensAtrasados.length > 5 && (
                  <p className="text-xs text-text-muted px-2">
                    e mais {stats.itensAtrasados.length - 5}...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progress by client */}
          {stats.clienteProgress.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-text-secondary mb-2">Progresso por Cliente</h3>
              <div className="space-y-2">
                {stats.clienteProgress.map((cp) => (
                  <div key={cp.nome}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-primary">{cp.nome}</span>
                      <span className="text-xs text-text-muted">
                        {cp.totalProjetos} proj. &middot; {cp.progressoMedio}%
                      </span>
                    </div>
                    <ProgressBar value={cp.progressoMedio} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
