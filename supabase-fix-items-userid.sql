-- CORREÇÃO: Adicionar user_id na tabela items para itens pessoais (sem workspace)

-- Adicionar coluna user_id se não existir
ALTER TABLE items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualizar políticas RLS de items para considerar user_id

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver items dos workspaces que acessam" ON items;
DROP POLICY IF EXISTS "Usuários podem criar items em workspaces com permissão" ON items;
DROP POLICY IF EXISTS "Usuários podem atualizar items em workspaces com permissão" ON items;
DROP POLICY IF EXISTS "Usuários podem deletar items em workspaces com permissão" ON items;

-- Política SELECT: Ver itens próprios OU de workspaces que acessa
CREATE POLICY "Usuários podem ver seus itens"
  ON items FOR SELECT
  USING (
    user_id = auth.uid() OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Política INSERT: Criar itens próprios ou em workspaces com permissão
CREATE POLICY "Usuários podem criar itens"
  ON items FOR INSERT
  WITH CHECK (
    (user_id = auth.uid() AND workspace_id IS NULL) OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Política UPDATE: Atualizar itens próprios ou em workspaces com permissão
CREATE POLICY "Usuários podem atualizar itens"
  ON items FOR UPDATE
  USING (
    (user_id = auth.uid() AND workspace_id IS NULL) OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Política DELETE: Deletar itens próprios ou em workspaces com permissão
CREATE POLICY "Usuários podem deletar itens"
  ON items FOR DELETE
  USING (
    (user_id = auth.uid() AND workspace_id IS NULL) OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Criar índice para user_id
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
