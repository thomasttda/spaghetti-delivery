# 🍔 SPAGHETTI EXPRESSO — Definição Completa do Projeto

> **Documento de persistência para desenvolvimento.**
> Última atualização: 2026-05-11
> Este arquivo define todas as regras, padrões, estrutura e decisões de design do projeto.

---

## 1. Visão Geral

**SPAGHETTI EXPRESSO** é um aplicativo web de delivery de massas e espaguetes artesanais com design "Premium Elevado". O app permite que clientes naveguem pelo cardápio, montem pedidos personalizados (removendo ingredientes), finalizem a compra e acompanhem o status em tempo real. Possui também um painel administrativo completo para gerenciar pedidos, cardápio, banners e clientes.

### Público-Alvo
- **Clientes**: Usuários finais que fazem pedidos de delivery
- **Administrador**: Dono/gerente do restaurante que gerencia o negócio

---

## 2. Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.2.5 |
| Linguagem | TypeScript | ^5 |
| UI Framework | React | 19.2.4 |
| Styling | Tailwind CSS v4 | ^4 |
| Componentes UI | shadcn/ui (customizados) | Radix UI primitives |
| Estado Global | Zustand (com persist) | ^5.0.13 |
| Backend/BaaS | Supabase | ^2.105.3 |
| Carousel | Embla Carousel + Autoplay | ^8.6.0 |
| Ícones | Lucide React | ^1.14.0 |
| Upload de Imagem | react-dropzone | ^15.0.0 |
| Cupom Fiscal | html2canvas | ^1.4.1 |
| Utilitários CSS | clsx + tailwind-merge + CVA | — |
| PostCSS | @tailwindcss/postcss | ^4 |

---

## 3. Configuração do Ambiente

### Variáveis de Ambiente (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://kxpjotsmxzmjuxiasolc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_wlvVG20M8ThEEJ21bccOsg_2jb_aHC5
```

### Credenciais do Admin
- **Email**: `admin@spaghetti.com`
- **Senha**: `spaghetti123`
- **Role no banco**: `admin` (na tabela `profiles`)

### Supabase Project
- **Ref**: `kxpjotsmxzmjuxiasolc`
- **URL**: `https://kxpjotsmxzmjuxiasolc.supabase.co`
- **Imagens remotas**: Configuradas no `next.config.ts` para aceitar qualquer hostname HTTPS + Supabase Storage

---

## 4. Estrutura de Arquivos

```
spaghetti_expresso_app/
├── .env.local                    # Variáveis de ambiente (NÃO comitar)
├── .gitignore
├── next.config.ts                # Config Next.js (imagens remotas)
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
│
├── public/
│   └── logo_spaghetti.png                  # Logo SPAGHETTI EXPRESSO (~1.7MB)
│
├── supabase/
│   └── schema.sql                # Schema completo do banco de dados
│
├── scripts/
│   ├── seed-admin.ts             # Criar admin via signUp API
│   ├── seed-admin-service.ts     # Criar admin via service_role key (bypassa rate limit)
│   ├── seed-crocks.ts            # Inserir produto CROCKS no banco
│   └── fix-rls.ts                # Script para diagnosticar RLS
│
└── src/
    ├── middleware.ts              # Proteção rota /admin (headers de segurança)
    │
    ├── app/
    │   ├── globals.css            # Sistema de temas e animações
    │   ├── layout.tsx             # Layout raiz (fontes, meta SEO, ThemeProvider)
    │   ├── page.tsx               # Home: Header + BannerCarousel + ProductGrid + Cart
    │   ├── favicon.ico
    │   ├── login/
    │   │   └── page.tsx           # Login/Cadastro com email+senha
    │   ├── orders/
    │   │   └── page.tsx           # Histórico de pedidos do cliente
    │   └── admin/
    │       ├── layout.tsx         # Metadata do admin
    │       └── page.tsx           # Dashboard admin (~42KB, componente grande)
    │
    ├── components/
    │   ├── theme-provider.tsx     # Sincroniza tema Zustand com DOM
    │   ├── header.tsx             # Logo centralizado + menu perfil (admin/logout)
    │   ├── banner-carousel.tsx    # Carrossel Embla com autoplay + link p/ produto
    │   ├── product-grid.tsx       # Grid 2x2 + filtro por categorias
    │   ├── product-detail.tsx     # Sheet: foto, descrição, ingredientes, qty, upsell
    │   ├── beverage-upsell.tsx    # Pop-up de bebida ao adicionar não-bebida
    │   ├── cart-button.tsx        # FAB flutuante com contador
    │   ├── cart-sheet.tsx         # Painel lateral do carrinho
    │   ├── checkout.tsx           # Dialog de finalização (nome, tel, endereço)
    │   ├── receipt.tsx            # Cupom fiscal + exportar PNG (html2canvas)
    │   └── ui/
    │       ├── button.tsx         # CVA variants (default, outline, ghost, etc.)
    │       ├── dialog.tsx         # Radix Dialog wrapper
    │       ├── sheet.tsx          # Radix Dialog como slide-out panel
    │       ├── input.tsx          # Input estilizado
    │       └── badge.tsx          # Badge com variants (success, warning, danger)
    │
    ├── lib/
    │   ├── supabase.ts            # Cliente Supabase + Database types + OrderStatus
    │   ├── utils.ts               # cn(), formatCurrency(R$), formatDate, generateOrderNumber
    │   └── demo-data.ts           # Dados fallback (CROCKS + categorias + banners demo)
    │
    └── store/
        ├── cart-store.ts          # Zustand: carrinho com persistência em localStorage
        └── theme-store.ts         # Zustand: tema fixo em 'light'
```

---

## 5. Banco de Dados (Supabase PostgreSQL)

### Tabelas

#### `profiles` (extends auth.users)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID (PK, FK → auth.users) | ID do usuário |
| email | TEXT | Email do usuário |
| full_name | TEXT | Nome completo |
| phone | TEXT | Telefone |
| address | TEXT | Endereço |
| role | TEXT ('customer' \| 'admin') | Papel do usuário |
| total_spent | NUMERIC | Total gasto (R$) |
| order_count | INTEGER | Total de pedidos |
| created_at | TIMESTAMPTZ | Data de criação |

#### `categories`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID (PK) | ID da categoria |
| name | TEXT | Nome (ex: Hambúrgueres) |
| slug | TEXT (UNIQUE) | Slug (ex: hamburgueres) |
| order | INTEGER | Ordem de exibição |

**Categorias pré-definidas**: Massas Tradicionais, Especiais, Bebidas, Sobremesas

#### `products`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID (PK) | ID do produto |
| name | TEXT | Nome do produto |
| description | TEXT | Descrição |
| price | NUMERIC | Preço em R$ |
| image_url | TEXT | URL da imagem |
| category | TEXT | Slug da categoria |
| ingredients | TEXT[] | Array de ingredientes |
| available | BOOLEAN | Se está disponível |

#### `banners`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID (PK) | ID do banner |
| image_url | TEXT | URL da imagem |
| title | TEXT | Título do banner |
| active | BOOLEAN | Se está ativo |
| order | INTEGER | Ordem de exibição |
| product_id | UUID (FK → products, nullable) | Produto linkado |

#### `orders`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID (PK) | ID do pedido |
| order_number | TEXT | Número do pedido (ex: SR-1234-ABCD) |
| customer_name | TEXT | Nome do cliente |
| customer_phone | TEXT | Telefone |
| customer_address | TEXT | Endereço |
| customer_email | TEXT (nullable) | Email |
| items | JSONB | Array de itens do pedido |
| subtotal | NUMERIC | Subtotal |
| delivery_fee | NUMERIC | Taxa de entrega (R$ 5,99) |
| discount | NUMERIC | Desconto |
| total | NUMERIC | Total |
| status | TEXT | pending → preparing → ready → out_for_delivery → delivered |
| user_id | UUID (FK → auth.users, nullable) | Usuário logado |

### RLS (Row Level Security)
- **profiles**: Usuários veem apenas seu próprio perfil; admin (via JWT email check) vê todos
- **categories**: Qualquer um pode ver; admin gerencia
- **products**: Qualquer um pode ver; admin gerencia
- **banners**: Qualquer um pode ver; admin gerencia
- **orders**: Usuário vê próprios pedidos; qualquer um pode criar; admin vê/atualiza todos

### Realtime
- Tabela `orders` publicada via `supabase_realtime` para atualizações em tempo real

### Trigger
- `handle_new_user()`: Cria automaticamente um perfil na tabela `profiles` quando um novo usuário se cadastra no Auth

---

## 6. Rotas da Aplicação

| Rota | Tipo | Descrição | Proteção |
|------|------|-----------|----------|
| `/` | Client | Home: carrossel, cardápio, carrinho | Pública |
| `/login` | Client | Login/Cadastro | Pública |
| `/orders` | Client | Histórico de pedidos | Requer auth |
| `/admin` | Client | Dashboard admin (pedidos, cardápio, banners, CRM) | Requer role `admin` |

---

## 7. Design System

### Tema Ativo: Light Mode Premium
O tema dark foi removido. Apenas Light Mode é utilizado.

#### Paleta de Cores (Light)
| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#FFFBF0` | Fundo principal (creme) |
| `--fg` | `#1a1a1a` | Texto principal |
| `--card-bg` | `#FFFFFF` | Fundo de cards |
| `--primary` | `#D97706` | Cor de destaque (âmbar) |
| `--primary-fg` | `#FFFFFF` | Texto sobre primary |
| `--secondary` | `#F5F0E8` | Fundo secundário |
| `--muted` | `#F5F0E8` | Elementos discretos |
| `--muted-fg` | `#737373` | Texto discreto |
| `--border-color` | `#E5DFD3` | Bordas |
| `--color-gold` | `#D4AF37` | Dourado (branding) |
| `--color-danger` | `#EF4444` | Erros/excluir |
| `--color-success` | `#22C55E` | Sucesso |

#### Tipografia
| Token | Fonte | Uso |
|-------|-------|-----|
| `--font-sans` | Inter | Texto geral |
| `--font-display` | Outfit | Títulos, branding |
| `--font-mono` | JetBrains Mono | Cupom fiscal |

Fontes carregadas via Google Fonts no `layout.tsx`.

#### Animações Disponíveis
- `animate-fade-in` — Fade + slide de 8px
- `animate-slide-up` — Slide de baixo para cima
- `animate-shimmer` — Brilho dourado flutuante
- `animate-pulse-gold` — Pulsação dourada (FAB)
- `animate-bounce-subtle` — Bounce suave
- `.card-premium` — Hover lift com sombra dourada
- `.glass` — Glassmorphism (blur + translucidez)
- `.chip-active` — Gradiente âmbar nos chips ativos

#### Sombras Premium
- Banners: `shadow-[0_8px_30px_rgb(0,0,0,0.08)]`
- Cards: `shadow-[0_4px_20px_rgb(0,0,0,0.06)]`
- Hover: `hover:shadow-[0_8px_32px_rgba(217,119,6,0.15)]`

---

## 8. Componentes — Padrões e Convenções

### Regras Gerais
1. Todos os componentes são **Client Components** (`'use client'`)
2. Imports de ícones: sempre usar **Lucide React**
3. Utilitário CSS: sempre usar `cn()` de `@/lib/utils` para merge de classes
4. Formatação de moeda: sempre usar `formatCurrency()` (R$ brasileiro)
5. Componentes UI base ficam em `src/components/ui/`
6. Componentes de feature ficam em `src/components/`

### Padrão de Dados
- Dados vêm do Supabase primeiro
- Se o Supabase retornar vazio/erro, usa dados de `demo-data.ts` como fallback
- Isso garante que o app funciona mesmo sem banco configurado

### Carrinho (Zustand)
- Persistido em `localStorage` com chave `spaghetti-expresso-cart`
- Apenas `items` são persistidos (não o estado de aberto/fechado)
- Itens com mesmos ingredientes removidos são agrupados (incrementam qty)
- Itens com ingredientes removidos diferentes são tratados como itens separados

### Admin Dashboard
- **Arquivo grande** (~42KB): `src/app/admin/page.tsx`
- Possui 4 abas: Pedidos | Cardápio | Banners | CRM
- Autenticação verificada client-side via query ao `profiles`
- Fallback: se query falhar, verifica se email === `admin@spaghetti.com`
- Pedidos com Supabase Realtime (subscrição)
- Alerta sonoro para novos pedidos (via Web Audio API)

---

## 9. Fluxo do Usuário

### Fluxo de Compra
```
Home → Escolher Produto → ProductDetail (Sheet)
  → Remover ingredientes (opcional)
  → Selecionar quantidade
  → "Adicionar ao Carrinho"
    → [Se não é bebida] → BeverageUpsell (Dialog)
  → CartButton (FAB) → CartSheet (painel lateral)
    → "Fechar Pedido" → Checkout (Dialog)
      → Preencher: Nome, Telefone, Endereço
      → "Enviar Pedido"
        → Receipt (cupom fiscal)
          → "Baixar Comprovante" (PNG via html2canvas)
```

### Fluxo do Admin
```
Login (admin@spaghetti.com) → Header menu → "Painel Admin"
  → Aba "Pedidos": Ver pedidos em tempo real → Atualizar status
  → Aba "Cardápio": Adicionar/Editar/Excluir produtos
  → Aba "Banners": Adicionar/Editar/Excluir banners + linkar produto
  → Aba "CRM": Ver clientes, total gasto, nº de pedidos
```

### Fluxo de Status do Pedido
```
pending → preparing → ready → out_for_delivery → delivered
(Pendente → Preparando → Pronto → Saiu p/ Entrega → Entregue)
```

---

## 10. Segurança

### Middleware
- Rota `/admin/*` recebe headers de segurança: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- Proteção de acesso é feita **client-side** via Supabase Auth

### Supabase Auth
- `persistSession: true` — Sessão salva no localStorage
- `autoRefreshToken: true` — Token renovado automaticamente
- `detectSessionInUrl: true` — Detecta callback do OAuth
- Confirmação de email: **desabilitada** no Supabase Dashboard (acesso imediato)

### RLS (Row Level Security)
- Todas as tabelas têm RLS habilitado
- Admin é detectado por `(auth.jwt() ->> 'email') = 'admin@spaghetti.com'` na policy de profiles
- Demais tabelas usam `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`

> **⚠️ ATENÇÃO**: As policies de `products`, `banners` e `orders` que referenciam a tabela `profiles` podem causar **recursão infinita** se a policy de `profiles` também referenciar `profiles`. Esse bug já foi identificado e um fix SQL foi gerado. Verificar se já foi aplicado no banco.

---

## 11. Deploy & Infraestrutura

### Repositório GitHub
- **Repo**: `thomasttda/spaghetti-expresso-ios`
- **Branch principal**: `main` (ou `master`)

### Deploy (Pendente)
- **Plataforma alvo**: Vercel
- **Variáveis de ambiente necessárias na Vercel**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Status**: Deploy ainda não foi finalizado

### Supabase Setup (Verificar)
- [ ] `schema.sql` executado no SQL Editor do Supabase
- [ ] Fix das políticas RLS aplicado (resolver recursão infinita)
- [ ] Confirmação de email desabilitada em Authentication > Settings
- [ ] Tabela `orders` adicionada ao Realtime
- [ ] Coluna `product_id` adicionada à tabela `banners` (se não veio pelo schema)
- [ ] Admin promovido: `UPDATE profiles SET role = 'admin' WHERE email = 'admin@spaghetti.com'`

---

## 12. Problemas Conhecidos e Decisões

### Bugs Conhecidos
1. **Recursão infinita RLS**: Policies que fazem `SELECT FROM profiles` dentro de uma policy da própria `profiles` causam erro 500. Solução: usar `auth.jwt() ->> 'email'` na policy de profiles.
2. **Demo banners sem imagem**: Os banners demo referenciam `/banners/banner1.jpg` etc., que não existem no diretório `public/`. Funcionam apenas quando há banners reais cadastrados no Supabase.
3. **Admin page muito grande**: O arquivo `admin/page.tsx` tem ~42KB. Idealmente deveria ser dividido em sub-componentes.

### Decisões de Design
1. **Sem tema Dark**: Removido por decisão do usuário. Apenas Light Mode Premium.
2. **Sem login com Google**: Foi implementado e depois removido por decisão do usuário.
3. **Confirmação de email desabilitada**: Para permitir acesso imediato após cadastro.
4. **Dados demo como fallback**: O app funciona sem banco configurado, mostrando dados fictícios.
5. **Taxa de entrega fixa**: `R$ 5,99` definida em `demo-data.ts` como `DELIVERY_FEE`.
6. **Moeda**: Estritamente Real Brasileiro (R$) via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

---

## 13. Comandos Úteis

```bash
# Desenvolvimento local
npm run dev                     # Inicia dev server em localhost:3000

# Build de produção
npm run build                   # Compila para produção

# Seed scripts (requerem npx tsx)
npx tsx scripts/seed-admin.ts                           # Cria admin via signUp
npx tsx scripts/seed-admin-service.ts <SERVICE_ROLE_KEY> # Cria admin via service role
npx tsx scripts/seed-crocks.ts <SERVICE_ROLE_KEY>        # Insere produto CROCKS

# Git
git add . && git commit -m "mensagem" && git push       # Enviar alterações
```

---

## 14. Glossário

| Termo | Significado |
|-------|------------|
| Sheet | Painel que desliza da lateral/baixo (Radix Dialog) |
| FAB | Floating Action Button (botão flutuante do carrinho) |
| Upsell | Sugestão de venda adicional (bebidas) |
| RLS | Row Level Security (segurança por linha no PostgreSQL) |
| CVA | Class Variance Authority (variants de componentes CSS) |
| Glassmorphism | Efeito visual com blur + transparência |
| Chip | Botão pequeno arredondado (filtro de categorias) |
