-- ============================================================
-- MEMENTOTASK - CORREÇÃO DE SEGURANÇA RLS + RPC
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ============================================
-- 0. FUNÇÕES AUXILIARES (SECURITY DEFINER para quebrar recursao RLS)
-- ============================================

-- Verifica se o usuario e membro de um workspace (bypassa RLS)
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica se o usuario e dono de um workspace (bypassa RLS)
CREATE OR REPLACE FUNCTION is_workspace_owner(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspaces WHERE id = ws_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retorna o role do membro em um workspace (bypassa RLS)
CREATE OR REPLACE FUNCTION get_member_role(ws_id UUID)
RETURNS TEXT AS $$
DECLARE
  member_role TEXT;
BEGIN
  SELECT role INTO member_role FROM workspace_members
  WHERE workspace_id = ws_id AND user_id = auth.uid();
  RETURN member_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 1. FIX: accept_workspace_invite
-- ============================================
DROP FUNCTION IF EXISTS accept_workspace_invite(UUID, UUID);
DROP FUNCTION IF EXISTS accept_workspace_invite(UUID);

CREATE OR REPLACE FUNCTION accept_workspace_invite(invite_id UUID)
RETURNS VOID AS $$
DECLARE
    invite_record RECORD;
    current_user_id UUID;
    user_email TEXT;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Nao autenticado';
    END IF;

    SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;

    SELECT * INTO invite_record
    FROM workspace_invites
    WHERE id = invite_id AND email = user_email AND accepted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Convite nao encontrado ou ja aceito';
    END IF;

    INSERT INTO workspace_members (workspace_id, user_id, role, invited_by, accepted_at)
    VALUES (invite_record.workspace_id, current_user_id, invite_record.role, invite_record.invited_by, NOW());

    UPDATE workspace_invites
    SET accepted_at = NOW(), accepted_by = current_user_id
    WHERE id = invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. FIX: Workspaces RLS (sem recursao)
-- ============================================
DROP POLICY IF EXISTS "workspaces_select" ON workspaces;
DROP POLICY IF EXISTS "workspaces_insert" ON workspaces;
DROP POLICY IF EXISTS "workspaces_update" ON workspaces;
DROP POLICY IF EXISTS "workspaces_delete" ON workspaces;

CREATE POLICY "workspaces_select" ON workspaces FOR SELECT USING (
  owner_id = auth.uid() OR is_workspace_member(id)
);
CREATE POLICY "workspaces_insert" ON workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "workspaces_update" ON workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "workspaces_delete" ON workspaces FOR DELETE USING (owner_id = auth.uid());

-- ============================================
-- 3. FIX: workspace_members RLS (sem recursao)
-- ============================================
DROP POLICY IF EXISTS "members_select" ON workspace_members;
DROP POLICY IF EXISTS "members_insert" ON workspace_members;
DROP POLICY IF EXISTS "members_update" ON workspace_members;
DROP POLICY IF EXISTS "members_delete" ON workspace_members;

-- SELECT: membro do mesmo workspace OU dono do workspace
CREATE POLICY "members_select" ON workspace_members FOR SELECT USING (
  user_id = auth.uid() OR is_workspace_owner(workspace_id)
);

-- INSERT: apenas dono (accept_invite usa SECURITY DEFINER)
CREATE POLICY "members_insert" ON workspace_members FOR INSERT WITH CHECK (
  is_workspace_owner(workspace_id)
);

-- UPDATE: apenas dono
CREATE POLICY "members_update" ON workspace_members FOR UPDATE USING (
  is_workspace_owner(workspace_id)
);

-- DELETE: dono pode remover, membro pode sair
CREATE POLICY "members_delete" ON workspace_members FOR DELETE USING (
  is_workspace_owner(workspace_id) OR user_id = auth.uid()
);

-- ============================================
-- 4. FIX: Items RLS (colaboracao via workspace)
-- ============================================
DROP POLICY IF EXISTS "items_select" ON items;
DROP POLICY IF EXISTS "items_insert" ON items;
DROP POLICY IF EXISTS "items_update" ON items;
DROP POLICY IF EXISTS "items_delete" ON items;

-- SELECT: dono OU membro/owner do workspace
CREATE POLICY "items_select" ON items FOR SELECT USING (
  user_id = auth.uid()
  OR (workspace_id IS NOT NULL AND (is_workspace_owner(workspace_id) OR is_workspace_member(workspace_id)))
);

-- INSERT: dono OU admin/editor do workspace
CREATE POLICY "items_insert" ON items FOR INSERT WITH CHECK (
  user_id = auth.uid()
  OR (workspace_id IS NOT NULL AND (is_workspace_owner(workspace_id) OR get_member_role(workspace_id) IN ('admin', 'editor')))
);

-- UPDATE: dono OU admin/editor do workspace
CREATE POLICY "items_update" ON items FOR UPDATE USING (
  user_id = auth.uid()
  OR (workspace_id IS NOT NULL AND (is_workspace_owner(workspace_id) OR get_member_role(workspace_id) IN ('admin', 'editor')))
);

-- DELETE: dono OU admin do workspace
CREATE POLICY "items_delete" ON items FOR DELETE USING (
  user_id = auth.uid()
  OR (workspace_id IS NOT NULL AND (is_workspace_owner(workspace_id) OR get_member_role(workspace_id) = 'admin'))
);

-- ============================================
-- VERIFICACAO
-- ============================================
SELECT 'Correcoes de seguranca aplicadas com sucesso!' as status;
