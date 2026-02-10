-- ============================================================
-- MEMENTOTASK - SCRIPT COMPLETO DE CRIAÇÃO DO BANCO
-- Execute tudo de uma vez para recriar o banco do zero
-- ============================================================

-- ============================================
-- 1. LIMPAR TUDO (CUIDADO: APAGA TODOS OS DADOS)
-- ============================================
DROP TABLE IF EXISTS workspace_invites CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS shares CASCADE;

DROP FUNCTION IF EXISTS accept_workspace_invite(UUID);
DROP FUNCTION IF EXISTS accept_workspace_invite(UUID, UUID);
DROP FUNCTION IF EXISTS update_workspace_timestamp();
DROP FUNCTION IF EXISTS is_workspace_member(UUID);
DROP FUNCTION IF EXISTS is_workspace_owner(UUID);
DROP FUNCTION IF EXISTS get_member_role(UUID);

-- ============================================
-- 2. TABELA: WORKSPACES
-- ============================================
CREATE TABLE workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);

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

-- ============================================
-- 3. TABELA: WORKSPACE_MEMBERS
-- ============================================
CREATE TABLE workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- ============================================
-- 4. TABELA: WORKSPACE_INVITES
-- ============================================
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

-- ============================================
-- 5. TABELA: ITEMS
-- ============================================
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES items(id) ON DELETE CASCADE,

  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('projeto', 'tarefa', 'subtarefa')),
  status TEXT NOT NULL CHECK (status IN ('a_fazer', 'em_andamento', 'pausado', 'concluido', 'cancelado')),
  prioridade TEXT NOT NULL CHECK (prioridade IN ('alta', 'media', 'baixa')),

  cliente TEXT,
  valor DECIMAL(10, 2),
  valor_recebido DECIMAL(10, 2),
  tipo_projeto TEXT,

  data_inicio DATE,
  prazo DATE,
  data_entrega DATE,

  descricao TEXT,
  responsavel TEXT,
  tecnologias TEXT[],
  notas TEXT,
  horas INTEGER,
  ordem INTEGER DEFAULT 0,

  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_workspace ON items(workspace_id);
CREATE INDEX idx_items_parent ON items(parent_id);

CREATE OR REPLACE FUNCTION update_item_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_item_em_modificacao
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_item_timestamp();

-- ============================================
-- 6. FUNÇÕES AUXILIARES (SECURITY DEFINER - quebram recursao RLS)
-- ============================================

CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_workspace_owner(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspaces WHERE id = ws_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
-- 7. RLS: WORKSPACES
-- ============================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspaces_select" ON workspaces FOR SELECT USING (
  owner_id = auth.uid() OR is_workspace_member(id)
);
CREATE POLICY "workspaces_insert" ON workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "workspaces_update" ON workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "workspaces_delete" ON workspaces FOR DELETE USING (owner_id = auth.uid());

-- ============================================
-- 8. RLS: WORKSPACE_MEMBERS
-- ============================================
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON workspace_members FOR SELECT USING (
  user_id = auth.uid() OR is_workspace_owner(workspace_id)
);
CREATE POLICY "members_insert" ON workspace_members FOR INSERT WITH CHECK (
  is_workspace_owner(workspace_id)
);
CREATE POLICY "members_update" ON workspace_members FOR UPDATE USING (
  is_workspace_owner(workspace_id)
);
CREATE POLICY "members_delete" ON workspace_members FOR DELETE USING (
  is_workspace_owner(workspace_id) OR user_id = auth.uid()
);

-- ============================================
-- 9. RLS: WORKSPACE_INVITES
-- ============================================
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_select_owner" ON workspace_invites FOR SELECT
  USING (is_workspace_owner(workspace_id));
CREATE POLICY "invites_select_invited" ON workspace_invites FOR SELECT
  USING (email = (auth.jwt() ->> 'email'));
CREATE POLICY "invites_insert" ON workspace_invites FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id));
CREATE POLICY "invites_update" ON workspace_invites FOR UPDATE
  USING (email = (auth.jwt() ->> 'email'));
CREATE POLICY "invites_delete" ON workspace_invites FOR DELETE
  USING (is_workspace_owner(workspace_id));

-- ============================================
-- 10. RLS: ITEMS
-- ============================================
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_select" ON items FOR SELECT USING (
  user_id = auth.uid()
  OR (workspace_id IS NOT NULL AND (is_workspace_owner(workspace_id) OR is_workspace_member(workspace_id)))
);
CREATE POLICY "items_insert" ON items FOR INSERT WITH CHECK (
  user_id = auth.uid()
  OR (workspace_id IS NOT NULL AND (is_workspace_owner(workspace_id) OR get_member_role(workspace_id) IN ('admin', 'editor')))
);
CREATE POLICY "items_update" ON items FOR UPDATE USING (
  user_id = auth.uid()
  OR (workspace_id IS NOT NULL AND (is_workspace_owner(workspace_id) OR get_member_role(workspace_id) IN ('admin', 'editor')))
);
CREATE POLICY "items_delete" ON items FOR DELETE USING (
  user_id = auth.uid()
  OR (workspace_id IS NOT NULL AND (is_workspace_owner(workspace_id) OR get_member_role(workspace_id) = 'admin'))
);

-- ============================================
-- 11. FUNÇÃO: ACEITAR CONVITE
-- ============================================
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
-- 12. REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE items, workspace_members, workspace_invites;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT 'BANCO DE DADOS CRIADO COM SUCESSO!' as status;
