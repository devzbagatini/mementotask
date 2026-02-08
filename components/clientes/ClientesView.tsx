'use client';

import { useMemo, useState } from 'react';
import { useMementotask } from '@/lib/context';
import type { Item } from '@/lib/types';
import { cn, formatCurrency, calculateProgress } from '@/lib/utils';
import { ArrowLeft, Briefcase, DollarSign, TrendingUp, LayoutGrid, List } from 'lucide-react';
import { TabelaView } from '@/components/tabela/TabelaView';

type ClientesDisplayMode = 'grid' | 'lista';

interface ClienteData {
  nome: string;
  totalProjetos: number;
  valorTotal: number;
  progressoMedio: number;
}

function useClientesData(): ClienteData[] {
  const { items } = useMementotask();

  return useMemo(() => {
    const clienteMap = new Map<string, Item[]>();

    for (const item of items) {
      if (item.tipo === 'projeto' && item.cliente) {
        const list = clienteMap.get(item.cliente) ?? [];
        list.push(item);
        clienteMap.set(item.cliente, list);
      }
    }

    const result: ClienteData[] = [];
    for (const [nome, projetos] of clienteMap) {
      let valorTotal = 0;
      let progressoTotal = 0;

      for (const projeto of projetos) {
        valorTotal += projeto.valor ?? 0;
        const children = items.filter((i) => i.parentId === projeto.id);
        progressoTotal += calculateProgress(children);
      }

      result.push({
        nome,
        totalProjetos: projetos.length,
        valorTotal,
        progressoMedio: projetos.length > 0 ? Math.round(progressoTotal / projetos.length) : 0,
      });
    }

    return result.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [items]);
}

const DISPLAY_MODES: { id: ClientesDisplayMode; icon: typeof LayoutGrid; label: string }[] = [
  { id: 'grid', icon: LayoutGrid, label: 'Grid' },
  { id: 'lista', icon: List, label: 'Lista' },
];

function DisplayModeToggle({ mode, onChange }: { mode: ClientesDisplayMode; onChange: (m: ClientesDisplayMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5">
      {DISPLAY_MODES.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          title={label}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            mode === id
              ? 'bg-surface-1 text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-secondary',
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-status-concluido transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium">{value}%</span>
    </div>
  );
}

function ClienteCard({ data, onClick }: { data: ClienteData; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border bg-surface-1 p-4 hover:bg-surface-2 transition-colors"
    >
      <h3 className="text-base font-semibold text-text-primary mb-3">{data.nome}</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Briefcase className="h-4 w-4 text-text-muted" />
          <span>{data.totalProjetos} projeto{data.totalProjetos !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <DollarSign className="h-4 w-4 text-text-muted" />
          <span>{formatCurrency(data.valorTotal)}</span>
        </div>

        <div className="col-span-2">
          <ProgressBar value={data.progressoMedio} />
        </div>
      </div>
    </button>
  );
}

function ClienteListItem({ data, onClick }: { data: ClienteData; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border bg-surface-1 px-5 py-4 hover:bg-surface-2 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-text-primary truncate">{data.nome}</h3>
        <span className="text-sm font-medium text-text-primary shrink-0 ml-4">{formatCurrency(data.valorTotal)}</span>
      </div>
      <div className="flex items-center gap-5 text-sm text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-text-muted" />
          <span>{data.totalProjetos} projeto{data.totalProjetos !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex-1 max-w-[200px]">
          <ProgressBar value={data.progressoMedio} />
        </div>
      </div>
    </button>
  );
}

function ClienteDetalhe({ clienteNome, onBack }: { clienteNome: string; onBack: () => void }) {
  const { items } = useMementotask();

  const projetos = useMemo(
    () => items.filter((i) => i.tipo === 'projeto' && i.cliente === clienteNome),
    [items, clienteNome],
  );

  const valorTotal = useMemo(
    () => projetos.reduce((sum, p) => sum + (p.valor ?? 0), 0),
    [projetos],
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-text-primary">{clienteNome}</h2>
          <p className="text-sm text-text-secondary">
            {projetos.length} projeto{projetos.length !== 1 ? 's' : ''} &middot; {formatCurrency(valorTotal)}
          </p>
        </div>
      </div>

      <TabelaView clienteFilter={clienteNome} />
    </div>
  );
}

export function ClientesView() {
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<ClientesDisplayMode>('grid');
  const clientesData = useClientesData();

  if (selectedCliente) {
    return (
      <ClienteDetalhe
        clienteNome={selectedCliente}
        onBack={() => setSelectedCliente(null)}
      />
    );
  }

  if (clientesData.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface-1 p-8 text-center text-text-muted">
        Nenhum cliente encontrado. Adicione clientes aos seus projetos.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <DisplayModeToggle mode={displayMode} onChange={setDisplayMode} />
      </div>

      {displayMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientesData.map((data) => (
            <ClienteCard
              key={data.nome}
              data={data}
              onClick={() => setSelectedCliente(data.nome)}
            />
          ))}
        </div>
      )}

      {displayMode === 'lista' && (
        <div className="flex flex-col gap-2">
          {clientesData.map((data) => (
            <ClienteListItem
              key={data.nome}
              data={data}
              onClick={() => setSelectedCliente(data.nome)}
            />
          ))}
        </div>
      )}

    </div>
  );
}
