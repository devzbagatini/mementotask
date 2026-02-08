'use client';

import { useDraggable } from '@dnd-kit/core';
import type { Item } from '@/lib/types';
import { KanbanCard } from './KanbanCard';

interface DraggableCardProps {
  item: Item;
}

export function DraggableCard({ item }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  return (
    <div ref={setNodeRef} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
      <KanbanCard
        item={item}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
      />
    </div>
  );
}
