
import { createClient } from '@supabase/supabase-js';

// Substitua pela sua URL e Key do Supabase (Settings -> API)
const SUPABASE_URL = 'https://nnbvmbjqlmuwlovlqgzh.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANONIMA_AQUI'; // <--- IMPORTANTE: COLOCAR A KEY AQUI

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
