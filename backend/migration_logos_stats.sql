-- Migration for Team Logos and Match Stats
-- Create team_logos table based on the documentation
CREATE TABLE IF NOT EXISTS team_logos (
    id SERIAL PRIMARY KEY,
    team_name TEXT NOT NULL,
    country TEXT,
    league TEXT,
    logo_url TEXT,
    resolution TEXT,
    local_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_name, resolution)
);

-- Create match_stats table based on the documentation
CREATE TABLE IF NOT EXISTS match_stats (
    id SERIAL PRIMARY KEY,
    match_id TEXT NOT NULL, -- Links to matches(id)
    period TEXT DEFAULT 'full', -- 'full', '1st_half', '2nd_half'
    category TEXT NOT NULL, -- e.g., 'Posse de bola', 'Total remates'
    home_value DOUBLE PRECISION,
    away_value DOUBLE PRECISION,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, period, category)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_logos_name ON team_logos(team_name);
CREATE INDEX IF NOT EXISTS idx_match_stats_match_id ON match_stats(match_id);
