'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  MeasuringStrategy,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragMoveEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMementotask } from '@/lib/context';
import type { Item, Tipo } from '@/lib/types';
import {
  type ColumnKey,
  DEFAULT_VISIBLE_COLUMNS,
  loadColumnConfig,
  saveColumnConfig,
  getVisibleColumnDefs,
} from '@/lib/columns';
import { TabelaRow, type DropZone } from './TabelaRow';
import { ColumnSettings } from './ColumnSettings';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortDir = 'asc' | 'desc';

const ACOES_COLUMN = { label: 'Ações' };
const COLLAPSED_KEY = 'mementotask_collapsed';

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

function loadCollapsed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCollapsed(collapsed: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...collapsed]));
}

function buildHierarchicalList(
  items: Item[],
  collapsed: Set<string>,
): { item: Item; depth: number; hasChildren: boolean }[] {
  const result: { item: Item; depth: number; hasChildren: boolean }[] = [];
  const childrenMap = new Map<string | null, Item[]>();

  for (const item of items) {
    const list = childrenMap.get(item.parentId) ?? [];
    list.push(item);
    childrenMap.set(item.parentId, list);
  }

  for (const [, children] of childrenMap) {
    children.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  }

  function walk(parentId: string | null, depth: number) {
    const children = childrenMap.get(parentId) ?? [];
    for (const child of children) {
      const hasChildren = (childrenMap.get(child.id)?.length ?? 0) > 0;
      result.push({ item: child, depth, hasChildren });
      if (!collapsed.has(child.id)) {
        walk(child.id, depth + 1);
      }
    }
  }

  walk(null, 0);

  const addedIds = new Set(result.map((r) => r.item.id));
  const allItemIds = new Set(items.map((i) => i.id));
  for (const item of items) {
    if (!addedIds.has(item.id)) {
      if (item.parentId !== null && allItemIds.has(item.parentId)) continue;
      const depth = item.tipo === 'projeto' ? 0 : item.tipo === 'tarefa' ? 1 : 2;
      const hasChildren = (childrenMap.get(item.id)?.length ?? 0) > 0;
      result.push({ item, depth, hasChildren });
    }
  }

  return result;
}

function tipoForParent(parentItem: Item | undefined): Tipo {
  if (!parentItem) return 'projeto';
  if (parentItem.tipo === 'projeto') return 'tarefa';
  return 'subtarefa';
}

function computeZone(pointerY: number, rect: { top: number; height: number }, targetItem: Item): DropZone {
  const relative = (pointerY - rect.top) / rect.height;
  if (targetItem.tipo === 'subtarefa') {
    return relative < 0.5 ? 'above' : 'below';
  }
  if (relative < 0.4) return 'above';
  if (relative > 0.6) return 'below';
  return 'inside';
}

function canDrop(draggedItem: Item, targetItem: Item, zone: DropZone, allItems: Item[]): boolean {
  if (draggedItem.id === targetItem.id) return false;

  let parent: Item | undefined = targetItem;
  while (parent) {
    if (parent.id === draggedItem.id) return false;
    parent = parent.parentId ? allItems.find((i) => i.id === parent!.parentId) : undefined;
  }

  if (zone === 'inside') {
    if (draggedItem.tipo === 'projeto') return false;
    if (targetItem.tipo === 'subtarefa') return false;
    return true;
  }

  return true;
}

function findRootProject(item: Item, allItems: Item[]): Item | undefined {
  let current: Item | undefined = item;
  while (current && current.parentId) {
    current = allItems.find((i) => i.id === current!.parentId);
  }
  return current;
}

function getItemCliente(item: Item, allItems: Item[]): string {
  if (item.cliente) return item.cliente;
  const root = findRootProject(item, allItems);
  return root?.cliente ?? '';
}

function compareItems(a: Item, b: Item, key: ColumnKey, allItems: Item[]): number {
  switch (key) {
    case 'nome':
      return a.nome.localeCompare(b.nome, 'pt-BR');
    case 'tipo': {
      const order = { projeto: 0, tarefa: 1, subtarefa: 2 };
      return order[a.tipo] - order[b.tipo];
    }
    case 'status':
      return a.status.localeCompare(b.status);
    case 'prioridade': {
      const pOrder = { alta: 0, media: 1, baixa: 2 };
      return pOrder[a.prioridade] - pOrder[b.prioridade];
    }
    case 'prazo':
      return (a.prazo ?? '').localeCompare(b.prazo ?? '');
    case 'valor':
      return (a.valor ?? 0) - (b.valor ?? 0);
    case 'cliente':
      return getItemCliente(a, allItems).localeCompare(getItemCliente(b, allItems), 'pt-BR');
    case 'valorRecebido':
      return (a.valorRecebido ?? 0) - (b.valorRecebido ?? 0);
    case 'tipoProjeto':
      return (a.tipoProjeto ?? '').localeCompare(b.tipoProjeto ?? '', 'pt-BR');
    case 'dataInicio':
      return (a.dataInicio ?? '').localeCompare(b.dataInicio ?? '');
    case 'dataEntrega':
      return (a.dataEntrega ?? '').localeCompare(b.dataEntrega ?? '');
    case 'responsavel':
      return (a.responsavel ?? '').localeCompare(b.responsavel ?? '', 'pt-BR');
    case 'criadoEm':
      return a.criadoEm.localeCompare(b.criadoEm);
    case 'atualizadoEm':
      return a.atualizadoEm.localeCompare(b.atualizadoEm);
    default:
      return 0;
  }
}

interface TabelaViewProps {
  clienteFilter?: string;
}

export function TabelaView({ clienteFilter }: TabelaViewProps = {}) {
  const { filteredItems, items, moveItem } = useMementotask();

  // Column config
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);

  useEffect(() => {
    setVisibleColumnKeys(loadColumnConfig());
  }, []);

  const handleColumnsChange = useCallback((cols: ColumnKey[]) => {
    setVisibleColumnKeys(cols);
    saveColumnConfig(cols);
  }, []);

  const forcedHiddenKeys: ColumnKey[] = clienteFilter ? ['cliente'] : [];

  const columns = useMemo(
    () => getVisibleColumnDefs(visibleColumnKeys, forcedHiddenKeys),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleColumnKeys, clienteFilter],
  );

  const colSpan = columns.length + 1; // +1 for Actions

  // Filter items for clienteFilter
  const displayItems = useMemo(() => {
    if (!clienteFilter) return filteredItems;
    const clientProjectIds = new Set(
      items
        .filter((i) => i.tipo === 'projeto' && i.cliente === clienteFilter)
        .map((i) => i.id),
    );
    const includedIds = new Set(clientProjectIds);
    let changed = true;
    while (changed) {
      changed = false;
      for (const item of items) {
        if (!includedIds.has(item.id) && item.parentId && includedIds.has(item.parentId)) {
          includedIds.add(item.id);
          changed = true;
        }
      }
    }
    return filteredItems.filter((i) => includedIds.has(i.id));
  }, [filteredItems, items, clienteFilter]);

  // Sort & hierarchy
  const [sortKey, setSortKey] = useState<ColumnKey>('nome');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const pointerYRef = useRef(0);
  const [dropTarget, setDropTarget] = useState<{ itemId: string; zone: DropZone } | null>(null);
  const dropTargetRef = useRef<{ itemId: string; zone: DropZone } | null>(null);

  useEffect(() => {
    if (!activeItem) return;
    const handler = (e: PointerEvent) => {
      pointerYRef.current = e.clientY;
    };
    document.addEventListener('pointermove', handler);
    return () => document.removeEventListener('pointermove', handler);
  }, [activeItem]);

  useEffect(() => {
    setCollapsed(loadCollapsed());
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveCollapsed(next);
      return next;
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleSort = (key: ColumnKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedItems = useMemo(() => {
    const sorted = [...displayItems].sort((a, b) => {
      const cmp = compareItems(a, b, sortKey, items);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return buildHierarchicalList(sorted, collapsed);
  }, [displayItems, items, sortKey, sortDir, collapsed]);

  const sortedIds = useMemo(
    () => sortedItems.map(({ item }) => item.id),
    [sortedItems],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = event.active.data.current?.item as Item | undefined;
    if (item) setActiveItem(item);
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { active, over } = event;
    if (!over) {
      dropTargetRef.current = null;
      setDropTarget(null);
      return;
    }
    const draggedItem = active.data.current?.item as Item | undefined;
    const targetItem = over.data.current?.item as Item | undefined;
    if (!targetItem || !draggedItem || draggedItem.id === targetItem.id) {
      dropTargetRef.current = null;
      setDropTarget(null);
      return;
    }
    const zone = computeZone(pointerYRef.current, over.rect, targetItem);
    if (!canDrop(draggedItem, targetItem, zone, items)) {
      dropTargetRef.current = null;
      setDropTarget(null);
      return;
    }
    const target = { itemId: targetItem.id, zone };
    dropTargetRef.current = target;
    setDropTarget(target);
  }, [items]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const currentTarget = dropTargetRef.current;

    setActiveItem(null);
    setDropTarget(null);
    dropTargetRef.current = null;

    const { active, over } = event;
    if (!over || !currentTarget) return;

    const draggedItem = active.data.current?.item as Item | undefined;
    const targetItem = over.data.current?.item as Item | undefined;

    if (!draggedItem || !targetItem || draggedItem.id === targetItem.id) return;

    const zone = currentTarget.zone;

    if (!canDrop(draggedItem, targetItem, zone, items)) return;

    if (zone === 'inside') {
      const newTipo = tipoForParent(targetItem);
      const siblingCount = items.filter((i) => i.parentId === targetItem.id).length;
      moveItem(draggedItem.id, targetItem.id, newTipo, siblingCount);
    } else {
      const newParentId = targetItem.parentId;
      const newTipo = tipoForParent(newParentId ? items.find((i) => i.id === newParentId) : undefined);
      const siblings = items
        .filter((i) => i.parentId === newParentId && i.id !== draggedItem.id)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
      const targetSiblingIdx = siblings.findIndex((s) => s.id === targetItem.id);
      const insertIdx = zone === 'below' ? targetSiblingIdx + 1 : targetSiblingIdx;
      moveItem(draggedItem.id, newParentId, newTipo, Math.max(0, insertIdx));
    }
  }, [items, moveItem]);

  return (
    <div>
      <div className="flex justify-end mb-2">
        <ColumnSettings
          visibleColumns={visibleColumnKeys}
          onChange={handleColumnsChange}
          forcedHiddenKeys={forcedHiddenKeys}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={() => { setActiveItem(null); setDropTarget(null); }}
      >
        <div className="overflow-x-auto rounded-xl border border-border font-data">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2">
                {columns.map(({ key, label, className }) => (
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
              <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                {sortedItems.map(({ item, depth, hasChildren }) => (
                  <TabelaRow
                    key={item.id}
                    item={item}
                    depth={depth}
                    hasChildren={hasChildren}
                    isCollapsed={collapsed.has(item.id)}
                    onToggleCollapse={toggleCollapse}
                    dropIndicator={dropTarget?.itemId === item.id ? dropTarget.zone : null}
                    clienteNome={getItemCliente(item, items)}
                    columns={columns}
                  />
                ))}
              </SortableContext>
              {sortedItems.length === 0 && (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-8 text-center">
                    <p className="text-sm italic text-text-muted font-heading">&ldquo;Labor omnia vincit&rdquo;</p>
                    <p className="text-xs text-text-muted mt-1">Nenhum item encontrado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <DragOverlay>
          {activeItem ? (
            <div className="rounded-xl border border-accent-projeto bg-surface-1 px-4 py-2 shadow-lg opacity-90 text-sm font-medium text-text-primary">
              {activeItem.nome}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
