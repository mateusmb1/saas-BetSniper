-- ========================================
-- CORREÇÃO DO BANCO DE DADOS BETSNIPER
-- ========================================
-- Execute este script para corrigir tipos de dados
-- ========================================

-- 1. Primeiro, dropar as tabelas existentes (se houver dados, será perdido)
-- Somente execute se estiver começando ou não se importa com os dados

DROP TABLE IF EXISTS bet_history CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_configs CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS logs CASCADE;

-- ========================================
-- Tabela de Jogos (matches)
-- ========================================
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

-- ========================================
-- Tabela de Histórico de Apostas (bet_history)
-- ========================================
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

-- ========================================
-- Tabela de Notificações (notifications)
-- ========================================
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

-- ========================================
-- Tabela de Configurações do Usuário (user_configs)
-- ========================================
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

-- ========================================
-- ÍNDICES
-- ========================================
CREATE INDEX IF NOT EXISTS matches_date_idx ON matches(date);
CREATE INDEX IF NOT EXISTS matches_league_idx ON matches(league);
CREATE INDEX IF NOT EXISTS matches_status_idx ON matches(status);
CREATE INDEX IF NOT EXISTS bet_history_user_idx ON bet_history(user_id);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications(unread) WHERE unread = true;

-- ========================================
-- HABILITAR REALTIME
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE bet_history;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_configs ENABLE ROW LEVEL SECURITY;

-- Políticas para matches (público)
CREATE POLICY "Public can view matches" ON matches FOR SELECT USING (true);

-- Políticas para dados do usuário
CREATE POLICY "Users can view own bet_history" ON bet_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own config" ON user_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bet_history" ON bet_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own config" ON user_configs FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- DADOS DE EXEMPLO
-- ========================================
INSERT INTO matches (external_id, league, home_team, away_team, date, time, status, prediction, confidence_score, home_odds, draw_odds, away_odds)
VALUES
    ('match_1', 'Premier League', 'Arsenal', 'Liverpool', CURRENT_DATE + 1, '16:00:00', 'scheduled', 'Over 2.5', 75, 1.85, 3.40, 4.20),
    ('match_2', 'La Liga', 'Barcelona', 'Real Madrid', CURRENT_DATE + 1, '20:00:00', 'scheduled', 'BTTS', 82, 1.70, 3.75, 4.50),
    ('match_3', 'Serie A', 'Juventus', 'Inter', CURRENT_DATE + 2, '19:45:00', 'scheduled', 'Juventus', 68, 2.30, 3.20, 3.10)
ON CONFLICT (external_id) DO NOTHING;

-- ========================================
-- RESULTADO
-- ========================================
SELECT 
    '✅ Banco de dados BetSniper configurado!' as status,
    (SELECT COUNT(*) FROM matches) as matches_count,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'matches') as table_check;
