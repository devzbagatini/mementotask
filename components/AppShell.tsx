'use client';

import { useState } from 'react';
import { MementotaskProvider, useMementotask } from '@/lib/context';
import { ThemeProvider } from '@/lib/theme';
import { SettingsProvider } from '@/lib/settings-context';
import { ToastProvider } from '@/lib/toast';
import { useToast } from '@/lib/toast';
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
import { LiberView } from './liber/LiberView';
import { DateTimeClock } from './DateTimeClock';
import { PomodoroTimer } from './PomodoroTimer';

function AppContent() {
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

  if (showSettings) {
    return (
      <div className="min-h-screen bg-surface-0">
        <Header onOpenSettings={() => setShowSettings(true)} />
        <SettingsView onBack={() => setShowSettings(false)} />
        <ToastContainer />
      </div>
    );
  }

  if (showLiber) {
    return (
      <div className="min-h-screen bg-surface-0">
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
    </div>
  );
}

export function AppShell() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <ToastProvider>
          <MementotaskProvider>
            <AppContent />
          </MementotaskProvider>
        </ToastProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
