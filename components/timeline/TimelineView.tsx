'use client';

import { useMemo, useState } from 'react';
import { useMementotask } from '@/lib/context';
import type { Item } from '@/lib/types';
import { diffInDays, getMonthsBetween, calculateProgress, cn } from '@/lib/utils';
import { TimelineHeader } from './TimelineHeader';
import { TimelineBar } from './TimelineBar';

type GroupMode = 'todos' | 'por_cliente';
type ShowMode = 'projetos' | 'projetos_tarefas';

function getItemDateRange(item: Item): { start: Date; end: Date } | null {
  const dates: Date[] = [];
  if (item.dataInicio) dates.push(new Date(item.dataInicio));
  if (item.prazo) dates.push(new Date(item.prazo));
  if (item.dataEntrega) dates.push(new Date(item.dataEntrega));

  if (dates.length === 0) return null;

  if (dates.length === 1) {
    // Single date — show as 7-day bar
    const d = dates[0];
    const end = new Date(d);
    end.setDate(end.getDate() + 7);
    return { start: d, end };
  }

  const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
  return { start: sorted[0], end: sorted[sorted.length - 1] };
}

export function TimelineView() {
  const { filteredItems, items, openEditModal } = useMementotask();
  const [groupMode, setGroupMode] = useState<GroupMode>('todos');
  const [showMode, setShowMode] = useState<ShowMode>('projetos');

  const { rangeItems, noDatesItems, rangeStart, rangeEnd, totalDays, todayOffset, months } = useMemo(() => {
    // Filter by show mode
    let displayed = filteredItems;
    if (showMode === 'projetos') {
      displayed = displayed.filter((i) => i.tipo === 'projeto');
    } else {
      displayed = displayed.filter((i) => i.tipo === 'projeto' || i.tipo === 'tarefa');
    }

    // Separate items with/without dates
    const withDates: { item: Item; range: { start: Date; end: Date } }[] = [];
    const noDates: Item[] = [];

    for (const item of displayed) {
      const range = getItemDateRange(item);
      if (range) {
        withDates.push({ item, range });
      } else {
        noDates.push(item);
      }
    }

    if (withDates.length === 0) {
      return {
        rangeItems: [],
        noDatesItems: noDates,
        rangeStart: new Date(),
        rangeEnd: new Date(),
        totalDays: 1,
        todayOffset: null,
        months: [],
      };
    }

    // Compute global range with padding
    let globalStart = withDates[0].range.start;
    let globalEnd = withDates[0].range.end;

    for (const { range } of withDates) {
      if (range.start < globalStart) globalStart = range.start;
      if (range.end > globalEnd) globalEnd = range.end;
    }

    // Add 7 days of padding each side
    const paddedStart = new Date(globalStart);
    paddedStart.setDate(paddedStart.getDate() - 7);
    const paddedEnd = new Date(globalEnd);
    paddedEnd.setDate(paddedEnd.getDate() + 7);

    const total = Math.max(diffInDays(paddedStart, paddedEnd), 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOff = diffInDays(paddedStart, today);
    const mths = getMonthsBetween(paddedStart, paddedEnd);

    return {
      rangeItems: withDates,
      noDatesItems: noDates,
      rangeStart: paddedStart,
      rangeEnd: paddedEnd,
      totalDays: total,
      todayOffset: todayOff >= 0 && todayOff <= total ? todayOff : null,
      months: mths,
    };
  }, [filteredItems, showMode]);

  // Group items
  const groups = useMemo(() => {
    if (groupMode === 'todos') {
      return [{ label: null, items: rangeItems }];
    }

    // Group by client
    const clientMap = new Map<string, typeof rangeItems>();
    const noClient: typeof rangeItems = [];

    for (const entry of rangeItems) {
      const cliente = entry.item.tipo === 'projeto'
        ? entry.item.cliente
        : items.find((i) => i.id === entry.item.parentId)?.cliente;

      if (cliente) {
        const list = clientMap.get(cliente) ?? [];
        list.push(entry);
        clientMap.set(cliente, list);
      } else {
        noClient.push(entry);
      }
    }

    const result: { label: string | null; items: typeof rangeItems }[] = [];
    for (const [label, grpItems] of Array.from(clientMap.entries()).sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))) {
      result.push({ label, items: grpItems });
    }
    if (noClient.length > 0) {
      result.push({ label: 'Sem Cliente', items: noClient });
    }
    return result;
  }, [groupMode, rangeItems, items]);

  // Get progress for projects
  function getProgress(item: Item): number | undefined {
    if (item.tipo !== 'projeto') return undefined;
    const children = items.filter((i) => i.parentId === item.id);
    return calculateProgress(children);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-muted">Agrupar:</span>
          <select
            value={groupMode}
            onChange={(e) => setGroupMode(e.target.value as GroupMode)}
            className="rounded-xl border border-border bg-surface-2 px-2 py-1 text-sm text-text-primary outline-none focus:border-accent-projeto"
          >
            <option value="todos">Todos</option>
            <option value="por_cliente">Por Cliente</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-muted">Mostrar:</span>
          <select
            value={showMode}
            onChange={(e) => setShowMode(e.target.value as ShowMode)}
            className="rounded-xl border border-border bg-surface-2 px-2 py-1 text-sm text-text-primary outline-none focus:border-accent-projeto"
          >
            <option value="projetos">Apenas Projetos</option>
            <option value="projetos_tarefas">Projetos + Tarefas</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      {rangeItems.length > 0 ? (
        <div className="rounded-xl border border-border bg-surface-1 overflow-x-auto">
          <div className="min-w-[600px]">
            <TimelineHeader months={months} totalDays={totalDays} todayOffset={todayOffset} />

            <div className="relative">
              {/* Today line */}
              {todayOffset !== null && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-priority-alta/30 z-0"
                  style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                />
              )}

              {groups.map((group, gi) => (
                <div key={gi}>
                  {group.label && (
                    <div className="px-3 py-1.5 text-xs font-medium text-text-muted uppercase tracking-wider bg-surface-2/50 border-b border-border">
                      {group.label}
                    </div>
                  )}
                  {group.items.map(({ item, range }) => {
                    const startOff = diffInDays(rangeStart, range.start);
                    const dur = Math.max(diffInDays(range.start, range.end), 1);
                    const leftPct = (startOff / totalDays) * 100;
                    const widthPct = (dur / totalDays) * 100;

                    return (
                      <div key={item.id} className="flex items-center border-b border-border/50">
                        <div className="w-40 shrink-0 px-3 py-1 truncate text-xs text-text-secondary border-r border-border">
                          {item.nome}
                        </div>
                        <div className="flex-1 relative">
                          <TimelineBar
                            item={item}
                            leftPct={leftPct}
                            widthPct={widthPct}
                            progress={getProgress(item)}
                            onClick={() => openEditModal(item)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface-1 p-8 text-center">
          <p className="text-sm italic text-text-muted font-heading">&ldquo;Tempus fugit&rdquo;</p>
          <p className="text-xs text-text-muted mt-1">Nenhum item com datas para exibir na timeline.</p>
        </div>
      )}

      {/* Items without dates */}
      {noDatesItems.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <h3 className="text-sm font-medium text-text-muted mb-2">
            Sem datas definidas ({noDatesItems.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {noDatesItems.map((item) => (
              <button
                key={item.id}
                onClick={() => openEditModal(item)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80',
                  item.tipo === 'projeto' ? 'bg-accent-projeto' : item.tipo === 'tarefa' ? 'bg-accent-tarefa' : 'bg-accent-subtarefa',
                )}
              >
                {item.nome}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
