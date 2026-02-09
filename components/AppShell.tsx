'use client';

import { useState } from 'react';
import { MementotaskProvider, useMementotask } from '@/lib/context';
import { AuthProvider } from '@/lib/auth-context';
import { WorkspaceProvider } from '@/lib/workspace-context';
import { ThemeProvider } from '@/lib/theme';
import { SettingsProvider } from '@/lib/settings-context';
import { ToastProvider } from '@/lib/toast';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from '@/lib/workspace-context';
import { BookOpen } from 'lucide-react';
import { Header } from './Header';
import { TabNav } from './TabNav';
import { FilterBar } from './FilterBar';
import { KanbanBoard } from './kanban/KanbanBoard';
import { TabelaView } from './tabela/TabelaView';
import { ClientesView } from './clientes/ClientesView';
import { TimelineView } from './timeline/TimelineView';
import { DashboardPanel } from './DashboardPanel';
import { ItemFormModal } from './forms/ItemFormModal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { ToastContainer } from './ui/Toast';
import { SettingsView } from './settings/SettingsView';
import { AuthPage } from './auth/AuthPage';
import { LiberView } from './liber/LiberView';
import { DateTimeClock } from './DateTimeClock';
import { PomodoroTimer } from './PomodoroTimer';
import { WelcomeModal } from './WelcomeModal';
import { useRealtimeUpdates } from '@/lib/hooks/useRealtimeUpdates';
import { RefreshCw, X } from 'lucide-react';

function RealtimeBanner() {
  const { hasUpdate, message, dismiss } = useRealtimeUpdates();
  const { reloadItems } = useMementotask();
  const { refreshMembers, refreshWorkspaces } = useWorkspace();

  if (!hasUpdate) return null;

  async function handleRefresh() {
    await Promise.all([reloadItems(), refreshMembers(), refreshWorkspaces()]);
    dismiss();
  }

  return (
    <div className="bg-accent-projeto text-white text-sm">
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-4 py-2 sm:px-6">
        <span>{message}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar
          </button>
          <button
            onClick={dismiss}
            className="p-1 rounded-md hover:bg-white/20 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const { view, confirmState, cancelDelete, executeDelete, getChildrenOf } = useMementotask();
  const { addToast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showLiber, setShowLiber] = useState(false);

  const childCount = confirmState.itemId ? getChildrenOf(confirmState.itemId).length : 0;
  const confirmMessage = childCount > 0
    ? `Tem certeza que deseja excluir "${confirmState.itemNome}" e seus ${childCount} item(ns) filho(s)? Esta ação não pode ser desfeita.`
    : `Tem certeza que deseja excluir "${confirmState.itemNome}"? Esta ação não pode ser desfeita.`;

  function handleDelete() {
    const nome = confirmState.itemNome;
    executeDelete();
    addToast(`"${nome}" excluído com sucesso`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0">
        <div className="text-text-muted">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-surface-0">
        <RealtimeBanner />
        <Header onOpenSettings={() => setShowSettings(true)} />
        <SettingsView onBack={() => setShowSettings(false)} />
        <ToastContainer />
      </div>
    );
  }

  if (showLiber) {
    return (
      <div className="min-h-screen bg-surface-0">
        <RealtimeBanner />
        <Header onOpenSettings={() => { setShowLiber(false); setShowSettings(true); }} />
        <LiberView onBack={() => setShowLiber(false)} />
        <ToastContainer />
      </div>
    );
  }

  const tabRightContent = (
    <>
      <button
        onClick={() => setShowLiber(true)}
        className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
        title="Liber — Ditados & Playlists"
      >
        <BookOpen className="h-5 w-5" />
      </button>
      <PomodoroTimer />
      <DateTimeClock />
    </>
  );

  return (
    <div className="min-h-screen bg-surface-0">
      <RealtimeBanner />
      <Header onOpenSettings={() => setShowSettings(true)} />
      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
        <DashboardPanel />
        <div className="mt-6">
          <TabNav rightContent={tabRightContent} />
        </div>
        <FilterBar />
        <main className="mt-4">
          {view === 'kanban' && <KanbanBoard />}
          {view === 'tabela' && <TabelaView />}
          {view === 'timeline' && <TimelineView />}
          {view === 'clientes' && <ClientesView />}
        </main>
      </div>

      <ItemFormModal />
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
        title="Excluir item"
        message={confirmMessage}
      />
      <ToastContainer />
      <WelcomeModal />
    </div>
  );
}

export function AppShell() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          <ToastProvider>
            <WorkspaceProvider>
              <MementotaskProvider>
                <AppContent />
              </MementotaskProvider>
            </WorkspaceProvider>
          </ToastProvider>
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
