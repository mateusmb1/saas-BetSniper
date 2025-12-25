-- Atualizar tabela matches para suportar múltiplas modalidades
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS sport text DEFAULT 'football',
ADD COLUMN IF NOT EXISTS league text,
ADD COLUMN IF NOT EXISTS home_logo text,
ADD COLUMN IF NOT EXISTS away_logo text,
ADD COLUMN IF NOT EXISTS raw jsonb,
ADD COLUMN IF NOT EXISTS is_live boolean DEFAULT false;

-- Atualizar índices para performance
CREATE INDEX IF NOT EXISTS idx_matches_sport ON matches(sport);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
