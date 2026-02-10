'use client';

import { useState } from 'react';
import { useWorkspace } from '@/lib/workspace-context';
import { Building2, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

export function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, loading, createNewWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 text-text-muted">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  async function handleCreate() {
    if (!newWorkspaceName.trim() || isCreating) return;
    setIsCreating(true);
    try {
      await createNewWorkspace(newWorkspaceName, newWorkspaceDesc);
      setShowCreate(false);
      setNewWorkspaceName('');
      setNewWorkspaceDesc('');
    } catch {
      // Toast is shown by the context
    } finally {
      setIsCreating(false);
    }
  }

  const createForm = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Nome do Workspace
        </label>
        <input
          type="text"
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          placeholder="Ex: Projetos Pessoais, Cliente ABC..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-projeto"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Descricao (opcional)
        </label>
        <textarea
          value={newWorkspaceDesc}
          onChange={(e) => setNewWorkspaceDesc(e.target.value)}
          placeholder="Descreva o proposito deste workspace..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-projeto resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => setShowCreate(false)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleCreate}
          disabled={!newWorkspaceName.trim() || isCreating}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-projeto text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Criando...' : 'Criar Workspace'}
        </button>
      </div>
    </div>
  );

  if (workspaces.length === 0) {
    return (
      <>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-projeto text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Criar Workspace</span>
        </button>

        <Modal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          title="Criar Novo Workspace"
        >
          {createForm}
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors min-w-[200px]"
        >
          <Building2 className="h-4 w-4 text-accent-projeto" />
          <span className="text-sm font-medium text-text-primary truncate flex-1 text-left">
            {currentWorkspace?.nome || 'Selecionar Workspace'}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 text-text-muted transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface-1 border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="max-h-60 overflow-y-auto py-1">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setCurrentWorkspace(workspace);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-surface-2 transition-colors",
                    currentWorkspace?.id === workspace.id && "bg-accent-projeto/10"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold",
                    currentWorkspace?.id === workspace.id
                      ? "bg-accent-projeto text-white"
                      : "bg-surface-3 text-text-secondary"
                  )}>
                    {workspace.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      currentWorkspace?.id === workspace.id ? "text-text-primary" : "text-text-secondary"
                    )}>
                      {workspace.nome}
                    </p>
                    <p className="text-xs text-text-muted">
                      {workspace.role === 'owner' ? 'Proprietario' :
                       workspace.role === 'admin' ? 'Administrador' :
                       workspace.role === 'editor' ? 'Editor' : 'Visualizador'}
                      {workspace.memberCount > 1 && ` • ${workspace.memberCount} membros`}
                    </p>
                  </div>
                </button>
              ))}
            </div>

          </div>
        )}
      </div>

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Criar Novo Workspace"
      >
        {createForm}
      </Modal>
    </>
  );
}
