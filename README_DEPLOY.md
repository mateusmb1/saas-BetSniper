# 🚀 Guia de Deploy (Produção)

Este projeto é um **SaaS Híbrido** composto por:
1.  **Frontend (React/Vite):** Pode ser hospedado em qualquer CDN (Vercel, Netlify).
2.  **Backend (Node.js/Express):** Precisa de um servidor persistente (VPS, Render, Railway) pois roda Cron Jobs e Puppeteer (Browser Automation).

---

## 📦 1. Deploy do Frontend (Vercel)

O Frontend está pronto para Vercel.

1.  Crie um novo projeto no Dashboard da Vercel.
2.  Conecte seu repositório GitHub.
3.  **Configurações de Build:**
    *   **Framework Preset:** Vite
    *   **Root Directory:** `./` (raiz)
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
4.  **Variáveis de Ambiente (Environment Variables):**
    Adicione estas variáveis no painel da Vercel:
    *   `VITE_API_URL`: A URL do seu Backend (Ex: `https://meu-backend.onrender.com/api`)
    *   `VITE_WS_URL`: A URL do WebSocket (Ex: `wss://meu-backend.onrender.com`)

---

## ⚙️ 2. Deploy do Backend (Render / Railway)

**IMPORTANTE:** O Backend **NÃO** funciona bem na Vercel (Serverless) porque:
*   Usa `Puppeteer` (Chrome Headless é pesado para serverless).
*   Usa `Cron Jobs` (precisa rodar 24/7, serverless "dorme").
*   Usa `WebSockets` (precisa de conexão persistente).

### Recomendação: Render.com (Plano Starter ou Free*)
*O plano Free do Render "dorme" após inatividade, o que pode pausar seus Cron Jobs. Para produção real, use o plano Starter ($7/mês).*

1.  Crie um **Web Service** no Render.
2.  Conecte o repositório.
3.  **Root Directory:** `backend`
4.  **Build Command:** `npm install`
5.  **Start Command:** `npm start`
6.  **Variáveis de Ambiente:**
    *   `DATABASE_URL`: Sua string de conexão do Supabase (Pooler Transaction Mode se possível).
    *   `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`: `true` (Se usar Docker, senão `false`).
    *   **Dica:** Para rodar Puppeteer no Render, você pode precisar adicionar um "Buildpack" ou usar Docker.

### Opção Docker (Mais robusta para Puppeteer)
O projeto já pode ser dockerizado. Crie um `Dockerfile` na pasta `backend` se necessário.

---

## 🛠️ 3. Como rodar localmente (Localhost)

Se você não está conseguindo visualizar, certifique-se de rodar **DOIS** terminais:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm start
```
*Deve aparecer: "🚀 BACKEND RODANDO em http://localhost:3001"*

**Terminal 2 (Frontend):**
```bash
# Na raiz do projeto
npm install
npm run dev
```
*Deve aparecer: "➜ Local: http://localhost:3000/"*

Acesse **http://localhost:3000** no navegador.
