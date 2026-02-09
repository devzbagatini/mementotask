-- DIAGNÓSTICO E CORREÇÃO COMPLETO

-- ========================================
-- 1. VERIFICAR SE TABELAS EXISTEM
-- ========================================
DO $$
BEGIN
    -- Verificar tabela workspaces
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'workspaces') THEN
        RAISE NOTICE 'Criando tabela workspaces...';
        
        CREATE TABLE workspaces (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nome TEXT NOT NULL,
            descricao TEXT,
            owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(nome, owner_id)
        );
        
        -- Trigger para atualizar timestamp
        CREATE OR REPLACE FUNCTION update_workspace_timestamp()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.atualizado_em = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
        
        CREATE TRIGGER update_workspace_em_modificacao
        BEFORE UPDATE ON workspaces
        FOR EACH ROW
        EXECUTE FUNCTION update_workspace_timestamp();
        
        -- Índice
        CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
        
        -- RLS
        ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Tabela workspaces criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela workspaces já existe.';
    END IF;

    -- Verificar tabela workspace_members
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'workspace_members') THEN
        RAISE NOTICE 'Criando tabela workspace_members...';
        
        CREATE TABLE workspace_members (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
            invited_by UUID REFERENCES auth.users(id),
            invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            accepted_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(workspace_id, user_id)
        );
        
        CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
        CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
        
        ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Tabela workspace_members criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela workspace_members já existe.';
    END IF;
END $$;

-- ========================================
-- 2. VERIFICAR COLUNA workspace_id EM items
-- ========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'items' 
                   AND column_name = 'workspace_id') THEN
        RAISE NOTICE 'Adicionando coluna workspace_id em items...';
        ALTER TABLE items ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
        CREATE INDEX idx_items_workspace ON items(workspace_id);
    ELSE
        RAISE NOTICE 'Coluna workspace_id já existe em items.';
    END IF;
END $$;

-- ========================================
-- 3. VERIFICAR COLUNA user_id EM items
-- ========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'items' 
                   AND column_name = 'user_id') THEN
        RAISE NOTICE 'Adicionando coluna user_id em items...';
        ALTER TABLE items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX idx_items_user_id ON items(user_id);
    ELSE
        RAISE NOTICE 'Coluna user_id já existe em items.';
    END IF;
END $$;

-- ========================================
-- 4. RECRIAR POLÍTICAS RLS SIMPLES
-- ========================================

-- Políticas para workspaces
DROP POLICY IF EXISTS "workspaces_select" ON workspaces;
DROP POLICY IF EXISTS "workspaces_insert" ON workspaces;
DROP POLICY IF EXISTS "workspaces_update" ON workspaces;
DROP POLICY IF EXISTS "workspaces_delete" ON workspaces;
DROP POLICY IF EXISTS "Usuários podem ver workspaces que possuem ou são membros" ON workspaces;
DROP POLICY IF EXISTS "Donos podem criar workspaces" ON workspaces;
DROP POLICY IF EXISTS "Donos podem atualizar seus workspaces" ON workspaces;
DROP POLICY IF EXISTS "Donos podem deletar seus workspaces" ON workspaces;

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

-- Políticas para items (simplificadas)
DROP POLICY IF EXISTS "items_select" ON items;
DROP POLICY IF EXISTS "items_insert" ON items;
DROP POLICY IF EXISTS "items_update" ON items;
DROP POLICY IF EXISTS "items_delete" ON items;
DROP POLICY IF EXISTS "Usuários podem ver seus itens" ON items;
DROP POLICY IF EXISTS "Usuários podem criar itens" ON items;
DROP POLICY IF EXISTS "Usuários podem atualizar itens" ON items;
DROP POLICY IF EXISTS "Usuários podem deletar itens" ON items;

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
-- 5. GARANTIR RLS ESTÁ ATIVADO
-- ========================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Desabilitar RLS para workspace_members temporariamente para debug
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;

RAISE NOTICE '========================================';
RAISE NOTICE 'SCHEMA ATUALIZADO COM SUCESSO!';
RAISE NOTICE '========================================';
RAISE NOTICE 'Tabelas criadas: workspaces, workspace_members';
RAISE NOTICE 'Colunas adicionadas: workspace_id, user_id em items';
RAISE NOTICE 'Políticas RLS simplificadas aplicadas';
RAISE NOTICE '========================================';
