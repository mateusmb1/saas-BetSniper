-- Criação das tabelas para o projeto Flashscore

CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,          -- ID único do jogo (mid ou derivado da URL)
    date DATE,                    -- data do jogo
    league TEXT,
    home_team TEXT,
    away_team TEXT,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT,                  -- 'FT', '77'', 'Agendado', etc.
    is_live BOOLEAN,
    match_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_stats (
    id SERIAL PRIMARY KEY,
    match_id TEXT REFERENCES matches(id),
    period TEXT,                  -- 'full', '1st_half', '2nd_half'
    category TEXT,                -- 'Posse de bola', 'Total remates', etc.
    home_value DOUBLE PRECISION,
    away_value DOUBLE PRECISION,
    captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices recomendados para performance
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_stats_match_id ON match_stats(match_id);
