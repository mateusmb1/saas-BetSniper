
import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente (Vite)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nnbvmbjqlmuwlovlqgzh.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
    console.error('❌ Supabase Anon Key não encontrada! Verifique o arquivo .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
