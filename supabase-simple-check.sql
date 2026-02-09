-- DIAGNÓSTICO SIMPLES - Query por query
-- Execute cada uma separadamente para ver o resultado

-- Query 1: Verificar se tabela workspaces existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'workspaces'
) as workspaces_existe;

-- Query 2: Verificar se tabela workspace_members existe  
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'workspace_members'
) as workspace_members_existe;

-- Query 3: Verificar se tabela workspace_invites existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'workspace_invites'
) as workspace_invites_existe;

-- Query 4: Contar workspaces
SELECT COUNT(*) as total_workspaces FROM workspaces;

-- Query 5: Contar workspace_members
SELECT COUNT(*) as total_members FROM workspace_members;

-- Query 6: Contar workspace_invites
SELECT COUNT(*) as total_invites FROM workspace_invites;

-- Query 7: Verificar políticas da tabela workspaces
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'workspaces';

-- Query 8: Teste - tentar selecionar workspaces (simula o erro)
SELECT * FROM workspaces LIMIT 1;
