'use client';

import { MementotaskProvider, useMementotask } from '@/lib/context';
import { Header } from './Header';
import { TabNav } from './TabNav';
import { FilterBar } from './FilterBar';
import { KanbanBoard } from './kanban/KanbanBoard';
import { TabelaView } from './tabela/TabelaView';
import { ItemFormModal } from './forms/ItemFormModal';
import { ConfirmDialog } from './ui/ConfirmDialog';

function AppContent() {
  const { view, confirmState, cancelDelete, executeDelete, getChildrenOf } = useMementotask();

  const childCount = confirmState.itemId ? getChildrenOf(confirmState.itemId).length : 0;
  const confirmMessage = childCount > 0
    ? `Tem certeza que deseja excluir "${confirmState.itemNome}" e seus ${childCount} item(ns) filho(s)? Esta ação não pode ser desfeita.`
    : `Tem certeza que deseja excluir "${confirmState.itemNome}"? Esta ação não pode ser desfeita.`;

  return (
    <div className="min-h-screen bg-surface-0">
      <Header />
      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
        <TabNav />
        <FilterBar />
        <main className="mt-4">
          {view === 'kanban' && <KanbanBoard />}
          {view === 'tabela' && <TabelaView />}
          {view === 'timeline' && (
            <div className="rounded-lg border border-border bg-surface-1 p-8 text-center text-text-muted">
              Timeline será implementado na próxima fase.
            </div>
          )}
        </main>
      </div>

      <ItemFormModal />
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onConfirm={executeDelete}
        onCancel={cancelDelete}
        title="Excluir item"
        message={confirmMessage}
      />
    </div>
  );
}

export function AppShell() {
  return (
    <MementotaskProvider>
      <AppContent />
    </MementotaskProvider>
  );
}
