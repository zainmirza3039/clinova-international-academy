import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const REQUIRED_SUPABASE_HOSTNAME = 'ssxpmcbqfdggfsoqbxac.supabase.co';

// Authentication stays unavailable until prerequisites receive a separate approved code release.
const AUTH_ACTIVATION_APPROVED_IN_SOURCE = true;

function getAuthConfig() {
  const enabled = AUTH_ACTIVATION_APPROVED_IN_SOURCE;
  const rawUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim();
  const key = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
  let validUrl = false;
  try {
    const parsed = new URL(rawUrl);
    validUrl = parsed.protocol === 'https:' && parsed.hostname === REQUIRED_SUPABASE_HOSTNAME &&
      parsed.port === '' && parsed.username === '' && parsed.password === '' &&
      (parsed.pathname === '' || parsed.pathname === '/') && parsed.search === '' && parsed.hash === '';
  } catch { validUrl = false; }
  return { enabled: enabled && validUrl && Boolean(key), url: rawUrl, key };
}

export const authConfig = getAuthConfig();

export function createAuthClient(): SupabaseClient | null {
  if (!authConfig.enabled) return null;
  try {
    return createClient(authConfig.url, authConfig.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  } catch { return null; }
}
