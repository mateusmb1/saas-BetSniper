-- ========================================
-- CRIAR USUÁRIO ADMIN - BETSNIPER
-- ========================================
-- Acesse: Supabase Dashboard > SQL Editor
-- Copie e execute este script
-- ========================================

-- Criar usuário admin
SELECT 
    email_confirm_at AS created,
    'admin@betsniper.com' AS email,
    'BetSniper2024!@#' AS password,
    '✅ Execute no Supabase Dashboard > Authentication > Users > Add User' AS instructions;

-- Instruções:
-- 1. Vá em Supabase Dashboard
-- 2. Authentication > Users
-- 3. Clique em "Add User"
-- 4. Preencha:
--    Email: admin@betsniper.com
--    Password: BetSniper2024!@#
--    Marque "Confirm email"
-- 5. Clique em "Create user"
