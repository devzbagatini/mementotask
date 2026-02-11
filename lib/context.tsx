'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Item, ItemCreate, FilterState, ViewType, Tipo } from './types';
import { appReducer, initialState, type ModalState, type ConfirmState } from './reducer';
import { loadItems as loadLocalItems, saveItems as saveLocalItems, createItem as createLocalItem, updateItem as updateLocalItem, deleteItem as deleteLocalItem } from './storage';
import { updateItem as updateSupabaseItem, deleteItem as deleteSupabaseItem } from './supabase-storage';
import { loadItemsByWorkspace, createItemInWorkspace } from './workspace-storage';
import { useWorkspace } from './workspace-context';
import { calculateProgress, getUniqueClientes } from './utils';
import { useAuth } from './auth-context';
import { supabase } from './supabase';

interface MementotaskContextValue {
  items: Item[];
  filter: FilterState;
  view: ViewType;
  filteredItems: Item[];
  uniqueProjetos: { id: string; nome: string }[];
  uniqueClientes: string[];
  uniqueTarefas: { id: string; nome: string }[];
  uniqueResponsaveis: string[];
  modalState: ModalState;
  confirmState: ConfirmState;
  isLoading: boolean;
  addItem: (data: ItemCreate) => Promise<void>;
  editItem: (id: string, changes: Partial<Item>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  setFilter: (filter: Partial<FilterState>) => void;
  setView: (view: ViewType) => void;
  getChildrenOf: (parentId: string) => Item[];
  getProjectProgress: (projectId: string) => number;
  getParent: (parentId: string) => Item | undefined;
  openCreateModal: (tipo: Tipo, parentId?: string | null, status?: string) => void;
  openEditModal: (item: Item) => void;
  closeModal: () => void;
  moveItem: (itemId: string, newParentId: string | null, newTipo: Tipo, targetIndex: number) => Promise<void>;
  confirmDelete: (id: string, nome: string) => void;
  cancelDelete: () => void;
  executeDelete: () => Promise<void>;
  reloadItems: () => Promise<void>;
}

const MementotaskContext = createContext<MementotaskContextValue | null>(null);

export function MementotaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, loading: authLoading } = useAuth();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const [isLoading, setIsLoading] = useState(false);

  // Load items - wait for auth and workspace to finish loading first
  useEffect(() => {
    // Don't load until auth resolves (prevents mock data flash)
    if (authLoading) return;
    // Don't load until workspace context is ready
    if (user && workspaceLoading) return;

    async function loadData() {
      setIsLoading(true);
      try {
        let items: Item[];

        if (user) {
          // Load from Supabase with workspace filter
          const workspaceId = currentWorkspace?.id || null;
          items = await loadItemsByWorkspace(workspaceId, user.id);
        } else if (!supabase) {
          // Only load localStorage when Supabase is not configured (local dev)
          items = loadLocalItems();
        } else {
          // Supabase configured but no user — show nothing
          items = [];
        }

        dispatch({ type: 'SET_ITEMS', payload: items });
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user, authLoading, currentWorkspace?.id, workspaceLoading]);

  const reloadItems = useCallback(async () => {
    if (!user) return;
    try {
      const workspaceId = currentWorkspace?.id || null;
      const items = await loadItemsByWorkspace(workspaceId, user.id);
      dispatch({ type: 'SET_ITEMS', payload: items });
    } catch (error) {
      console.error('Error reloading items:', error);
    }
  }, [user, currentWorkspace?.id]);

  // Sync to localStorage when not using Supabase
  useEffect(() => {
    if (!user && state.items.length > 0) {
      saveLocalItems(state.items);
    }
  }, [state.items, user]);

  const addItem = useCallback(
    async (data: ItemCreate) => {
      setIsLoading(true);
      try {
        if (user) {
          // Create in Supabase with workspace
          const workspaceId = currentWorkspace?.id || null;
          const siblingCount = state.items.filter(i => i.parentId === (data.parentId ?? null)).length;
          await createItemInWorkspace(user.id, workspaceId, { ...data, ordem: siblingCount + 1 });
          const items = await loadItemsByWorkspace(workspaceId, user.id);
          dispatch({ type: 'SET_ITEMS', payload: items });
        } else {
          // Create in localStorage
          const newItems = createLocalItem(state.items, data);
          dispatch({ type: 'SET_ITEMS', payload: newItems });
        }
      } catch (error) {
        console.error('Error adding item:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [state.items, user, currentWorkspace?.id],
  );

  const editItem = useCallback(
    async (id: string, changes: Partial<Item>) => {
      setIsLoading(true);
      try {
        if (user) {
          // Update in Supabase
          await updateSupabaseItem(id, changes);
          const workspaceId = currentWorkspace?.id || null;
          const items = await loadItemsByWorkspace(workspaceId, user.id);
          dispatch({ type: 'SET_ITEMS', payload: items });
        } else {
          // Update in localStorage
          const newItems = updateLocalItem(state.items, id, changes);
          dispatch({ type: 'SET_ITEMS', payload: newItems });
        }
      } catch (error) {
        console.error('Error editing item:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [state.items, user, currentWorkspace?.id],
  );

  const removeItem = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        if (user) {
          // Delete from Supabase
          await deleteSupabaseItem(id);
          const workspaceId = currentWorkspace?.id || null;
          const items = await loadItemsByWorkspace(workspaceId, user.id);
          dispatch({ type: 'SET_ITEMS', payload: items });
        } else {
          // Delete from localStorage
          const newItems = deleteLocalItem(state.items, id);
          dispatch({ type: 'SET_ITEMS', payload: newItems });
        }
      } catch (error) {
        console.error('Error removing item:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [state.items, user, currentWorkspace?.id],
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
      payload: { mode: 'create', tipo, parentId: parentId ?? null, defaultStatus: status },
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
    async (itemId: string, newParentId: string | null, newTipo: Tipo, targetIndex: number) => {
      setIsLoading(true);
      try {
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

        if (user) {
          // Update in Supabase
          await updateSupabaseItem(itemId, { parentId: newParentId, tipo: newTipo, ordem: targetIndex + 1 });
          const workspaceId = currentWorkspace?.id || null;
          const items = await loadItemsByWorkspace(workspaceId, user.id);
          dispatch({ type: 'SET_ITEMS', payload: items });
        } else {
          // Update in localStorage
          saveLocalItems(newItems);
          dispatch({ type: 'SET_ITEMS', payload: newItems });
        }
      } catch (error) {
        console.error('Error moving item:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [state.items, user, currentWorkspace?.id],
  );

  // Confirm dialog actions
  const confirmDelete = useCallback((id: string, nome: string) => {
    dispatch({ type: 'OPEN_CONFIRM', payload: { itemId: id, itemNome: nome } });
  }, []);

  const cancelDelete = useCallback(() => {
    dispatch({ type: 'CLOSE_CONFIRM' });
  }, []);

  const executeDelete = useCallback(async () => {
    if (state.confirm.itemId) {
      await removeItem(state.confirm.itemId);
    }
    dispatch({ type: 'CLOSE_CONFIRM' });
  }, [state.confirm.itemId, removeItem]);

  const filteredItems = useMemo(() => {
    const { status, prioridade, projeto, cliente, tarefa, responsavel, busca } = state.filter;

    // Helper to find root project of an item
    function findRootProject(item: Item): Item | undefined {
      let current: Item | undefined = item;
      while (current && current.parentId) {
        current = state.items.find((i) => i.id === current!.parentId);
      }
      return current;
    }

    // Collect all descendants of a given parent
    function collectDescendants(parentId: string, ids: Set<string>) {
      for (const item of state.items) {
        if (item.parentId === parentId) {
          ids.add(item.id);
          collectDescendants(item.id, ids);
        }
      }
    }

    // Common filters applied to any item
    function matchesCommon(item: Item): boolean {
      if (status !== 'todos' && item.status !== status) return false;
      if (prioridade !== 'todas' && item.prioridade !== prioridade) return false;
      if (responsavel && !(item.responsavel?.toLowerCase().includes(responsavel.toLowerCase()))) return false;
      if (busca) {
        const term = busca.toLowerCase();
        const matchesName = item.nome.toLowerCase().includes(term);
        const matchesClient = item.cliente?.toLowerCase().includes(term);
        const matchesDesc = item.descricao?.toLowerCase().includes(term);
        if (!matchesName && !matchesClient && !matchesDesc) return false;
      }
      return true;
    }

    // When filtering by tarefa, show only the tarefa itself and its subtarefas
    if (tarefa) {
      const tarefaItem = state.items.find((i) => i.id === tarefa);
      if (!tarefaItem) return [];

      const ids = new Set<string>([tarefa]);
      collectDescendants(tarefa, ids);

      return state.items.filter((item) => ids.has(item.id) && matchesCommon(item));
    }

    // When filtering by projeto, show the project + all its descendants
    if (projeto) {
      const projetoItem = state.items.find((i) => i.id === projeto);
      if (!projetoItem) return [];

      const ids = new Set<string>([projeto]);
      collectDescendants(projeto, ids);

      return state.items.filter((item) => ids.has(item.id) && matchesCommon(item));
    }

    return state.items.filter((item) => {
      if (!matchesCommon(item)) return false;
      if (cliente) {
        if (item.tipo === 'projeto') {
          if (!item.cliente?.toLowerCase().includes(cliente.toLowerCase()))
            return false;
        } else {
          const root = findRootProject(item);
          if (!root?.cliente?.toLowerCase().includes(cliente.toLowerCase()))
            return false;
        }
      }
      return true;
    });
  }, [state.items, state.filter]);

  const uniqueProjetos = useMemo(
    () =>
      state.items
        .filter((i) => i.tipo === 'projeto')
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
        .map((i) => ({ id: i.id, nome: i.nome })),
    [state.items],
  );

  const uniqueClientes = useMemo(
    () => getUniqueClientes(state.items),
    [state.items],
  );

  const uniqueTarefas = useMemo(
    () =>
      state.items
        .filter((i) => i.tipo === 'tarefa')
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((i) => ({ id: i.id, nome: i.nome })),
    [state.items],
  );

  const uniqueResponsaveis = useMemo(
    () => [...new Set(state.items.filter((i) => i.responsavel).map((i) => i.responsavel!))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [state.items],
  );

  const value = useMemo<MementotaskContextValue>(
    () => ({
      items: state.items,
      filter: state.filter,
      view: state.view,
      filteredItems,
      uniqueProjetos,
      uniqueClientes,
      uniqueTarefas,
      uniqueResponsaveis,
      modalState: state.modal,
      confirmState: state.confirm,
      isLoading,
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
      reloadItems,
    }),
    [
      state.items,
      state.filter,
      state.view,
      state.modal,
      state.confirm,
      isLoading,
      filteredItems,
      uniqueProjetos,
      uniqueClientes,
      uniqueTarefas,
      uniqueResponsaveis,
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
