# 🏢 Sistema de Workspaces - Documentação

## O que é um Workspace?

Um **Workspace** é um espaço de trabalho isolado onde você pode organizar seus projetos. 

**Exemplos de uso:**
- 🏠 **Workspace Pessoal** - Seus projetos pessoais
- 💼 **Cliente ABC** - Projetos de um cliente específico  
- 🎨 **Agência de Design** - Todos os projetos da agência
- 👥 **Equipe de Desenvolvimento** - Projetos compartilhados com sua equipe

Cada workspace tem seus próprios projetos, tarefas e membros. Os dados são completamente isolados entre workspaces.

---

## 🚀 Como Usar

### 1. Criar um Novo Workspace

1. Clique no seletor de workspace (ao lado do logo)
2. Selecione "Criar novo workspace"
3. Digite um nome e descrição (opcional)
4. Clique em "Criar Workspace"

### 2. Alternar entre Workspaces

1. Clique no seletor de workspace
2. Escolha o workspace desejado na lista
3. Os projetos serão carregados automaticamente

### 3. Compartilhar um Workspace

1. Clique no botão "Compartilhar" (ícone de usuários)
2. Digite o email do convidado
3. Escolha a permissão:
   - **Administrador** - Gerencia membros e projetos
   - **Editor** - Cria e edita projetos
   - **Visualizador** - Apenas visualiza
4. Clique em "Enviar Convite"

### 4. Gerenciar Membros

No modal de compartilhamento, você pode:
- Ver todos os membros do workspace
- Alterar permissões de membros
- Remover membros

---

## 🔐 Permissões

| Papel | Criar Projetos | Editar Projetos | Gerenciar Membros | Deletar Workspace |
|-------|---------------|----------------|-------------------|-------------------|
| **Proprietário** | ✅ | ✅ | ✅ | ✅ |
| **Administrador** | ✅ | ✅ | ✅ | ❌ |
| **Editor** | ✅ | ✅ | ❌ | ❌ |
| **Visualizador** | ❌ | ❌ | ❌ | ❌ |

---

## 🗄️ Configuração do Banco de Dados

### Passo 1: Executar Schema SQL

No Supabase Dashboard (https://supabase.com/dashboard/project/jfvhtrxsogzldcufgism/sql/new), execute o arquivo `supabase-workspaces-schema.sql`:

```sql
-- Este arquivo cria:
-- 1. Tabela workspaces
-- 2. Tabela workspace_members  
-- 3. Atualiza tabela items com workspace_id
-- 4. Configura RLS (Row Level Security)
-- 5. Cria índices para performance
```

### Passo 2: Verificar Tabelas

Após executar, verifique se as tabelas foram criadas:

1. Acesse: https://supabase.com/dashboard/project/jfvhtrxsogzldcufgism/editor
2. Confira se existem:
   - `workspaces`
   - `workspace_members`
   - E a coluna `workspace_id` na tabela `items`

---

## 📁 Estrutura de Arquivos

```
lib/
├── types.ts                    # Tipos Workspace, WorkspaceMember, etc
├── workspace-context.tsx       # Contexto de workspaces (React)
├── workspace-storage.ts        # Funções CRUD para Supabase
└── supabase-workspaces-schema.sql  # Schema do banco

components/workspace/
├── WorkspaceSwitcher.tsx       # Seletor de workspace no Header
└── WorkspaceShare.tsx          # Modal de compartilhamento
```

---

## ⚠️ Migração de Dados Existentes

Os dados existentes (criados antes dos workspaces) continuarão funcionando como **items pessoais** (sem workspace).

Para migrar um projeto para um workspace:
1. Crie o workspace
2. Edite o projeto e altere o `workspace_id` no banco (manualmente)

Ou simplesmente crie novos projetos no workspace desejado.

---

## 🎯 Funcionalidades Futuras

- [ ] Transferir projetos entre workspaces
- [ ] Templates de workspace
- [ ] Workspace público (somente visualização)
- [ ] Estatísticas por workspace
- [ ] Backup/export de workspace

---

## 🐛 Troubleshooting

### Erro: "Workspace not configured"
- Verifique se o Supabase está configurado no `.env.local`
- Verifique se o schema SQL foi executado

### Erro: "permission denied for table workspaces"
- Verifique se as políticas RLS foram criadas corretamente
- Execute o schema SQL novamente

### Não consigo convidar membro
- O usuário precisa ter uma conta no Mementotask
- Verifique se digitou o email corretamente

---

## 📝 Notas Técnicas

### Isolamento de Dados
Cada workspace é completamente isolado:
- Projetos de workspaces diferentes não aparecem juntos
- Filtros e buscas são por workspace
- Dashboard mostra estatísticas do workspace atual

### Performance
- Índices criados em `workspace_id` para queries rápidas
- RLS garante segurança sem impactar performance
- Dados são carregados sob demanda

---

**Pronto para usar!** 🚀
