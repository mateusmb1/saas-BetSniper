# ⚽ SaaS Bet Analytics - Flashscore IA Connect

Bem-vindo ao **SaaS Bet Analytics**, uma plataforma moderna de análise de dados de futebol que combina a rapidez da **API da ESPN** com a profundidade estatística do **Flashscore**. Este sistema oferece insights em tempo real, previsões baseadas em IA e uma experiência de usuário premium.

![Dashboard Preview](docs/images/dashboard_preview.png)
*(Adicione uma captura de tela do seu Dashboard aqui)*

---

## 🚀 Funcionalidades Principais

*   **📊 Coleta Híbrida de Dados:**
    *   **Tempo Real:** Integração com ESPN para placares, minutos e bandeiras oficiais com atualização a cada 30 segundos.
    *   **Estatísticas Profundas:** Crawler automatizado (Puppeteer) que extrai dados detalhados (posse de bola, remates, xG) do Flashscore.
*   **🤖 Insights de IA:** Algoritmo que analisa probabilidade, odds e momento dos times para sugerir apostas de valor (ex: "Over 0.5 HT", "Ambas Marcam").
*   **📱 Interface Premium (Mobile-First):** Design moderno inspirado em apps de aposta de elite, com modo escuro nativo e navegação fluida.
*   **🔔 Sistema de Notificações:** Alertas em tempo real sobre gols e oportunidades de mercado.
*   **📈 Gestão de Banca:** Histórico de apostas e simulador de ROI integrados.

---

## 🏗️ Arquitetura do Sistema

O projeto segue uma arquitetura **Monorepo** com separação clara entre Frontend e Backend.

### 🔧 Tech Stack

**Frontend:**
*   **React 18** (Vite)
*   **TypeScript**
*   **Tailwind CSS** (Estilização)
*   **Recharts** (Gráficos)

**Backend:**
*   **Node.js** (Express)
*   **PostgreSQL** (Supabase)
*   **Puppeteer** (Web Scraping Avançado)
*   **WebSocket** (Atualizações em Tempo Real)

**Infraestrutura:**
*   **Banco de Dados:** Supabase (Postgres)
*   **Hospedagem Sugerida:** Vercel (Front) + Railway/Render (Back)

---

## 📦 Instalação e Configuração

### Pré-requisitos
*   Node.js (v18+)
*   NPM ou Yarn
*   Conta no Supabase (para o banco de dados)

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/saas-bet-analytics.git
cd saas-bet-analytics
```

### 2. Configurar o Backend
```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend` com suas credenciais:
```env
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@[SEU-HOST]:5432/postgres"
```

### 3. Configurar o Frontend
```bash
cd ..  # Voltar para a raiz
npm install
```

### 4. Inicializar o Banco de Dados
O sistema possui migrações automáticas. Ao iniciar o backend pela primeira vez, ele criará as tabelas necessárias (`matches`, `match_stats`, etc.).

---

## ▶️ Como Executar

Para rodar o projeto em ambiente de desenvolvimento:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```
*O backend iniciará na porta 3001 e começará a coleta de dados imediatamente.*

**Terminal 2 (Frontend):**
```bash
# Na raiz do projeto
npm run dev
```
*O frontend estará acessível em `http://localhost:3000`.*

---

## 📱 Manual de Uso

### 1. Dashboard (Tela Inicial)
Visualização rápida dos jogos do dia.
*   **Filtros:**terne entre "Todos", "Ao Vivo" e "Ligas".
*   **Cards de Jogo:** Clique em qualquer jogo para ver detalhes.
*   **Indicadores:** Ícone de "Raio" indica uma sugestão da IA.

### 2. Detalhes da Partida
Análise profunda de um jogo específico.
*   **Comparativo:** Força dos times lado a lado.
*   **Probabilidades:** Gráfico de pizza mostrando a chance de vitória.
*   **Estatísticas:** Dados extraídos do Flashscore (quando disponíveis).

### 3. Perfil e Configurações
Gerencie sua conta e preferências.
*   **Plano:** Visualize seu status de assinatura (Elite Pro).
*   **Ajustes:** Configure notificações e formato de odds.

---

## 📂 Estrutura de Pastas

```
/
├── backend/                 # Servidor Node.js
│   ├── python_scraper/      # Scripts auxiliares em Python
│   ├── database.js          # Conexão com Postgres
│   ├── espnService.js       # API ESPN (Dados rápidos)
│   ├── flashscoreDeepScraper.js # Crawler Flashscore (Dados profundos)
│   └── server.js            # Ponto de entrada da API
├── src/                     # Código fonte React
│   ├── components/          # Componentes reutilizáveis
│   ├── screens/             # Telas da aplicação
│   └── services/            # Clientes de API e WebSocket
└── DOCS/                    # Documentação técnica detalhada
```

---

## 🤝 Contribuindo

1.  Faça um Fork do projeto
2.  Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`)
3.  Faça o Commit (`git commit -m 'Add some NovaFeature'`)
4.  Push para a Branch (`git push origin feature/NovaFeature`)
5.  Abra um Pull Request

---

## 📄 Licença

Este projeto é proprietário e destinado a uso comercial como SaaS.
