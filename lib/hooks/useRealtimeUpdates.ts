'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from '@/lib/workspace-context';

export type UpdateType = 'items' | 'invite_accepted' | null;

export function useRealtimeUpdates() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [hasUpdate, setHasUpdate] = useState(false);
  const [updateType, setUpdateType] = useState<UpdateType>(null);
  const [message, setMessage] = useState('');
  const userIdRef = useRef(user?.id);

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  const dismiss = useCallback(() => {
    setHasUpdate(false);
    setUpdateType(null);
    setMessage('');
  }, []);

  useEffect(() => {
    if (!supabase || !user || !currentWorkspace?.id) return;

    const workspaceId = currentWorkspace.id;

    const channel = supabase
      .channel(`workspace-${workspaceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items', filter: `workspace_id=eq.${workspaceId}` },
        (payload) => {
          const record = (payload.new || payload.old) as any;
          if (record?.user_id === userIdRef.current) return;
          setHasUpdate(true);
          setUpdateType('items');
          setMessage('Há atualizações neste workspace.');
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workspace_members', filter: `workspace_id=eq.${workspaceId}` },
        () => {
          setHasUpdate(true);
          setUpdateType('invite_accepted');
          setMessage('Um membro aceitou o convite para este workspace.');
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'workspace_invites', filter: `workspace_id=eq.${workspaceId}` },
        (payload) => {
          const record = payload.new as any;
          if (record?.accepted_at) {
            setHasUpdate(true);
            setUpdateType('invite_accepted');
            setMessage('Um convite foi aceito neste workspace.');
          }
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [user, currentWorkspace?.id]);

  // Reset when switching workspace
  useEffect(() => {
    dismiss();
  }, [currentWorkspace?.id, dismiss]);

  return { hasUpdate, updateType, message, dismiss };
}
