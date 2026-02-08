'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Item, ItemCreate, FilterState, ViewType, Tipo } from './types';
import { appReducer, initialState, type ModalState, type ConfirmState } from './reducer';
import { loadItems, saveItems, createItem, updateItem, deleteItem } from './storage';
import { calculateProgress, getUniqueTipoProjeto, getUniqueClientes } from './utils';
import { MOCK_DATA } from './mock-data';

interface MementotaskContextValue {
  items: Item[];
  filter: FilterState;
  view: ViewType;
  filteredItems: Item[];
  uniqueTipoProjeto: string[];
  uniqueClientes: string[];
  modalState: ModalState;
  confirmState: ConfirmState;
  addItem: (data: ItemCreate) => void;
  editItem: (id: string, changes: Partial<Item>) => void;
  removeItem: (id: string) => void;
  setFilter: (filter: Partial<FilterState>) => void;
  setView: (view: ViewType) => void;
  getChildrenOf: (parentId: string) => Item[];
  getProjectProgress: (projectId: string) => number;
  getParent: (parentId: string) => Item | undefined;
  openCreateModal: (tipo: Tipo, parentId?: string | null, status?: string) => void;
  openEditModal: (item: Item) => void;
  closeModal: () => void;
  moveItem: (itemId: string, newParentId: string | null, newTipo: Tipo, targetIndex: number) => void;
  confirmDelete: (id: string, nome: string) => void;
  cancelDelete: () => void;
  executeDelete: () => void;
}

const MementotaskContext = createContext<MementotaskContextValue | null>(null);

export function MementotaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount, seed mock data if empty
  useEffect(() => {
    let items = loadItems();
    if (items.length === 0) {
      items = MOCK_DATA;
      saveItems(items);
    }
    dispatch({ type: 'SET_ITEMS', payload: items });
  }, []);

  // Sync to localStorage on items change (skip initial empty state)
  useEffect(() => {
    if (state.items.length > 0) {
      saveItems(state.items);
    }
  }, [state.items]);

  const addItem = useCallback(
    (data: ItemCreate) => {
      const newItems = createItem(state.items, data);
      dispatch({ type: 'SET_ITEMS', payload: newItems });
    },
    [state.items],
  );

  const editItem = useCallback(
    (id: string, changes: Partial<Item>) => {
      const newItems = updateItem(state.items, id, changes);
      dispatch({ type: 'SET_ITEMS', payload: newItems });
    },
    [state.items],
  );

  const removeItem = useCallback(
    (id: string) => {
      const newItems = deleteItem(state.items, id);
      dispatch({ type: 'SET_ITEMS', payload: newItems });
    },
    [state.items],
  );

  const setFilter = useCallback((filter: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const setView = useCallback((view: ViewType) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  const getChildrenOf = useCallback(
    (parentId: string) => state.items.filter((item) => item.parentId === parentId),
    [state.items],
  );

  const getProjectProgress = useCallback(
    (projectId: string) => {
      const directChildren = state.items.filter((item) => item.parentId === projectId);
      return calculateProgress(directChildren);
    },
    [state.items],
  );

  const getParent = useCallback(
    (parentId: string) => state.items.find((item) => item.id === parentId),
    [state.items],
  );

  // Modal actions
  const openCreateModal = useCallback((tipo: Tipo, parentId?: string | null, status?: string) => {
    dispatch({
      type: 'OPEN_MODAL',
      payload: { mode: 'create', tipo, parentId: parentId ?? null },
    });
  }, []);

  const openEditModal = useCallback((item: Item) => {
    dispatch({
      type: 'OPEN_MODAL',
      payload: { mode: 'edit', item, tipo: item.tipo },
    });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  // Move item (reorder / reparent)
  const moveItem = useCallback(
    (itemId: string, newParentId: string | null, newTipo: Tipo, targetIndex: number) => {
      let newItems = [...state.items];
      const itemIdx = newItems.findIndex((i) => i.id === itemId);
      if (itemIdx === -1) return;

      // Update item's parentId, tipo, and ordem
      const now = new Date().toISOString();
      newItems[itemIdx] = { ...newItems[itemIdx], parentId: newParentId, tipo: newTipo, atualizadoEm: now };

      // Re-number siblings in the target parent
      const siblings = newItems
        .filter((i) => i.parentId === newParentId && i.id !== itemId)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

      siblings.splice(targetIndex, 0, newItems[itemIdx]);
      siblings.forEach((s, i) => {
        const idx = newItems.findIndex((n) => n.id === s.id);
        if (idx !== -1) newItems[idx] = { ...newItems[idx], ordem: i + 1 };
      });

      saveItems(newItems);
      dispatch({ type: 'SET_ITEMS', payload: newItems });
    },
    [state.items],
  );

  // Confirm dialog actions
  const confirmDelete = useCallback((id: string, nome: string) => {
    dispatch({ type: 'OPEN_CONFIRM', payload: { itemId: id, itemNome: nome } });
  }, []);

  const cancelDelete = useCallback(() => {
    dispatch({ type: 'CLOSE_CONFIRM' });
  }, []);

  const executeDelete = useCallback(() => {
    if (state.confirm.itemId) {
      const newItems = deleteItem(state.items, state.confirm.itemId);
      dispatch({ type: 'SET_ITEMS', payload: newItems });
    }
    dispatch({ type: 'CLOSE_CONFIRM' });
  }, [state.confirm.itemId, state.items]);

  const filteredItems = useMemo(() => {
    const { status, tipoProjeto, cliente, busca } = state.filter;

    // Helper to find root project of an item
    function findRootProject(item: Item): Item | undefined {
      let current: Item | undefined = item;
      while (current && current.parentId) {
        current = state.items.find((i) => i.id === current!.parentId);
      }
      return current;
    }

    return state.items.filter((item) => {
      if (status !== 'todos' && item.status !== status) return false;
      if (tipoProjeto) {
        if (item.tipo === 'projeto') {
          if (!item.tipoProjeto?.toLowerCase().includes(tipoProjeto.toLowerCase()))
            return false;
        } else {
          const root = findRootProject(item);
          if (
            !root?.tipoProjeto
              ?.toLowerCase()
              .includes(tipoProjeto.toLowerCase())
          )
            return false;
        }
      }
      if (cliente) {
        // For projects, match directly. For children, match via root project.
        if (item.tipo === 'projeto') {
          if (!item.cliente?.toLowerCase().includes(cliente.toLowerCase()))
            return false;
        } else {
          const root = findRootProject(item);
          if (!root?.cliente?.toLowerCase().includes(cliente.toLowerCase()))
            return false;
        }
      }
      if (busca) {
        const term = busca.toLowerCase();
        const matchesName = item.nome.toLowerCase().includes(term);
        const matchesClient = item.cliente?.toLowerCase().includes(term);
        const matchesDesc = item.descricao?.toLowerCase().includes(term);
        if (!matchesName && !matchesClient && !matchesDesc) return false;
      }
      return true;
    });
  }, [state.items, state.filter]);

  const uniqueTipoProjeto = useMemo(
    () => getUniqueTipoProjeto(state.items),
    [state.items],
  );

  const uniqueClientes = useMemo(
    () => getUniqueClientes(state.items),
    [state.items],
  );

  const value = useMemo<MementotaskContextValue>(
    () => ({
      items: state.items,
      filter: state.filter,
      view: state.view,
      filteredItems,
      uniqueTipoProjeto,
      uniqueClientes,
      modalState: state.modal,
      confirmState: state.confirm,
      addItem,
      editItem,
      removeItem,
      setFilter,
      setView,
      getChildrenOf,
      getProjectProgress,
      getParent,
      openCreateModal,
      openEditModal,
      closeModal,
      moveItem,
      confirmDelete,
      cancelDelete,
      executeDelete,
    }),
    [
      state.items,
      state.filter,
      state.view,
      state.modal,
      state.confirm,
      filteredItems,
      uniqueTipoProjeto,
      uniqueClientes,
      addItem,
      editItem,
      removeItem,
      setFilter,
      setView,
      getChildrenOf,
      getProjectProgress,
      getParent,
      openCreateModal,
      openEditModal,
      closeModal,
      moveItem,
      confirmDelete,
      cancelDelete,
      executeDelete,
    ],
  );

  return (
    <MementotaskContext.Provider value={value}>
      {children}
    </MementotaskContext.Provider>
  );
}

export function useMementotask(): MementotaskContextValue {
  const ctx = useContext(MementotaskContext);
  if (!ctx) {
    throw new Error('useMementotask must be used within MementotaskProvider');
  }
  return ctx;
}
