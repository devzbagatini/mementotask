-- CORREÇÃO: Atualizar políticas para compartilhamento (sem conflito)

-- ========================================
-- 1. LIMPAR POLÍTICAS ANTIGAS
-- ========================================
DROP POLICY IF EXISTS "workspaces_owner_select" ON workspaces;
DROP POLICY IF EXISTS "workspaces_select" ON workspaces;
DROP POLICY IF EXISTS "workspace_members_select" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_update" ON workspace_members;

-- ========================================
-- 2. CRIAR NOVAS POLÍTICAS
-- ========================================

-- SELECT em workspaces: Dono OU Membro pode ver
CREATE POLICY "workspaces_select_shared"
    ON workspaces FOR SELECT
    USING (
        owner_id = auth.uid() OR
        id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- SELECT em workspace_members: Membros podem ver outros membros
CREATE POLICY "workspace_members_select_shared"
    ON workspace_members FOR SELECT
    USING (
        workspace_id IN (
            -- Workspaces que sou dono
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
            UNION
            -- Workspaces que sou membro
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

-- INSERT: Dono pode adicionar membros
CREATE POLICY "workspace_members_insert_shared"
    ON workspace_members FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

-- DELETE: Dono pode remover membros
CREATE POLICY "workspace_members_delete_shared"
    ON workspace_members FOR DELETE
    USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

-- UPDATE: Dono pode alterar permissões
CREATE POLICY "workspace_members_update_shared"
    ON workspace_members FOR UPDATE
    USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

-- ========================================
-- 3. REABILITAR RLS
-- ========================================
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. RESULTADO
-- ========================================
SELECT '✅ Políticas atualizadas para suportar compartilhamento!' as status;
