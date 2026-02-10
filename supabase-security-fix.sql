-- ============================================================
-- MEMENTOTASK - CORREÇÃO DE SEGURANÇA RLS + RPC
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ============================================
-- 1. FIX: accept_workspace_invite - usar auth.uid() em vez de parametro
-- ============================================
CREATE OR REPLACE FUNCTION accept_workspace_invite(invite_id UUID)
RETURNS VOID AS $$
DECLARE
    invite_record RECORD;
    current_user_id UUID;
    user_email TEXT;
BEGIN
    -- Usar auth.uid() em vez de parametro do client
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Nao autenticado';
    END IF;

    -- Buscar email do usuario autenticado
    SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;

    -- Buscar convite que corresponde ao email do usuario
    SELECT * INTO invite_record
    FROM workspace_invites
    WHERE id = invite_id AND email = user_email AND accepted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Convite nao encontrado ou ja aceito';
    END IF;

    -- Inserir como membro
    INSERT INTO workspace_members (workspace_id, user_id, role, invited_by, accepted_at)
    VALUES (invite_record.workspace_id, current_user_id, invite_record.role, invite_record.invited_by, NOW());

    -- Marcar convite como aceito
    UPDATE workspace_invites
    SET accepted_at = NOW(), accepted_by = current_user_id
    WHERE id = invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. FIX: Items RLS - permitir colaboracao via workspace_members
-- ============================================

-- Remover policies antigas
DROP POLICY IF EXISTS "items_select" ON items;
DROP POLICY IF EXISTS "items_insert" ON items;
DROP POLICY IF EXISTS "items_update" ON items;
DROP POLICY IF EXISTS "items_delete" ON items;

-- SELECT: dono OU membro do workspace
CREATE POLICY "items_select" ON items FOR SELECT USING (
  user_id = auth.uid()
  OR (
    workspace_id IS NOT NULL
    AND (
      workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
      OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    )
  )
);

-- INSERT: dono OU membro com role admin/editor
CREATE POLICY "items_insert" ON items FOR INSERT WITH CHECK (
  user_id = auth.uid()
  OR (
    workspace_id IS NOT NULL
    AND (
      workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
      OR workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
      )
    )
  )
);

-- UPDATE: dono OU membro com role admin/editor
CREATE POLICY "items_update" ON items FOR UPDATE USING (
  user_id = auth.uid()
  OR (
    workspace_id IS NOT NULL
    AND (
      workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
      OR workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
      )
    )
  )
);

-- DELETE: dono OU membro com role admin
CREATE POLICY "items_delete" ON items FOR DELETE USING (
  user_id = auth.uid()
  OR (
    workspace_id IS NOT NULL
    AND (
      workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
      OR workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  )
);

-- ============================================
-- 3. FIX: workspace_members - adicionar UPDATE policy + permitir membros ver outros membros
-- ============================================

-- Remover policies antigas
DROP POLICY IF EXISTS "members_select" ON workspace_members;
DROP POLICY IF EXISTS "members_insert" ON workspace_members;
DROP POLICY IF EXISTS "members_delete" ON workspace_members;

-- SELECT: dono do workspace OU membro do mesmo workspace
CREATE POLICY "members_select" ON workspace_members FOR SELECT USING (
  workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- INSERT: apenas dono ou a funcao accept_workspace_invite (SECURITY DEFINER)
CREATE POLICY "members_insert" ON workspace_members FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
);

-- UPDATE: apenas dono do workspace pode mudar roles
CREATE POLICY "members_update" ON workspace_members FOR UPDATE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
);

-- DELETE: dono pode remover, membro pode sair (remover a si mesmo)
CREATE POLICY "members_delete" ON workspace_members FOR DELETE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  OR user_id = auth.uid()
);

-- ============================================
-- 4. FIX: Workspaces SELECT - membros tambem precisam ver o workspace
-- ============================================

DROP POLICY IF EXISTS "workspaces_select" ON workspaces;

CREATE POLICY "workspaces_select" ON workspaces FOR SELECT USING (
  owner_id = auth.uid()
  OR id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- ============================================
-- VERIFICACAO
-- ============================================
SELECT 'Correcoes de seguranca aplicadas com sucesso!' as status;
