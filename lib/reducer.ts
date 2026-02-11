import type { Item, FilterState, ViewType, Tipo } from './types';

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  item?: Item;
  tipo?: Tipo;
  parentId?: string | null;
  defaultStatus?: string;
}

export interface ConfirmState {
  isOpen: boolean;
  itemId: string;
  itemNome: string;
}

export interface AppState {
  items: Item[];
  filter: FilterState;
  view: ViewType;
  modal: ModalState;
  confirm: ConfirmState;
}

export type AppAction =
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: { id: string; changes: Partial<Item> } }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'OPEN_MODAL'; payload: Omit<ModalState, 'isOpen'> }
  | { type: 'CLOSE_MODAL' }
  | { type: 'OPEN_CONFIRM'; payload: { itemId: string; itemNome: string } }
  | { type: 'CLOSE_CONFIRM' };

export const initialState: AppState = {
  items: [],
  filter: {
    status: 'todos',
    prioridade: 'todas',
    projeto: '',
    cliente: '',
    tarefa: '',
    responsavel: '',
    busca: '',
  },
  view: 'kanban',
  modal: {
    isOpen: false,
    mode: 'create',
  },
  confirm: {
    isOpen: false,
    itemId: '',
    itemNome: '',
  },
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };

    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };

    case 'UPDATE_ITEM': {
      const { id, changes } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id
            ? { ...item, ...changes, atualizadoEm: new Date().toISOString() }
            : item,
        ),
      };
    }

    case 'DELETE_ITEM': {
      const idsToDelete = new Set<string>();
      function collectChildren(parentId: string) {
        idsToDelete.add(parentId);
        for (const item of state.items) {
          if (item.parentId === parentId) {
            collectChildren(item.id);
          }
        }
      }
      collectChildren(action.payload);
      return {
        ...state,
        items: state.items.filter((item) => !idsToDelete.has(item.id)),
      };
    }

    case 'SET_FILTER':
      return {
        ...state,
        filter: { ...state.filter, ...action.payload },
      };

    case 'SET_VIEW':
      return { ...state, view: action.payload };

    case 'OPEN_MODAL':
      return {
        ...state,
        modal: { isOpen: true, ...action.payload },
      };

    case 'CLOSE_MODAL':
      return {
        ...state,
        modal: { isOpen: false, mode: 'create' },
      };

    case 'OPEN_CONFIRM':
      return {
        ...state,
        confirm: { isOpen: true, ...action.payload },
      };

    case 'CLOSE_CONFIRM':
      return {
        ...state,
        confirm: { isOpen: false, itemId: '', itemNome: '' },
      };

    default:
      return state;
  }
}
