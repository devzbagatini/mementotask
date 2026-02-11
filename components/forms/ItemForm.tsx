'use client';

import { useState, useMemo, useRef, type FormEvent } from 'react';
import type { Item, ItemCreate, Tipo, Status, Prioridade } from '@/lib/types';
import { STATUSES, STATUS_LABELS, PRIORIDADES, PRIORIDADE_LABELS } from '@/lib/types';
import { useMementotask } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from '@/lib/workspace-context';
import { Briefcase, ListTodo, User } from 'lucide-react';

interface ItemFormProps {
  tipo: Tipo;
  parentId?: string | null;
  defaultStatus?: string;
  item?: Item; // existing item for edit mode
  onSubmit: (data: ItemCreate | { id: string; changes: Partial<Item> }) => void;
  onCancel: () => void;
}

export function ItemForm({ tipo, parentId, defaultStatus, item, onSubmit, onCancel }: ItemFormProps) {
  const isEdit = !!item;
  const { items, uniqueResponsaveis } = useMementotask();
  const { user } = useAuth();
  const { members, sentInvites, currentWorkspace } = useWorkspace();
  const uniqueTipoProjeto = [...new Set(items.filter(i => i.tipoProjeto).map(i => i.tipoProjeto!))];

  // Form state
  const [nome, setNome] = useState(item?.nome ?? '');
  const [status, setStatus] = useState<Status>(item?.status ?? (defaultStatus as Status) ?? 'a_fazer');
  const [prioridade, setPrioridade] = useState<Prioridade>(item?.prioridade ?? 'media');
  const [prazo, setPrazo] = useState(item?.prazo ? item.prazo.slice(0, 10) : '');
  const [horas, setHoras] = useState(item?.horas?.toString() ?? '');
  const [descricao, setDescricao] = useState(item?.descricao ?? '');
  const [responsavel, setResponsavel] = useState(item?.responsavel ?? '');
  const [notas, setNotas] = useState(item?.notas ?? '');

  // Project-specific
  const [cliente, setCliente] = useState(item?.cliente ?? '');
  const [valor, setValor] = useState(item?.valor?.toString() ?? '');
  const [valorRecebido, setValorRecebido] = useState(item?.valorRecebido?.toString() ?? '');
  const [tipoProjeto, setTipoProjeto] = useState(item?.tipoProjeto ?? '');
  const [tecnologias, setTecnologias] = useState(item?.tecnologias?.join(', ') ?? '');

  // Parent selection for create mode
  const [selectedParentId, setSelectedParentId] = useState<string>(parentId ?? '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMentions, setShowMentions] = useState(false);
  const responsavelRef = useRef<HTMLInputElement>(null);

  // Build mention suggestions: current user + existing responsaveis + invite emails
  const mentionSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    if (user?.email) suggestions.add(user.email);
    for (const r of uniqueResponsaveis) suggestions.add(r);
    for (const inv of sentInvites) {
      if (inv.acceptedAt) suggestions.add(inv.email);
    }
    return [...suggestions].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [user?.email, uniqueResponsaveis, sentInvites]);

  // Build ancestry info (for tarefa/subtarefa context display)
  const ancestry = useMemo(() => {
    const resolvedParentId = item?.parentId ?? parentId ?? selectedParentId;
    if (!resolvedParentId) return null;

    const chain: Item[] = [];
    let current = items.find((i) => i.id === resolvedParentId);
    while (current) {
      chain.unshift(current);
      current = current.parentId ? items.find((i) => i.id === current!.parentId) : undefined;
    }

    const projeto = chain.find((i) => i.tipo === 'projeto');
    const tarefa = chain.find((i) => i.tipo === 'tarefa');

    return {
      projeto: projeto?.nome,
      cliente: projeto?.cliente,
      tarefa: tarefa?.nome,
    };
  }, [items, item?.parentId, parentId, selectedParentId]);

  // Get valid parent options
  const parentOptions = tipo === 'tarefa'
    ? items.filter((i) => i.tipo === 'projeto')
    : tipo === 'subtarefa'
    ? items.filter((i) => i.tipo === 'tarefa')
    : [];

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (valor && isNaN(Number(valor))) newErrors.valor = 'Valor deve ser numérico';
    if (valorRecebido && isNaN(Number(valorRecebido))) newErrors.valorRecebido = 'Valor deve ser numérico';
    if ((tipo === 'tarefa' || tipo === 'subtarefa') && !isEdit && !selectedParentId) {
      newErrors.parentId = tipo === 'tarefa' ? 'Selecione um projeto' : 'Selecione uma tarefa';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const commonFields = {
      nome: nome.trim(),
      status,
      prioridade,
      prazo: prazo || undefined,
      horas: horas ? Number(horas) : undefined,
      descricao: descricao.trim() || undefined,
      responsavel: responsavel.trim() || undefined,
      notas: notas.trim() || undefined,
    };

    const projectFields = tipo === 'projeto' ? {
      cliente: cliente.trim() || undefined,
      valor: valor ? Number(valor) : undefined,
      valorRecebido: valorRecebido ? Number(valorRecebido) : undefined,
      tipoProjeto: tipoProjeto.trim() || undefined,
      tecnologias: tecnologias.trim() ? tecnologias.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    } : {};

    if (isEdit) {
      onSubmit({ id: item!.id, changes: { ...commonFields, ...projectFields } });
    } else {
      const resolvedParentId = tipo === 'projeto' ? null : selectedParentId || parentId || null;
      const data: ItemCreate = {
        ...commonFields,
        ...projectFields,
        tipo,
        parentId: resolvedParentId,
      };
      onSubmit(data);
    }
  }

  const inputClass = 'w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-projeto';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1';
  const errorClass = 'text-xs text-priority-alta mt-1';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Ancestry context */}
      {ancestry && (ancestry.projeto || ancestry.tarefa) && (
        <div className="rounded-xl bg-surface-2 border border-border px-4 py-3 space-y-1.5">
          {ancestry.projeto && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-accent-projeto shrink-0" />
              <span className="text-text-muted">Projeto:</span>
              <span className="text-text-primary font-medium">{ancestry.projeto}</span>
            </div>
          )}
          {ancestry.cliente && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-text-muted shrink-0" />
              <span className="text-text-muted">Cliente:</span>
              <span className="text-text-primary font-medium">{ancestry.cliente}</span>
            </div>
          )}
          {ancestry.tarefa && tipo === 'subtarefa' && (
            <div className="flex items-center gap-2 text-sm">
              <ListTodo className="h-4 w-4 text-accent-tarefa shrink-0" />
              <span className="text-text-muted">Tarefa:</span>
              <span className="text-text-primary font-medium">{ancestry.tarefa}</span>
            </div>
          )}
        </div>
      )}

      {/* Nome */}
      <div>
        <label className={labelClass}>Nome *</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={inputClass}
          placeholder="Nome do item"
          autoFocus
        />
        {errors.nome && <p className={errorClass}>{errors.nome}</p>}
      </div>

      {/* Parent selection (create mode, non-project) */}
      {!isEdit && tipo !== 'projeto' && (
        <div>
          <label className={labelClass}>
            {tipo === 'tarefa' ? 'Projeto *' : 'Tarefa *'}
          </label>
          <select
            value={selectedParentId}
            onChange={(e) => setSelectedParentId(e.target.value)}
            className={inputClass}
          >
            <option value="">Selecione...</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          {errors.parentId && <p className={errorClass}>{errors.parentId}</p>}
        </div>
      )}

      {/* Status & Prioridade */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Prioridade</label>
          <select value={prioridade} onChange={(e) => setPrioridade(e.target.value as Prioridade)} className={inputClass}>
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>{PRIORIDADE_LABELS[p]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Prazo + Horas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Prazo</label>
          <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} className={inputClass} />
          {prazo && (() => {
            const diff = Math.ceil((new Date(prazo + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
            if (diff < 0) return <p className="text-xs text-priority-alta font-medium mt-1">{Math.abs(diff)} dia(s) atrasado</p>;
            if (diff === 0) return <p className="text-xs text-status-pausado font-medium mt-1">Vence hoje</p>;
            return <p className="text-xs text-text-muted mt-1">{diff} dia(s) restante(s)</p>;
          })()}
        </div>
        <div>
          <label className={labelClass}>Horas estimadas</label>
          <input type="number" min="0" step="0.5" value={horas} onChange={(e) => setHoras(e.target.value)} className={inputClass} placeholder="0" />
        </div>
      </div>

      {/* Responsável */}
      <div className="relative">
        <label className={labelClass}>Responsável</label>
        <input
          ref={responsavelRef}
          type="text"
          value={responsavel}
          onChange={(e) => {
            setResponsavel(e.target.value);
            setShowMentions(e.target.value.endsWith('@') || (e.target.value.includes('@') && showMentions));
          }}
          onKeyDown={(e) => {
            if (e.key === '@') setShowMentions(true);
            if (e.key === 'Escape') setShowMentions(false);
          }}
          onFocus={() => {
            if (responsavel.endsWith('@')) setShowMentions(true);
          }}
          onBlur={() => setTimeout(() => setShowMentions(false), 200)}
          className={inputClass}
          placeholder="Digite @ para mencionar"
        />
        {showMentions && mentionSuggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface-1 border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {mentionSuggestions
              .filter((s) => {
                const afterAt = responsavel.split('@').pop()?.toLowerCase() || '';
                return afterAt === '' || s.toLowerCase().includes(afterAt);
              })
              .map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const atIndex = responsavel.lastIndexOf('@');
                  const before = atIndex >= 0 ? responsavel.slice(0, atIndex) : responsavel;
                  setResponsavel((before + suggestion).trim());
                  setShowMentions(false);
                  responsavelRef.current?.focus();
                }}
                className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-2 transition-colors flex items-center gap-2"
              >
                <User className="h-3.5 w-3.5 text-text-muted" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Project-specific fields */}
      {tipo === 'projeto' && (
        <>
          <div>
            <label className={labelClass}>Cliente</label>
            <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} className={inputClass} placeholder="Nome do cliente" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input type="text" value={valor} onChange={(e) => setValor(e.target.value)} className={inputClass} placeholder="0.00" />
              {errors.valor && <p className={errorClass}>{errors.valor}</p>}
            </div>
            <div>
              <label className={labelClass}>Valor Recebido (R$)</label>
              <input type="text" value={valorRecebido} onChange={(e) => setValorRecebido(e.target.value)} className={inputClass} placeholder="0.00" />
              {errors.valorRecebido && <p className={errorClass}>{errors.valorRecebido}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Tipo de Projeto</label>
            <input
              type="text"
              list="tipoProjetoList"
              value={tipoProjeto}
              onChange={(e) => setTipoProjeto(e.target.value)}
              className={inputClass}
              placeholder="Ex: Web, Mobile, API..."
            />
            <datalist id="tipoProjetoList">
              {uniqueTipoProjeto.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div>
            <label className={labelClass}>Tecnologias</label>
            <input type="text" value={tecnologias} onChange={(e) => setTecnologias(e.target.value)} className={inputClass} placeholder="React, Node.js, PostgreSQL..." />
          </div>
        </>
      )}

      {/* Descrição */}
      <div>
        <label className={labelClass}>Descrição</label>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className={inputClass + ' min-h-[80px] resize-y'} placeholder="Descrição do item..." />
      </div>

      {/* Notas */}
      <div>
        <label className={labelClass}>Notas</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} className={inputClass + ' min-h-[60px] resize-y'} placeholder="Notas adicionais..." />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-xl bg-accent-projeto px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          {isEdit ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}
