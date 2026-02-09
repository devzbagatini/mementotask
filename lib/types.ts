// ===== Tipos base =====

export type Status = 'a_fazer' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado';
export type KanbanStatus = 'a_fazer' | 'em_andamento' | 'pausado' | 'concluido';
export type Prioridade = 'alta' | 'media' | 'baixa';
export type Tipo = 'projeto' | 'tarefa' | 'subtarefa';
export type ViewType = 'kanban' | 'tabela' | 'timeline' | 'clientes';
export type Permissao = 'view' | 'edit' | 'admin';

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
  workspaceId?: string | null; // NULL = item pessoal (legado)

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
  horas?: number;
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
  horas?: number;
  descricao?: string;
  responsavel?: string;
  tecnologias?: string[];
  notas?: string;
}

export interface FilterState {
  status: Status | 'todos';
  prioridade: Prioridade | 'todas';
  projeto: string;
  cliente: string;
  tarefa: string;
  responsavel: string;
  busca: string;
}

export interface Share {
  id: string;
  itemId: string;
  fromUserId: string;
  toUserId: string;
  permissao: Permissao;
  criadoEm: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

// ===== Workspace Types =====

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Workspace {
  id: string;
  nome: string;
  descricao?: string;
  ownerId: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  email?: string; // join with auth.users
  invitedBy?: string;
  invitedAt: string;
  acceptedAt?: string;
}

export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole;
  memberCount: number;
}
