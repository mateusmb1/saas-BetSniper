-- Tabela unificada para Python e Node.js
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,          -- ID do jogo (Flashscore ou ESPN)
    date DATE,
    league TEXT,
    home_team TEXT,               -- Node: homeTeam
    away_team TEXT,               -- Node: awayTeam
    home_score INTEGER,
    away_score INTEGER,
    status TEXT,                  -- 'FT', 'LIVE', 'SCHEDULED'
    is_live BOOLEAN DEFAULT FALSE,
    match_url TEXT,
    home_logo TEXT,               -- Adicionado para guardar bandeiras
    away_logo TEXT,               -- Adicionado para guardar bandeiras
    minute INTEGER,               -- Tempo de jogo
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
