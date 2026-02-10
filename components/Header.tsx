'use client';

import { useState } from 'react';
import { Plus, Sun, Moon, Monitor, Hourglass, Settings, LogOut, User, Building2 } from 'lucide-react';
import { useMementotask } from '@/lib/context';
import { useTheme, type ThemeMode } from '@/lib/theme';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from '@/lib/workspace-context';
import { WorkspaceSwitcher } from './workspace/WorkspaceSwitcher';
import { WorkspaceShare } from './workspace/WorkspaceShare';
import { Modal } from './ui/Modal';

const THEME_ICONS: Record<ThemeMode, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const THEME_LABELS: Record<ThemeMode, string> = {
  system: 'Tema: Sistema',
  light: 'Tema: Claro',
  dark: 'Tema: Escuro',
};

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { openCreateModal } = useMementotask();
  const { mode, cycleMode } = useTheme();
  const { user, signOut } = useAuth();
  const { createNewWorkspace } = useWorkspace();
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [wsName, setWsName] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [creatingWs, setCreatingWs] = useState(false);

  async function handleCreateWorkspace() {
    if (!wsName.trim() || creatingWs) return;
    setCreatingWs(true);
    try {
      await createNewWorkspace(wsName, wsDesc);
      setShowCreateWs(false);
      setWsName('');
      setWsDesc('');
    } catch {
      // Toast shown by context
    } finally {
      setCreatingWs(false);
    }
  }

  const ThemeIcon = THEME_ICONS[mode];

  return (
    <header className="border-b border-border bg-surface-1 font-ui">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Hourglass className="h-6 w-6 text-accent-projeto" />
            <h1 className="text-xl font-bold text-text-primary leading-tight hidden sm:block font-heading">
              Mementotask
            </h1>
          </div>
          <div className="h-6 w-px bg-border hidden md:block" />
          <WorkspaceSwitcher />
        </div>
        <div className="flex items-center gap-2">
          <WorkspaceShare />
          <button
            onClick={signOut}
            className="rounded-xl p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
          {user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 text-text-secondary text-sm">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{user.email}</span>
            </div>
          )}
          <button
            onClick={onOpenSettings}
            className="rounded-xl p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
            title="Configuracoes"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={cycleMode}
            className="rounded-xl p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
            title={THEME_LABELS[mode]}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowCreateWs(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-3 transition-colors"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Workspace</span>
          </button>
          <button
            onClick={() => openCreateModal('projeto')}
            className="flex items-center gap-2 rounded-xl bg-accent-projeto px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Projeto</span>
          </button>
        </div>
      </div>

      <Modal isOpen={showCreateWs} onClose={() => setShowCreateWs(false)} title="Criar Novo Workspace">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Workspace</label>
            <input
              type="text"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              placeholder="Ex: Projetos Pessoais, Cliente ABC..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-projeto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Descricao (opcional)</label>
            <textarea
              value={wsDesc}
              onChange={(e) => setWsDesc(e.target.value)}
              placeholder="Descreva o proposito deste workspace..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-projeto resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreateWs(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleCreateWorkspace}
              disabled={!wsName.trim() || creatingWs}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-projeto text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingWs ? 'Criando...' : 'Criar Workspace'}
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
