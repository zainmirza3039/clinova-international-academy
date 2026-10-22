// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
const createClient = vi.hoisted(() => vi.fn(() => ({ publicClient: true })));
vi.mock('@supabase/supabase-js', () => ({ createClient }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); createClient.mockClear(); });

describe('integrated review safety', () => {
  it('forces all live feature flags off in the review deployment build', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
    for (const flag of ['AUTH', 'LEARNER_DATA', 'ENQUIRIES', 'INDEXING', 'VERIFICATION']) {
      expect(config.buildCommand).toContain(`VITE_${flag}_ENABLED=false`);
    }
    expect(config.routes.some((route: { handle?: string }) => route.handle === 'filesystem')).toBe(true);
    expect(config.routes.at(-1).dest).toBe('/index.html');
    expect(config.routes[0].headers['X-Robots-Tag']).toBe('noindex, nofollow');
  });
  it('retains the patched router and supplied logo-only assets', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.dependencies['react-router-dom']).toBe('^7.18.4');
    for (const name of ['clinova-logo.png', 'clinova-logo-white.png', 'clinova-icon.png', 'apple-touch-icon.png', 'clinova-social.png']) {
      expect(readFileSync(`public/${name}`).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    }
  });
  it('retains a null client when public configuration is absent', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', ''); vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    const module = await import('@/lib/supabase');
    expect(module.supabase).toBeNull(); expect(module.isSupabaseConfigured).toBe(false);
    expect(createClient).not.toHaveBeenCalled();
  });
  it('prevents the public client from managing student auth sessions', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://ssxpmcbqfdggfsoqbxac.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'synthetic-public-key');
    await import('@/lib/supabase');
    expect(createClient).toHaveBeenCalledWith(expect.any(String), 'synthetic-public-key', {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  });
});
