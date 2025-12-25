-- Tabela de Perfis (Vinculada ao Auth do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    region VARCHAR(10), -- 'BR' ou 'EU'
    currency VARCHAR(10), -- 'BRL' ou 'EUR'
    plano TEXT DEFAULT 'free', -- 'free', 'pro', 'elite'
    status TEXT DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS (Segurança)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Usuário vê seu próprio perfil
CREATE POLICY "Usuário vê seu perfil"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Apenas Backend (Service Role) pode inserir/atualizar tudo
-- (Nota: No Supabase, Service Role ignora RLS, então não precisa de policy explicita para escrita se usarmos a chave correta, 
-- mas se usarmos o client anonimo, precisamos bloquear escrita).
-- Vamos bloquear escrita direta do frontend:
CREATE POLICY "Usuário NUNCA edita seu perfil diretamente"
ON public.profiles
FOR UPDATE
USING (false); 

CREATE POLICY "Usuário NUNCA insere seu perfil diretamente"
ON public.profiles
FOR INSERT
WITH CHECK (false);

-- Trigger para criar perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plano, status)
  VALUES (new.id, new.email, 'free', 'ativo');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger se existir para evitar duplicação
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabela de Uso Diário (Para o plano Free)
CREATE TABLE IF NOT EXISTS public.usage_daily (
  user_id UUID REFERENCES public.profiles(id),
  date DATE DEFAULT CURRENT_DATE,
  queries_count INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

ALTER TABLE public.usage_daily ENABLE ROW LEVEL SECURITY;

-- Policy: Usuário vê seu uso
CREATE POLICY "Usuário vê seu uso"
ON public.usage_daily
FOR SELECT
USING (auth.uid() = user_id);
