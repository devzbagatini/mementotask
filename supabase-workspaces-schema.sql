-- Tabela de Workspaces (Espaços de Trabalho)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nome, owner_id)
);

-- Tabela de Membros do Workspace
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(workspace_id, user_id)
);

-- Adicionar workspace_id à tabela items
ALTER TABLE items ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_items_workspace ON items(workspace_id);

-- Trigger para atualizar atualizado_em
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

-- RLS para workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Políticas para workspaces
CREATE POLICY "Usuários podem ver workspaces que possuem ou são membros"
  ON workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Donos podem criar workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Donos podem atualizar seus workspaces"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Donos podem deletar seus workspaces"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- Políticas para workspace_members
CREATE POLICY "Usuários podem ver membros de seus workspaces"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Donos e admins podem adicionar membros"
  ON workspace_members FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Donos e admins podem remover membros"
  ON workspace_members FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Atualizar políticas de items para considerar workspace
DROP POLICY IF EXISTS "Usuários podem ver seus próprios items" ON items;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios items" ON items;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios items" ON items;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios items" ON items;

CREATE POLICY "Usuários podem ver items dos workspaces que acessam"
  ON items FOR SELECT
  USING (
    workspace_id IS NULL OR -- Items sem workspace (legado)
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar items em workspaces com permissão"
  ON items FOR INSERT
  WITH CHECK (
    workspace_id IS NULL OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Usuários podem atualizar items em workspaces com permissão"
  ON items FOR UPDATE
  USING (
    workspace_id IS NULL OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Usuários podem deletar items em workspaces com permissão"
  ON items FOR DELETE
  USING (
    workspace_id IS NULL OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );
