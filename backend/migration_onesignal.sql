-- =======================================================
-- MIGRAÇÃO: ADICIONAR CAMPO ONE SIGNAL ID
-- =======================================================

-- Adicionar campo para armazenar OneSignal user ID
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onesignal_id TEXT;

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_onesignal_id ON profiles(onesignal_id);

-- Adicionar comentário
COMMENT ON COLUMN profiles.onesignal_id IS 'ID do usuário no OneSignal para envio de notificações push';
