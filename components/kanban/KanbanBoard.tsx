'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import { useMementotask } from '@/lib/context';
import { KANBAN_STATUSES, type KanbanStatus, type Item } from '@/lib/types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

export function KanbanBoard() {
  const { filteredItems, editItem } = useMementotask();
  const [activeItem, setActiveItem] = useState<Item | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const item = event.active.data.current?.item as Item | undefined;
    if (item) setActiveItem(item);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const item = active.data.current?.item as Item | undefined;
    const newStatus = over.data.current?.status as KanbanStatus | undefined;

    if (item && newStatus && item.status !== newStatus) {
      editItem(item.id, { status: newStatus });
    }
  }

  function handleDragCancel() {
    setActiveItem(null);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KANBAN_STATUSES.map((status) => {
          const columnItems = filteredItems.filter((item) => item.status === status);
          return (
            <KanbanColumn key={status} status={status} items={columnItems} />
          );
        })}
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="w-[280px] rotate-3 opacity-90">
            <KanbanCard item={activeItem} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
