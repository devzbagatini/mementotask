'use client';

import { useState } from 'react';
import { useWorkspace } from '@/lib/workspace-context';
import { Building2, ChevronDown, Plus, Settings, Users, X } from 'lucide-react';
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

  if (workspaces.length === 0) {
    return (
      <button
        onClick={() => setShowCreate(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-projeto text-white hover:opacity-90 transition-opacity"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm font-medium">Criar Workspace</span>
      </button>
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
                      {workspace.role === 'owner' ? 'Proprietário' : 
                       workspace.role === 'admin' ? 'Administrador' :
                       workspace.role === 'editor' ? 'Editor' : 'Visualizador'}
                      {workspace.memberCount > 1 && ` • ${workspace.memberCount} membros`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="border-t border-border p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCreate(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors text-sm text-text-secondary"
              >
                <Plus className="h-4 w-4" />
                Criar novo workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Criar Novo Workspace"
      >
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
              Descrição (opcional)
            </label>
            <textarea
              value={newWorkspaceDesc}
              onChange={(e) => setNewWorkspaceDesc(e.target.value)}
              placeholder="Descreva o propósito deste workspace..."
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
              onClick={async () => {
                console.log('🖱️ Botão clicado!');
                console.log('   Nome:', newWorkspaceName);
                console.log('   isCreating:', isCreating);
                
                if (!newWorkspaceName.trim() || isCreating) {
                  console.log('⛔ Bloqueado - nome vazio ou já criando');
                  return;
                }
                
                setIsCreating(true);
                console.log('⏳ Iniciando criação...');
                
                try {
                  console.log('📤 Chamando createNewWorkspace...');
                  await createNewWorkspace(newWorkspaceName, newWorkspaceDesc);
                  console.log('✅ Workspace criado com sucesso!');
                  setShowCreate(false);
                  setNewWorkspaceName('');
                  setNewWorkspaceDesc('');
                } catch (error: any) {
                  console.error('❌ Erro ao criar workspace:', error);
                  console.error('   Mensagem:', error.message);
                  console.error('   Código:', error.code);
                  alert('Erro: ' + error.message);
                } finally {
                  setIsCreating(false);
                  console.log('🏁 Finalizado');
                }
              }}
              disabled={!newWorkspaceName.trim() || isCreating}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-projeto text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Criando...' : 'Criar Workspace'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
