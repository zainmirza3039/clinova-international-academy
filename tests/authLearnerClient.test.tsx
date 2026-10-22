import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient }));
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });
const session = { user: { id: '11111111-1111-4111-8111-111111111111' }, access_token: 'synthetic-test-token' };

describe('learner uses the existing authenticated client only', () => {
  it('never exposes or starts a provided client while authentication is off', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'false'); vi.resetModules();
    const { AuthProvider, useAuth } = await import('@/auth/AuthProvider');
    const getSession = vi.fn();
    const client = { auth: { getSession } } as unknown as SupabaseClient;
    function Probe() { return <p>{useAuth().client === null ? 'blocked' : 'attached'}</p>; }
    render(<AuthProvider client={client}><Probe /></AuthProvider>);
    expect(screen.getByText('blocked')).toBeTruthy();
    expect(getSession).not.toHaveBeenCalled(); expect(createClient).not.toHaveBeenCalled();
  });
  it('reuses the exact client only after readiness and removes it for recovery/logout', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'true');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://ssxpmcbqfdggfsoqbxac.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'synthetic-only'); vi.resetModules();
    const { AuthProvider, useAuth } = await import('@/auth/AuthProvider');
    let emit: ((event: string, next: typeof session | null) => void) | undefined;
    let resolveSession: ((value: { data: { session: typeof session }; error: null }) => void) | undefined;
    const deferred = new Promise<{ data: { session: typeof session }; error: null }>(resolve => { resolveSession = resolve; });
    const client = { auth: {
      getSession: vi.fn(() => deferred),
      onAuthStateChange: vi.fn((callback: typeof emit) => { emit = callback; return { data: { subscription: { unsubscribe: vi.fn() } } }; }),
    } } as unknown as SupabaseClient;
    let exposed: SupabaseClient | null = null;
    function Probe() { const auth = useAuth(); exposed = auth.client; return <p>{auth.client === null ? 'blocked' : 'attached'}</p>; }
    render(<AuthProvider client={client}><Probe /></AuthProvider>);
    expect(screen.getByText('blocked')).toBeTruthy();
    await act(async () => { resolveSession?.({ data: { session }, error: null }); });
    expect(screen.getByText('attached')).toBeTruthy(); expect(exposed).toBe(client);
    await act(async () => { emit?.('PASSWORD_RECOVERY', session); });
    expect(screen.getByText('blocked')).toBeTruthy(); expect(exposed).toBeNull();
    await act(async () => { emit?.('SIGNED_IN', session); });
    expect(exposed).toBe(client);
    await act(async () => { emit?.('SIGNED_OUT', null); });
    expect(screen.getByText('blocked')).toBeTruthy(); expect(exposed).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });
});
