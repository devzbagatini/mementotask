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
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoString));
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
  return new Date(prazo) < new Date();
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
