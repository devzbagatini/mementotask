import type { Item, ItemCreate } from './types';
import { generateId } from './utils';

const STORAGE_KEY = 'mementotask_items';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function loadItems(): Item[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Item[];
  } catch {
    return [];
  }
}

export function saveItems(items: Item[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function createItem(items: Item[], data: ItemCreate): Item[] {
  const now = new Date().toISOString();
  const newItem: Item = {
    id: generateId(),
    nome: data.nome,
    tipo: data.tipo,
    status: data.status ?? 'a_fazer',
    prioridade: data.prioridade ?? 'media',
    parentId: data.parentId ?? null,
    cliente: data.cliente,
    valor: data.valor,
    valorRecebido: data.valorRecebido,
    tipoProjeto: data.tipoProjeto,
    dataInicio: data.dataInicio,
    prazo: data.prazo,
    dataEntrega: data.dataEntrega,
    descricao: data.descricao,
    responsavel: data.responsavel,
    tecnologias: data.tecnologias,
    notas: data.notas,
    criadoEm: now,
    atualizadoEm: now,
  };
  const next = [...items, newItem];
  saveItems(next);
  return next;
}

export function updateItem(
  items: Item[],
  id: string,
  changes: Partial<Omit<Item, 'id' | 'criadoEm'>>,
): Item[] {
  const next = items.map((item) =>
    item.id === id
      ? { ...item, ...changes, atualizadoEm: new Date().toISOString() }
      : item,
  );
  saveItems(next);
  return next;
}

export function deleteItem(items: Item[], id: string): Item[] {
  const idsToDelete = new Set<string>();

  function collectChildren(parentId: string) {
    idsToDelete.add(parentId);
    for (const item of items) {
      if (item.parentId === parentId) {
        collectChildren(item.id);
      }
    }
  }

  collectChildren(id);
  const next = items.filter((item) => !idsToDelete.has(item.id));
  saveItems(next);
  return next;
}
