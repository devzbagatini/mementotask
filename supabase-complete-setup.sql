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

DROP FUNCTION IF EXISTS accept_workspace_invite(UUID, UUID);
DROP FUNCTION IF EXISTS update_workspace_timestamp();

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

-- RLS simples: só o dono vê/gerencia
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspaces_select" ON workspaces FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "workspaces_insert" ON workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "workspaces_update" ON workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "workspaces_delete" ON workspaces FOR DELETE USING (owner_id = auth.uid());

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

-- RLS: só o dono do workspace pode ver/gerenciar membros
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON workspace_members FOR SELECT 
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "members_insert" ON workspace_members FOR INSERT 
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "members_delete" ON workspace_members FOR DELETE 
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

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

-- RLS
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_select_owner" ON workspace_invites FOR SELECT 
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "invites_select_invited" ON workspace_invites FOR SELECT 
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "invites_insert" ON workspace_invites FOR INSERT 
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "invites_update" ON workspace_invites FOR UPDATE 
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "invites_delete" ON workspace_invites FOR DELETE 
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- ============================================
-- 5. TABELA: ITEMS (PROJETOS, TAREFAS, SUBTAREFAS)
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

-- Trigger para atualizar timestamp
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

-- RLS simples: só o dono vê/gerencia seus itens
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_select" ON items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "items_insert" ON items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "items_update" ON items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "items_delete" ON items FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 6. FUNÇÃO: ACEITAR CONVITE
-- ============================================
CREATE OR REPLACE FUNCTION accept_workspace_invite(invite_id UUID, user_id UUID)
RETURNS VOID AS $$
DECLARE
    invite_record RECORD;
    user_email TEXT;
BEGIN
    -- Buscar email do usuário
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    
    -- Buscar convite
    SELECT * INTO invite_record 
    FROM workspace_invites 
    WHERE id = invite_id AND email = user_email AND accepted_at IS NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Convite não encontrado ou já aceito';
    END IF;
    
    -- Inserir como membro
    INSERT INTO workspace_members (workspace_id, user_id, role, invited_by)
    VALUES (invite_record.workspace_id, user_id, invite_record.role, invite_record.invited_by);
    
    -- Marcar convite como aceito
    UPDATE workspace_invites 
    SET accepted_at = NOW(), accepted_by = user_id
    WHERE id = invite_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. VERIFICAÇÃO FINAL
-- ============================================
SELECT '✅ BANCO DE DADOS CRIADO COM SUCESSO!' as status;

SELECT 'Tabelas criadas:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('workspaces', 'workspace_members', 'workspace_invites', 'items')
ORDER BY table_name;
