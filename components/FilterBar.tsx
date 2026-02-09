'use client';

import { useState } from 'react';
import { useMementotask } from '@/lib/context';
import { STATUS_LABELS, STATUSES, PRIORIDADE_LABELS, PRIORIDADES } from '@/lib/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterSelect } from './ui/FilterSelect';

export function FilterBar() {
  const { filter, setFilter, uniqueProjetos, uniqueClientes, uniqueTarefas, uniqueResponsaveis } = useMementotask();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    filter.status !== 'todos' ||
    filter.prioridade !== 'todas' ||
    filter.cliente !== '' ||
    filter.projeto !== '' ||
    filter.tarefa !== '' ||
    filter.responsavel !== '';

  const statusOptions = [
    { value: 'todos', label: 'Todos os Status' },
    ...STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
  ];

  const prioridadeOptions = [
    { value: 'todas', label: 'Todas Prioridades' },
    ...PRIORIDADES.map((p) => ({ value: p, label: PRIORIDADE_LABELS[p] })),
  ];

  const clienteOptions = [
    { value: '', label: 'Todos os Clientes' },
    ...uniqueClientes.map((c) => ({ value: c, label: c })),
  ];

  const projetoOptions = [
    { value: '', label: 'Todos os Projetos' },
    ...uniqueProjetos.map((p) => ({ value: p.id, label: p.nome })),
  ];

  const tarefaOptions = [
    { value: '', label: 'Todas as Tarefas' },
    ...uniqueTarefas.map((t) => ({ value: t.id, label: t.nome })),
  ];

  const responsavelOptions = [
    { value: '', label: 'Todos Responsaveis' },
    ...uniqueResponsaveis.map((r) => ({ value: r, label: r })),
  ];

  return (
    <div className="mt-4 space-y-3">
      {/* Search + toggle (always visible) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por nome, cliente ou descricao..."
            value={filter.busca}
            onChange={(e) => setFilter({ busca: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-projeto"
          />
        </div>
        <button
          onClick={() => setFiltersOpen((p) => !p)}
          className={cn(
            'sm:hidden rounded-xl border border-border p-2 transition-colors',
            filtersOpen || hasActiveFilters
              ? 'bg-accent-projeto text-white border-accent-projeto'
              : 'bg-surface-2 text-text-muted hover:text-text-primary',
          )}
          title="Filtros"
        >
          {filtersOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
        </button>
      </div>

      {/* Filter selects (always visible on sm+, togglable on mobile) */}
      <div className={cn(
        'flex flex-wrap items-center gap-3',
        filtersOpen ? 'flex' : 'hidden sm:flex',
      )}>
        <FilterSelect
          value={filter.status}
          options={statusOptions}
          onChange={(v) => setFilter({ status: v as typeof filter.status })}
          placeholder="Todos os Status"
        />

        <FilterSelect
          value={filter.prioridade}
          options={prioridadeOptions}
          onChange={(v) => setFilter({ prioridade: v as typeof filter.prioridade })}
          placeholder="Todas Prioridades"
        />

        <FilterSelect
          value={filter.cliente}
          options={clienteOptions}
          onChange={(v) => setFilter({ cliente: v })}
          placeholder="Todos os Clientes"
        />

        <FilterSelect
          value={filter.projeto}
          options={projetoOptions}
          onChange={(v) => setFilter({ projeto: v })}
          placeholder="Todos os Projetos"
        />

        <FilterSelect
          value={filter.tarefa}
          options={tarefaOptions}
          onChange={(v) => setFilter({ tarefa: v })}
          placeholder="Todas as Tarefas"
        />

        <FilterSelect
          value={filter.responsavel}
          options={responsavelOptions}
          onChange={(v) => setFilter({ responsavel: v })}
          placeholder="Todos Responsaveis"
        />

        {hasActiveFilters && (
          <button
            onClick={() => setFilter({ status: 'todos', prioridade: 'todas', cliente: '', projeto: '', tarefa: '', responsavel: '' })}
            className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
