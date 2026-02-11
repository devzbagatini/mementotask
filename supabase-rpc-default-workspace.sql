-- Migration: create_default_workspace_if_needed RPC
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION create_default_workspace_if_needed(user_id UUID)
RETURNS UUID AS $$
DECLARE
  ws_id UUID;
BEGIN
  -- Verifica se já existe workspace próprio
  SELECT id INTO ws_id FROM workspaces WHERE owner_id = user_id LIMIT 1;
  IF ws_id IS NOT NULL THEN
    RETURN NULL; -- Já existe, não precisa criar
  END IF;

  -- Cria workspace padrão
  INSERT INTO workspaces (nome, owner_id)
  VALUES ('Meu Workspace', user_id)
  RETURNING id INTO ws_id;

  RETURN ws_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
