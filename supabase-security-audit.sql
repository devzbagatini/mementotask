-- ============================================================
-- MEMENTOTASK - AUDITORIA DE SEGURANÇA (QUERY ÚNICA)
-- Execute no Supabase SQL Editor
-- Todos os resultados aparecem numa única tabela consolidada
-- ============================================================

-- 1. Tabelas sem RLS habilitado
SELECT
  1 as ordem,
  'CRITICO' as severidade,
  'RLS' as check_tipo,
  schemaname || '.' || tablename as detalhe,
  'RLS DESABILITADO - qualquer usuario pode ler/escrever' as resultado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('workspaces', 'workspace_members', 'workspace_invites', 'items')
  AND NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = pg_tables.tablename
      AND c.relrowsecurity = true
  )

UNION ALL

-- 1b. Confirmar RLS ativo (positivo)
SELECT
  1 as ordem,
  'OK' as severidade,
  'RLS' as check_tipo,
  c.relname as detalhe,
  'RLS habilitado' as resultado
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('workspaces', 'workspace_members', 'workspace_invites', 'items')
  AND c.relrowsecurity = true

UNION ALL

-- 2. Tabelas com RLS mas sem policies
SELECT
  2 as ordem,
  'CRITICO' as severidade,
  'POLICIES' as check_tipo,
  c.relname as detalhe,
  'RLS habilitado mas ZERO policies' as resultado
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('workspaces', 'workspace_members', 'workspace_invites', 'items')
  AND c.relrowsecurity = true
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.tablename = c.relname AND p.schemaname = 'public'
  )

UNION ALL

-- 3. Listar policies ativas
SELECT
  3 as ordem,
  'INFO' as severidade,
  'POLICY' as check_tipo,
  tablename || ' -> ' || policyname as detalhe,
  cmd || ': ' || COALESCE(qual, '(sem USING)') as resultado
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('workspaces', 'workspace_members', 'workspace_invites', 'items')

UNION ALL

-- 4. Funcoes SECURITY DEFINER
SELECT
  4 as ordem,
  'ATENCAO' as severidade,
  'SEC_DEFINER' as check_tipo,
  p.proname as detalhe,
  'Funcao roda com privilegios elevados' as resultado
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true

UNION ALL

-- 5. Permissoes do role ANON
SELECT
  5 as ordem,
  'CRITICO' as severidade,
  'ANON_ACCESS' as check_tipo,
  table_name || ' (' || privilege_type || ')' as detalhe,
  'Role ANON tem acesso - possivel vazamento sem autenticacao' as resultado
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
  AND table_schema = 'public'
  AND table_name IN ('workspaces', 'workspace_members', 'workspace_invites', 'items')

UNION ALL

-- 6. Permissoes do role AUTHENTICATED
SELECT
  6 as ordem,
  'INFO' as severidade,
  'AUTH_ACCESS' as check_tipo,
  table_name || ' (' || privilege_type || ')' as detalhe,
  'OK se RLS estiver ativo' as resultado
FROM information_schema.role_table_grants
WHERE grantee = 'authenticated'
  AND table_schema = 'public'
  AND table_name IN ('workspaces', 'workspace_members', 'workspace_invites', 'items')

UNION ALL

-- 7. Items orfaos
(SELECT
  7 as ordem,
  'ATENCAO' as severidade,
  'ORFAO' as check_tipo,
  i.id::text as detalhe,
  'Item sem workspace e user invalido: ' || i.nome as resultado
FROM items i
WHERE i.workspace_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = i.user_id)
LIMIT 10)

UNION ALL

-- 8. Convites pendentes antigos
SELECT
  8 as ordem,
  CASE
    WHEN wi.invited_at < NOW() - INTERVAL '30 days' THEN 'ATENCAO'
    ELSE 'INFO'
  END as severidade,
  'INVITE' as check_tipo,
  wi.email as detalhe,
  'Pendente desde ' || wi.invited_at::date::text as resultado
FROM workspace_invites wi
WHERE wi.accepted_at IS NULL

UNION ALL

-- 9. Membros duplicados
SELECT
  9 as ordem,
  'CRITICO' as severidade,
  'DUPLICATA' as check_tipo,
  workspace_id::text as detalhe,
  'User ' || user_id::text || ' duplicado ' || COUNT(*)::text || 'x' as resultado
FROM workspace_members
GROUP BY workspace_id, user_id
HAVING COUNT(*) > 1

UNION ALL

-- 10. Realtime
SELECT
  10 as ordem,
  'INFO' as severidade,
  'REALTIME' as check_tipo,
  pt.tablename as detalhe,
  'Exposta via Realtime (RLS se aplica)' as resultado
FROM pg_publication p
JOIN pg_publication_tables pt ON pt.pubname = p.pubname
WHERE pt.schemaname = 'public'
  AND pt.tablename IN ('workspaces', 'workspace_members', 'workspace_invites', 'items')

ORDER BY ordem, severidade, detalhe;
