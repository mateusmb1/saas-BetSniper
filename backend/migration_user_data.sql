-- Tabela de Apostas (Histórico)
CREATE TABLE IF NOT EXISTS public.user_bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id TEXT, -- Pode vir de diferentes fontes, então TEXT
    date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sport TEXT,
    league TEXT,
    home_team TEXT,
    away_team TEXT,
    market TEXT,
    result TEXT CHECK (result IN ('WIN', 'LOSS', 'PENDING', 'VOID')),
    amount DECIMAL(10, 2),
    ev DECIMAL(5, 2),
    odds DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para user_bets
ALTER TABLE public.user_bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê suas apostas"
ON public.user_bets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuário cria suas apostas"
ON public.user_bets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('WIN', 'AI', 'LIVE', 'ALERT')),
    title TEXT,
    content TEXT,
    unread BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê suas notificações"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Sistema cria notificações"
ON public.notifications
FOR INSERT
WITH CHECK (true); -- Idealmente restringir ao service role, mas ok por agora

CREATE POLICY "Usuário atualiza suas notificações"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);
