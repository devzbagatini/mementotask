// DEBUG: Script para testar criacao de workspace no console do navegador
// Como usar:
// 1. Abra http://localhost:3000
// 2. Faca login
// 3. Aperte F12 para abrir o console
// 4. Cole este script e aperte Enter

(async function debugWorkspace() {
  console.log('🚀 Iniciando debug de workspace...\n');

  // 1. Verificar se Supabase esta disponivel
  console.log('1️⃣ Verificando Supabase...');
  const supabase = window.supabase;
  if (!supabase) {
    console.error('❌ Supabase nao encontrado no window');
    console.log('💡 Dica: Faca login primeiro!');
    return;
  }
  console.log('✅ Supabase encontrado');

  // 2. Verificar sessao
  console.log('\n2️⃣ Verificando sessao...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    console.error('❌ Sem sessao:', sessionError?.message || 'Faca login primeiro');
    return;
  }
  console.log('✅ Sessao ativa - User ID:', session.user.id);
  console.log('   Email:', session.user.email);

  // 3. Testar SELECT na tabela workspaces
  console.log('\n3️⃣ Testando SELECT em workspaces...');
  const { data: workspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('*');
  
  if (wsError) {
    console.error('❌ Erro no SELECT:', wsError.message);
    console.error('   Codigo:', wsError.code);
    console.error('   Detalhes:', wsError.details);
    console.log('\n💡 Possiveis causas:');
    console.log('   - Tabela nao existe');
    console.log('   - RLS bloqueando');
    console.log('   - Sem permissao');
  } else {
    console.log('✅ SELECT funcionou!');
    console.log('   Workspaces encontrados:', workspaces.length);
    workspaces.forEach(w => console.log('   -', w.nome, '(ID:', w.id + ')'));
  }

  // 4. Testar INSERT
  console.log('\n4️⃣ Testando INSERT (criar workspace)...');
  const testName = 'Workspace Teste ' + new Date().toLocaleTimeString();
  console.log('   Criando:', testName);
  
  const { data: newWorkspace, error: insertError } = await supabase
    .from('workspaces')
    .insert({
      nome: testName,
      descricao: 'Workspace de teste criado via debug',
      owner_id: session.user.id
    })
    .select()
    .single();
  
  if (insertError) {
    console.error('❌ Erro no INSERT:', insertError.message);
    console.error('   Codigo:', insertError.code);
    console.error('   Detalhes:', insertError.details);
    console.error('   Hint:', insertError.hint);
    console.log('\n💡 Possiveis causas:');
    console.log('   - Tabela nao existe');
    console.log('   - RLS bloqueando INSERT');
    console.log('   - owner_id nao corresponde ao usuario logado');
    console.log('   - Constraint UNIQUE violada (nome duplicado)');
  } else {
    console.log('✅ INSERT funcionou! Workspace criado:');
    console.log('   ID:', newWorkspace.id);
    console.log('   Nome:', newWorkspace.nome);
    console.log('   Criado em:', newWorkspace.criado_em);
  }

  // 5. Verificar politicas RLS
  console.log('\n5️⃣ Verificando politicas RLS...');
  const { data: policies, error: policyError } = await supabase
    .rpc('get_policies', { table_name: 'workspaces' });
  
  if (policyError) {
    console.log('ℹ️  Nao foi possivel listar politicas (funcao RPC pode nao existir)');
  } else {
    console.log('   Politicas encontradas:', policies?.length || 0);
  }

  console.log('\n🏁 Debug finalizado!');
})();

// Funcao auxiliar para limpar workspaces de teste
window.limparWorkspacesTeste = async function() {
  console.log('\n🧹 Limpando workspaces de teste...');
  const supabase = window.supabase;
  if (!supabase) {
    console.error('Supabase nao encontrado');
    return;
  }
  
  const { data, error } = await supabase
    .from('workspaces')
    .delete()
    .like('nome', 'Workspace Teste%');
  
  if (error) {
    console.error('Erro ao limpar:', error.message);
  } else {
    console.log('✅ Workspaces de teste removidos');
  }
};

console.log('📋 Script de debug carregado!');
console.log('Execute: debugWorkspace()');
console.log('Para limpar testes: limparWorkspacesTeste()');
