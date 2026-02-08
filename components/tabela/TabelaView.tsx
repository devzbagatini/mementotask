'use client';

import { useMemo, useState } from 'react';
import { useMementotask } from '@/lib/context';
import type { Item } from '@/lib/types';
import { TabelaRow } from './TabelaRow';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortKey = 'nome' | 'tipo' | 'status' | 'prioridade' | 'prazo' | 'valor';
type SortDir = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: string; className?: string }[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'tipo', label: 'Tipo', className: 'hidden sm:table-cell' },
  { key: 'status', label: 'Status' },
  { key: 'prioridade', label: 'Prioridade', className: 'hidden md:table-cell' },
  { key: 'prazo', label: 'Prazo', className: 'hidden md:table-cell' },
  { key: 'valor', label: 'Valor', className: 'hidden lg:table-cell' },
];

const ACOES_COLUMN = { label: 'Ações' };

function buildHierarchicalList(
  items: Item[],
): { item: Item; depth: number }[] {
  const result: { item: Item; depth: number }[] = [];
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const childrenMap = new Map<string | null, Item[]>();

  for (const item of items) {
    const list = childrenMap.get(item.parentId) ?? [];
    list.push(item);
    childrenMap.set(item.parentId, list);
  }

  function walk(parentId: string | null, depth: number) {
    const children = childrenMap.get(parentId) ?? [];
    for (const child of children) {
      result.push({ item: child, depth });
      walk(child.id, depth + 1);
    }
  }

  walk(null, 0);

  // Also add orphaned items (filtered items whose parent is not in the set)
  const addedIds = new Set(result.map((r) => r.item.id));
  for (const item of items) {
    if (!addedIds.has(item.id)) {
      // Determine depth based on tipo
      const depth = item.tipo === 'projeto' ? 0 : item.tipo === 'tarefa' ? 1 : 2;
      result.push({ item, depth });
    }
  }

  return result;
}

export function TabelaView() {
  const { filteredItems } = useMementotask();
  const [sortKey, setSortKey] = useState<SortKey>('nome');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'nome':
          cmp = a.nome.localeCompare(b.nome, 'pt-BR');
          break;
        case 'tipo': {
          const order = { projeto: 0, tarefa: 1, subtarefa: 2 };
          cmp = order[a.tipo] - order[b.tipo];
          break;
        }
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'prioridade': {
          const pOrder = { alta: 0, media: 1, baixa: 2 };
          cmp = pOrder[a.prioridade] - pOrder[b.prioridade];
          break;
        }
        case 'prazo':
          cmp = (a.prazo ?? '').localeCompare(b.prazo ?? '');
          break;
        case 'valor':
          cmp = (a.valor ?? 0) - (b.valor ?? 0);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return buildHierarchicalList(sorted);
  }, [filteredItems, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-2">
            {COLUMNS.map(({ key, label, className }) => (
              <th
                key={key}
                className={cn(
                  'px-4 py-3 text-left font-medium text-text-secondary cursor-pointer select-none hover:text-text-primary',
                  className,
                )}
                onClick={() => handleSort(key)}
              >
                <div className="flex items-center gap-1">
                  {label}
                  {sortKey === key &&
                    (sortDir === 'asc' ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-left font-medium text-text-secondary w-20">
              {ACOES_COLUMN.label}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedItems.map(({ item, depth }) => (
            <TabelaRow key={item.id} item={item} depth={depth} />
          ))}
          {sortedItems.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                Nenhum item encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
