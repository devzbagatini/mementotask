import type { Workspace, WorkspaceMember, WorkspaceWithRole } from './types';
import { supabase } from './supabase';

// Workspaces
export async function loadWorkspaces(userId: string): Promise<WorkspaceWithRole[]> {
  if (!supabase) throw new Error('Supabase not configured');

  // Simplificado: apenas workspaces do dono (evita recursão RLS)
  const { data: ownedWorkspaces, error: ownedError } = await supabase
    .from('workspaces')
    .select('*');

  if (ownedError) throw ownedError;

  // Filtrar apenas os que o usuário é dono (RLS já faz isso, mas garantimos)
  const userWorkspaces = ownedWorkspaces?.filter(ws => ws.owner_id === userId) || [];

  // Contar membros
  const workspaces: WorkspaceWithRole[] = [];
  
  for (const ws of userWorkspaces) {
    const { count } = await supabase
      .from('workspace_members')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', ws.id);
      
    workspaces.push({
      id: ws.id,
      nome: ws.nome,
      descricao: ws.descricao,
      ownerId: ws.owner_id,
      criadoEm: ws.criado_em,
      atualizadoEm: ws.atualizado_em,
      role: 'owner',
      memberCount: (count || 0) + 1,
    });
  }

  return workspaces;
}

export async function createWorkspace(userId: string, nome: string, descricao?: string): Promise<Workspace> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      nome,
      descricao,
      owner_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    ownerId: data.owner_id,
    criadoEm: data.criado_em,
    atualizadoEm: data.atualizado_em,
  };
}

export async function updateWorkspace(id: string, changes: Partial<Workspace>): Promise<Workspace> {
  if (!supabase) throw new Error('Supabase not configured');

  const row: any = {};
  if (changes.nome !== undefined) row.nome = changes.nome;
  if (changes.descricao !== undefined) row.descricao = changes.descricao;

  const { data, error } = await supabase
    .from('workspaces')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    ownerId: data.owner_id,
    criadoEm: data.criado_em,
    atualizadoEm: data.atualizado_em,
  };
}

export async function deleteWorkspace(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Workspace Invites
export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceMember['role'],
  invitedBy: string
): Promise<{ id: string; email: string; role: string; invitedAt: string }> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('workspace_invites')
    .insert({
      workspace_id: workspaceId,
      email: email.toLowerCase().trim(),
      role,
      invited_by: invitedBy,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Convite já enviado para este email neste workspace.');
    }
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    invitedAt: data.invited_at,
  };
}

// Accept invite
export async function acceptInvite(inviteId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .rpc('accept_workspace_invite', {
      invite_id: inviteId,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });

  if (error) throw error;
}

// Load pending invites for current user
export async function loadPendingInvites(): Promise<any[]> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('workspace_invites')
    .select(`
      id,
      workspace_id,
      role,
      invited_at,
      workspaces(nome, descricao, owner_id)
    `)
    .eq('email', user.email)
    .is('accepted_at', null);

  if (error) throw error;
  return data || [];
}

export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceMember['role']
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function loadWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId);

  if (error) throw error;

  return data.map(m => ({
    id: m.id,
    workspaceId: m.workspace_id,
    userId: m.user_id,
    role: m.role,
    invitedBy: m.invited_by,
    invitedAt: m.invited_at,
    acceptedAt: m.accepted_at,
  }));
}

// Items com workspace
export async function loadItemsByWorkspace(workspaceId: string | null, userId: string): Promise<Item[]> {
  if (!supabase) throw new Error('Supabase not configured');

  // Query simplificada - apenas itens do usuário (RLS filtra)
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .order('criado_em', { ascending: true });

  if (error) {
    console.error('Error loading items:', error);
    throw error;
  }
  return data.map(row => ({
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    status: row.status,
    prioridade: row.prioridade,
    parentId: row.parent_id,
    workspaceId: row.workspace_id,
    cliente: row.cliente,
    valor: row.valor,
    valorRecebido: row.valor_recebido,
    tipoProjeto: row.tipo_projeto,
    dataInicio: row.data_inicio,
    prazo: row.prazo,
    dataEntrega: row.data_entrega,
    descricao: row.descricao,
    responsavel: row.responsavel,
    tecnologias: row.tecnologias,
    notas: row.notas,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    ordem: row.ordem || 0,
    horas: row.horas,
  }));
}

import type { Item } from './types';

export async function createItemInWorkspace(
  userId: string,
  workspaceId: string | null,
  data: import('./types').ItemCreate
): Promise<Item> {
  if (!supabase) throw new Error('Supabase not configured');

  const row = {
    user_id: userId,
    workspace_id: workspaceId,
    parent_id: data.parentId || null,
    nome: data.nome,
    tipo: data.tipo,
    status: data.status ?? 'a_fazer',
    prioridade: data.prioridade ?? 'media',
    cliente: data.cliente,
    valor: data.valor,
    valor_recebido: data.valorRecebido,
    tipo_projeto: data.tipoProjeto,
    data_inicio: data.dataInicio,
    prazo: data.prazo,
    data_entrega: data.dataEntrega,
    descricao: data.descricao,
    responsavel: data.responsavel,
    tecnologias: data.tecnologias,
    notas: data.notas,
    ordem: data.ordem || 1,
  };

  const { data: result, error } = await supabase
    .from('items')
    .insert(row)
    .select()
    .single();

  if (error) throw error;

  return {
    id: result.id,
    nome: result.nome,
    tipo: result.tipo,
    status: result.status,
    prioridade: result.prioridade,
    parentId: result.parent_id,
    workspaceId: result.workspace_id,
    cliente: result.cliente,
    valor: result.valor,
    valorRecebido: result.valor_recebido,
    tipoProjeto: result.tipo_projeto,
    dataInicio: result.data_inicio,
    prazo: result.prazo,
    dataEntrega: result.data_entrega,
    descricao: result.descricao,
    responsavel: result.responsavel,
    tecnologias: result.tecnologias,
    notas: result.notas,
    criadoEm: result.criado_em,
    atualizadoEm: result.atualizado_em,
    ordem: result.ordem || 0,
    horas: result.horas,
  };
}
