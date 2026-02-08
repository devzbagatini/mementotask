'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { useMementotask } from '@/lib/context';
import type { Item, Tipo } from '@/lib/types';
import { TabelaRow, type DropZone } from './TabelaRow';
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
const COLLAPSED_KEY = 'mementotask_collapsed';

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

  // Sort children by ordem
  for (const [, children] of childrenMap) {
    children.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  }

  function walk(parentId: string | null, depth: number) {
    const children = childrenMap.get(parentId) ?? [];
    for (const child of children) {
      const hasChildren = (childrenMap.get(child.id)?.length ?? 0) > 0;
      result.push({ item: child, depth, hasChildren });
      // Skip children if this item is collapsed
      if (!collapsed.has(child.id)) {
        walk(child.id, depth + 1);
      }
    }
  }

  walk(null, 0);

  // Also add orphaned items (filtered items whose parent is not in the set)
  const addedIds = new Set(result.map((r) => r.item.id));
  for (const item of items) {
    if (!addedIds.has(item.id)) {
      const depth = item.tipo === 'projeto' ? 0 : item.tipo === 'tarefa' ? 1 : 2;
      const hasChildren = (childrenMap.get(item.id)?.length ?? 0) > 0;
      result.push({ item, depth, hasChildren });
    }
  }

  return result;
}

// Determine tipo based on new parent
function tipoForParent(parentItem: Item | undefined): Tipo {
  if (!parentItem) return 'projeto';
  if (parentItem.tipo === 'projeto') return 'tarefa';
  return 'subtarefa';
}

// Compute drop zone from pointer Y position relative to the row rect
function computeZone(pointerY: number, rect: { top: number; height: number }, targetItem: Item): DropZone {
  const relative = (pointerY - rect.top) / rect.height;
  // Subtarefas can't have children — only above/below
  if (targetItem.tipo === 'subtarefa') {
    return relative < 0.5 ? 'above' : 'below';
  }
  if (relative < 0.25) return 'above';
  if (relative > 0.75) return 'below';
  return 'inside';
}

export function TabelaView() {
  const { filteredItems, items, moveItem } = useMementotask();
  const [sortKey, setSortKey] = useState<SortKey>('nome');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Track pointer Y and current drop target for visual indicators
  const pointerYRef = useRef(0);
  const [dropTarget, setDropTarget] = useState<{ itemId: string; zone: DropZone } | null>(null);

  // Track pointer position during drag
  useEffect(() => {
    if (!activeItem) return;
    const handler = (e: PointerEvent) => {
      pointerYRef.current = e.clientY;
    };
    document.addEventListener('pointermove', handler);
    return () => document.removeEventListener('pointermove', handler);
  }, [activeItem]);

  // Load collapsed state from localStorage on mount
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
      activationConstraint: { distance: 5 },
    }),
  );

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
    return buildHierarchicalList(sorted, collapsed);
  }, [filteredItems, sortKey, sortDir, collapsed]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = event.active.data.current?.item as Item | undefined;
    if (item) setActiveItem(item);
  }, []);

  // Update visual indicator during drag
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setDropTarget(null);
      return;
    }
    const targetItem = over.data.current?.item as Item | undefined;
    if (!targetItem) {
      setDropTarget(null);
      return;
    }
    const zone = computeZone(pointerYRef.current, over.rect, targetItem);
    setDropTarget({ itemId: targetItem.id, zone });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null);
    setDropTarget(null);

    const { active, over } = event;
    if (!over) return;

    const draggedItem = active.data.current?.item as Item | undefined;
    const targetItem = over.data.current?.item as Item | undefined;

    if (!draggedItem || !targetItem || draggedItem.id === targetItem.id) return;

    // Prevent dropping on own descendant
    let parent: Item | undefined = targetItem;
    while (parent) {
      if (parent.id === draggedItem.id) return;
      parent = parent.parentId ? items.find((i) => i.id === parent!.parentId) : undefined;
    }

    // Compute zone from pointer position
    const zone = computeZone(pointerYRef.current, over.rect, targetItem);

    if (zone === 'inside') {
      const newTipo = tipoForParent(targetItem);
      const siblingCount = items.filter((i) => i.parentId === targetItem.id).length;
      moveItem(draggedItem.id, targetItem.id, newTipo, siblingCount);
    } else {
      // Move as sibling (above or below the target)
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setActiveItem(null); setDropTarget(null); }}
    >
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
            {sortedItems.map(({ item, depth, hasChildren }) => (
              <TabelaRow
                key={item.id}
                item={item}
                depth={depth}
                hasChildren={hasChildren}
                isCollapsed={collapsed.has(item.id)}
                onToggleCollapse={toggleCollapse}
                dropIndicator={dropTarget?.itemId === item.id ? dropTarget.zone : null}
              />
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
      <DragOverlay>
        {activeItem ? (
          <div className="rounded-lg border border-accent-projeto bg-surface-1 px-4 py-2 shadow-lg opacity-90 text-sm font-medium text-text-primary">
            {activeItem.nome}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
