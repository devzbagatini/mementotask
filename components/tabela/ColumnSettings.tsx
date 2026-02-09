'use client';

import { useState, useCallback } from 'react';
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
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings2, GripVertical, X, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type ColumnKey,
  COLUMN_DEFS,
  ALL_COLUMN_KEYS,
  DEFAULT_VISIBLE_COLUMNS,
} from '@/lib/columns';

interface ColumnSettingsProps {
  visibleColumns: ColumnKey[];
  onChange: (columns: ColumnKey[]) => void;
  forcedHiddenKeys?: ColumnKey[];
}

function SortableColumnItem({
  columnKey,
  isLocked,
  onRemove,
}: {
  columnKey: ColumnKey;
  isLocked: boolean;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columnKey, disabled: isLocked });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
        isDragging && 'opacity-50 bg-surface-3',
      )}
    >
      {isLocked ? (
        <span className="w-5 h-5 shrink-0" />
      ) : (
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <span className="flex-1 text-text-primary">{COLUMN_DEFS[columnKey].label}</span>
      {isLocked ? (
        <span className="text-[10px] text-text-muted">Fixo</span>
      ) : (
        <button
          onClick={onRemove}
          className="shrink-0 rounded p-0.5 text-text-muted hover:text-priority-alta hover:bg-surface-3 transition-colors"
          title="Ocultar coluna"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function ColumnSettings({ visibleColumns, onChange, forcedHiddenKeys = [] }: ColumnSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Columns visible in settings (exclude forced hidden from display)
  const displayVisible = visibleColumns.filter((k) => !forcedHiddenKeys.includes(k));

  const hiddenColumns = ALL_COLUMN_KEYS.filter(
    (k) => !visibleColumns.includes(k) && !forcedHiddenKeys.includes(k),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = visibleColumns.indexOf(active.id as ColumnKey);
      const newIndex = visibleColumns.indexOf(over.id as ColumnKey);
      if (oldIndex === -1 || newIndex === -1) return;
      // Don't allow moving before 'nome'
      if (newIndex === 0 && visibleColumns[0] === 'nome') return;
      onChange(arrayMove(visibleColumns, oldIndex, newIndex));
    },
    [visibleColumns, onChange],
  );

  const handleRemove = useCallback(
    (key: ColumnKey) => {
      onChange(visibleColumns.filter((k) => k !== key));
    },
    [visibleColumns, onChange],
  );

  const handleAdd = useCallback(
    (key: ColumnKey) => {
      onChange([...visibleColumns, key]);
    },
    [visibleColumns, onChange],
  );

  const handleReset = useCallback(() => {
    onChange([...DEFAULT_VISIBLE_COLUMNS]);
  }, [onChange]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors',
          isOpen
            ? 'bg-surface-2 text-text-primary'
            : 'text-text-muted hover:text-text-secondary hover:bg-surface-2',
        )}
        title="Gerenciar colunas"
      >
        <Settings2 className="h-4 w-4" />
        <span className="hidden sm:inline">Colunas</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-full mt-1 z-40 w-64 rounded-xl border border-border bg-surface-1 shadow-lg">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-primary">Colunas Visíveis</h3>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
                  title="Restaurar padrão"
                >
                  <RotateCcw className="h-3 w-3" />
                  Padrão
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={displayVisible}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0.5">
                    {displayVisible.map((key) => (
                      <SortableColumnItem
                        key={key}
                        columnKey={key}
                        isLocked={key === 'nome'}
                        onRemove={() => handleRemove(key)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {hiddenColumns.length > 0 && (
                <div className="border-t border-border mt-2 pt-2">
                  <h3 className="text-xs font-medium text-text-muted mb-1.5">Adicionar Coluna</h3>
                  <div className="space-y-0.5">
                    {hiddenColumns.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleAdd(key)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-text-secondary hover:bg-surface-2 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {COLUMN_DEFS[key].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
