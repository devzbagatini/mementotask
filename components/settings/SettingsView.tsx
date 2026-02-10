'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useWorkspace } from '@/lib/workspace-context';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SettingsHeader } from './SettingsHeader';
import { PresetSection } from './PresetSection';
import { ColorSection } from './ColorSection';
import { FontSection } from './FontSection';
import { SettingsPreview } from './SettingsPreview';

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const { currentWorkspace, deleteCurrentWorkspace } = useWorkspace();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <SettingsHeader onBack={onBack} />

      <div className="flex gap-8">
        {/* Settings panels */}
        <div className="flex-1 min-w-0 space-y-8">
          <PresetSection />
          <ColorSection />
          <FontSection />

          {/* Workspace Danger Zone */}
          {currentWorkspace?.role === 'owner' && (
            <div className="rounded-xl border border-priority-alta/20 p-6 space-y-3">
              <h3 className="text-sm font-medium text-priority-alta">Zona de Perigo</h3>
              <p className="text-xs text-text-muted">
                Excluir o workspace "{currentWorkspace.nome}" removerá todos os projetos e membros permanentemente.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-priority-alta/30 text-priority-alta hover:bg-priority-alta/10 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Excluindo...' : 'Excluir Workspace'}
              </button>

              <ConfirmDialog
                isOpen={showDeleteConfirm}
                onCancel={() => setShowDeleteConfirm(false)}
                title="Excluir Workspace"
                message={`Tem certeza que deseja excluir "${currentWorkspace.nome}"? Todos os projetos e membros serão removidos. Esta ação não pode ser desfeita.`}
                onConfirm={async () => {
                  setShowDeleteConfirm(false);
                  setIsDeleting(true);
                  try {
                    await deleteCurrentWorkspace();
                    onBack();
                  } catch {
                    // Error handled in context
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Preview sidebar — hidden on mobile */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-6">
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              Preview
            </h3>
            <SettingsPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
