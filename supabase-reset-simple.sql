-- LIMPAR E RECRIAR WORKSPACES DO ZERO (VERSÃO SIMPLIFICADA)

-- ========================================
-- 1. DESATIVAR RLS TEMPORARIAMENTE
-- ========================================
ALTER TABLE IF EXISTS workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workspace_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS items DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. REMOVER TABELAS SE EXISTIREM
-- ========================================
DROP TABLE IF EXISTS workspace_invites CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

-- ========================================
-- 3. RECRIAR TABELA WORKSPACES
-- ========================================
CREATE TABLE workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_workspace_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspace_em_modificacao
BEFORE UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION update_workspace_timestamp();

-- ========================================
-- 4. RECRIAR TABELA WORKSPACE_MEMBERS
-- ========================================
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

-- ========================================
-- 5. RECRIAR TABELA WORKSPACE_INVITES
-- ========================================
CREATE TABLE workspace_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES auth.users(id),
  UNIQUE(workspace_id, email)
);

CREATE INDEX idx_workspace_invites_workspace ON workspace_invites(workspace_id);
CREATE INDEX idx_workspace_invites_email ON workspace_invites(email);

-- ========================================
-- 6. POLÍTICAS RLS SIMPLES (SEM RECURSÃO)
-- ========================================

-- Workspaces: Dono pode tudo
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

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

-- Workspace_members: Dono pode gerenciar
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "members_insert"
  ON workspace_members FOR INSERT
  WITH CHECK (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "members_delete"
  ON workspace_members FOR DELETE
  USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

-- Workspace_invites: Dono pode gerenciar
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_select_owner"
  ON workspace_invites FOR SELECT
  USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "invites_select_invited"
  ON workspace_invites FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "invites_insert"
  ON workspace_invites FOR INSERT
  WITH CHECK (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "invites_update"
  ON workspace_invites FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "invites_delete"
  ON workspace_invites FOR DELETE
  USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

-- ========================================
-- 7. FUNÇÃO PARA ACEITAR CONVITE
-- ========================================
CREATE OR REPLACE FUNCTION accept_workspace_invite(invite_id UUID, user_id UUID)
RETURNS VOID AS $$
DECLARE
    invite_record RECORD;
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    
    SELECT * INTO invite_record 
    FROM workspace_invites 
    WHERE id = invite_id AND email = user_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Convite não encontrado';
    END IF;
    
    INSERT INTO workspace_members (workspace_id, user_id, role, invited_by)
    VALUES (invite_record.workspace_id, user_id, invite_record.role, invite_record.invited_by);
    
    UPDATE workspace_invites 
    SET accepted_at = NOW(), accepted_by = user_id
    WHERE id = invite_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. VERIFICAR COLUNAS EM ITEMS
-- ========================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'items' 
                 AND column_name = 'workspace_id') THEN
    ALTER TABLE items ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX idx_items_workspace ON items(workspace_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'items' 
                 AND column_name = 'user_id') THEN
    ALTER TABLE items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_items_user_id ON items(user_id);
  END IF;
END $$;

-- ========================================
-- 9. POLÍTICAS PARA ITEMS
-- ========================================
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "items_select" ON items;
DROP POLICY IF EXISTS "items_insert" ON items;
DROP POLICY IF EXISTS "items_update" ON items;
DROP POLICY IF EXISTS "items_delete" ON items;

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
-- 10. RESULTADO
-- ========================================
SELECT '✅ BANCO RECRIADO COM SUCESSO!' as status;
