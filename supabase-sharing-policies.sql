-- ATUALIZAÇÃO: Permitir ver workspaces compartilhados

-- ========================================
-- 1. ATUALIZAR POLÍTICA DE SELECT EM WORKSPACES
-- ========================================

-- Remover política antiga
DROP POLICY IF EXISTS "workspaces_owner_select" ON workspaces;

-- Nova política: Dono OU Membro pode ver
CREATE POLICY "workspaces_select"
    ON workspaces FOR SELECT
    USING (
        owner_id = auth.uid() OR
        id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- ========================================
-- 2. POLÍTICAS PARA WORKSPACE_MEMBERS
-- ========================================

-- SELECT: Membros podem ver outros membros do mesmo workspace
DROP POLICY IF EXISTS "workspace_members_select" ON workspace_members;

CREATE POLICY "workspace_members_select"
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
DROP POLICY IF EXISTS "workspace_members_insert" ON workspace_members;

CREATE POLICY "workspace_members_insert"
    ON workspace_members FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

-- DELETE: Dono pode remover membros
DROP POLICY IF EXISTS "workspace_members_delete" ON workspace_members;

CREATE POLICY "workspace_members_delete"
    ON workspace_members FOR DELETE
    USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

-- UPDATE: Dono pode alterar permissões
DROP POLICY IF EXISTS "workspace_members_update" ON workspace_members;

CREATE POLICY "workspace_members_update"
    ON workspace_members FOR UPDATE
    USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

-- ========================================
-- 3. REABILITAR RLS EM WORKSPACE_MEMBERS
-- ========================================
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. RESULTADO
-- ========================================
SELECT 'Políticas atualizadas para suportar compartilhamento!' as status;
