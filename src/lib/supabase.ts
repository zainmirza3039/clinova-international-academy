import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function createUnavailableClient(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get(_target, property) {
      if (property === 'from' || property === 'rpc') {
        return () => {
          throw new Error('Supabase configuration is missing.');
        };
      }
      return undefined;
    },
  });
}

// Importing the application must remain safe in local, CI and Preview environments.
// Database access fails closed until both public connection values are configured.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createUnavailableClient();
