-- DIAGNÓSTICO COMPLETO DO SUPABASE
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. VERIFICAR TABELAS
-- ========================================
SELECT 'TABELAS EXISTENTES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('workspaces', 'workspace_members', 'workspace_invites', 'items', 'shares')
ORDER BY table_name;

-- ========================================
-- 2. VERIFICAR COLUNAS EM ITEMS
-- ========================================
SELECT '\nCOLUNAS DA TABELA ITEMS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'items'
ORDER BY ordinal_position;

-- ========================================
-- 3. VERIFICAR RLS ESTÁ ATIVADO
-- ========================================
SELECT '\nRLS STATUS:' as info;
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('workspaces', 'workspace_members', 'workspace_invites', 'items')
AND relkind = 'r';

-- ========================================
-- 4. LISTAR TODAS AS POLÍTICAS
-- ========================================
SELECT '\nPOLÍTICAS RLS:' as info;
SELECT tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('workspaces', 'workspace_members', 'workspace_invites', 'items')
ORDER BY tablename, cmd, policyname;

-- ========================================
-- 5. VERIFICAR FUNÇÕES
-- ========================================
SELECT '\nFUNÇÕES:' as info;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('accept_workspace_invite', 'update_workspace_timestamp')
ORDER BY routine_name;

-- ========================================
-- 6. VERIFICAR ÍNDICES
-- ========================================
SELECT '\nÍNDICES:' as info;
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('workspaces', 'workspace_members', 'workspace_invites', 'items')
ORDER BY tablename, indexname;

-- ========================================
-- 7. TESTAR INSERÇÃO (simulação)
-- ========================================
SELECT '\nTESTE DE PERMISSÕES:' as info;

-- Verificar se há constraints UNIQUE violando
SELECT tc.table_name, tc.constraint_name, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
AND tc.table_schema = 'public'
AND tc.table_name IN ('workspaces', 'workspace_members', 'workspace_invites');

-- ========================================
-- 8. RESUMO
-- ========================================
SELECT '\n✅ DIAGNÓSTICO CONCLUÍDO!' as info;
