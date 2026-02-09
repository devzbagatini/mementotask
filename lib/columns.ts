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
}

export const COLUMN_DEFS: Record<ColumnKey, { label: string; className?: string }> = {
  nome: { label: 'Nome' },
  cliente: { label: 'Cliente', className: 'hidden lg:table-cell' },
  tipo: { label: 'Tipo', className: 'hidden sm:table-cell' },
  status: { label: 'Status' },
  prioridade: { label: 'Prioridade', className: 'hidden md:table-cell' },
  prazo: { label: 'Prazo', className: 'hidden md:table-cell' },
  horas: { label: 'Horas', className: 'hidden md:table-cell' },
  valor: { label: 'Valor', className: 'hidden lg:table-cell' },
  valorRecebido: { label: 'Valor Recebido', className: 'hidden lg:table-cell' },
  tipoProjeto: { label: 'Tipo Projeto', className: 'hidden lg:table-cell' },
  dataInicio: { label: 'Data Início', className: 'hidden md:table-cell' },
  dataEntrega: { label: 'Data Entrega', className: 'hidden md:table-cell' },
  responsavel: { label: 'Responsável', className: 'hidden md:table-cell' },
  criadoEm: { label: 'Criado em', className: 'hidden lg:table-cell' },
  atualizadoEm: { label: 'Atualizado em', className: 'hidden lg:table-cell' },
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

export function getVisibleColumnDefs(
  visibleKeys: ColumnKey[],
  excludeKeys: ColumnKey[] = [],
): ColumnDef[] {
  return visibleKeys
    .filter((k) => !excludeKeys.includes(k))
    .map((k) => ({ key: k, ...COLUMN_DEFS[k] }));
}
