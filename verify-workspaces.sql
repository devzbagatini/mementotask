-- VERIFICAÇÃO: Checar se tabelas de workspace foram criadas

-- 1. Verificar se tabela 'workspaces' existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'workspaces'
) as workspaces_exists;

-- 2. Verificar se tabela 'workspace_members' existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'workspace_members'
) as workspace_members_exists;

-- 3. Verificar se coluna 'workspace_id' existe em 'items'
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'items' 
  AND column_name = 'workspace_id'
) as workspace_id_column_exists;

-- 4. Verificar RLS está ativado
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('workspaces', 'workspace_members')
AND relkind = 'r';

-- 5. Contar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('workspaces', 'workspace_members', 'items')
ORDER BY tablename, policyname;
