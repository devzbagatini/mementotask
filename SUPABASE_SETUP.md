# 🚀 CONFIGURAÇÃO DO SUPABASE - PASSO A PASSO

## 📋 VISÃO GERAL

Este guia vai te ajudar a configurar o Supabase para o Mementotask com autenticação e sistema de compartilhamento.

---

## PASSO 1: Criar Projeto no Supabase

1. Acesse: https://supabase.com
2. Clique em **"Start your project"** ou **"New Project"**
3. Faça login/registro (GitHub ou Email)
4. Clique em **"New Project"**
5. Preencha:
   - **Name**: `mementotask`
   - **Database Password**: Crie uma senha forte e salve!
   - **Region**: Escolha a região mais próxima (ex: South America)
   - **Pricing Plan**: Free (0 dólares/mês)
6. Aguarde o projeto ser criado (pode levar 2-3 minutos)

---

## PASSO 2: Obter Credenciais

1. No seu projeto, clique em **Settings** (ícone de engrenagem) → **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://xxxxxxxxx.supabase.co`
   - **anon public key**: Clique no ícone de "copy"

---

## PASSO 3: Configurar .env.local

1. No seu projeto local, abra o arquivo `.env.local` na raiz
2. Substitua os placeholders pelas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projetoid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

3. Salve o arquivo

---

## PASSO 4: Executar Schema SQL

1. No Supabase, clique em **SQL Editor** no menu lateral
2. Clique em **"New query"**
3. Copie todo o conteúdo do arquivo `supabase-schema.sql` do seu projeto
4. Cole no editor SQL do Supabase
5. Clique em **"Run"** (ícone de ▶️ ou Ctrl+Enter)
6. Verifique se aparece "Success. No rows returned"

**O que isso faz:**
- Cria tabelas: `items`, `shares`
- Configura Row Level Security (RLS)
- Cria índices para performance
- Cria triggers automáticos

---

## PASSO 5: Habilitar Email Auth

1. No Supabase, clique em **Authentication** → **Providers**
2. Clique em **Email**
3. Verifique se está **Enabled**
4. (Opcional) Configure **Confirm email** se quiser confirmação por email

---

## PASSO 6: Testar

1. No seu terminal, execute:
```bash
npm run dev
```

2. Abra o navegador em: http://localhost:3000

3. Você deve ver a tela de login
4. Crie uma conta com um email válido
5. Verifique se funciona!

---

## TROUBLESHOOTING

### Erro: "Invalid API Key"
- Verifique se as credenciais no `.env.local` estão corretas
- Verifique se reiniciou o servidor (`npm run dev`) após editar o `.env.local`

### Erro: "Table does not exist"
- Execute o SQL schema novamente (PASSO 4)
- Verifique se não houve erros na execução

### Erro: "Permission denied"
- Verifique se as políticas RLS foram criadas corretamente
- Execute o SQL schema novamente

### Email de confirmação não chega
- No Supabase, vá em **Authentication** → **Email Templates**
- Desmarque **"Enable email confirmations"** temporariamente
- Ou configure SMTP customizado

---

## ESTRUTURA DO BANCO

### Tabela: `items`

```sql
id              UUID      (primary key)
user_id         UUID      (foreign key → auth.users)
parent_id       UUID      (foreign key → items.id)
nome            TEXT
tipo            TEXT      (projeto/tarefa/subtarefa)
status          TEXT      (a_fazer/em_andamento/pausado/concluido/cancelado)
prioridade      TEXT      (alta/media/baixa)
cliente         TEXT
valor           DECIMAL
valor_recebido  DECIMAL
tipo_projeto    TEXT
data_inicio     DATE
prazo           DATE
data_entrega    DATE
descricao       TEXT
responsavel     TEXT
tecnologias     TEXT[]
notas           TEXT
ordem           INTEGER
criado_em       TIMESTAMP
atualizado_em   TIMESTAMP
```

### Tabela: `shares`

```sql
id           UUID      (primary key)
item_id      UUID      (foreign key → items.id)
from_user_id UUID      (foreign key → auth.users)
to_user_id   UUID      (foreign key → auth.users)
permissao    TEXT      (view/edit/admin)
criado_em    TIMESTAMP
```

---

## SEGURANÇA

O schema usa **Row Level Security (RLS)** para garantir que:

✅ Usuários só vejam SEUS próprios items
✅ Usuários só vejam items COMPARTILHADOS com eles
✅ Usuários só possam CRIAR items com seu user_id
✅ Usuários só possam EDITAR itens de permissão edit/admin
✅ Usuários só possam DELETAR seus próprios itens ou items compartilhados com permissão admin

---

## PRÓXIMOS PASSOS

Após configurar o Supabase, você pode:

1. ✅ Testar login/registro
2. ✅ Criar projetos
3. ✅ Compartilhar projetos com colegas
4. ✅ Ver projetos compartilhados na dashboard

---

**Dúvidas?** Consulte a documentação do Supabase: https://supabase.com/docs
