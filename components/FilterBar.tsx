'use client';

import { useState } from 'react';
import { useMementotask } from '@/lib/context';
import { STATUS_LABELS, STATUSES } from '@/lib/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const selectClass =
  'rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-projeto appearance-none cursor-pointer';

export function FilterBar() {
  const { filter, setFilter, uniqueTipoProjeto, uniqueClientes, uniqueTarefas } = useMementotask();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    filter.status !== 'todos' ||
    filter.cliente !== '' ||
    filter.tipoProjeto !== '' ||
    filter.tarefa !== '';

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
        <select
          value={filter.status}
          onChange={(e) => setFilter({ status: e.target.value as typeof filter.status })}
          className={selectClass}
        >
          <option value="todos">Todos os Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          value={filter.cliente}
          onChange={(e) => setFilter({ cliente: e.target.value })}
          className={selectClass}
        >
          <option value="">Todos os Clientes</option>
          {uniqueClientes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filter.tarefa}
          onChange={(e) => setFilter({ tarefa: e.target.value })}
          className={selectClass}
        >
          <option value="">Todas as Tarefas</option>
          {uniqueTarefas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>

        <div className="relative">
          <input
            type="text"
            list="tipo-projeto-list"
            placeholder="Tipo de Projeto"
            value={filter.tipoProjeto}
            onChange={(e) => setFilter({ tipoProjeto: e.target.value })}
            className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-projeto w-44"
          />
          <datalist id="tipo-projeto-list">
            {uniqueTipoProjeto.map((tipo) => (
              <option key={tipo} value={tipo} />
            ))}
          </datalist>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => setFilter({ status: 'todos', cliente: '', tipoProjeto: '', tarefa: '' })}
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
