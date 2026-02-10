'use client';

import { useState } from 'react';
import { useWorkspace } from '@/lib/workspace-context';
import { useAuth } from '@/lib/auth-context';
import { Users, Mail, Shield, UserMinus, Clock, Check, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador', description: 'Pode gerenciar membros e projetos' },
  { value: 'editor', label: 'Editor', description: 'Pode criar e editar projetos' },
  { value: 'viewer', label: 'Visualizador', description: 'Apenas visualiza projetos' },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
};

export function WorkspaceShare() {
  const { user } = useAuth();
  const {
    currentWorkspace, members, sentInvites,
    inviteToWorkspace, removeFromWorkspace, changeMemberRole,
    cancelInvite,
  } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);

  if (!currentWorkspace || currentWorkspace.role === 'viewer') return null;

  const canManageMembers = currentWorkspace.role === 'owner' || currentWorkspace.role === 'admin';
  const pendingSentInvites = sentInvites.filter(i => !i.acceptedAt);
  const acceptedSentInvites = sentInvites.filter(i => i.acceptedAt);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
      >
        <Users className="h-4 w-4 text-text-muted" />
        <span className="text-sm text-text-secondary">
          {currentWorkspace.memberCount > 1
            ? `${currentWorkspace.memberCount} membros`
            : 'Compartilhar'}
        </span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Compartilhar "${currentWorkspace.nome}"`}
      >
        <div className="space-y-6">
          {/* Invite Section */}
          {canManageMembers && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">Convidar Membro</h3>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-projeto"
                  />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-border bg-surface-2 text-text-primary text-sm focus:outline-none focus:border-accent-projeto"
                >
                  {ROLE_OPTIONS.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={async () => {
                  if (!email.trim()) return;
                  setIsInviting(true);
                  try {
                    await inviteToWorkspace(email, selectedRole);
                    setEmail('');
                  } catch (error) {
                    // Error handled in context
                  } finally {
                    setIsInviting(false);
                  }
                }}
                disabled={!email.trim() || isInviting}
                className="w-full py-2 rounded-lg bg-accent-projeto text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInviting ? 'Enviando convite...' : 'Enviar Convite'}
              </button>
            </div>
          )}

          {/* Pending Invites */}
          {pendingSentInvites.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">
                Convites Pendentes ({pendingSentInvites.length})
              </h3>
              <div className="space-y-2">
                {pendingSentInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2">
                    <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{invite.email}</p>
                      <p className="text-xs text-text-muted">
                        {ROLE_LABELS[invite.role] || invite.role} — aguardando
                      </p>
                    </div>
                    {canManageMembers && (
                      <button
                        onClick={() => cancelInvite(invite.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-priority-alta hover:bg-priority-alta/10 transition-colors"
                        title="Cancelar convite"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Membros ({members.length + 1})
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {/* Owner */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2">
                <div className="h-8 w-8 rounded-full bg-accent-projeto flex items-center justify-center text-white text-sm font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'V'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {currentWorkspace.role === 'owner' ? `Você (${user?.email || ''})` : 'Proprietário'}
                  </p>
                  <p className="text-xs text-text-muted">Proprietário</p>
                </div>
                <Shield className="h-4 w-4 text-accent-projeto" />
              </div>

              {/* Other Members */}
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-2"
                >
                  <div className="h-8 w-8 rounded-full bg-surface-3 flex items-center justify-center text-text-secondary text-sm font-bold">
                    {member.email?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {member.email || 'Usuário'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {ROLE_LABELS[member.role] || member.role}
                    </p>
                  </div>

                  {canManageMembers && member.userId !== currentWorkspace.ownerId && (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => changeMemberRole(member.userId, e.target.value as any)}
                        className="px-2 py-1 rounded text-xs border border-border bg-surface-1 text-text-primary focus:outline-none focus:border-accent-projeto"
                      >
                        {ROLE_OPTIONS.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => removeFromWorkspace(member.userId)}
                        className="p-1.5 rounded-lg text-priority-alta hover:bg-priority-alta/10 transition-colors"
                        title="Remover membro"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {members.length === 0 && pendingSentInvites.length === 0 && (
                <p className="text-center text-sm text-text-muted py-4">
                  Nenhum membro convidado ainda.
                </p>
              )}
            </div>
          </div>

          {/* Accepted Invites History */}
          {acceptedSentInvites.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">
                Convites Aceitos ({acceptedSentInvites.length})
              </h3>
              <div className="space-y-2">
                {acceptedSentInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 opacity-70">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{invite.email}</p>
                      <p className="text-xs text-text-muted">{ROLE_LABELS[invite.role] || invite.role} — aceito</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-3 rounded-lg bg-surface-2 text-xs text-text-muted space-y-1">
            <p><strong>Proprietário:</strong> Controle total do workspace</p>
            <p><strong>Administrador:</strong> Gerencia membros e projetos</p>
            <p><strong>Editor:</strong> Cria e edita projetos</p>
            <p><strong>Visualizador:</strong> Apenas visualiza</p>
          </div>

        </div>
      </Modal>

    </>
  );
}
