# BetSniper - Futebol SaaS

Sistema de análise e coleta de dados esportivos com integração Supabase.

## Arquitetura

- **Frontend**: React + Vite + TypeScript (Pasta raiz)
- **Backend**: Node.js + Express + WebSocket (Pasta `backend/`)
- **Scrapers**:
  - **ESPN Service**: Node.js (Rápido, Ligas Principais)
  - **Deep Scraper**: Puppeteer (Flashscore, Stats Profundos)
  - **SportDB Scraper**: Python (Futebol, Basquete, Tênis - Coleta contínua)

## Configuração

1. Configure o arquivo `backend/.env` (use `.env.example` como base).
2. Instale as dependências:
   - Node: `npm install` (na raiz e em `backend/`)
   - Python: `pip install -r backend/python_scraper/requirements.txt`

## Execução

### Modo Desenvolvimento
Em terminais separados:

1. **Backend** (API + Scrapers):
   ```bash
   cd backend
   npm start
   ```
   *Nota: O backend iniciará automaticamente o scraper Python se a `SPORTDB_API_KEY` estiver configurada.*

2. **Frontend**:
   ```bash
   npm run dev
   ```

### Deploy
O projeto está configurado para deploy com Procfile (Heroku/Render) ou Docker (futuro).
Certifique-se de configurar as variáveis de ambiente no servidor de produção.
