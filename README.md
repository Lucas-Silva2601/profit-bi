<div align="center">

# Profit BI

**Plataforma de Business Intelligence multi-tenant com dashboards gerados automaticamente por Inteligência Artificial.**

Arraste um Excel. Em segundos, um LLM desenha o painel gerencial completo — KPIs, gráficos e filtros — pronto para compartilhar com um link público.

[![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript%205-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://sdk.vercel.ai/)

[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](#-licença)
![Status](https://img.shields.io/badge/status-ativo-brightgreen?style=for-the-badge)

</div>

---

## 🧠 Sobre o projeto

O Profit BI nasceu de uma dor real: **empresas pequenas e médias que dependem de planilhas soltas** e ferramentas de BI caras demais para o que precisam. A proposta é simples — transformar um `.xlsx` cru em um painel executivo profissional, sem configurar nada.

O diferencial está no **pipeline autogerado**: em vez de o usuário montar gráfico por gráfico (como no Power BI clássico), ele faz upload dos dados e um LLM atua como *analista de dados sênior*, decidindo quais KPIs criar, qual o melhor tipo de gráfico para cada coluna e como agrupar as métricas — devolvendo o layout completo do dashboard em JSON.

### ✨ Destaques

- 🤖 **Dashboards autogerados por IA** — Ollama Cloud (`gemma4:31b-cloud`) analisa o schema dos dados e projeta o painel inteiro em JSON
- 📊 **Enterprise Grid** — renderização densa em CSS Grid com paginação por lâminas (sem rolagem bagunçada), no nível visual de ferramentas corporativas
- 🔗 **Links públicos seguros** — compartilhe qualquer painel via token único, com opção de senha e expiração
- 🏢 **Multi-tenant de verdade** — workspaces isolados; cada empresa enxerga apenas os próprios dados
- 💬 **Chat e insights com IA** — pergunte ao painel em linguagem natural e receba resumos executivos
- 🔌 **Integrações OAuth nativas** — Google Analytics, Google Sheets e Meta Ads com importação automática
- ↩️ **Versionamento de dashboards** — restaure layouts anteriores a qualquer momento
- 🛡️ **Segurança** — rate limiting por rota, validação tipada (Zod) de ponta a ponta e escopo de tenant aplicado em todas as queries

---

## 🗺️ Arquitetura

```mermaid
flowchart LR
    subgraph INPUT
        A[📁 Excel / CSV]
        B[🔌 GA · Sheets · Meta Ads]
    end

    subgraph PIPELINE["ETL + IA"]
        C[Extração e limpeza<br/>de dados]
        D[Engine LLM<br/>Ollama Cloud]
        E[Layout JSON<br/>KPIs + Gráficos]
    end

    subgraph DATA
        F[(PostgreSQL)]
        G[Drizzle ORM<br/>9 tabelas]
    end

    subgraph RENDER
        H[Engine de<br/>Agregação]
        I[Enterprise Grid<br/>Recharts + CSS Grid]
        J[/🔗 Link público/]
    end

    A --> C
    B --> C
    C --> D
    D --> E
    C --> G
    G --> F
    F --> H
    E --> H
    H --> I
    I --> J
```

### Como funciona o fluxo

1. **Upload** — o usuário solta a planilha em `/dashboard/upload`; o backend lê via Buffer e normaliza datas, moedas e separadores brasileiros automaticamente
2. **Persistência** — os dados são salvos em `datasets` + `dataset_rows` (JSONB flexível) no PostgreSQL
3. **IA projeta o layout** — uma amostra do schema vai para o LLM, que devolve o dashboard completo em JSON: KPIs no topo, gráficos ideais por tipo de coluna, filtros e cores da marca
4. **Renderização** — a Engine de Agregação roda no servidor sobre os dados filtrados e o Enterprise Grid renderiza tudo em lâminas paginadas
5. **Compartilhamento** — um clique gera um link público com token (e senha opcional), acessível sem login

---

## 🛠️ Stack

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | Next.js 16 (App Router, Server Components), React 19, Tailwind CSS 4, Recharts, lucide-react |
| **Backend** | Server Actions, Route Handlers, TypeScript 5 |
| **Banco de dados** | PostgreSQL (Neon/Railway/local) + Drizzle ORM (schema tipado, migrations) |
| **Autenticação** | Better Auth próprio — e-mail/senha + Google OAuth, sessões em banco |
| **IA** | Vercel AI SDK → Ollama Cloud (`gemma4:31b-cloud`) |
| **Integrações** | Google Analytics, Google Sheets e Meta Ads (OAuth 2.0 via `googleapis`) |
| **Qualidade** | ESLint 9, Prettier, Husky + lint-staged, Zod, `@t3-oss/env-nextjs` |

<div align="center">

<img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,postgres,vercel,github,vscode" alt="Tecnologias" />

</div>

---

## 🚀 Começando

### Pré-requisitos

- Node.js 20+
- PostgreSQL — local via Docker (recomendado em dev) ou na nuvem ([Neon](https://neon.tech) — free tier)
- Docker Desktop (opcional, apenas para o banco local)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/profit-bi.git
cd profit-bi

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp .env.example .env.local
#    Gere o segredo do auth:
openssl rand -base64 32   # cole o resultado no BETTER_AUTH_SECRET

# 4. Suba o banco local e aplique as migrations
npm run db:up      # PostgreSQL 16 via Docker (pule se for usar Neon)
npm run db:migrate

# 5. Suba o desenvolvimento
npm run dev
```

### Banco de dados

**Opção A — PostgreSQL local com Docker (recomendado para desenvolvimento)**

```bash
npm run db:up      # sobe o container postgres:16 na porta 5432
npm run db:migrate # cria as tabelas
```

O `.env.local` deve apontar para `postgresql://profitbi:profitbi@localhost:5432/profitbi`. Para derrubar o banco: `npm run db:down`.

**Opção B — Neon / PostgreSQL externo**

Crie o banco no [Neon](https://neon.tech), copie a connection string para `DATABASE_URL` no `.env.local` e rode `npm run db:migrate`.

> ⚠️ Sem `.env.local` a aplicação não inicia: `DATABASE_URL` e `BETTER_AUTH_SECRET` são obrigatórios (validação Zod em `env.ts`).

Acesse [http://localhost:3000](http://localhost:3000), crie sua conta e arraste sua primeira planilha.

### Execução rápida (abre o navegador automaticamente)

| Comando | O que faz |
|---------|-----------|
| `npm run app:start` | Sobe o servidor e abre `http://localhost:3000` no navegador assim que estiver pronto |
| `npm run app:stop` | Encerra a instância em execução |
| `npm run app:restart` | Reinicia a aplicação (stop + start) |

> Os scripts gravam o PID em `.app.pid` para evitar instâncias duplicadas e funcionam em Windows, macOS e Linux. Se a porta 3000 estiver ocupada, a URL real é detectada no output do Next e aberta corretamente.

### Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run app:start` | Inicia + abre o navegador automaticamente |
| `npm run app:stop` / `app:restart` | Para ou reinicia a aplicação |
| `npm run build` / `start` | Build e produção |
| `npm run lint` | Lint com ESLint |
| `npm run db:up` / `db:down` | Sobe/derruba o PostgreSQL local (Docker) |
| `npm run db:generate` | Gera migration a partir do schema |
| `npm run db:migrate` | Aplica migrations pendentes |
| `npm run db:push` | Sincroniza schema direto (dev) |
| `npm run db:studio` | GUI de exploração do banco |

---

## 🔐 Variáveis de ambiente

Validadas com Zod em `env.ts` (100% TypeScript, tipos inferidos automaticamente) — o build falha se uma obrigatória faltar. Copie `.env.example` como ponto de partida.

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `DATABASE_URL` | ✅ | String de conexão PostgreSQL |
| `BETTER_AUTH_SECRET` | ✅ | Segredo do Better Auth (mín. 32 chars) |
| `BETTER_AUTH_URL` | — | URL pública da app para o auth |
| `NEXT_PUBLIC_BASE_URL` | — | URL base em produção |
| `OLLAMA_API_KEY` | — | Chave da Ollama Cloud (https://ollama.com/settings/keys) |
| `OLLAMA_MODEL` | — | Padrão: `gemma4:31b-cloud` |
| `OLLAMA_BASE_URL` | — | Padrão: `https://ollama.com/v1` (use `http://localhost:11434/v1` para Ollama local) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | Login Google + Sheets + Analytics |
| `META_APP_ID` / `META_APP_SECRET` | — | Meta Ads (Facebook/Instagram) |

> **Login com Google:** no Google Cloud Console, cadastre a redirect URI `http://localhost:3000/api/auth/callback/google` (e o equivalente do domínio em produção). Detalhes completos no [guia do Better Auth](https://www.better-auth.com/docs).

---

## 📁 Estrutura

```text
profit-bi/
├── app/                  # App Router — páginas, APIs e Server Actions
│   ├── api/              # auth · ai · datasets · profile · integrations
│   ├── actions/          # dataset · share · versions
│   └── dashboard/        # lobby · upload · settings · bi/[id] · share/[token]
├── components/           # Componentes React (dashboard/, layout/, UI)
├── utils/                # Helpers (auth, session, workspace, ai, aggregation)
├── db/                   # Drizzle ORM — schema.ts, index.ts, migrations/
├── assets/               # Imagens estáticas
├── env.ts                # Variáveis de ambiente tipadas (Zod)
├── drizzle.config.ts     # Config do drizzle-kit
└── middleware.ts         # Proteção de rotas via cookie de sessão
```

---

## 🗺️ Roadmap

- [ ] Filtros dinâmicos editáveis pelo usuário no painel
- [ ] Alertas e metas por KPI (notificações de atingimento)
- [ ] Agendamento de relatórios por e-mail
- [ ] Exportação direta para PDF
- [ ] Modo colaborativo (comentários em painéis)
- [ ] Suporte a mais fontes: Stripe, RD Station, Mercado Livre

---

## 🤝 Contato

<div align="center">

Desenvolvido com ❤️ por **Jonata**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SEU_USUARIO)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/SEU_PERFIL)

</div>

<!-- Preencha acima com seus links reais de GitHub e LinkedIn -->

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
