'use client';

import { useMementotask } from '@/lib/context';
import { STATUS_LABELS, STATUSES } from '@/lib/types';
import { Search } from 'lucide-react';

export function FilterBar() {
  const { filter, setFilter, uniqueTipoProjeto, uniqueClientes } = useMementotask();

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {/* Status filter */}
      <select
        value={filter.status}
        onChange={(e) => setFilter({ status: e.target.value as typeof filter.status })}
        className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-projeto"
      >
        <option value="todos">Todos os Status</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {/* Cliente filter */}
      <select
        value={filter.cliente}
        onChange={(e) => setFilter({ cliente: e.target.value })}
        className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-projeto"
      >
        <option value="">Todos os Clientes</option>
        {uniqueClientes.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Tipo Projeto filter with datalist */}
      <div className="relative">
        <input
          type="text"
          list="tipo-projeto-list"
          placeholder="Tipo de Projeto"
          value={filter.tipoProjeto}
          onChange={(e) => setFilter({ tipoProjeto: e.target.value })}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-projeto w-44"
        />
        <datalist id="tipo-projeto-list">
          {uniqueTipoProjeto.map((tipo) => (
            <option key={tipo} value={tipo} />
          ))}
        </datalist>
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar por nome, cliente ou descrição..."
          value={filter.busca}
          onChange={(e) => setFilter({ busca: e.target.value })}
          className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-projeto"
        />
      </div>
    </div>
  );
}
