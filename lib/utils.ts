import type { Item } from './types';

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(isoString: string): string {
  // Append T00:00:00 to date-only strings to force local timezone parsing
  // Without this, "2026-02-11" is parsed as UTC midnight which in UTC-3 becomes Feb 10
  const date = isoString.includes('T') ? new Date(isoString) : new Date(isoString + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function calculateProgress(
  children: Item[],
): number {
  if (children.length === 0) return 0;
  const concluidos = children.filter(
    (c) => c.status === 'concluido',
  ).length;
  return Math.round((concluidos / children.length) * 100);
}

export function getUniqueTipoProjeto(items: Item[]): string[] {
  const tipos = new Set<string>();
  for (const item of items) {
    if (item.tipoProjeto) tipos.add(item.tipoProjeto);
  }
  return Array.from(tipos).sort();
}

export function getUniqueClientes(items: Item[]): string[] {
  const clientes = new Set<string>();
  for (const item of items) {
    if (item.cliente) clientes.add(item.cliente);
  }
  return Array.from(clientes).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function isOverdue(prazo: string | undefined): boolean {
  if (!prazo) return false;
  const prazoDate = prazo.includes('T') ? new Date(prazo) : new Date(prazo + 'T23:59:59');
  return prazoDate < new Date();
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function diffInDays(a: string | Date, b: string | Date): number {
  const da = typeof a === 'string' ? new Date(a) : a;
  const db = typeof b === 'string' ? new Date(b) : b;
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export interface MonthInfo {
  year: number;
  month: number; // 0-11
  label: string;
  startDay: number; // offset in days from range start
  days: number; // days in this month within the range
}

export function getMonthsBetween(startDate: Date, endDate: Date): MonthInfo[] {
  const months: MonthInfo[] = [];
  const rangeStart = new Date(startDate);
  rangeStart.setHours(0, 0, 0, 0);

  const current = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  while (current <= end) {
    const monthStart = new Date(current);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    const effectiveStart = monthStart < rangeStart ? rangeStart : monthStart;
    const effectiveEnd = monthEnd > end ? end : monthEnd;

    const startDay = diffInDays(rangeStart, effectiveStart);
    const days = diffInDays(effectiveStart, effectiveEnd) + 1;

    months.push({
      year: current.getFullYear(),
      month: current.getMonth(),
      label: new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(current),
      startDay,
      days,
    });

    current.setMonth(current.getMonth() + 1);
  }

  return months;
}
