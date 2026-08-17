import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from environment variables
const rawSupabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Clean Supabase URL (remove /rest/v1/ suffix if provided)
const supabaseUrl = rawSupabaseUrl
  ? rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
  : '';

// Verify credentials without crashing the application on startup
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseAnonKey !== 'COLE_AQUI_A_CHAVE_PUBLICA';

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase não está totalmente configurado. Insira as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env ou no painel de configurações para habilitar persistência em nuvem.'
  );
}

// Instantiate the Supabase client safely
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder-url.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

export const hasSupabaseConfig = () => isConfigured;

export const getSupabasePublicUrl = (): string | null =>
  isConfigured ? supabaseUrl : null;
