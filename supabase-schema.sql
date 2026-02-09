-- Tabela de items (projetos, tarefas, subtarefas)
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES items(id) ON DELETE CASCADE,

  -- Campos básicos
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('projeto', 'tarefa', 'subtarefa')),
  status TEXT NOT NULL CHECK (status IN ('a_fazer', 'em_andamento', 'pausado', 'concluido', 'cancelado')),
  prioridade TEXT NOT NULL CHECK (prioridade IN ('alta', 'media', 'baixa')),

  -- Campos específicos de projeto
  cliente TEXT,
  valor DECIMAL(10, 2),
  valor_recebido DECIMAL(10, 2),
  tipo_projeto TEXT,

  -- Datas
  data_inicio DATE,
  prazo DATE,
  data_entrega DATE,

  -- Outras informações
  descricao TEXT,
  responsavel TEXT,
  tecnologias TEXT[],
  notas TEXT,

  -- Metadados
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_project_parent CHECK (
    tipo = 'projeto' AND parent_id IS NULL OR
    tipo = 'tarefa' AND parent_id IS NOT NULL OR
    tipo = 'subtarefa' AND parent_id IS NOT NULL
  )
);

-- Tabela de compartilhamento de projetos
CREATE TABLE IF NOT EXISTS shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissao TEXT NOT NULL CHECK (permissao IN ('view', 'edit', 'admin')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(item_id, to_user_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_parent_id ON items(parent_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_tipo ON items(tipo);
CREATE INDEX IF NOT EXISTS idx_shares_item_id ON shares(item_id);
CREATE INDEX IF NOT EXISTS idx_shares_to_user_id ON shares(to_user_id);
CREATE INDEX IF NOT EXISTS idx_shares_from_user_id ON shares(from_user_id);

-- Função para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar atualizado_em
CREATE TRIGGER atualizar_items_em_modificacao
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

-- Habilitar Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para items
CREATE POLICY "Usuários podem ver seus próprios items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver items compartilhados com eles"
  ON items FOR SELECT
  USING (
    id IN (
      SELECT item_id FROM shares
      WHERE to_user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar seus próprios items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar items compartilhados com permissão edit ou admin"
  ON items FOR UPDATE
  USING (
    id IN (
      SELECT item_id FROM shares
      WHERE to_user_id = auth.uid() AND permissao IN ('edit', 'admin')
    )
  );

CREATE POLICY "Usuários podem deletar seus próprios items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar items compartilhados com permissão admin"
  ON items FOR DELETE
  USING (
    id IN (
      SELECT item_id FROM shares
      WHERE to_user_id = auth.uid() AND permissao = 'admin'
    )
  );

-- Políticas RLS para shares
CREATE POLICY "Usuários podem ver seus próprios compartilhamentos"
  ON shares FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Usuários podem criar compartilhamentos"
  ON shares FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Usuários podem deletar seus próprios compartilhamentos"
  ON shares FOR DELETE
  USING (auth.uid() = from_user_id);

-- Função para deletar items em cascata
CREATE OR REPLACE FUNCTION delete_item_cascade()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM shares WHERE item_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para deletar shares quando item é deletado
CREATE TRIGGER cascade_delete_item
BEFORE DELETE ON items
FOR EACH ROW
EXECUTE FUNCTION delete_item_cascade();
