'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './auth-context';
import { useToast } from './toast';
import type { Workspace, WorkspaceWithRole, WorkspaceMember, WorkspaceInvite } from './types';
import {
  loadWorkspaces,
  createWorkspace,
  createDefaultWorkspaceIfNeeded,
  createItemInWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  updateMemberRole,
  loadWorkspaceMembers,
  loadWorkspaceInvites,
  deleteInvite,
  loadPendingInvites,
  acceptInvite,
} from './workspace-storage';
import { supabase } from './supabase';
import { EXAMPLE_PROJECT } from './mock-data';

interface WorkspaceInviteItem {
  id: string;
  email: string;
  role: string;
  invitedAt: string;
  acceptedAt: string | null;
}

interface WorkspaceContextValue {
  workspaces: WorkspaceWithRole[];
  currentWorkspace: WorkspaceWithRole | null;
  members: WorkspaceMember[];
  pendingInvites: any[];
  sentInvites: WorkspaceInviteItem[];
  loading: boolean;
  setCurrentWorkspace: (workspace: WorkspaceWithRole | null) => void;
  createNewWorkspace: (nome: string, descricao?: string) => Promise<void>;
  updateCurrentWorkspace: (changes: Partial<Workspace>) => Promise<void>;
  deleteCurrentWorkspace: () => Promise<void>;
  inviteToWorkspace: (email: string, role: WorkspaceMember['role']) => Promise<void>;
  removeFromWorkspace: (userId: string) => Promise<void>;
  changeMemberRole: (userId: string, role: WorkspaceMember['role']) => Promise<void>;
  cancelInvite: (inviteId: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  loadInvites: () => Promise<void>;
  acceptWorkspaceInvite: (inviteId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const STORAGE_KEY = 'mementotask_current_workspace';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<WorkspaceWithRole | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [sentInvites, setSentInvites] = useState<WorkspaceInviteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  // Load workspaces and pending invites on mount
  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspaceState(null);
      setPendingInvites([]);
      setLoading(false);
      return;
    }

    loadUserWorkspaces();
    loadInvites();
  }, [user]);

  // Load members and invites when workspace changes
  useEffect(() => {
    if (currentWorkspace?.id) {
      loadMembers();
      loadSentInvites();
    } else {
      setMembers([]);
      setSentInvites([]);
    }
  }, [currentWorkspace?.id]);

  async function loadUserWorkspaces() {
    if (!user) return;
    if (loadingRef.current) return;
    loadingRef.current = true;

    setLoading(true);
    try {
      // Primeiro: criar workspace padrão se necessário (de forma idempotente)
      const workspace = await createDefaultWorkspaceIfNeeded(user.id);
      
      // Segundo: carregar workspaces
      let data = await loadWorkspaces(user.id);

      // Terceiro: seed example project APENAS se criou workspace agora
      if (workspace) {
        const hasProjects = data.some(w => w.id === workspace.id);
        if (hasProjects) {
          const { data: items } = await supabase!
            .from('items')
            .select('id')
            .eq('workspace_id', workspace.id)
            .limit(1);

          if (!items || items.length === 0) {
            // Mapear IDs antigos (hardcoded) para novos UUIDs do Supabase
            const idMap = new Map<string, string>();

            // Inserir em ordem: projetos primeiro, depois tarefas, depois subtarefas
            const sorted = [...EXAMPLE_PROJECT].sort((a, b) => {
              const order = { projeto: 0, tarefa: 1, subtarefa: 2 };
              return (order[a.tipo] ?? 3) - (order[b.tipo] ?? 3);
            });

            for (const item of sorted) {
              const mappedParentId = item.parentId ? idMap.get(item.parentId) ?? null : null;
              const created = await createItemInWorkspace(user.id, workspace.id, {
                ...item,
                parentId: mappedParentId,
              });
              idMap.set(item.id, created.id);
            }
          }
        }
        data = await loadWorkspaces(user.id);
      }

      setWorkspaces(data);

      // Restore from localStorage or use a workspace
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const saved = data.find(w => w.id === savedId);
        if (saved) {
          setCurrentWorkspaceState(saved);
        } else {
          // Prioritize shared workspace (not owner) over personal workspace
          const sharedWs = data.find(w => w.role !== 'owner');
          if (sharedWs) {
            setCurrentWorkspaceState(sharedWs);
          } else if (data.length > 0) {
            setCurrentWorkspaceState(data[0]);
          }
          if (data.length > 0) {
            localStorage.setItem(STORAGE_KEY, (sharedWs || data[0]).id);
          }
        }
      } else {
        // Prioritize shared workspace (not owner) over personal workspace
        const sharedWs = data.find(w => w.role !== 'owner');
        if (sharedWs) {
          setCurrentWorkspaceState(sharedWs);
          localStorage.setItem(STORAGE_KEY, sharedWs.id);
        } else if (data.length > 0) {
          setCurrentWorkspaceState(data[0]);
          localStorage.setItem(STORAGE_KEY, data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
      addToast('Erro ao carregar workspaces');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }

  async function loadMembers() {
    if (!currentWorkspace?.id) return;

    try {
      const data = await loadWorkspaceMembers(currentWorkspace.id);
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  }

  async function loadSentInvites() {
    if (!currentWorkspace?.id) return;

    try {
      const data = await loadWorkspaceInvites(currentWorkspace.id);
      setSentInvites(data);
    } catch (error) {
      console.error('Error loading sent invites:', error);
    }
  }

  function setCurrentWorkspace(workspace: WorkspaceWithRole | null) {
    setCurrentWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem(STORAGE_KEY, workspace.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  async function createNewWorkspace(nome: string, descricao?: string) {
    if (!user) return;
    
    try {
      const workspace = await createWorkspace(user.id, nome, descricao);
      const workspaceWithRole: WorkspaceWithRole = {
        ...workspace,
        role: 'owner',
        memberCount: 1,
      };
      
      setWorkspaces(prev => [...prev, workspaceWithRole]);
      setCurrentWorkspace(workspaceWithRole);
      addToast(`Workspace "${nome}" criado com sucesso!`);
    } catch (error) {
      console.error('Error creating workspace:', error);
      addToast('Erro ao criar workspace');
      throw error;
    }
  }

  async function updateCurrentWorkspace(changes: Partial<Workspace>) {
    if (!currentWorkspace) return;
    
    try {
      const updated = await updateWorkspace(currentWorkspace.id, changes);
      const updatedWithRole: WorkspaceWithRole = {
        ...updated,
        role: currentWorkspace.role,
        memberCount: currentWorkspace.memberCount,
      };
      
      setWorkspaces(prev => 
        prev.map(w => w.id === updated.id ? updatedWithRole : w)
      );
      setCurrentWorkspace(updatedWithRole);
      addToast('Workspace atualizado!');
    } catch (error) {
      console.error('Error updating workspace:', error);
      addToast('Erro ao atualizar workspace');
      throw error;
    }
  }

  async function deleteCurrentWorkspace() {
    if (!currentWorkspace) return;
    
    try {
      await deleteWorkspace(currentWorkspace.id);
      setWorkspaces(prev => prev.filter(w => w.id !== currentWorkspace.id));
      
      // Switch to another workspace if available
      const remaining = workspaces.filter(w => w.id !== currentWorkspace.id);
      if (remaining.length > 0) {
        setCurrentWorkspace(remaining[0]);
      } else {
        setCurrentWorkspace(null);
      }
      
      addToast('Workspace deletado');
    } catch (error) {
      console.error('Error deleting workspace:', error);
      addToast('Erro ao deletar workspace');
      throw error;
    }
  }

  async function inviteToWorkspace(email: string, role: WorkspaceMember['role']) {
    if (!currentWorkspace || !user) return;

    try {
      await inviteMember(currentWorkspace.id, email, role, user.id);

      // Send invite email
      try {
        const session = await supabase?.auth.getSession();
        const token = session?.data?.session?.access_token;
        await fetch('/api/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            email,
            workspaceName: currentWorkspace.nome,
            invitedByEmail: user.email,
            role,
          }),
        });
      } catch (emailErr) {
        // Email send failure should not block the invite
      }

      await loadMembers();
      await loadSentInvites();
      addToast(`Convite enviado para ${email}`);
    } catch (error: any) {
      console.error('Error inviting member:', error);
      addToast(error.message || 'Erro ao convidar membro');
      throw error;
    }
  }

  async function cancelInvite(inviteId: string) {
    try {
      await deleteInvite(inviteId);
      await loadSentInvites();
      addToast('Convite cancelado');
    } catch (error) {
      console.error('Error canceling invite:', error);
      addToast('Erro ao cancelar convite');
    }
  }

  async function removeFromWorkspace(userId: string) {
    if (!currentWorkspace) return;
    
    try {
      await removeMember(currentWorkspace.id, userId);
      await loadMembers();
      addToast('Membro removido');
    } catch (error) {
      console.error('Error removing member:', error);
      addToast('Erro ao remover membro');
      throw error;
    }
  }

  async function changeMemberRole(userId: string, role: WorkspaceMember['role']) {
    if (!currentWorkspace) return;
    
    try {
      await updateMemberRole(currentWorkspace.id, userId, role);
      await loadMembers();
      addToast('Permissão atualizada');
    } catch (error) {
      console.error('Error changing role:', error);
      addToast('Erro ao atualizar permissão');
      throw error;
    }
  }

  async function refreshMembers() {
    await loadMembers();
  }

  async function refreshWorkspaces() {
    await loadUserWorkspaces();
  }

  async function loadInvites() {
    try {
      const invites = await loadPendingInvites();
      setPendingInvites(invites);
    } catch (error) {
      console.error('Error loading invites:', error);
    }
  }

  async function acceptWorkspaceInvite(inviteId: string) {
    try {
      await acceptInvite(inviteId);
      addToast('Convite aceito!');
      await loadInvites();
      await loadUserWorkspaces();
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      addToast(error.message || 'Erro ao aceitar convite');
      throw error;
    }
  }

  const value: WorkspaceContextValue = {
    workspaces,
    currentWorkspace,
    members,
    pendingInvites,
    sentInvites,
    loading,
    setCurrentWorkspace,
    createNewWorkspace,
    updateCurrentWorkspace,
    deleteCurrentWorkspace,
    inviteToWorkspace,
    removeFromWorkspace,
    changeMemberRole,
    cancelInvite,
    refreshMembers,
    refreshWorkspaces,
    loadInvites,
    acceptWorkspaceInvite,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return ctx;
}
