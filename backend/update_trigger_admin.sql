CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Conta quantos perfis já existem
  SELECT count(*) INTO user_count FROM public.profiles;

  INSERT INTO public.profiles (id, email, plano, status)
  VALUES (
    new.id, 
    new.email, 
    -- Se for o primeiro usuário (count = 0), define como 'elite' (admin), senão 'free'
    CASE WHEN user_count = 0 THEN 'elite' ELSE 'free' END, 
    'ativo'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
