-- POLÍTICAS RLS SEGURAS E SEM RECURSÃO

-- ========================================
-- 1. REMOVER POLÍTICAS ANTIGAS
-- ========================================
DROP POLICY IF EXISTS "workspaces_select" ON workspaces;
DROP POLICY IF EXISTS "workspaces_insert" ON workspaces;
DROP POLICY IF EXISTS "workspaces_update" ON workspaces;
DROP POLICY IF EXISTS "workspaces_delete" ON workspaces;

DROP POLICY IF EXISTS "items_select" ON items;
DROP POLICY IF EXISTS "items_insert" ON items;
DROP POLICY IF EXISTS "items_update" ON items;
DROP POLICY IF EXISTS "items_delete" ON items;

DROP POLICY IF EXISTS "workspace_members_select" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON workspace_members;

-- ========================================
-- 2. POLÍTICAS PARA WORKSPACES
-- ========================================

-- SELECT: Dono pode ver seus workspaces
CREATE POLICY "workspaces_owner_select"
    ON workspaces FOR SELECT
    USING (owner_id = auth.uid());

-- INSERT: Apenas dono pode criar
CREATE POLICY "workspaces_owner_insert"
    ON workspaces FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- UPDATE: Apenas dono pode atualizar
CREATE POLICY "workspaces_owner_update"
    ON workspaces FOR UPDATE
    USING (owner_id = auth.uid());

-- DELETE: Apenas dono pode deletar
CREATE POLICY "workspaces_owner_delete"
    ON workspaces FOR DELETE
    USING (owner_id = auth.uid());

-- ========================================
-- 3. POLÍTICAS PARA ITEMS
-- ========================================

-- SELECT: Dono pode ver seus itens (pessoais)
CREATE POLICY "items_owner_select"
    ON items FOR SELECT
    USING (user_id = auth.uid());

-- INSERT: Apenas dono pode criar itens pessoais
CREATE POLICY "items_owner_insert"
    ON items FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Apenas dono pode atualizar seus itens
CREATE POLICY "items_owner_update"
    ON items FOR UPDATE
    USING (user_id = auth.uid());

-- DELETE: Apenas dono pode deletar seus itens
CREATE POLICY "items_owner_delete"
    ON items FOR DELETE
    USING (user_id = auth.uid());

-- ========================================
-- 4. POLÍTICAS PARA WORKSPACE_MEMBERS
-- ========================================

-- SELECT: Dono pode ver membros de seus workspaces
CREATE POLICY "workspace_members_owner_select"
    ON workspace_members FOR SELECT
    USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

-- INSERT: Dono pode adicionar membros
CREATE POLICY "workspace_members_owner_insert"
    ON workspace_members FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

-- DELETE: Dono pode remover membros
CREATE POLICY "workspace_members_owner_delete"
    ON workspace_members FOR DELETE
    USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

-- ========================================
-- 5. ATIVAR RLS
-- ========================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. VERIFICAÇÃO
-- ========================================
SELECT 'Políticas RLS seguras aplicadas!' as status;

-- Mostrar políticas criadas
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE tablename IN ('workspaces', 'items', 'workspace_members')
ORDER BY tablename, policyname;
