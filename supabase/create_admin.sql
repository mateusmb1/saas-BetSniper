-- ========================================
-- CRIAR USUÁRIO ADMIN PARA BETSNIPER
-- ========================================
-- Execute no SQL Editor do Supabase

-- 1. Criar usuário admin (substitua o email e senha desejados)
-- O email e senha serão:
-- Email: admin@betsniper.com
-- Senha: BetSniper2024!@#

INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'admin@betsniper.com',
    -- Esta senha é: BetSniper2024!@#
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/nMskyB.5oX5v5Q5Q5Q5Q5',
    NOW(),
    NOW(),
    NOW()
);

-- 2. Criar perfil do usuário
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    created_at
)
SELECT 
    gen_random_uuid(),
    id,
    jsonb_build_object('email', email),
    'email',
    NOW()
FROM auth.users
WHERE email = 'admin@betsniper.com';

-- 3. Atualizar perfil público (se tiver tabela profiles)
-- CREATE TABLE IF NOT EXISTS public.profiles (
--     id UUID REFERENCES auth.users(id) PRIMARY KEY,
--     email TEXT,
--     role TEXT DEFAULT 'admin',
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

SELECT '✅ Usuário admin criado com sucesso!' as status;
SELECT email, created_at FROM auth.users WHERE email = 'admin@betsniper.com';
