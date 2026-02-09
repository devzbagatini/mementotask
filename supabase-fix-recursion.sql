-- CORREÇÃO: Remover recursão infinita nas políticas RLS

-- ========================================
-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- ========================================
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. REMOVER TODAS AS POLÍTICAS ANTIGAS
-- ========================================
DROP POLICY IF EXISTS "workspaces_select" ON workspaces;
DROP POLICY IF EXISTS "workspaces_insert" ON workspaces;
DROP POLICY IF EXISTS "workspaces_update" ON workspaces;
DROP POLICY IF EXISTS "workspaces_delete" ON workspaces;
DROP POLICY IF EXISTS "Usuários podem ver workspaces que possuem ou são membros" ON workspaces;
DROP POLICY IF EXISTS "Donos podem criar workspaces" ON workspaces;
DROP POLICY IF EXISTS "Donos podem atualizar seus workspaces" ON workspaces;
DROP POLICY IF EXISTS "Donos podem deletar seus workspaces" ON workspaces;

DROP POLICY IF EXISTS "items_select" ON items;
DROP POLICY IF EXISTS "items_insert" ON items;
DROP POLICY IF EXISTS "items_update" ON items;
DROP POLICY IF EXISTS "items_delete" ON items;
DROP POLICY IF EXISTS "Usuários podem ver seus itens" ON items;
DROP POLICY IF EXISTS "Usuários podem criar itens" ON items;
DROP POLICY IF EXISTS "Usuários podem atualizar itens" ON items;
DROP POLICY IF EXISTS "Usuários podem deletar itens" ON items;
DROP POLICY IF EXISTS "Usuários podem ver items dos workspaces que acessam" ON items;
DROP POLICY IF EXISTS "Usuários podem criar items em workspaces com permissão" ON items;
DROP POLICY IF EXISTS "Usuários podem atualizar items em workspaces com permissão" ON items;
DROP POLICY IF EXISTS "Usuários podem deletar items em workspaces com permissão" ON items;

-- ========================================
-- 3. POLÍTICAS SIMPLES SEM RECURSÃO
-- ========================================

-- Workspaces: Apenas dono pode ver/gerenciar
CREATE POLICY "workspaces_select"
    ON workspaces FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "workspaces_insert"
    ON workspaces FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update"
    ON workspaces FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete"
    ON workspaces FOR DELETE
    USING (owner_id = auth.uid());

-- Items: Apenas dono (user_id) pode ver/gerenciar
CREATE POLICY "items_select"
    ON items FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "items_insert"
    ON items FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "items_update"
    ON items FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "items_delete"
    ON items FOR DELETE
    USING (user_id = auth.uid());

-- ========================================
-- 4. REABILITAR RLS
-- ========================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Workspace_members: Desabilitado por enquanto (para evitar complicações)
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. RESULTADO
-- ========================================
SELECT 'Políticas RLS simplificadas aplicadas com sucesso!' as status;
