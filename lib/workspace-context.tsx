'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './auth-context';
import { useToast } from './toast';
import type { Workspace, WorkspaceWithRole, WorkspaceMember } from './types';
import {
  loadWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  updateMemberRole,
  loadWorkspaceMembers,
} from './workspace-storage';

interface WorkspaceContextValue {
  workspaces: WorkspaceWithRole[];
  currentWorkspace: WorkspaceWithRole | null;
  members: WorkspaceMember[];
  loading: boolean;
  setCurrentWorkspace: (workspace: WorkspaceWithRole | null) => void;
  createNewWorkspace: (nome: string, descricao?: string) => Promise<void>;
  updateCurrentWorkspace: (changes: Partial<Workspace>) => Promise<void>;
  deleteCurrentWorkspace: () => Promise<void>;
  inviteToWorkspace: (email: string, role: WorkspaceMember['role']) => Promise<void>;
  removeFromWorkspace: (userId: string) => Promise<void>;
  changeMemberRole: (userId: string, role: WorkspaceMember['role']) => Promise<void>;
  refreshMembers: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const STORAGE_KEY = 'mementotask_current_workspace';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<WorkspaceWithRole | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Load workspaces on mount
  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspaceState(null);
      setLoading(false);
      return;
    }

    loadUserWorkspaces();
  }, [user]);

  // Load members when workspace changes
  useEffect(() => {
    if (currentWorkspace?.id) {
      loadMembers();
    } else {
      setMembers([]);
    }
  }, [currentWorkspace?.id]);

  async function loadUserWorkspaces() {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await loadWorkspaces(user.id);
      setWorkspaces(data);
      
      // Restore from localStorage or use first workspace
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const saved = data.find(w => w.id === savedId);
        if (saved) {
          setCurrentWorkspaceState(saved);
        } else if (data.length > 0) {
          setCurrentWorkspaceState(data[0]);
          localStorage.setItem(STORAGE_KEY, data[0].id);
        }
      } else if (data.length > 0) {
        setCurrentWorkspaceState(data[0]);
        localStorage.setItem(STORAGE_KEY, data[0].id);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
      addToast('Erro ao carregar workspaces');
    } finally {
      setLoading(false);
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
      await loadMembers();
      addToast(`Convite enviado para ${email}`);
    } catch (error: any) {
      console.error('Error inviting member:', error);
      addToast(error.message || 'Erro ao convidar membro');
      throw error;
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

  const value: WorkspaceContextValue = {
    workspaces,
    currentWorkspace,
    members,
    loading,
    setCurrentWorkspace,
    createNewWorkspace,
    updateCurrentWorkspace,
    deleteCurrentWorkspace,
    inviteToWorkspace,
    removeFromWorkspace,
    changeMemberRole,
    refreshMembers,
    refreshWorkspaces,
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
