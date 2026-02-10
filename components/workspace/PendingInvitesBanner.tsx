'use client';

import { useState } from 'react';
import { useWorkspace } from '@/lib/workspace-context';
import { Mail, Check, X, Users, Loader2 } from 'lucide-react';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
};

export function PendingInvitesBanner() {
  const { pendingInvites, acceptWorkspaceInvite, loadInvites } = useWorkspace();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleInvites = pendingInvites.filter(inv => !dismissedIds.has(inv.id));

  if (visibleInvites.length === 0) return null;

  async function handleAccept(inviteId: string) {
    setAcceptingId(inviteId);
    try {
      await acceptWorkspaceInvite(inviteId);
    } catch {
      // Toast is shown by context
    } finally {
      setAcceptingId(null);
    }
  }

  function handleDismiss(inviteId: string) {
    setDismissedIds(prev => new Set(prev).add(inviteId));
  }

  return (
    <div className="bg-surface-1 border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        {visibleInvites.map((invite) => {
          const workspace = invite.workspaces;
          const workspaceName = workspace?.nome || 'Workspace';
          const isAccepting = acceptingId === invite.id;

          return (
            <div
              key={invite.id}
              className="flex items-center justify-between gap-4 py-3 border-b border-border/50 last:border-b-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-accent-projeto/10 flex items-center justify-center">
                  <Mail className="h-4.5 w-4.5 text-accent-projeto" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    Convite para <span className="text-accent-projeto">{workspaceName}</span>
                  </p>
                  <p className="text-xs text-text-muted">
                    {roleLabels[invite.role] || invite.role}
                    {workspace?.descricao && ` — ${workspace.descricao}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAccept(invite.id)}
                  disabled={isAccepting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent-projeto text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isAccepting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Aceitar
                </button>
                <button
                  onClick={() => handleDismiss(invite.id)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                  title="Dispensar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
