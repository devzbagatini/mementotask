export type ColumnKey =
  | 'nome'
  | 'cliente'
  | 'tipo'
  | 'status'
  | 'prioridade'
  | 'prazo'
  | 'horas'
  | 'valor'
  | 'valorRecebido'
  | 'tipoProjeto'
  | 'dataInicio'
  | 'dataEntrega'
  | 'responsavel'
  | 'criadoEm'
  | 'atualizadoEm';

export interface ColumnDef {
  key: ColumnKey;
  label: string;
  className?: string;
  minWidth?: number;
  defaultWidth?: number;
  truncate?: boolean;
}

export const COLUMN_DEFS: Record<ColumnKey, { label: string; className?: string; minWidth?: number; defaultWidth?: number; truncate?: boolean }> = {
  nome: { label: 'Nome', minWidth: 140, defaultWidth: 220, truncate: true },
  cliente: { label: 'Cliente', className: 'hidden lg:table-cell', minWidth: 80, defaultWidth: 130, truncate: true },
  tipo: { label: 'Tipo', className: 'hidden sm:table-cell', minWidth: 80, defaultWidth: 95 },
  status: { label: 'Status', minWidth: 110, defaultWidth: 135 },
  prioridade: { label: 'Prioridade', className: 'hidden md:table-cell', minWidth: 90, defaultWidth: 110 },
  prazo: { label: 'Prazo', className: 'hidden md:table-cell', minWidth: 90, defaultWidth: 115 },
  horas: { label: 'Horas', className: 'hidden md:table-cell', minWidth: 55, defaultWidth: 70 },
  valor: { label: 'Valor', className: 'hidden lg:table-cell', minWidth: 80, defaultWidth: 110 },
  valorRecebido: { label: 'Valor Recebido', className: 'hidden lg:table-cell', minWidth: 80, defaultWidth: 120 },
  tipoProjeto: { label: 'Tipo Projeto', className: 'hidden lg:table-cell', minWidth: 80, defaultWidth: 110, truncate: true },
  dataInicio: { label: 'Data Início', className: 'hidden md:table-cell', minWidth: 90, defaultWidth: 110 },
  dataEntrega: { label: 'Data Entrega', className: 'hidden md:table-cell', minWidth: 90, defaultWidth: 110 },
  responsavel: { label: 'Responsável', className: 'hidden md:table-cell', minWidth: 100, defaultWidth: 160, truncate: true },
  criadoEm: { label: 'Criado em', className: 'hidden lg:table-cell', minWidth: 90, defaultWidth: 110 },
  atualizadoEm: { label: 'Atualizado em', className: 'hidden lg:table-cell', minWidth: 90, defaultWidth: 110 },
};

export const ALL_COLUMN_KEYS: ColumnKey[] = [
  'nome', 'cliente', 'tipo', 'status', 'prioridade', 'prazo', 'horas', 'valor',
  'valorRecebido', 'tipoProjeto', 'dataInicio', 'dataEntrega', 'responsavel',
  'criadoEm', 'atualizadoEm',
];

export const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = [
  'nome', 'cliente', 'tipo', 'status', 'prioridade', 'prazo', 'horas', 'valor',
];

const STORAGE_KEY = 'mementotask_columns';

export function loadColumnConfig(): ColumnKey[] {
  if (typeof window === 'undefined') return DEFAULT_VISIBLE_COLUMNS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VISIBLE_COLUMNS;
    const parsed = JSON.parse(raw) as string[];
    const valid = parsed.filter((k): k is ColumnKey => k in COLUMN_DEFS);
    if (!valid.includes('nome')) valid.unshift('nome');
    return valid;
  } catch {
    return DEFAULT_VISIBLE_COLUMNS;
  }
}

export function saveColumnConfig(columns: ColumnKey[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
}

const WIDTHS_STORAGE_KEY = 'mementotask_column_widths';

export function loadColumnWidths(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(WIDTHS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveColumnWidths(widths: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WIDTHS_STORAGE_KEY, JSON.stringify(widths));
}

export function getColumnWidth(key: ColumnKey, savedWidths: Record<string, number>): number {
  return savedWidths[key] ?? COLUMN_DEFS[key].defaultWidth ?? 100;
}

export function getVisibleColumnDefs(
  visibleKeys: ColumnKey[],
  excludeKeys: ColumnKey[] = [],
): ColumnDef[] {
  return visibleKeys
    .filter((k) => !excludeKeys.includes(k))
    .map((k) => ({ key: k, ...COLUMN_DEFS[k] }));
}
