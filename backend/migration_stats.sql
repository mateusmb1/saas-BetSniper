-- Tabela de Estatísticas de Jogos (Deep Scraper)
CREATE TABLE IF NOT EXISTS public.match_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT REFERENCES matches(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'full', -- 'full', '1st_half', '2nd_half'
    category VARCHAR(50), -- 'Ball Possession', 'Goal Attempts', etc.
    home_value DECIMAL,
    away_value DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(match_id, category, type)
);

-- Habilitar RLS
ALTER TABLE public.match_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Leitura pública (ou restrita a planos PRO/ELITE depois)
CREATE POLICY "Leitura pública de stats"
ON public.match_stats
FOR SELECT
USING (true);

-- Policy: Escrita apenas Service Role
-- (Implícito no Supabase, mas boa prática bloquear anon)
