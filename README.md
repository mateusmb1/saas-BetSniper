# BetSniper - Plataforma de Análise Esportiva SaaS

Sistema completo de análise e recomendação de apostas esportivas com inteligência artificial, alimentado por múltiplas fontes de dados em tempo real.

## 🎯 Características

### Frontend (React + Vite + TypeScript)
- ✅ Interface moderna e responsiva (mobile-first)
- ✅ Autenticação Supabase
- ✅ Dashboard em tempo real com WebSocket
- ✅ Análises de jogos com IA (Gemini)
- ✅ Sistema de perfis e planos (Free/Pro/Elite)
- ✅ Histórico de apostas e notificações
- ✅ Simulador de bankroll
- ✅ Ranking de jogos com scores de confiança

### Backend (Node.js + Express)
- ✅ API REST completa
- ✅ WebSocket para atualizações em tempo real
- ✅ Detecção automática de região (geoip)
- ✅ Configuração dinâmica de preços por região
- ✅ Integração com Gemini AI para análise avançada
- ✅ Serviço de usuários com planos e notificações

### Fontes de Dados
- ✅ **ESPN API** - Ligas principais ( rápida, logos)
- ✅ **SportDB API** - Dados completos (futebol, basquete, tênis)
- ✅ **Deep Scraper** - Stats profundos (Flashscore - Puppeteer)

## 🗂️ Estrutura do Projeto

```
Trae/
├── src/                      # TypeScript types
├── screens/                   # Telas React
│   ├── Dashboard.tsx           # Dashboard principal
│   ├── MatchDetail.tsx         # Detalhes do jogo + IA
│   ├── Profile.tsx             # Perfil do usuário
│   ├── Simulator.tsx           # Simulador de bankroll
│   └── ...
├── components/                 # Componentes reutilizáveis
├── services/
│   ├── supabase.ts            # Cliente Supabase
│   └── apiClient.ts           # Cliente API + WebSocket
├── backend/                   # Backend Node.js
│   ├── server.js               # Express + WebSocket
│   ├── geminiService.js        # Serviço Gemini AI
│   ├── database.js             # Conexão PostgreSQL
│   ├── matchService.js         # Lógica de matches
│   ├── userService.js          # Usuários e planos
│   ├── espnService.js          # ESPN API integration
│   ├── flashscoreDeepScraper.js # Scraper avançado
│   ├── migration*.sql           # Migrations do banco
│   └── runMigrations.js       # Script para migrations
├── supabase/                  # Edge Functions
│   └── functions/
│       └── send-push/         # Notificações push
└── .env.local                # Variáveis de ambiente (não commitar)
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz:

```env
# Backend (desenvolvimento)
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon

# Gemini API
GEMINI_API_KEY=sua-chave-gemini

# OneSignal
VITE_ONESIGNAL_APP_ID=seu-app-id
```

Configure `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:senha@db.supabase.co:5432/postgres

SPORTDB_API_KEY=sua-chave-sportdb

SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

GEMINI_API_KEY=sua-chave-gemini

NODE_ENV=production
```

### 2. Instalar Dependências

Frontend:
```bash
npm install
```

Backend:
```bash
cd backend
npm install
```

### 3. Executar Migrations do Banco de Dados

Acesse o **Supabase Dashboard** → **SQL Editor** e execute na ordem:

1. `backend/migration.sql` - Tabela principal de matches
2. `backend/migration_fix_admin.sql` - Corrige trigger de admin
3. `backend/migration_analysis.sql` - Campos para análise IA
4. `backend/migration_onesignal.sql` - Campo OneSignal ID

Ou use o script automatizado:
```bash
cd backend
node runMigrations.js
```

## 🚀 Execução

### Modo Desenvolvimento

1. **Backend** (porta 3001):
```bash
cd backend
npm start
```

2. **Frontend** (porta 3000):
```bash
npm run dev
```

## 🌐 Deploy em Produção

### Frontend (Vercel)
```bash
vercel deploy --prod
```

### Backend (Supabase Edge Functions)
O backend usa Supabase como banco de dados e pode ser hospedado em qualquer serviço (Render, Railway, Vercel Serverless).

Para deploy, configure as variáveis de ambiente e use o comando deploy do seu provedor.

## 📊 Tecnologias

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, WebSocket, pg (PostgreSQL)
- **Banco**: PostgreSQL (Supabase)
- **IA**: Google Gemini API
- **Dados**: ESPN API, SportDB API, Puppeteer (Flashscore)
- **Autenticação**: Supabase Auth
- **Real-time**: WebSocket + Supabase Realtime

## 🔑 Recursos Principais

### Autenticação
- ✅ Login/Registro com email
- ✅ Gerenciamento de sessões
- ✅ Planos (Free/Pro/Elite)
- ✅ Detecção automática de região

### Análise de Jogos
- ✅ Score de confiança local (0-100)
- ✅ Análise híbrida (local + Gemini AI)
- ✅ Recomendação de mercados
- ✅ Odds atualizadas em tempo real
- ✅ Estatísticas profundas (H2H, forma, ranking)

### Notificações
- ✅ WebSockets para atualizações em tempo real
- ✅ Edge Functions para push notifications
- ✅ Integração OneSignal

## 📝 Migrations

Todas as migrations estão em `backend/`:

| Arquivo | Descrição |
|----------|------------|
| `migration.sql` | Tabela principal de matches |
| `migration_fix_admin.sql` | Corrige bug do trigger de admin |
| `migration_analysis.sql` | Campos para análise IA |
| `migration_onesignal.sql` | Campo para OneSignal ID |

## 🔧 Desenvolvimento

### Scripts Úteis

```bash
# Rodar migrations
cd backend && node runMigrations.js

# Verificar frontend
npm run build

# Formatar código
npm run lint

# Type check
npm run typecheck
```

## 📄 Licença

Propriedade intelectual reservada. Todos os direitos reservados.

## 👥 Suporte

Para suporte ou questões, abra uma issue no repositório.
