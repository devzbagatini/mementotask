# Mementotask

Gerenciador de projetos hierárquico (Projeto → Tarefa → Subtarefa) com workspaces compartilhados.

## Regra Obrigatória

**Sempre atualizar este CLAUDE.md** quando fluxos, arquivos-chave ou arquitetura forem alterados. Manter este arquivo como fonte de verdade da estrutura do projeto.

## Stack

- Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- Supabase (Auth, Database, RLS, Realtime) + Resend (email)
- Deploy: Vercel (mementotask.dev / www.mementotask.dev)
- Node 20 obrigatório

## Estrutura de Arquivos

### Lib (Core)

| Arquivo | Responsabilidade |
|---|---|
| `lib/context.tsx` | Provider principal: items CRUD, filtros, modal state, moveItem |
| `lib/reducer.ts` | State shape: `ModalState`, `ConfirmState`, `AppState` |
| `lib/workspace-context.tsx` | Provider de workspaces: load, create, seed exemplo, switch |
| `lib/workspace-storage.ts` | Supabase ops: workspaces, members, invites, items por workspace |
| `lib/supabase-storage.ts` | Supabase ops: items CRUD direto (sem workspace filter) |
| `lib/storage.ts` | localStorage fallback (dev sem Supabase) |
| `lib/auth-context.tsx` | Auth provider: login, signup, logout, session |
| `lib/supabase.ts` | Client Supabase singleton |
| `lib/types.ts` | Tipos: Item, Workspace, Status, Prioridade, etc |
| `lib/mock-data.ts` | EXAMPLE_PROJECT: cards de exemplo para novos usuários |
| `lib/settings-context.tsx` | Provider de configurações (tema, fonte, cores) |
| `lib/columns.ts` | Definição de colunas da tabela |
| `lib/utils.ts` | Helpers: calculateProgress, getUniqueClientes, cn |

### Fluxos Importantes

**Modal de criação/edição:**
```
context.tsx (openCreateModal) → reducer.ts (ModalState + defaultStatus)
→ ItemFormModal.tsx (lê modalState, resolve tipo)
→ ItemForm.tsx (formulário com defaultStatus, parentId)
```

**Inicialização de workspace (primeiro login):**
```
workspace-context.tsx (loadUserWorkspaces)
→ workspace-storage.ts (createDefaultWorkspaceIfNeeded → RPC Supabase)
→ workspace-context.tsx (seed EXAMPLE_PROJECT com mapeamento de IDs)
→ workspace-storage.ts (createItemInWorkspace para cada item)
```

**Items CRUD (com Supabase):**
```
context.tsx (addItem/editItem/removeItem/moveItem)
→ workspace-storage.ts (createItemInWorkspace / loadItemsByWorkspace)
→ supabase-storage.ts (updateItem / deleteItem)
```

**Drag & Drop (Kanban):**
```
KanbanBoard.tsx (DndContext) → DraggableCard.tsx → KanbanColumn.tsx (droppable)
→ context.tsx (moveItem) → supabase-storage.ts (updateItem)
→ workspace-storage.ts (loadItemsByWorkspace para reload)
```

**Drag & Drop (Tabela):**
```
TabelaView.tsx (DndContext + SortableContext) → TabelaRow.tsx (useSortable)
→ context.tsx (moveItem)
```

### Components

| Arquivo | Responsabilidade |
|---|---|
| `components/AppShell.tsx` | Layout principal, renderiza views |
| `components/Header.tsx` | Header com workspace switcher |
| `components/FilterBar.tsx` | Barra de filtros |
| `components/WelcomeModal.tsx` | Tutorial para novos usuários (dismiss scoped por userId) |
| `components/kanban/KanbanBoard.tsx` | Board Kanban com DnD |
| `components/kanban/KanbanColumn.tsx` | Coluna Kanban (dropdown +: projeto/tarefa/subtarefa) |
| `components/kanban/KanbanCard.tsx` | Card visual |
| `components/kanban/DraggableCard.tsx` | Wrapper draggable do card |
| `components/tabela/TabelaView.tsx` | Tabela hierárquica com DnD |
| `components/tabela/TabelaRow.tsx` | Linha da tabela (sortable) |
| `components/tabela/ColumnSettings.tsx` | Config de colunas visíveis/ordem |
| `components/timeline/TimelineView.tsx` | Gantt chart |
| `components/forms/ItemFormModal.tsx` | Modal wrapper do formulário |
| `components/forms/ItemForm.tsx` | Formulário de item (aceita defaultStatus, parentId) |
| `components/workspace/WorkspaceSwitcher.tsx` | Troca de workspace |
| `components/workspace/WorkspaceShare.tsx` | Compartilhamento + membros |
| `components/workspace/PendingInvitesBanner.tsx` | Banner de convites pendentes |
| `components/settings/SettingsView.tsx` | Painel de configurações |
| `components/auth/AuthPage.tsx` | Login/signup |

### API Routes

| Rota | Responsabilidade |
|---|---|
| `app/api/invite/route.ts` | Envio de email de convite via Resend REST API |

## Supabase

### RPCs
- `create_default_workspace_if_needed(user_id)` — Cria workspace "Meu Workspace" se não existir (SECURITY DEFINER)
- `accept_workspace_invite(invite_id)` — Aceita convite e cria membership

### Helper Functions (SECURITY DEFINER)
- `is_workspace_member(ws_id, uid)` — Evita recursão RLS
- `is_workspace_owner(ws_id, uid)` — Evita recursão RLS
- `get_member_role(ws_id, uid)` — Retorna role do membro
- `get_user_email()` — Retorna email do user autenticado
- `user_workspace_ids(uid)` — Retorna IDs dos workspaces do user
- `user_workspace_role(ws_id, uid)` — Retorna role no workspace
- `handle_new_user()` — Trigger de auth para novos usuários

### Segurança
- RLS habilitado em todas as 4 tabelas (workspaces, workspace_members, workspace_invites, items)
- Role `anon` **sem acesso** às tabelas (REVOKE ALL aplicado)
- Apenas `authenticated` acessa, filtrado por RLS policies
- Auth via Supabase Auth (HTTPS direto, senha nunca passa pelo Next.js server)
- Middleware exige Bearer token em `/api/*`

### SQL Files
- `supabase-complete-setup.sql` — Schema completo (DROP + CREATE)
- `supabase-security-fix.sql` — Fix RLS (safe to re-run)
- `supabase-security-audit.sql` — Auditoria de segurança (query única, re-executável)

## Padrões

- **RLS**: Sempre usar `SECURITY DEFINER` helpers para evitar recursão circular entre workspaces ↔ workspace_members
- **IDs**: Supabase gera UUIDs. Nunca confiar em IDs hardcoded do frontend
- **Reload após mutação**: Após qualquer CRUD, sempre recarregar via `loadItemsByWorkspace()` (não `loadSupabaseItems`)
- **localStorage**: Chaves devem ser scoped por userId quando relevante (ex: `mementotask_tutorial_dismissed_${userId}`)
- **Env vars**: Sempre `.trim()` — Vercel pode adicionar newlines
- **Role anon**: Nunca dar grants para `anon` em tabelas de dados. Revogar se o Supabase adicionar por padrão
