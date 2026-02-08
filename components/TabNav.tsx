'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMementotask } from '@/lib/context';
import type { ViewType } from '@/lib/types';
import { Columns3, Table, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS_MAP: Record<ViewType, { id: ViewType; label: string; icon: typeof Columns3 }> = {
  kanban: { id: 'kanban', label: 'Kanban', icon: Columns3 },
  tabela: { id: 'tabela', label: 'Tabela', icon: Table },
  timeline: { id: 'timeline', label: 'Timeline', icon: Clock },
  clientes: { id: 'clientes', label: 'Clientes', icon: Users },
};

const DEFAULT_TAB_ORDER: ViewType[] = ['kanban', 'tabela', 'timeline', 'clientes'];
const TAB_ORDER_KEY = 'mementotask_tab_order';

function loadTabOrder(): ViewType[] {
  if (typeof window === 'undefined') return DEFAULT_TAB_ORDER;
  try {
    const raw = localStorage.getItem(TAB_ORDER_KEY);
    if (!raw) return DEFAULT_TAB_ORDER;
    const parsed = JSON.parse(raw) as string[];
    const validTabs = new Set<string>(DEFAULT_TAB_ORDER);
    const valid = parsed.filter((t): t is ViewType => validTabs.has(t));
    for (const t of DEFAULT_TAB_ORDER) {
      if (!valid.includes(t)) valid.push(t);
    }
    return valid;
  } catch {
    return DEFAULT_TAB_ORDER;
  }
}

function saveTabOrder(order: ViewType[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TAB_ORDER_KEY, JSON.stringify(order));
}

function SortableTab({
  tab,
  isActive,
  onClick,
}: {
  tab: (typeof TABS_MAP)[ViewType];
  isActive: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = tab.icon;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px select-none',
        isDragging && 'opacity-50 z-10',
        isActive
          ? 'border-accent-projeto text-accent-projeto'
          : 'border-transparent text-text-muted hover:text-text-secondary',
      )}
    >
      <Icon className="h-4 w-4" />
      {tab.label}
    </button>
  );
}

export function TabNav() {
  const { view, setView } = useMementotask();
  const [tabOrder, setTabOrder] = useState<ViewType[]>(DEFAULT_TAB_ORDER);

  useEffect(() => {
    setTabOrder(loadTabOrder());
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTabOrder((prev) => {
      const oldIdx = prev.indexOf(active.id as ViewType);
      const newIdx = prev.indexOf(over.id as ViewType);
      if (oldIdx === -1 || newIdx === -1) return prev;
      const next = arrayMove(prev, oldIdx, newIdx);
      saveTabOrder(next);
      return next;
    });
  }, []);

  return (
    <nav className="flex gap-1 border-b border-border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tabOrder} strategy={horizontalListSortingStrategy}>
          {tabOrder.map((id) => (
            <SortableTab
              key={id}
              tab={TABS_MAP[id]}
              isActive={view === id}
              onClick={() => setView(id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </nav>
  );
}
