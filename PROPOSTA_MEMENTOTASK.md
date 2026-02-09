# MEMENTOTASK - Proposta de Desenvolvimento

## 📋 VISÃO GERAL

**Mementotask** é um sistema de gerenciamento de projetos hierárquico desenvolvido para acompanhar projetos de criação de sites desde o briefing até a entrega final.

**Desenvolvedor:** Nicolas Bagatini (@devzbagatini)  
**Repositório:** https://github.com/devzbagatini/mementotask  
**Stack:** Next.js 16 + React + Tailwind CSS + TypeScript

---

## 🎯 OBJETIVO

Criar uma aplicação web moderna que substitua ferramentas como Notion, oferecendo controle total sobre gerenciamento de projetos com estrutura hierárquica clara e visualizações múltiplas.

---

## 🏗️ ESTRUTURA HIERÁRQUICA

```
PROJETO (Cliente)
└── TAREFA (Etapa do projeto)
    └── SUBTAREFA (Atividade específica)
```

### Exemplo Prático:
```
📁 PROJETO: Silva Advogados - Redesign Site
   Status: Em Andamento | Prazo: 28/02/2024 | Valor: R$ 5.500
   
   ├── 📝 TAREFA: Briefing com cliente
   │   Status: Concluída
   │   ├── ✅ SUBTAREFA: Coletar requisitos
   │   ├── ✅ SUBTAREFA: Definir páginas
   │   └── ✅ SUBTAREFA: Escolher referências
   │
   ├── 📝 TAREFA: Criar layout no Elementor
   │   Status: Em andamento
   │   ├── ✅ SUBTAREFA: Home page
   │   ├── 🔄 SUBTAREFA: Página sobre
   │   └── ⏳ SUBTAREFA: Página serviços
   │
   └── 📝 TAREFA: Desenvolvimento
       Status: A fazer
       ├── ⏳ SUBTAREFA: Instalar plugins
       ├── ⏳ SUBTAREFA: Configurar SEO
       └── ⏳ SUBTAREFA: Testes responsivo
```

---

## 💾 ESTRUTURA DE DADOS

### Schema Único (Uma Database)

Todos os itens (Projetos, Tarefas, Subtarefas) ficam na **mesma tabela** com relacionamento hierárquico via campo `parentId`.

```typescript
interface Item {
  id: string;
  nome: string;
  tipo: 'projeto' | 'tarefa' | 'subtarefa';
  status: 'a_fazer' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado';
  prioridade: 'alta' | 'media' | 'baixa';
  
  // Hierarquia
  parentId: string | null; // ID do item pai (null para projetos raiz)
  
  // Dados específicos de Projeto
  cliente?: string;
  valor?: number;
  valorRecebido?: number;
  tipoProjeto?: 'institucional' | 'ecommerce' | 'blog' | 'landing_page' | 'personalizado';
  
  // Datas
  dataInicio?: Date;
  prazo?: Date;
  dataEntrega?: Date;
  
  // Outras informações
  descricao?: string;
  responsavel?: string;
  tecnologias?: string[]; // ['Elementor', 'WooCommerce', etc]
  notas?: string;
  
  // Metadados
  criadoEm: Date;
  atualizadoEm: Date;
}
```

---

## 🎨 VISUALIZAÇÕES

O Mementotask oferece **3 modos de visualização**:

### 1. 📊 KANBAN (Principal)
- Colunas por **Status** (A Fazer, Em Andamento, Pausado, Concluído)
- Cards hierárquicos (Projetos → Tarefas → Subtarefas)
- Drag & Drop entre colunas
- Cores diferentes por tipo:
  - 🔵 Projeto (azul) - com barra de progresso
  - 🟢 Tarefa (verde) - vinculada ao projeto
  - 🟣 Subtarefa (roxo) - indentada

### 2. 📋 TABELA
- Lista hierárquica com indentação visual
- Colunas: Nome, Tipo, Status, Cliente, Prazo, Valor
- Filtros por: Status, Cliente, Tipo, Prazo
- Ordenação customizável
- Busca global

### 3. 📅 TIMELINE
- Linha do tempo dos projetos
- Visualização por prazo
- Barras de progresso
- Identificação de atrasos
- Agrupamento por período (semana, mês)

---

## 🎨 DESIGN REFERENCE

Um protótipo visual HTML já foi criado mostrando o layout esperado. Principais características:

**Header:**
- Logo/Nome do projeto
- Botão "Novo Projeto"

**Navegação:**
- Tabs para trocar entre visualizações (Kanban, Tabela, Timeline)

**Filtros:**
- Status, Cliente, Busca
- Sempre visíveis no topo

**Cards (Kanban):**
- Projeto: Nome, Cliente, Valor, Prazo, Barra de progresso
- Tarefa: Nome, Projeto pai, Prazo
- Subtarefa: Nome, Tarefa pai, Status

**Cores por Prioridade:**
- 🔴 Alta
- 🟡 Média
- 🟢 Baixa

**Estilo:**
- Design clean e profissional
- Inspirado no protótipo criado (prototipo-visual.html)
- Tailwind CSS para estilização
- Responsivo mobile-first

---

## 🛠️ TECNOLOGIAS

### Frontend
- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utility-first
- **Framer Motion** - Animações (opcional)
- **Lucide React** - Ícones

### Backend/Dados (Fase 1)
- **localStorage** - Armazenamento local do navegador
  - Simples para MVP
  - Funciona offline
  - Sem necessidade de servidor
  - Migração futura para banco de dados

### Backend/Dados (Fase 2 - Futuro)
- **Supabase** ou **Firebase** - BaaS para persistência
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM para TypeScript

### DevOps
- **Git** - Controle de versão
- **GitHub** - Repositório remoto
- **Vercel** - Deploy e hospedagem (futuro)

---

## 📁 ESTRUTURA DO PROJETO

```
mementotask/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout global
│   ├── page.tsx           # Página inicial (dashboard)
│   ├── projetos/          # Rotas de projetos
│   └── globals.css        # Estilos globais
│
├── components/            # Componentes React (criar)
│   ├── ui/               # Componentes base (Button, Card, etc)
│   ├── kanban/           # Componentes do Kanban
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── KanbanCard.tsx
│   ├── tabela/           # Componentes da Tabela
│   │   ├── TabelaView.tsx
│   │   └── TabelaRow.tsx
│   ├── timeline/         # Componentes do Timeline
│   │   └── TimelineView.tsx
│   ├── forms/            # Formulários
│   │   ├── ProjetoForm.tsx
│   │   ├── TarefaForm.tsx
│   │   └── SubtarefaForm.tsx
│   └── layout/           # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Filtros.tsx
│
├── lib/                   # Utilitários (criar)
│   ├── storage.ts        # Interface localStorage
│   ├── types.ts          # Tipos TypeScript
│   └── utils.ts          # Funções auxiliares
│
├── public/               # Arquivos estáticos
├── node_modules/         # Dependências (não versionar)
├── package.json          # Dependências e scripts
├── tsconfig.json         # Config TypeScript
├── tailwind.config.ts    # Config Tailwind
└── README.md             # Documentação

```

---

## 🚀 ROADMAP DE DESENVOLVIMENTO

### ✅ FASE 0: Setup (CONCLUÍDO)
- [x] Criar repositório GitHub
- [x] Inicializar projeto Next.js
- [x] Configurar Git
- [x] Primeiro push
- [x] Rodar projeto local

### 🎯 FASE 1: Estrutura Base (PRÓXIMA)
**Objetivo:** Criar fundação do projeto

**1.1 - Tipos e Storage**
- [ ] Criar `lib/types.ts` com interfaces
- [ ] Criar `lib/storage.ts` para localStorage
- [ ] Implementar CRUD básico (Create, Read, Update, Delete)
- [ ] Criar dados de exemplo (mock data)

**1.2 - Componentes Base**
- [ ] Header com logo e botão "Novo Projeto"
- [ ] Tabs de navegação (Kanban, Tabela, Timeline)
- [ ] Filtros (Status, Cliente, Busca)
- [ ] Card genérico para Projeto/Tarefa/Subtarefa

**1.3 - Visualização Kanban (Básica)**
- [ ] Layout de 4 colunas (A Fazer, Em Andamento, Pausado, Concluído)
- [ ] Renderizar cards por status
- [ ] Mostrar hierarquia visual (indentação)
- [ ] SEM drag & drop ainda (adicionar depois)

**1.4 - Visualização Tabela (Básica)**
- [ ] Tabela com colunas essenciais
- [ ] Indentação hierárquica
- [ ] Ordenação por coluna
- [ ] Busca básica

### 📋 FASE 2: Funcionalidades Core
**Objetivo:** Adicionar interatividade

**2.1 - Formulários**
- [ ] Modal para criar Projeto
- [ ] Modal para criar Tarefa
- [ ] Modal para criar Subtarefa
- [ ] Validação de campos
- [ ] Salvar no localStorage

**2.2 - Edição e Exclusão**
- [ ] Editar item existente
- [ ] Excluir item (com confirmação)
- [ ] Mover item entre status (dropdown)
- [ ] Atualizar progresso do projeto

**2.3 - Drag & Drop no Kanban**
- [ ] Instalar biblioteca (react-beautiful-dnd ou dnd-kit)
- [ ] Implementar drag entre colunas
- [ ] Atualizar status automaticamente
- [ ] Animações suaves

### 🎨 FASE 3: Polish e UX
**Objetivo:** Melhorar experiência

**3.1 - Timeline**
- [ ] Criar visualização Timeline
- [ ] Mostrar projetos por data
- [ ] Barras de progresso
- [ ] Identificar atrasos

**3.2 - Dashboard/Analytics**
- [ ] Estatísticas gerais (projetos ativos, concluídos, etc)
- [ ] Gráficos simples (Chart.js)
- [ ] Projetos urgentes (prazo próximo)
- [ ] Valor total em projetos

**3.3 - Melhorias UX**
- [ ] Loading states
- [ ] Toast notifications (sucesso/erro)
- [ ] Confirmar ações destrutivas
- [ ] Atalhos de teclado
- [ ] Tema escuro/claro
- [ ] Responsividade mobile

### 🚀 FASE 4: Deploy e Produção
**Objetivo:** Colocar online

- [ ] Testar em diferentes navegadores
- [ ] Otimizar performance
- [ ] Deploy no Vercel
- [ ] Configurar domínio (mementotask.io)
- [ ] Analytics (opcional)

### 🔮 FASE 5: Futuro
**Features avançadas (depois do MVP)**

- [ ] Migrar para banco de dados (Supabase/Firebase)
- [ ] Autenticação (login/registro)
- [ ] Multi-usuário (equipes)
- [ ] Anexar arquivos
- [ ] Comentários e histórico
- [ ] Notificações de prazo
- [ ] Export/Import de dados
- [ ] Integrações (Google Drive, Slack)
- [ ] API pública
- [ ] App mobile (React Native)

---

## 💡 DECISÕES TÉCNICAS

### Por que localStorage primeiro?
- ✅ Mais simples para MVP
- ✅ Funciona offline
- ✅ Sem custo de servidor
- ✅ Desenvolvimento mais rápido
- ✅ Fácil migrar depois

### Por que Next.js?
- ✅ Framework moderno e popular
- ✅ React com superpoderes (SSR, routing, etc)
- ✅ Perfeito para apps web
- ✅ Deploy fácil (Vercel)
- ✅ Comunidade gigante

### Por que Tailwind CSS?
- ✅ Estilização rápida
- ✅ Utility-first (como Bootstrap)
- ✅ Não precisa escrever CSS
- ✅ Responsivo built-in
- ✅ Muito popular

---

## 📝 EXEMPLOS DE DADOS

### Projeto Exemplo
```typescript
{
  id: "proj_1",
  nome: "Silva Advogados - Redesign Site",
  tipo: "projeto",
  status: "em_andamento",
  prioridade: "media",
  parentId: null,
  cliente: "João Silva",
  valor: 5500,
  valorRecebido: 2750,
  tipoProjeto: "institucional",
  dataInicio: "2024-01-15",
  prazo: "2024-02-28",
  tecnologias: ["Elementor", "RankMath SEO"],
  descricao: "Modernização completo do site",
  responsavel: "Nico",
  criadoEm: "2024-01-15T10:00:00Z",
  atualizadoEm: "2024-02-07T14:00:00Z"
}
```

### Tarefa Exemplo
```typescript
{
  id: "task_1",
  nome: "Criar layout no Elementor",
  tipo: "tarefa",
  status: "em_andamento",
  prioridade: "alta",
  parentId: "proj_1", // Pertence ao projeto Silva Advogados
  prazo: "2024-02-15",
  responsavel: "Nico",
  notas: "Layouts das 3 principais páginas",
  criadoEm: "2024-01-16T09:00:00Z",
  atualizadoEm: "2024-02-05T16:30:00Z"
}
```

### Subtarefa Exemplo
```typescript
{
  id: "subtask_1",
  nome: "Design Página Sobre",
  tipo: "subtarefa",
  status: "em_andamento",
  prioridade: "alta",
  parentId: "task_1", // Pertence à tarefa Criar layout
  prazo: "2024-02-10",
  responsavel: "Nico",
  notas: "Em revisão",
  criadoEm: "2024-01-17T11:00:00Z",
  atualizadoEm: "2024-02-06T10:00:00Z"
}
```

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

**AGORA:** Começar Fase 1.1 - Criar estrutura base

1. Criar arquivo `lib/types.ts` com todas as interfaces
2. Criar arquivo `lib/storage.ts` com funções CRUD
3. Criar arquivo `lib/mock-data.ts` com dados de exemplo
4. Testar se storage funciona corretamente

**Depois:** Criar componentes visuais básicos

---

## 📚 REFERÊNCIAS

- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs
- **Lucide Icons:** https://lucide.dev

---

## 🤝 DESENVOLVIMENTO

**Metodologia:**
- Desenvolvimento incremental (uma feature por vez)
- Commits frequentes com mensagens descritivas
- Testar cada funcionalidade antes de avançar
- Usar Claude Code para acelerar desenvolvimento
- Manter código limpo e organizado

**Padrão de Commit:**
```
feat: adiciona componente KanbanBoard
fix: corrige bug no filtro de status
docs: atualiza README com instruções
refactor: melhora estrutura do storage
style: ajusta espaçamento dos cards
```

---

## 🎓 FILOSOFIA DO PROJETO

> "Criar uma ferramenta simples, bonita e eficiente que realmente ajude no dia a dia do desenvolvedor web. Sem complicações, sem features desnecessárias. Apenas o essencial, bem feito."

**Princípios:**
- 🎯 **Foco** - Fazer uma coisa e fazer bem
- 🎨 **Design** - Interface limpa e profissional
- ⚡ **Performance** - Rápido e responsivo
- 📱 **Mobile-first** - Funciona em qualquer dispositivo
- 🔧 **Pragmático** - Soluções simples primeiro, complexidade depois

---

**Última atualização:** 07/02/2026  
**Status:** Projeto inicializado, pronto para desenvolvimento  
**Desenvolvedor:** Nicolas Bagatini (@devzbagatini)
