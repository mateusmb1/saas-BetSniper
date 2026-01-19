# BetSniper - Configuração com Supabase

## ✅ Configuração Concluída

O sistema foi ajustado para usar **Supabase como Backend 100%**.

## 📋 Próximos Passos

### 1. Executar Migrações no Supabase

Acesse o **Supabase Dashboard** → **SQL Editor** e execute o conteúdo do arquivo:

```
supabase/schema.sql
```

Ou copie e cole o seguinte:

```sql
-- Tabela de Jogos
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(100) UNIQUE,
    league VARCHAR(100),
    league_logo VARCHAR(500),
    home_team VARCHAR(200),
    away_team VARCHAR(200),
    home_logo VARCHAR(500),
    away_logo VARCHAR(500),
    date DATE,
    time TIME,
    status VARCHAR(50),
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    home_odds DECIMAL(5,2),
    draw_odds DECIMAL(5,2),
    away_odds DECIMAL(5,2),
    prediction VARCHAR(50),
    confidence_score INTEGER DEFAULT 0,
    analysis TEXT,
    is_live BOOLEAN DEFAULT false,
    sport VARCHAR(50) DEFAULT 'football',
    country VARCHAR(100),
    season VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Histórico de Apostas
CREATE TABLE IF NOT EXISTS bet_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id),
    prediction VARCHAR(50),
    odds DECIMAL(5,2),
    stake DECIMAL(10,2),
    result VARCHAR(20),
    profit_loss DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    unread BOOLEAN DEFAULT true,
    link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Configurações do Usuário
CREATE TABLE IF NOT EXISTS user_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan VARCHAR(20) DEFAULT 'free',
    notifications_enabled BOOLEAN DEFAULT true,
    favorite_leagues TEXT[],
    preferred_sports TEXT[],
    language VARCHAR(10) DEFAULT 'pt-BR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE bet_history;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Row Level Security (RLS)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Users can view own bet_history" ON bet_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
```

### 2. Inserir Dados de Exemplo

```sql
INSERT INTO matches (external_id, league, home_team, away_team, date, time, status, prediction, confidence_score)
VALUES
    ('match_1', 'Premier League', 'Arsenal', 'Liverpool', CURRENT_DATE + 1, '16:00', 'scheduled', 'Over 2.5', 75),
    ('match_2', 'La Liga', 'Barcelona', 'Real Madrid', CURRENT_DATE + 1, '20:00', 'scheduled', 'BTTS', 82),
    ('match_3', 'Serie A', 'Juventus', 'Inter', CURRENT_DATE + 2, '19:45', 'scheduled', 'Juventus', 68)
ON CONFLICT (external_id) DO NOTHING;
```

### 3. Executar o Frontend

```bash
cd saas-BetSniper
npm run dev
```

O sistema estará disponível em **http://localhost:3000**

## 🔧 Configurações Já Aplicadas

- ✅ `.env.local` configurado com as chaves do Supabase
- ✅ `apiClient.ts` ajustado para usar Supabase Client diretamente
- ✅ `services/supabase.ts` configurado com URL e Anon Key
- ✅ Arquivos da pasta "substituir" copiados para a raiz
- ✅ Edge Functions criadas em `supabase/functions/`

## 📁 Estrutura do Backend Supabase

| Recurso | Descrição |
|---------|-----------|
| **Database** | PostgreSQL com tabelas: matches, bet_history, notifications, user_configs |
| **Auth** | Supabase Auth (já configurado) |
| **Realtime** | Atualizações em tempo real via Supabase Realtime |
| **Edge Functions** | Funções Deno para scraping/atualização de dados |

## 🚀 Deploy

### Frontend (Vercel)
```bash
vercel deploy --prod
```

### Edge Functions (Supabase)
```bash
supabase functions deploy refresh-matches
supabase functions deploy update-live
```

## 📝 Variáveis de Ambiente em Produção

Configure no Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

Configure no Supabase:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
