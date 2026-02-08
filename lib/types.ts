// ===== Tipos base =====

export type Status = 'a_fazer' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado';
export type KanbanStatus = 'a_fazer' | 'em_andamento' | 'pausado' | 'concluido';
export type Prioridade = 'alta' | 'media' | 'baixa';
export type Tipo = 'projeto' | 'tarefa' | 'subtarefa';
export type ViewType = 'kanban' | 'tabela' | 'timeline' | 'clientes';

// ===== Constantes =====

export const STATUSES: Status[] = ['a_fazer', 'em_andamento', 'pausado', 'concluido', 'cancelado'];
export const KANBAN_STATUSES: KanbanStatus[] = ['a_fazer', 'em_andamento', 'pausado', 'concluido'];
export const PRIORIDADES: Prioridade[] = ['alta', 'media', 'baixa'];
export const TIPOS: Tipo[] = ['projeto', 'tarefa', 'subtarefa'];

// ===== Labels em português =====

export const STATUS_LABELS: Record<Status, string> = {
  a_fazer: 'A Fazer',
  em_andamento: 'Em Andamento',
  pausado: 'Pausado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const PRIORIDADE_LABELS: Record<Prioridade, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export const TIPO_LABELS: Record<Tipo, string> = {
  projeto: 'Projeto',
  tarefa: 'Tarefa',
  subtarefa: 'Subtarefa',
};

// ===== Interfaces =====

export interface Item {
  id: string;
  nome: string;
  tipo: Tipo;
  status: Status;
  prioridade: Prioridade;
  parentId: string | null;

  // Dados específicos de Projeto
  cliente?: string;
  valor?: number;
  valorRecebido?: number;
  tipoProjeto?: string; // texto livre com autocomplete

  // Datas (armazenadas como ISO string)
  dataInicio?: string;
  prazo?: string;
  dataEntrega?: string;

  // Outras informações
  descricao?: string;
  responsavel?: string;
  tecnologias?: string[];
  notas?: string;

  // Ordenação
  ordem: number;

  // Metadados
  criadoEm: string;
  atualizadoEm: string;
}

export interface ItemCreate {
  nome: string;
  tipo: Tipo;
  status?: Status;
  prioridade?: Prioridade;
  parentId?: string | null;
  ordem?: number;
  cliente?: string;
  valor?: number;
  valorRecebido?: number;
  tipoProjeto?: string;
  dataInicio?: string;
  prazo?: string;
  dataEntrega?: string;
  descricao?: string;
  responsavel?: string;
  tecnologias?: string[];
  notas?: string;
}

export interface FilterState {
  status: Status | 'todos';
  tipoProjeto: string;
  cliente: string;
  busca: string;
}
