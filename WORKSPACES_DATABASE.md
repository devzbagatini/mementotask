# Documentação do Sistema de Workspaces - Mementotask

## Visão Geral

Este documento descreve a implementação completa do sistema de workspaces com compartilhamento no Mementotask.

## Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. `workspaces`
Armazena os espaços de trabalho.

```sql
- id: UUID (PK)
- nome: TEXT (obrigatório)
- descricao: TEXT (opcional)
- owner_id: UUID → auth.users(id) (obrigatório)
- criado_em: TIMESTAMP
- atualizado_em: TIMESTAMP
```

#### 2. `workspace_members`
Armazena os membros dos workspaces.

```sql
- id: UUID (PK)
- workspace_id: UUID → workspaces(id)
- user_id: UUID → auth.users(id)
- role: TEXT (owner|admin|editor|viewer)
- invited_by: UUID → auth.users(id)
- invited_at: TIMESTAMP
- accepted_at: TIMESTAMP
```

#### 3. `workspace_invites`
Armazena convites pendentes.

```sql
- id: UUID (PK)
- workspace_id: UUID → workspaces(id)
- email: TEXT (obrigatório)
- role: TEXT (admin|editor|viewer)
- invited_by: UUID → auth.users(id)
- invited_at: TIMESTAMP
- accepted_at: TIMESTAMP
- accepted_by: UUID → auth.users(id)
```

#### 4. `items` (modificada)
Adicionado suporte a workspaces.

```sql
- workspace_id: UUID → workspaces(id) (opcional, NULL = item pessoal)
- user_id: UUID → auth.users(id) (obrigatório para itens pessoais)
```

## Políticas RLS (Row Level Security)

### Tabela: `workspaces`

```sql
-- SELECT: Dono ou Membro pode ver
CREATE POLICY "workspaces_select_shared"
    ON workspaces FOR SELECT
    USING (
        owner_id = auth.uid() OR
        id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

-- INSERT: Apenas dono pode criar
CREATE POLICY "workspaces_insert"
    ON workspaces FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- UPDATE: Apenas dono pode atualizar
CREATE POLICY "workspaces_update"
    ON workspaces FOR UPDATE
    USING (owner_id = auth.uid());

-- DELETE: Apenas dono pode deletar
CREATE POLICY "workspaces_delete"
    ON workspaces FOR DELETE
    USING (owner_id = auth.uid());
```

### Tabela: `workspace_members`

```sql
-- SELECT: Membros podem ver outros membros do mesmo workspace
CREATE POLICY "workspace_members_select_shared"
    ON workspace_members FOR SELECT
    USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

-- INSERT: Dono pode adicionar
CREATE POLICY "workspace_members_insert_shared"
    ON workspace_members FOR INSERT
    WITH CHECK (
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    );

-- DELETE: Dono pode remover
CREATE POLICY "workspace_members_delete_shared"
    ON workspace_members FOR DELETE
    USING (
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    );

-- UPDATE: Dono pode alterar permissões
CREATE POLICY "workspace_members_update_shared"
    ON workspace_members FOR UPDATE
    USING (
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    );
```

### Tabela: `workspace_invites`

```sql
-- SELECT (Owner): Dono pode ver convites de seus workspaces
CREATE POLICY "workspace_invites_select_owner"
    ON workspace_invites FOR SELECT
    USING (
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    );

-- SELECT (Invited): Convidado pode ver seus próprios convites
CREATE POLICY "workspace_invites_select_invited"
    ON workspace_invites FOR SELECT
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- INSERT: Dono pode criar convites
CREATE POLICY "workspace_invites_insert"
    ON workspace_invites FOR INSERT
    WITH CHECK (
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    );

-- UPDATE: Convidado pode aceitar convite
CREATE POLICY "workspace_invites_update"
    ON workspace_invites FOR UPDATE
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- DELETE: Dono pode cancelar convites
CREATE POLICY "workspace_invites_delete"
    ON workspace_invites FOR DELETE
    USING (
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    );
```

### Tabela: `items`

```sql
-- SELECT: Dono pode ver seus itens (pessoais)
CREATE POLICY "items_owner_select"
    ON items FOR SELECT
    USING (user_id = auth.uid());

-- INSERT: Apenas dono pode criar
CREATE POLICY "items_owner_insert"
    ON items FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Apenas dono pode atualizar
CREATE POLICY "items_owner_update"
    ON items FOR UPDATE
    USING (user_id = auth.uid());

-- DELETE: Apenas dono pode deletar
CREATE POLICY "items_owner_delete"
    ON items FOR DELETE
    USING (user_id = auth.uid());
```

## Funções PostgreSQL

### `accept_workspace_invite(invite_id UUID, user_id UUID)`

Aceita um convite pendente e adiciona o usuário como membro do workspace.

```sql
CREATE OR REPLACE FUNCTION accept_workspace_invite(invite_id UUID, user_id UUID)
RETURNS VOID AS $$
DECLARE
    invite_record RECORD;
    user_email TEXT;
BEGIN
    -- Buscar email do usuário
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    
    -- Buscar convite
    SELECT * INTO invite_record 
    FROM workspace_invites 
    WHERE id = invite_id AND email = user_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Convite não encontrado ou não pertence a este usuário';
    END IF;
    
    -- Inserir como membro
    INSERT INTO workspace_members (workspace_id, user_id, role, invited_by)
    VALUES (invite_record.workspace_id, user_id, invite_record.role, invite_record.invited_by);
    
    -- Marcar convite como aceito
    UPDATE workspace_invites 
    SET accepted_at = NOW(), accepted_by = user_id
    WHERE id = invite_id;
END;
$$ LANGUAGE plpgsql;
```

## Fluxo de Compartilhamento

### 1. Enviar Convite
1. Dono clica em "Compartilhar"
2. Insere email do convidado
3. Seleciona permissão (admin, editor, viewer)
4. Sistema cria registro em `workspace_invites`
5. Convidado recebe notificação (futuro: email)

### 2. Aceitar Convite
1. Convidado vê convite pendente
2. Clica em "Aceitar"
3. Sistema chama `accept_workspace_invite()`
4. Registro movido de `workspace_invites` para `workspace_members`
5. Convidado agora tem acesso ao workspace

### 3. Gerenciar Membros
1. Dono pode ver todos os membros
2. Dono pode alterar permissões
3. Dono pode remover membros

## Permissões (Roles)

| Role | Projetos | Membros | Configurações |
|------|----------|---------|---------------|
| **owner** | CRUD | CRUD | CRUD |
| **admin** | CRUD | CRUD | - |
| **editor** | CRUD | - | - |
| **viewer** | R | - | - |

- **C** = Create (Criar)
- **R** = Read (Visualizar)
- **U** = Update (Atualizar)
- **D** = Delete (Deletar)

## Segurança

### Proteções Implementadas

1. **Isolamento de Dados**: Usuários só veem workspaces onde são donos ou membros
2. **RLS**: Todas as tabelas têm Row Level Security ativado
3. **Validação**: Função `accept_workspace_invite` valida email do usuário
4. **Constraints**: UNIQUE evita convites duplicados
5. **Cascata**: ON DELETE CASCADE remove dados relacionados

### SQL Injection
- Impossível via Supabase SDK
- Todas as queries são parametrizadas

### Acesso Não Autorizado
- Bloqueado por RLS
- Usuário só acessa seus próprios dados

## Arquivos SQL

Todos os scripts SQL estão na raiz do projeto:

- `supabase-schema.sql` - Schema inicial
- `supabase-workspaces-schema.sql` - Schema de workspaces
- `supabase-fix-items-userid.sql` - Correção user_id
- `supabase-fix-recursion.sql` - Correção recursão RLS
- `supabase-secure-policies.sql` - Políticas seguras
- `supabase-sharing-policies.sql` - Políticas de compartilhamento
- `supabase-sharing-fix.sql` - Correção políticas
- `supabase-invites-table.sql` - Tabela de convites
- `verify-workspaces.sql` - Script de verificação

## Próximos Passos

1. Implementar envio de email para convites
2. Criar tela de notificações de convite
3. Adicionar permissões mais granulares
4. Implementar audit log
5. Criar relatórios de atividade

---

**Documentação criada em:** 2026-02-09  
**Última atualização:** 2026-02-09  
**Versão:** 1.0
