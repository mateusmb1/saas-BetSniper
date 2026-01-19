-- =======================================================
-- MIGRAÇÃO: ADICIONAR CAMPOS PARA ANÁLISE IA
-- =======================================================
-- Esta migration adiciona campos necessários para análise
-- avançada de jogos usando cálculo local + Gemini AI

-- Adicionar campos de análise avançada
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_last5 TEXT[];
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_last5 TEXT[];
ALTER TABLE matches ADD COLUMN IF NOT EXISTS h2h_matches JSONB;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_ranking INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_ranking INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS injuries JSONB;

-- Adicionar campos para scores da IA
ALTER TABLE matches ADD COLUMN IF NOT EXISTS gemini_analysis JSONB;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS hybrid_score INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS local_score INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_matches_hybrid_score ON matches(hybrid_score);
CREATE INDEX IF NOT EXISTS idx_matches_local_score ON matches(local_score);

-- =======================================================
-- INSERIR COMENTÁRIOS DE DOCUMENTAÇÃO
-- =======================================================
COMMENT ON COLUMN matches.home_last5 IS 'Últimos 5 jogos do mandante (ex: ["W", "D", "W", "D", "W", "D"])';
COMMENT ON COLUMN matches.away_last5 IS 'Últimos 5 jogos do visitante';
COMMENT ON COLUMN matches.h2h_matches IS 'Histórico head-to-head em formato JSON';
COMMENT ON COLUMN matches.home_ranking IS 'Posição do mandante na tabela';
COMMENT ON COLUMN matches.away_ranking IS 'Posição do visitante na tabela';
COMMENT ON COLUMN matches.injuries IS 'Lista de jogadores lesionados/suspensos';
COMMENT ON COLUMN matches.gemini_analysis IS 'Análise completa da Gemini AI em JSON';
COMMENT ON COLUMN matches.hybrid_score IS 'Score final combinando local (70%) + Gemini (30%)';
COMMENT ON COLUMN matches.local_score IS 'Score calculado localmente sem IA externa';
COMMENT ON COLUMN matches.analyzed_at IS 'Timestamp da última análise IA';
