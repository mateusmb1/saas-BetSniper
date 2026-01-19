-- =======================================================
-- MIGRAÇÃO: CORRIGIR TRIGGER ADMIN (BUG CRÍTICO)
-- =======================================================

-- Dropar trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- =======================================================
-- Criar função CORRIGIDA (conta ANTES do insert)
-- =======================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- 1. Contar quantos perfis já existem (ANTES de inserir)
  SELECT count(*) INTO user_count FROM public.profiles;  
  
  -- 2. Inserir novo perfil com plano correto
  INSERT INTO public.profiles (id, email, plano, status, region, currency)
  VALUES (
    new.id, 
    new.email, 
    -- Se for o primeiro usuário (count = 0), define como 'elite'
    -- Caso contrário, define como 'free'
    CASE WHEN user_count = 0 THEN 'elite' ELSE 'free' END, 
    'ativo',
    -- Padrão: Brasil / Real Brasileiro
    'BR',
    'BRL'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================================================
-- Criar trigger vinculando à função
-- =======================================================
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
