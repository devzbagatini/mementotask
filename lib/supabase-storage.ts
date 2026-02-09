import type { Item, ItemCreate, Share, Permissao } from './types';
import { supabase } from './supabase';

export async function loadItems(userId: string): Promise<Item[]> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .or(`user_id.eq.${userId},id.in.(SELECT item_id FROM shares WHERE to_user_id = ${userId})`)
    .order('criado_em', { ascending: true });

  if (error) throw error;
  return data.map(row => ({
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    status: row.status,
    prioridade: row.prioridade,
    parentId: row.parent_id,
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
  }));
}

export async function createItem(userId: string, data: ItemCreate): Promise<Item> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  const now = new Date().toISOString();
  const row = {
    user_id: userId,
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
  return mapRowToItem(result);
}

export async function updateItem(
  id: string,
  changes: Partial<Item>
): Promise<Item> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  const row: any = {
    atualizado_em: new Date().toISOString(),
  };

  if (changes.nome !== undefined) row.nome = changes.nome;
  if (changes.tipo !== undefined) row.tipo = changes.tipo;
  if (changes.status !== undefined) row.status = changes.status;
  if (changes.prioridade !== undefined) row.prioridade = changes.prioridade;
  if (changes.parentId !== undefined) row.parent_id = changes.parentId;
  if (changes.cliente !== undefined) row.cliente = changes.cliente;
  if (changes.valor !== undefined) row.valor = changes.valor;
  if (changes.valorRecebido !== undefined) row.valor_recebido = changes.valorRecebido;
  if (changes.tipoProjeto !== undefined) row.tipo_projeto = changes.tipoProjeto;
  if (changes.dataInicio !== undefined) row.data_inicio = changes.dataInicio;
  if (changes.prazo !== undefined) row.prazo = changes.prazo;
  if (changes.dataEntrega !== undefined) row.data_entrega = changes.dataEntrega;
  if (changes.descricao !== undefined) row.descricao = changes.descricao;
  if (changes.responsavel !== undefined) row.responsavel = changes.responsavel;
  if (changes.tecnologias !== undefined) row.tecnologias = changes.tecnologias;
  if (changes.notas !== undefined) row.notas = changes.notas;
  if (changes.ordem !== undefined) row.ordem = changes.ordem;
  if (changes.horas !== undefined) row.horas = changes.horas;

  const { data: result, error } = await supabase
    .from('items')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRowToItem(result);
}

export async function deleteItem(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}

export async function shareItem(
  itemId: string,
  fromUserId: string,
  toUserEmail: string,
  permissao: Permissao
): Promise<Share> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  const { data: userData } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', toUserEmail)
    .single();

  if (!userData) {
    throw new Error('Usuário não encontrado');
  }

  const { data, error } = await supabase
    .from('shares')
    .insert({
      item_id: itemId,
      from_user_id: fromUserId,
      to_user_id: userData.id,
      permissao,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRowToShare(data);
}

export async function loadShares(userId: string): Promise<Share[]> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  const { data, error } = await supabase
    .from('shares')
    .select('*')
    .eq('to_user_id', userId);

  if (error) throw error;
  return data.map(mapRowToShare);
}

function mapRowToItem(row: any): Item {
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    status: row.status,
    prioridade: row.prioridade,
    parentId: row.parent_id,
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
  };
}

function mapRowToShare(row: any): Share {
  return {
    id: row.id,
    itemId: row.item_id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    permissao: row.permissao,
    criadoEm: row.criado_em,
  };
}
